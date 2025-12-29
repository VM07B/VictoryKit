const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/apiError");

/**
 * Validation middleware that accepts validators and returns middleware array
 * Usage: validate([body('field').isString(), ...])
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      }));

      return next(ApiError.badRequest("Validation failed", extractedErrors));
    }

    next();
  };
};

module.exports = { validate };
