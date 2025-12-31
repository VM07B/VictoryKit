/**
 * Zod-based validation utilities for VictoryKit
 * Provides type-safe request validation with detailed error messages
 */

const { z } = require("zod");

// Common validation schemas
const schemas = {
  // MongoDB ObjectId
  objectId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId"),

  // Email validation
  email: z.string().email("Invalid email address"),

  // Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  // URL validation
  url: z.string().url("Invalid URL"),

  // IP Address (v4 or v6)
  ipAddress: z.string().ip({ message: "Invalid IP address" }),

  // Domain name
  domain: z
    .string()
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "Invalid domain name"
    ),

  // UUID
  uuid: z.string().uuid("Invalid UUID"),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),

  // Date range
  dateRange: z
    .object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
    .refine((data) => data.startDate <= data.endDate, {
      message: "Start date must be before end date",
    }),

  // File upload metadata
  fileUpload: z.object({
    filename: z.string().min(1),
    mimetype: z.string(),
    size: z.number().max(50 * 1024 * 1024, "File size must be less than 50MB"),
  }),

  // Security scan request
  scanRequest: z.object({
    target: z.string().min(1, "Target is required"),
    scanType: z.enum(["quick", "full", "custom"]).default("quick"),
    options: z.record(z.any()).optional(),
  }),
};

/**
 * Express middleware factory for request validation
 * @param {object} schema - Zod schema object with body, query, params
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return async (req, res, next) => {
    try {
      const validated = {};

      if (schema.body) {
        validated.body = await schema.body.parseAsync(req.body);
        req.body = validated.body;
      }

      if (schema.query) {
        validated.query = await schema.query.parseAsync(req.query);
        req.query = validated.query;
      }

      if (schema.params) {
        validated.params = await schema.params.parseAsync(req.params);
        req.params = validated.params;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Validate data directly without middleware
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {object} { success: boolean, data?: any, errors?: array }
 */
function validateData(schema, data) {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      };
    }
    throw error;
  }
}

module.exports = {
  z,
  schemas,
  validate,
  validateData,
};
