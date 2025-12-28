const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiError');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));

    throw ApiError.badRequest('Validation failed', extractedErrors);
  }

  next();
};

module.exports = { validate };
