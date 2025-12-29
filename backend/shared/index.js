// VictoryKit Shared Module
// Single import for all shared utilities

const config = require('./config');
const { connectDB, connectDatabase, closeAll } = require('./config/database');

// Utils
const { ApiError } = require('./utils/apiError');
const { ApiResponse } = require('./utils/apiResponse');
const logger = require('./utils/logger');

// Middleware
const { authenticate } = require('./middleware/auth.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const { validate } = require('./middleware/validation.middleware');
const { createRateLimiter } = require('./middleware/rateLimiter.middleware');

module.exports = {
  // Config
  config,
  connectDB,
  connectDatabase,
  closeAll,
  
  // Utils
  ApiError,
  ApiResponse,
  logger,
  
  // Middleware
  authenticate,
  errorHandler,
  validate,
  createRateLimiter
};
