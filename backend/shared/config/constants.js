module.exports = {
  // API Versioning
  API_VERSION: 'v1',
  
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  
  // JWT
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    ANALYST: 'analyst',
    VIEWER: 'viewer'
  },
  
  // Permissions
  PERMISSIONS: {
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete',
    ADMIN: 'admin'
  },
  
  // Risk Levels
  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  
  // Status
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'pdf', 'csv', 'json', 'txt'],
  
  // Cache TTL (seconds)
  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600 // 1 hour
  }
};
