const mongoose = require("mongoose");

const attackLogSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WAFRule",
    },
    ruleName: {
      type: String,
    },
    sourceIp: {
      type: String,
      required: true,
    },
    targetUri: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
      default: "GET",
    },
    userAgent: {
      type: String,
    },
    payload: {
      type: String,
    },
    matchedPattern: {
      type: String,
    },
    action: {
      type: String,
      enum: ["blocked", "allowed", "challenged", "rate_limited", "logged"],
      default: "blocked",
    },
    category: {
      type: String,
      enum: [
        "sqli",
        "xss",
        "rce",
        "lfi",
        "rfi",
        "csrf",
        "custom",
        "bot",
        "scanner",
        "unknown",
      ],
      default: "unknown",
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "medium",
    },
    geoLocation: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
    headers: {
      type: Map,
      of: String,
    },
    responseCode: {
      type: Number,
    },
    processingTime: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

attackLogSchema.index({ createdAt: -1 });
attackLogSchema.index({ sourceIp: 1, createdAt: -1 });
attackLogSchema.index({ category: 1, createdAt: -1 });
attackLogSchema.index({ action: 1 });

module.exports = mongoose.model("AttackLog", attackLogSchema);
