const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = ApiError.badRequest('Validation Error', messages);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`${field} already exists`);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  // Default to ApiError if not already
  if (!(error instanceof ApiError)) {
    error = new ApiError(
      err.statusCode || 500,
      err.message || 'Internal Server Error',
      err.details
    );
  }

  // Log error
  logger.error(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    details: error.details,
    timestamp: error.timestamp,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

module.exports = {
  errorHandler,
  notFoundHandler
};
