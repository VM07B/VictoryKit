/**
 * Socket.IO real-time utilities for VictoryKit
 * Provides live updates for security events, scans, and notifications
 */

const { Server } = require("socket.io");
const pino = require("pino");

const logger = pino({ name: "realtime-service" });

let io = null;

// Namespaces for different features
const namespaces = {
  SCANS: "/scans",
  ALERTS: "/alerts",
  DASHBOARD: "/dashboard",
  NOTIFICATIONS: "/notifications",
};

// Event types
const events = {
  // Scan events
  SCAN_STARTED: "scan:started",
  SCAN_PROGRESS: "scan:progress",
  SCAN_COMPLETED: "scan:completed",
  SCAN_FAILED: "scan:failed",

  // Alert events
  ALERT_NEW: "alert:new",
  ALERT_UPDATED: "alert:updated",
  ALERT_RESOLVED: "alert:resolved",

  // Dashboard events
  STATS_UPDATE: "stats:update",
  THREAT_DETECTED: "threat:detected",

  // Notification events
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
};

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @param {object} options - Socket.IO options
 * @returns {Server}
 */
function initializeSocketIO(httpServer, options = {}) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    ...options,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (token) {
      // TODO: Verify JWT token
      socket.userId = "authenticated-user"; // Replace with actual user ID
      next();
    } else if (process.env.NODE_ENV === "development") {
      socket.userId = "dev-user";
      next();
    } else {
      next(new Error("Authentication required"));
    }
  });

  // Connection handling
  io.on("connection", (socket) => {
    logger.info(
      { socketId: socket.id, userId: socket.userId },
      "Client connected"
    );

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle room subscriptions
    socket.on("subscribe", (room) => {
      socket.join(room);
      logger.debug({ socketId: socket.id, room }, "Joined room");
    });

    socket.on("unsubscribe", (room) => {
      socket.leave(room);
      logger.debug({ socketId: socket.id, room }, "Left room");
    });

    socket.on("disconnect", (reason) => {
      logger.info({ socketId: socket.id, reason }, "Client disconnected");
    });
  });

  // Setup namespaces
  setupNamespaces();

  logger.info("Socket.IO initialized");
  return io;
}

/**
 * Setup namespace-specific handlers
 */
function setupNamespaces() {
  // Scans namespace
  const scansNsp = io.of(namespaces.SCANS);
  scansNsp.on("connection", (socket) => {
    logger.debug({ socketId: socket.id }, "Connected to scans namespace");

    socket.on("subscribe:scan", (scanId) => {
      socket.join(`scan:${scanId}`);
    });
  });

  // Alerts namespace
  const alertsNsp = io.of(namespaces.ALERTS);
  alertsNsp.on("connection", (socket) => {
    logger.debug({ socketId: socket.id }, "Connected to alerts namespace");

    socket.on("subscribe:tool", (toolId) => {
      socket.join(`tool:${toolId}`);
    });
  });

  // Dashboard namespace
  const dashboardNsp = io.of(namespaces.DASHBOARD);
  dashboardNsp.on("connection", (socket) => {
    logger.debug({ socketId: socket.id }, "Connected to dashboard namespace");
  });
}

/**
 * Emit event to a room
 * @param {string} room - Room name
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function emitToRoom(room, event, data) {
  if (!io) {
    logger.warn("Socket.IO not initialized");
    return;
  }
  io.to(room).emit(event, data);
}

/**
 * Emit event to a user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function emitToUser(userId, event, data) {
  emitToRoom(`user:${userId}`, event, data);
}

/**
 * Emit event to a namespace
 * @param {string} namespace - Namespace name
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function emitToNamespace(namespace, event, data) {
  if (!io) {
    logger.warn("Socket.IO not initialized");
    return;
  }
  io.of(namespace).emit(event, data);
}

/**
 * Broadcast scan progress
 * @param {string} scanId - Scan ID
 * @param {number} progress - Progress percentage
 * @param {string} status - Current status
 */
function broadcastScanProgress(scanId, progress, status) {
  io?.of(namespaces.SCANS).to(`scan:${scanId}`).emit(events.SCAN_PROGRESS, {
    scanId,
    progress,
    status,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast new alert
 * @param {string} toolId - Tool ID
 * @param {object} alert - Alert data
 */
function broadcastAlert(toolId, alert) {
  io?.of(namespaces.ALERTS).to(`tool:${toolId}`).emit(events.ALERT_NEW, {
    toolId,
    alert,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast dashboard stats update
 * @param {object} stats - Statistics data
 */
function broadcastDashboardStats(stats) {
  io?.of(namespaces.DASHBOARD).emit(events.STATS_UPDATE, {
    stats,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get Socket.IO instance
 * @returns {Server}
 */
function getIO() {
  return io;
}

module.exports = {
  initializeSocketIO,
  emitToRoom,
  emitToUser,
  emitToNamespace,
  broadcastScanProgress,
  broadcastAlert,
  broadcastDashboardStats,
  getIO,
  namespaces,
  events,
};
