/**
 * LogAnalysis Model
 * Log analysis results and insights
 */

const mongoose = require("mongoose");

const patternSchema = new mongoose.Schema({
  name: String,
  regex: String,
  description: String,
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
  },
  category: String,
});

const anomalySchema = new mongoose.Schema({
  type: String,
  description: String,
  confidence: Number,
  evidence: [String],
  timestamp: { type: Date, default: Date.now },
});

const logAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    logEntryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LogEntry",
      },
    ],
    timeRange: {
      start: Date,
      end: Date,
    },
    summary: {
      totalEntries: Number,
      errorCount: Number,
      warningCount: Number,
      criticalCount: Number,
      uniqueSources: Number,
      patternsDetected: Number,
    },
    patterns: [patternSchema],
    anomalies: [anomalySchema],
    insights: [
      {
        type: String,
        priority: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
        },
        description: String,
        recommendation: String,
      },
    ],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
logAnalysisSchema.index({ userId: 1, createdAt: -1 });
logAnalysisSchema.index({ status: 1 });

module.exports = mongoose.model("LogAnalysis", logAnalysisSchema);
