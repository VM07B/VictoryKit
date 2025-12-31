/**
 * Prometheus Metrics Service for VictoryKit
 * Custom metrics, histograms, counters for API and security monitoring
 */

const promClient = require("prom-client");
const pino = require("pino");

const logger = pino({ name: "metrics" });

// Default metrics collection
let collectDefaultMetrics = null;
let metricsInitialized = false;

// Custom registries for different concerns
const defaultRegistry = promClient.register;

// ============================================
// HTTP Request Metrics
// ============================================

const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code", "service"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const httpRequestTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code", "service"],
});

const httpRequestsInProgress = new promClient.Gauge({
  name: "http_requests_in_progress",
  help: "Number of HTTP requests currently being processed",
  labelNames: ["method", "service"],
});

// ============================================
// Security Scan Metrics
// ============================================

const securityScansTotal = new promClient.Counter({
  name: "security_scans_total",
  help: "Total number of security scans performed",
  labelNames: ["scan_type", "tool", "status"],
});

const securityScanDuration = new promClient.Histogram({
  name: "security_scan_duration_seconds",
  help: "Duration of security scans in seconds",
  labelNames: ["scan_type", "tool"],
  buckets: [0.5, 1, 2, 5, 10, 30, 60, 120, 300],
});

const securityFindingsTotal = new promClient.Counter({
  name: "security_findings_total",
  help: "Total number of security findings",
  labelNames: ["scan_type", "severity", "tool"],
});

const activeScans = new promClient.Gauge({
  name: "active_security_scans",
  help: "Number of security scans currently in progress",
  labelNames: ["scan_type", "tool"],
});

// ============================================
// AI/LLM Metrics
// ============================================

const aiRequestsTotal = new promClient.Counter({
  name: "ai_requests_total",
  help: "Total number of AI/LLM requests",
  labelNames: ["provider", "model", "operation", "status"],
});

const aiRequestDuration = new promClient.Histogram({
  name: "ai_request_duration_seconds",
  help: "Duration of AI/LLM requests in seconds",
  labelNames: ["provider", "model", "operation"],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
});

const aiTokensUsed = new promClient.Counter({
  name: "ai_tokens_used_total",
  help: "Total number of AI tokens used",
  labelNames: ["provider", "model", "token_type"],
});

// ============================================
// Queue Metrics
// ============================================

const queueJobsTotal = new promClient.Counter({
  name: "queue_jobs_total",
  help: "Total number of queue jobs",
  labelNames: ["queue", "status"],
});

const queueJobDuration = new promClient.Histogram({
  name: "queue_job_duration_seconds",
  help: "Duration of queue job processing",
  labelNames: ["queue"],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300],
});

const queueSize = new promClient.Gauge({
  name: "queue_size",
  help: "Current size of job queues",
  labelNames: ["queue", "state"],
});

// ============================================
// Database Metrics
// ============================================

const dbOperationsTotal = new promClient.Counter({
  name: "db_operations_total",
  help: "Total number of database operations",
  labelNames: ["operation", "collection", "status"],
});

