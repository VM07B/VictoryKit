/**
 * LogEntry Model
 * Log entry storage and analysis
 */

const mongoose = require("mongoose");

const logEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      required: true,
      enum: [
        "system",
        "application",
        "network",
        "security",
        "database",
        "custom",
      ],
    },
    level: {
      type: String,
      required: true,
      enum: ["debug", "info", "warn", "error", "critical"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      hostname: String,
      ipAddress: String,
      userAgent: String,
      sessionId: String,
      requestId: String,
      correlationId: String,
    },
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
    },
    tags: [String],
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    analyzed: {
      type: Boolean,
      default: false,
    },
    analysis: {
      anomalies: [String],
      patterns: [String],
      recommendations: [String],
      riskScore: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
logEntrySchema.index({ userId: 1, timestamp: -1 });
logEntrySchema.index({ source: 1, level: 1 });
logEntrySchema.index({ "metadata.correlationId": 1 });
logEntrySchema.index({ tags: 1 });

module.exports = mongoose.model("LogEntry", logEntrySchema);
