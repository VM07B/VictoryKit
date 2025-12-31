// VictoryKit Shared Module
// Single import for all shared utilities

const config = require("./config");
const { connectDB, connectDatabase, closeAll } = require("./config/database");

// Utils
const { ApiError } = require("./utils/apiError");
const { ApiResponse } = require("./utils/apiResponse");
const logger = require("./utils/logger");

// New Phase 1 Utils
const {
  z,
  schemas,
  validate: zodValidate,
  validateData,
} = require("./utils/validation");
const {
  createLogger,
  requestLogger,
  logSecurityEvent,
  logAuditEvent,
  startPerformanceTimer,
} = require("./utils/pinoLogger");
const {
  queues,
  addJob,
  createWorker,
  getQueueStats,
  closeQueues,
} = require("./utils/queue");
const {
  initializeSocketIO,
  emitToRoom,
  emitToUser,
  broadcastScanProgress,
  broadcastAlert,
  broadcastDashboardStats,
  namespaces,
  events,
} = require("./utils/realtime");
const {
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
} = require("./utils/fileHandler");
const {
  initializeEmail,
  sendEmail,
  sendTemplatedEmail,
  templates: emailTemplates,
} = require("./utils/email");

// AI Services (Phase 2)
const aiProvider = require("./services/aiProvider");
const langchainService = require("./services/langchainService");
const codeSandbox = require("./services/codeSandbox");

// Observability Services (Phase 3)
const tracing = require("./services/tracing");
const metrics = require("./services/metrics");
const errorTracking = require("./services/errorTracking");

// Security Middleware (Phase 3)
const securityMiddleware = require("./middleware/security.middleware");

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

  // AI Provider (OpenAI, Anthropic, Gemini)
  aiProvider,
  initializeAI: aiProvider.initializeProviders,
  chat: aiProvider.chat,
  streamChat: aiProvider.streamChat,
  generateEmbeddings: aiProvider.generateEmbeddings,
  securityPrompts: aiProvider.securityPrompts,

  // Langchain Orchestration
  langchainService,
  getChatModel: langchainService.getChatModel,
  createSecurityAgent: langchainService.createSecurityAgent,
  runSecurityAnalysis: langchainService.runSecurityAnalysis,
  createRAGChain: langchainService.createRAGChain,
  securityTools: langchainService.securityTools,

  // Code Sandbox (isolated-vm)
  codeSandbox,
  executeCode: codeSandbox.executeCode,
  analyzeCodeSecurity: codeSandbox.analyzeCodeSecurity,
  createSandbox: codeSandbox.createSandbox,

  // Tracing (OpenTelemetry)
  tracing,
  initializeTracing: tracing.initializeTracing,
  withSpan: tracing.withSpan,
  withSecurityScanSpan: tracing.withSecurityScanSpan,
  withAISpan: tracing.withAISpan,
  tracingMiddleware: tracing.tracingMiddleware,

  // Metrics (Prometheus)
  metrics,
  initializeMetrics: metrics.initializeMetrics,
  metricsMiddleware: metrics.metricsMiddleware,
  metricsHandler: metrics.metricsHandler,
  recordSecurityScan: metrics.recordSecurityScan,
  recordAIRequest: metrics.recordAIRequest,

  // Error Tracking (Sentry)
  errorTracking,
  initializeSentry: errorTracking.initializeSentry,
  captureException: errorTracking.captureException,
  captureSecurityEvent: errorTracking.captureSecurityEvent,
  sentryRequestHandler: errorTracking.requestHandler,
  sentryErrorHandler: errorTracking.errorHandler,

  // Advanced Security Middleware
  securityMiddleware,
  configureSecurityMiddleware: securityMiddleware.configureSecurityMiddleware,
  securityBundle: securityMiddleware.securityBundle,
  suspiciousActivityDetector: securityMiddleware.suspiciousActivityDetector,
  validateApiKey: securityMiddleware.validateApiKey,
  ipFilter: securityMiddleware.ipFilter,

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
