/**
 * Sentry Error Tracking Service for VictoryKit
 * Captures errors, performance data, and provides context for debugging
 */

const Sentry = require("@sentry/node");
const pino = require("pino");

const logger = pino({ name: "error-tracking" });

let sentryInitialized = false;

// Default configuration
const defaultConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  release: process.env.APP_VERSION || "1.0.0",
  serverName: process.env.HOSTNAME || "victorykit-api",
  sampleRate: 1.0,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.5,
  enabled: process.env.NODE_ENV !== "test",
};

/**
 * Initialize Sentry
 * @param {object} config - Configuration options
 */
function initializeSentry(config = {}) {
  const options = { ...defaultConfig, ...config };

  if (!options.dsn) {
    logger.warn("Sentry DSN not configured, error tracking disabled");
    return;
  }

  if (!options.enabled) {
    logger.info("Sentry disabled for this environment");
    return;
  }

  Sentry.init({
    dsn: options.dsn,
    environment: options.environment,
    release: options.release,
    serverName: options.serverName,
    sampleRate: options.sampleRate,
    tracesSampleRate: options.tracesSampleRate,
    profilesSampleRate: options.profilesSampleRate,

    // Integrations
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express(),
      // Enable MongoDB tracing
      new Sentry.Integrations.Mongo({ useMongoose: true }),
    ],

    // Before send hook for filtering/modifying events
    beforeSend(event, hint) {
      // Filter out certain errors
      const error = hint?.originalException;

      // Don't report 404s or validation errors
      if (error?.statusCode === 404 || error?.name === "ValidationError") {
        return null;
      }

      // Scrub sensitive data
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      "ECONNRESET",
      "ETIMEDOUT",
      "ECONNREFUSED",
      /^NetworkError/,
      /^AbortError/,
    ],
  });

  sentryInitialized = true;
  logger.info({ environment: options.environment }, "Sentry initialized");
}

/**
 * Express request handler middleware
 * Must be the first middleware
 */
function requestHandler() {
  if (!sentryInitialized) return (req, res, next) => next();
  return Sentry.Handlers.requestHandler({
    user: ["id", "email", "role"],
    ip: true,
    request: ["method", "url", "query"],
  });
}

/**
 * Express tracing handler middleware
 */
function tracingHandler() {
  if (!sentryInitialized) return (req, res, next) => next();
  return Sentry.Handlers.tracingHandler();
}

/**
 * Express error handler middleware
 * Must be after all other middleware and routes
 */
function errorHandler() {
  if (!sentryInitialized) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture 5xx errors
      if (error.statusCode >= 500) return true;
      // Capture security-related errors
      if (error.name === "SecurityError") return true;
      return false;
    },
  });
}

/**
 * Capture an exception
 * @param {Error} error - Error to capture
 * @param {object} context - Additional context
 * @returns {string} Event ID
 */
function captureException(error, context = {}) {
  if (!sentryInitialized) {
    logger.error(
      { error: error.message, ...context },
      "Error (Sentry disabled)"
    );
    return null;
  }

  return Sentry.captureException(error, {
    extra: context,
    tags: context.tags || {},
  });
}

/**
 * Capture a message
 * @param {string} message - Message to capture
 * @param {string} level - Severity level
 * @param {object} context - Additional context
 * @returns {string} Event ID
 */
function captureMessage(message, level = "info", context = {}) {
  if (!sentryInitialized) {
    logger[level]({ ...context }, message);
    return null;
  }

  return Sentry.captureMessage(message, {
    level,
    extra: context,
    tags: context.tags || {},
  });
}

/**
 * Set user context for current scope
 * @param {object} user - User information
 */
function setUser(user) {
  if (!sentryInitialized) return;

  Sentry.setUser({
    id: user.id || user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

/**
 * Clear user context
 */
function clearUser() {
  if (!sentryInitialized) return;
  Sentry.setUser(null);
}

/**
 * Set custom tags
 * @param {object} tags - Tags to set
 */
function setTags(tags) {
  if (!sentryInitialized) return;
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

/**
 * Add breadcrumb for debugging
 * @param {object} breadcrumb - Breadcrumb data
 */
function addBreadcrumb(breadcrumb) {
  if (!sentryInitialized) return;

  Sentry.addBreadcrumb({
    category: breadcrumb.category || "custom",
    message: breadcrumb.message,
    level: breadcrumb.level || "info",
    data: breadcrumb.data,
  });
}

/**
 * Create a transaction for performance monitoring
 * @param {string} name - Transaction name
 * @param {string} op - Operation type
 * @returns {Transaction}
 */
function startTransaction(name, op = "custom") {
  if (!sentryInitialized) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Wrap a function with error capturing
 * @param {Function} fn - Function to wrap
 * @param {object} context - Context for errors
 * @returns {Function}
 */
function withErrorCapture(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, context);
      throw error;
    }
  };
}

/**
 * Security-specific error capture
 * @param {string} type - Security event type
 * @param {object} details - Event details
 */
function captureSecurityEvent(type, details) {
  const message = `Security Event: ${type}`;

  if (!sentryInitialized) {
    logger.warn({ type, ...details }, message);
    return null;
  }

  addBreadcrumb({
    category: "security",
    message: type,
    level: "warning",
    data: details,
  });

  return Sentry.captureMessage(message, {
    level: "warning",
    tags: {
      security_event: type,
      severity: details.severity || "medium",
    },
    extra: details,
  });
}

/**
 * Capture API error with request context
 * @param {Error} error - Error object
 * @param {object} req - Express request
 */
function captureAPIError(error, req) {
  if (!sentryInitialized) {
    logger.error(
      {
        error: error.message,
        method: req.method,
        path: req.path,
        user: req.user?.id,
      },
      "API Error"
    );
    return null;
  }

  Sentry.withScope((scope) => {
    // Add request context
    scope.setExtra("request", {
      method: req.method,
      path: req.path,
      query: req.query,
      params: req.params,
      ip: req.ip,
    });

    // Add user if authenticated
    if (req.user) {
      scope.setUser({
        id: req.user.id || req.user._id,
        email: req.user.email,
        role: req.user.role,
      });
    }

    // Set tags
    scope.setTag("api.path", req.path);
    scope.setTag("api.method", req.method);

    Sentry.captureException(error);
  });
}

/**
 * Flush pending events before shutdown
 * @param {number} timeout - Timeout in ms
 */
async function close(timeout = 2000) {
  if (!sentryInitialized) return;

  await Sentry.close(timeout);
  logger.info("Sentry closed");
}

module.exports = {
  // Initialization
  initializeSentry,

  // Express middleware
  requestHandler,
  tracingHandler,
  errorHandler,

  // Capture functions
  captureException,
  captureMessage,
  captureSecurityEvent,
  captureAPIError,

  // Context management
  setUser,
  clearUser,
  setTags,
  addBreadcrumb,

  // Performance
  startTransaction,

  // Utilities
  withErrorCapture,
  close,

  // Direct Sentry access for advanced usage
  Sentry,
};
