/**
 * Advanced Security Middleware for VictoryKit
 * MongoDB sanitization, XSS protection, and additional security layers
 */

const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const helmet = require("helmet");
const pino = require("pino");

const logger = pino({ name: "security-middleware" });

/**
 * Configure all security middleware for Express app
 * @param {Express} app - Express application
 * @param {object} options - Configuration options
 */
function configureSecurityMiddleware(app, options = {}) {
  const {
    enableMongoSanitize = true,
    enableXSS = true,
    enableHPP = true,
    enableHelmet = true,
    hppWhitelist = [],
    cspDirectives = null,
  } = options;

  // Helmet - Security headers
  if (enableHelmet) {
    app.use(
      helmet({
        contentSecurityPolicy: cspDirectives
          ? { directives: cspDirectives }
          : {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: [
                  "'self'",
                  "https://api.openai.com",
                  "https://api.anthropic.com",
                ],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
              },
            },
        crossOriginEmbedderPolicy: false, // Allow embedding for certain use cases
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );
    logger.debug("Helmet security headers configured");
  }

  // MongoDB Query Sanitization - Prevent NoSQL injection
  if (enableMongoSanitize) {
    app.use(
      mongoSanitize({
        replaceWith: "_",
        onSanitize: ({ req, key }) => {
          logger.warn(
            {
              path: req.path,
              key,
              ip: req.ip,
            },
            "MongoDB injection attempt blocked"
          );
        },
      })
    );
    logger.debug("MongoDB sanitization enabled");
  }

  // XSS Protection - Clean user input
  if (enableXSS) {
    app.use(xss());
    logger.debug("XSS protection enabled");
  }

  // HTTP Parameter Pollution Protection
  if (enableHPP) {
    app.use(
      hpp({
        whitelist: [
          "sort",
          "filter",
          "fields",
          "page",
          "limit",
          "severity",
          "status",
          "type",
          ...hppWhitelist,
        ],
      })
    );
    logger.debug("HPP protection enabled");
  }

  logger.info("Security middleware configured");
}

/**
 * Request fingerprinting middleware
 * Creates a unique fingerprint for each request for tracking
 */
function requestFingerprint() {
  return (req, res, next) => {
    const crypto = require("crypto");
    const components = [
      req.ip,
      req.get("user-agent") || "",
      req.get("accept-language") || "",
      req.get("accept-encoding") || "",
    ];

    req.fingerprint = crypto
      .createHash("sha256")
      .update(components.join("|"))
      .digest("hex")
      .substring(0, 16);

    next();
  };
}

/**
 * Suspicious activity detection middleware
 * Flags potentially malicious requests
 */
function suspiciousActivityDetector(options = {}) {
  const {
    maxBodySize = 10 * 1024 * 1024, // 10MB
    suspiciousPatterns = [
      /(\.\.\/)/, // Path traversal
      /(<script)/i, // Script injection
      /(union\s+select)/i, // SQL injection
      /(\$where|\$gt|\$lt|\$ne)/i, // MongoDB operators in wrong context
      /(javascript:)/i, // JavaScript protocol
      /(data:text\/html)/i, // Data URL injection
      /(on\w+\s*=)/i, // Event handler injection
    ],
    onSuspicious,
  } = options;

  return (req, res, next) => {
    const suspicious = [];
    const checkValue = (value, location) => {
      if (typeof value === "string") {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            suspicious.push({
              location,
              pattern: pattern.toString(),
              value: value.substring(0, 100),
            });
          }
        }
      } else if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([key, val]) => {
          checkValue(val, `${location}.${key}`);
        });
      }
    };

    // Check various request parts
    checkValue(req.query, "query");
    checkValue(req.body, "body");
    checkValue(req.params, "params");

    // Check headers for common attack vectors
    const suspiciousHeaders = ["x-forwarded-for", "referer", "origin"];
    suspiciousHeaders.forEach((header) => {
      const value = req.get(header);
      if (value) checkValue(value, `header.${header}`);
    });

    if (suspicious.length > 0) {
      req.suspiciousActivity = suspicious;
      logger.warn(
        {
          path: req.path,
          method: req.method,
          ip: req.ip,
          fingerprint: req.fingerprint,
          suspicious,
        },
        "Suspicious activity detected"
      );

      if (onSuspicious) {
        onSuspicious(req, suspicious);
      }
    }

    next();
  };
}

