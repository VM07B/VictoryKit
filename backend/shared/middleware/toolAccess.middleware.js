const ToolAccess = require('../models/ToolAccess.model');
const { ApiError } = require('../utils/apiError');

// Middleware to check if user has access to a specific tool
const checkToolAccess = (toolId) => {
  return async (req, res, next) => {
    try {
      // Admin always has access
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      // Check if user has active access
      const hasAccess = await ToolAccess.hasAccess(req.user.id, toolId);

      if (!hasAccess) {
        throw ApiError.forbidden(
          `Access denied. Purchase 24-hour access to ${toolId} for $1 to use this tool.`
        );
      }

      // Get access details and attach to request
      const access = await ToolAccess.getActiveAccess(req.user.id, toolId);
      req.toolAccess = access;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check access from route parameters
const checkToolAccessFromRoute = async (req, res, next) => {
  try {
    // Extract tool name from route path
    const pathSegments = req.path.split('/').filter(Boolean);
    const toolId = pathSegments[0]; // First segment after /api/v1/

    // Admin always has access
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // Check if user has active access
    const hasAccess = await ToolAccess.hasAccess(req.user.id, toolId);

    if (!hasAccess) {
      throw ApiError.forbidden(
        `Access denied. Purchase 24-hour access to this tool for $1.`
      );
    }

    // Get access details and attach to request
    const access = await ToolAccess.getActiveAccess(req.user.id, toolId);
    req.toolAccess = access;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkToolAccess,
  checkToolAccessFromRoute
};
