/**
 * Pino-based high-performance logging utilities for VictoryKit
 * Use for high-throughput scenarios - faster than Winston
 */

const pino = require('pino');

// Log levels
const levels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

// Base configuration
const baseConfig = {
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.SERVICE_NAME || 'victorykit',
    env: process.env.NODE_ENV || 'development',
  },
};

// Development configuration (pretty printing)
const devConfig = {
  ...baseConfig,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
};

// Production configuration (JSON output)
const prodConfig = {
  ...baseConfig,
  redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'apiKey'],
};

/**
 * Create logger instance
 * @param {string} name - Logger name/module
 * @param {object} options - Additional options
 * @returns {pino.Logger}
 */
function createLogger(name, options = {}) {
  const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
  
  return pino({
    ...config,
    name,
    ...options,
  });
}

/**
 * Create child logger with additional context
 * @param {pino.Logger} parent - Parent logger
 * @param {object} bindings - Additional bindings
 * @returns {pino.Logger}
 */
function createChildLogger(parent, bindings) {
  return parent.child(bindings);
}

/**
 * Express request logging middleware
 * @param {object} options - Middleware options
 * @returns {Function}
 */
function requestLogger(options = {}) {
  const logger = createLogger('http');
  
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Generate request ID if not present
    req.id = req.id || req.headers['x-request-id'] || require('uuid').v4();
    
    // Log request
    logger.info({
      type: 'request',
      requestId: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    
    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logMethod = res.statusCode >= 400 ? 'error' : 'info';
      
      logger[logMethod]({
        type: 'response',
        requestId: req.id,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
    });
    
    next();
  };
}

/**
 * Security event logger
 */
const securityLogger = createLogger('security');

/**
 * Log security event
 * @param {string} event - Event type
 * @param {object} details - Event details
 * @param {string} severity - Event severity (info, warn, error)
 */
function logSecurityEvent(event, details, severity = 'info') {
  securityLogger[severity]({
    type: 'security-event',
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Audit logger for compliance
 */
const auditLogger = createLogger('audit');

/**
 * Log audit event
 * @param {string} action - Action performed
 * @param {object} details - Event details
 */
function logAuditEvent(action, details) {
  auditLogger.info({
    type: 'audit',
    action,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Performance logger
 */
const performanceLogger = createLogger('performance');

/**
 * Create performance timer
 * @param {string} operation - Operation name
 * @returns {Function} End timer function
 */
function startPerformanceTimer(operation) {
  const startTime = process.hrtime.bigint();
  
  return (metadata = {}) => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds
    
    performanceLogger.info({
      type: 'performance',
      operation,
      duration,
      ...metadata,
    });
    
    return duration;
  };
}

module.exports = {
  createLogger,
  createChildLogger,
  requestLogger,
  logSecurityEvent,
  logAuditEvent,
  startPerformanceTimer,
  levels,
};
