const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token required');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Token expired'));
    } else {
      next(error);
    }
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || []
      };
    }

    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
};

// Role-based authorization
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

// Permission-based authorization
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const hasPermission = permissions.some(permission => 
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole,
  requirePermission
};