/**
 * API key validation middleware
 * Validates API keys in headers
 */
function validateApiKey(options = {}) {
  const {
    headerName = "x-api-key",
    validateFn, // async function(apiKey) => { valid: boolean, client?: object }
    required = true,
  } = options;

  return async (req, res, next) => {
    const apiKey = req.get(headerName);

    if (!apiKey) {
      if (required) {
        return res.status(401).json({
          success: false,
          error: "API key required",
          code: "API_KEY_MISSING",
        });
      }
      return next();
    }

    try {
      if (validateFn) {
        const result = await validateFn(apiKey);
        if (!result.valid) {
          logger.warn(
            { ip: req.ip, path: req.path },
            "Invalid API key attempt"
          );
          return res.status(401).json({
            success: false,
            error: "Invalid API key",
            code: "API_KEY_INVALID",
          });
        }
        req.apiClient = result.client;
      }
      next();
    } catch (error) {
      logger.error({ error: error.message }, "API key validation error");
      return res.status(500).json({
        success: false,
        error: "Authentication error",
        code: "AUTH_ERROR",
      });
    }
  };
}

/**
 * Request size limiter
 * Limits request body size based on content type
 */
function requestSizeLimiter(options = {}) {
  const {
    maxJsonSize = "1mb",
    maxUrlEncodedSize = "1mb",
    maxFileSize = "50mb",
  } = options;

  const express = require("express");

  return [
    express.json({ limit: maxJsonSize }),
    express.urlencoded({ extended: true, limit: maxUrlEncodedSize }),
    (req, res, next) => {
      // File upload size is handled by multer
      next();
    },
  ];
}

/**
 * IP blacklist/whitelist middleware
 * @param {object} options - Configuration
 */
function ipFilter(options = {}) {
  const { blacklist = [], whitelist = [], mode = "blacklist" } = options;

  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (mode === "whitelist" && whitelist.length > 0) {
      if (!whitelist.includes(clientIP)) {
        logger.warn({ ip: clientIP }, "IP not in whitelist");
        return res.status(403).json({
          success: false,
          error: "Access denied",
          code: "IP_NOT_WHITELISTED",
        });
      }
    }

    if (mode === "blacklist" && blacklist.includes(clientIP)) {
      logger.warn({ ip: clientIP }, "Blacklisted IP blocked");
      return res.status(403).json({
        success: false,
        error: "Access denied",
        code: "IP_BLACKLISTED",
      });
    }

    next();
  };
}

/**
 * Security headers for API responses
 */
function securityHeaders() {
  return (req, res, next) => {
    // Remove sensitive headers
    res.removeHeader("X-Powered-By");

    // Add security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
    );

    next();
  };
}

/**
 * Combine all security middleware into one
 * @param {object} options - Configuration
 * @returns {Function[]}
 */
function securityBundle(options = {}) {
  const middlewares = [securityHeaders(), requestFingerprint()];

  if (options.detectSuspicious !== false) {
    middlewares.push(suspiciousActivityDetector(options.suspicious || {}));
  }

  return middlewares;
}

module.exports = {
  // Main configuration
  configureSecurityMiddleware,

  // Individual middleware
  requestFingerprint,
  suspiciousActivityDetector,
  validateApiKey,
  requestSizeLimiter,
  ipFilter,
  securityHeaders,

  // Bundle
  securityBundle,

  // Re-export for direct use
  mongoSanitize,
  xss,
  hpp,
  helmet,
};