const dbOperationDuration = new promClient.Histogram({
  name: "db_operation_duration_seconds",
  help: "Duration of database operations",
  labelNames: ["operation", "collection"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

const dbConnectionsActive = new promClient.Gauge({
  name: "db_connections_active",
  help: "Number of active database connections",
});

// ============================================
// Authentication Metrics
// ============================================

const authAttemptsTotal = new promClient.Counter({
  name: "auth_attempts_total",
  help: "Total number of authentication attempts",
  labelNames: ["method", "status"],
});

const activeSessionsGauge = new promClient.Gauge({
  name: "active_sessions",
  help: "Number of active user sessions",
});

// ============================================
// Business Metrics
// ============================================

const usersRegisteredTotal = new promClient.Counter({
  name: "users_registered_total",
  help: "Total number of users registered",
});

const reportsGeneratedTotal = new promClient.Counter({
  name: "reports_generated_total",
  help: "Total number of security reports generated",
  labelNames: ["report_type", "format"],
});

// ============================================
// Initialization & Middleware
// ============================================

/**
 * Initialize metrics collection
 * @param {object} options - Configuration options
 */
function initializeMetrics(options = {}) {
  if (metricsInitialized) {
    logger.warn("Metrics already initialized");
    return;
  }

  const {
    serviceName = "victorykit-api",
    collectDefault = true,
    prefix = "",
  } = options;

  if (collectDefault) {
    collectDefaultMetrics = promClient.collectDefaultMetrics;
    collectDefaultMetrics({
      prefix,
      labels: { service: serviceName },
    });
  }

  metricsInitialized = true;
  logger.info({ serviceName }, "Prometheus metrics initialized");
}

/**
 * Express middleware for HTTP metrics
 */
function metricsMiddleware(options = {}) {
  const { serviceName = "victorykit-api" } = options;

  return (req, res, next) => {
    const startTime = Date.now();

    // Track in-progress requests
    httpRequestsInProgress.labels(req.method, serviceName).inc();

    // Capture response
    res.on("finish", () => {
      const duration = (Date.now() - startTime) / 1000;
      const route = req.route?.path || req.path || "unknown";

      httpRequestDuration
        .labels(req.method, route, res.statusCode.toString(), serviceName)
        .observe(duration);

      httpRequestTotal
        .labels(req.method, route, res.statusCode.toString(), serviceName)
        .inc();

      httpRequestsInProgress.labels(req.method, serviceName).dec();
    });

    next();
  };
}

/**
 * Metrics endpoint handler
 */
async function metricsHandler(req, res) {
  try {
    res.set("Content-Type", defaultRegistry.contentType);
    res.end(await defaultRegistry.metrics());
  } catch (error) {
    logger.error({ error: error.message }, "Error generating metrics");
    res.status(500).end();
  }
}

// ============================================
// Recording Functions
// ============================================

/**
 * Record a security scan
 * @param {object} scanData - Scan information
 */
function recordSecurityScan(scanData) {
  const { type, tool, status, duration, findings = [] } = scanData;

  securityScansTotal.labels(type, tool, status).inc();

  if (duration) {
    securityScanDuration.labels(type, tool).observe(duration / 1000);
  }

  // Record findings by severity
  const severityCounts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  Object.entries(severityCounts).forEach(([severity, count]) => {
    securityFindingsTotal.labels(type, severity, tool).inc(count);
  });
}

/**
 * Record an AI/LLM request
 * @param {object} aiData - AI request information
 */
function recordAIRequest(aiData) {
  const { provider, model, operation, status, duration, tokens } = aiData;

  aiRequestsTotal.labels(provider, model, operation, status).inc();

  if (duration) {
    aiRequestDuration
      .labels(provider, model, operation)
      .observe(duration / 1000);
  }

  if (tokens) {
    if (tokens.prompt) {
      aiTokensUsed.labels(provider, model, "prompt").inc(tokens.prompt);
    }
    if (tokens.completion) {
      aiTokensUsed.labels(provider, model, "completion").inc(tokens.completion);
    }
  }
}

/**
 * Record a queue job
 * @param {object} jobData - Job information
 */
function recordQueueJob(jobData) {
  const { queue, status, duration } = jobData;

  queueJobsTotal.labels(queue, status).inc();

  if (duration) {
    queueJobDuration.labels(queue).observe(duration / 1000);
  }
}

/**
 * Update queue size metrics
 * @param {string} queueName - Queue name
 * @param {object} sizes - Size by state
 */
function updateQueueSize(queueName, sizes) {
  Object.entries(sizes).forEach(([state, size]) => {
    queueSize.labels(queueName, state).set(size);
  });
}

/**
 * Record a database operation
 * @param {object} dbData - Database operation info
 */
function recordDBOperation(dbData) {
  const { operation, collection, status, duration } = dbData;

  dbOperationsTotal.labels(operation, collection, status).inc();

  if (duration) {
    dbOperationDuration.labels(operation, collection).observe(duration / 1000);
  }
}

/**
 * Record authentication attempt
 * @param {string} method - Auth method
 * @param {string} status - Success/failure
 */
function recordAuthAttempt(method, status) {
  authAttemptsTotal.labels(method, status).inc();
}

/**
 * Update active sessions count
 * @param {number} count - Number of active sessions
 */
function updateActiveSessions(count) {
  activeSessionsGauge.set(count);
}

/**
 * Update active scans gauge
 * @param {string} scanType - Type of scan
 * @param {string} tool - Tool name
 * @param {number} delta - Change in count (+1 or -1)
 */
function updateActiveScans(scanType, tool, delta) {
  if (delta > 0) {
    activeScans.labels(scanType, tool).inc();
  } else {
    activeScans.labels(scanType, tool).dec();
  }
}

/**
 * Record report generation
 * @param {string} reportType - Type of report
 * @param {string} format - Output format
 */
function recordReportGenerated(reportType, format) {
  reportsGeneratedTotal.labels(reportType, format).inc();
}

/**
 * Record user registration
 */
function recordUserRegistration() {
  usersRegisteredTotal.inc();
}

/**
 * Get current metrics as JSON
 * @returns {Promise<object>}
 */
async function getMetricsJSON() {
  const metrics = await defaultRegistry.getMetricsAsJSON();
  return metrics;
}

/**
 * Reset all metrics (useful for testing)
 */
function resetMetrics() {
  defaultRegistry.resetMetrics();
  logger.info("Metrics reset");
}

module.exports = {
  // Initialization
  initializeMetrics,
  metricsMiddleware,
  metricsHandler,

  // Recording functions
  recordSecurityScan,
  recordAIRequest,
  recordQueueJob,
  updateQueueSize,
  recordDBOperation,
  recordAuthAttempt,
  updateActiveSessions,
  updateActiveScans,
  recordReportGenerated,
  recordUserRegistration,

  // Utility functions
  getMetricsJSON,
  resetMetrics,

  // Direct access to metrics for custom usage
  metrics: {
    httpRequestDuration,
    httpRequestTotal,
    httpRequestsInProgress,
    securityScansTotal,
    securityScanDuration,
    securityFindingsTotal,
    activeScans,
    aiRequestsTotal,
    aiRequestDuration,
    aiTokensUsed,
    queueJobsTotal,
    queueJobDuration,
    queueSize,
    dbOperationsTotal,
    dbOperationDuration,
    dbConnectionsActive,
    authAttemptsTotal,
    activeSessionsGauge,
  },

  // Prometheus client for advanced usage
  promClient,
  registry: defaultRegistry,
};
