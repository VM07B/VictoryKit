/**
 * OpenTelemetry Distributed Tracing Service for VictoryKit
 * Provides automatic instrumentation, custom spans, and trace export
 */

const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-http");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { Resource } = require("@opentelemetry/resources");
const {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} = require("@opentelemetry/semantic-conventions");
const { trace, context, SpanStatusCode } = require("@opentelemetry/api");
const pino = require("pino");

const logger = pino({ name: "tracing" });

// SDK instance
let sdk = null;

// Configuration
const defaultConfig = {
  serviceName: "victorykit-api",
  serviceVersion: "1.0.0",
  environment: process.env.NODE_ENV || "development",
  traceExporterUrl:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318/v1/traces",
  metricsExporterUrl:
    process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
    "http://localhost:4318/v1/metrics",
  enabled: process.env.OTEL_ENABLED !== "false",
};

/**
 * Initialize OpenTelemetry SDK
 * @param {object} config - Configuration options
 */
function initializeTracing(config = {}) {
  const options = { ...defaultConfig, ...config };

  if (!options.enabled) {
    logger.info("OpenTelemetry tracing disabled");
    return;
  }

  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: options.serviceName,
    [SEMRESATTRS_SERVICE_VERSION]: options.serviceVersion,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: options.environment,
  });

  // Trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: options.traceExporterUrl,
  });

  // Metrics exporter
  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: options.metricsExporterUrl,
    }),
    exportIntervalMillis: 60000, // Export every minute
  });

  sdk = new opentelemetry.NodeSDK({
    resource,
    traceExporter,
    metricReader,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-express": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-http": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-mongoose": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-ioredis": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-fs": {
          enabled: false, // Can be noisy
        },
      }),
    ],
  });

  sdk.start();
  logger.info(
    { serviceName: options.serviceName },
    "OpenTelemetry initialized"
  );

  // Graceful shutdown
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => logger.info("Tracing terminated"))
      .catch((error) => logger.error({ error }, "Error terminating tracing"));
  });
}

/**
 * Get the current tracer
 * @param {string} name - Tracer name
 * @returns {Tracer}
 */
function getTracer(name = "victorykit") {
  return trace.getTracer(name);
}

/**
 * Create a custom span
 * @param {string} name - Span name
 * @param {object} options - Span options
 * @param {Function} fn - Function to execute within span
 * @returns {Promise<any>}
 */
async function withSpan(name, options = {}, fn) {
  const tracer = getTracer(options.tracerName);
  const { attributes = {}, kind } = options;

  return tracer.startActiveSpan(name, { attributes, kind }, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Create a security scan span with standard attributes
 * @param {string} scanType - Type of security scan
 * @param {object} scanInfo - Scan metadata
 * @param {Function} fn - Scan function
 * @returns {Promise<any>}
 */
async function withSecurityScanSpan(scanType, scanInfo, fn) {
  return withSpan(
    `security.scan.${scanType}`,
    {
      attributes: {
        "security.scan.type": scanType,
        "security.scan.target": scanInfo.target || "unknown",
        "security.scan.tool": scanInfo.tool || "victorykit",
        "security.scan.user_id": scanInfo.userId || "anonymous",
      },
    },
    async (span) => {
      const startTime = Date.now();
      const result = await fn(span);

      // Add result attributes
      span.setAttributes({
        "security.scan.duration_ms": Date.now() - startTime,
        "security.scan.findings_count": result?.findings?.length || 0,
        "security.scan.risk_level": result?.riskLevel || "unknown",
      });

      return result;
    }
  );
}

/**
 * Create an AI/LLM operation span
 * @param {string} operation - AI operation type
 * @param {object} aiInfo - AI metadata
 * @param {Function} fn - AI function
 * @returns {Promise<any>}
 */
async function withAISpan(operation, aiInfo, fn) {
  return withSpan(
    `ai.${operation}`,
    {
      attributes: {
        "ai.operation": operation,
        "ai.provider": aiInfo.provider || "unknown",
        "ai.model": aiInfo.model || "unknown",
        "ai.temperature": aiInfo.temperature || 0.7,
      },
    },
    async (span) => {
      const result = await fn(span);

      // Add usage attributes if available
      if (result?.usage) {
        span.setAttributes({
          "ai.tokens.prompt": result.usage.prompt_tokens || 0,
          "ai.tokens.completion": result.usage.completion_tokens || 0,
          "ai.tokens.total": result.usage.total_tokens || 0,
        });
      }

      return result;
    }
  );
}

/**
 * Add attributes to current span
 * @param {object} attributes - Key-value attributes
 */
function addSpanAttributes(attributes) {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Record an event in the current span
 * @param {string} name - Event name
 * @param {object} attributes - Event attributes
 */
function recordSpanEvent(name, attributes = {}) {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Express middleware for adding trace context
 */
function tracingMiddleware(options = {}) {
  const { serviceName = "victorykit-api" } = options;

  return (req, res, next) => {
    const span = trace.getActiveSpan();

    if (span) {
      // Add request attributes
      span.setAttributes({
        "http.user_agent": req.get("user-agent") || "unknown",
        "http.request_id": req.headers["x-request-id"] || req.id,
        "victorykit.service": serviceName,
      });

      // Add user info if authenticated
      if (req.user) {
        span.setAttributes({
          "user.id": req.user.id || req.user._id,
          "user.role": req.user.role || "user",
        });
      }
    }

    // Propagate trace ID in response header
    const traceId = span?.spanContext()?.traceId;
    if (traceId) {
      res.setHeader("X-Trace-ID", traceId);
    }

    next();
  };
}

/**
 * Shutdown tracing gracefully
 */
async function shutdownTracing() {
  if (sdk) {
    await sdk.shutdown();
    logger.info("OpenTelemetry shutdown complete");
  }
}

module.exports = {
  initializeTracing,
  getTracer,
  withSpan,
  withSecurityScanSpan,
  withAISpan,
  addSpanAttributes,
  recordSpanEvent,
  tracingMiddleware,
  shutdownTracing,

  // Re-export OpenTelemetry API for advanced usage
  trace,
  context,
  SpanStatusCode,
};
