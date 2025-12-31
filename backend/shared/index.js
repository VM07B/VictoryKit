// VictoryKit Shared Module
// Single import for all shared utilities

const config = require("./config");
const { connectDB, connectDatabase, closeAll } = require("./config/database");

// Utils
const { ApiError } = require("./utils/apiError");
const { ApiResponse } = require("./utils/apiResponse");
const logger = require("./utils/logger");

// New Phase 1 Utils
const { z, schemas, validate: zodValidate, validateData } = require("./utils/validation");
const { createLogger, requestLogger, logSecurityEvent, logAuditEvent, startPerformanceTimer } = require("./utils/pinoLogger");
const { queues, addJob, createWorker, getQueueStats, closeQueues } = require("./utils/queue");
const { initializeSocketIO, emitToRoom, emitToUser, broadcastScanProgress, broadcastAlert, broadcastDashboardStats, namespaces, events } = require("./utils/realtime");
const { uploadSingle, uploadMultiple, getFileInfo, deleteFile, moveFile, readFile, writeFile, listFiles, cleanupOldFiles, UPLOAD_DIR } = require("./utils/fileHandler");
const { initializeEmail, sendEmail, sendTemplatedEmail, templates: emailTemplates } = require("./utils/email");

// Middleware
const {
  authMiddleware,
  optionalAuth,
  requireRole,
  requirePermission,
} = require("./middleware/auth.middleware");
const { errorHandler } = require("./middleware/errorHandler.middleware");
const { validate } = require("./middleware/validation.middleware");
const { createRateLimiter } = require("./middleware/rateLimiter.middleware");

module.exports = {
  // Config
  config,
  connectDB,
  connectDatabase,
  closeAll,

  // Utils (Legacy)
  ApiError,
  ApiResponse,
  logger,

  // Validation (Zod)
  z,
  schemas,
  zodValidate,
  validateData,

  // Logging (Pino - high performance)
  createLogger,
  requestLogger,
  logSecurityEvent,
  logAuditEvent,
  startPerformanceTimer,

  // Queue (BullMQ)
  queues,
  addJob,
  createWorker,
  getQueueStats,
  closeQueues,

  // Real-time (Socket.IO)
  initializeSocketIO,
  emitToRoom,
  emitToUser,
  broadcastScanProgress,
  broadcastAlert,
  broadcastDashboardStats,
  namespaces,
  events,

  // File Handling (Multer + fs-extra)
  uploadSingle,
  uploadMultiple,
  getFileInfo,
  deleteFile,
  moveFile,
  readFile,
  writeFile,
  listFiles,
  cleanupOldFiles,
  UPLOAD_DIR,

  // Email (Nodemailer)
  initializeEmail,
  sendEmail,
  sendTemplatedEmail,
  emailTemplates,

  // Middleware
  authenticate: authMiddleware,
  authMiddleware,
  optionalAuth,
  requireRole,
  requirePermission,
  errorHandler,
  validate,
  createRateLimiter,
};
