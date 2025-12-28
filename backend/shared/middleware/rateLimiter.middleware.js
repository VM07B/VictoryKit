const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { ApiError } = require('../utils/apiError');

// Create rate limiter for API endpoints
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  const limiterOptions = {
    windowMs,
    max,
    message: {
      success: false,
      statusCode: 429,
      message,
      timestamp: new Date().toISOString()
    },
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw ApiError.tooManyRequests(message);
    }
  };

  // Use Redis for distributed rate limiting in production
  if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    limiterOptions.store = new RedisStore({
      client: require('redis').createClient({ url: process.env.REDIS_URL }),
      prefix: 'rl:'
    });
  }

  return rateLimit(limiterOptions);
};

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

// Standard API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later'
});

// Generous rate limiter for public endpoints
const publicLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  message: 'Too many requests, please try again later'
});

// Strict limiter for ML/AI endpoints (resource intensive)
const mlLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many ML requests, please try again later'
});

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  publicLimiter,
  mlLimiter
};
