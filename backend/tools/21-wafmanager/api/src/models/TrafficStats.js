const mongoose = require("mongoose");

const trafficStatsSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ["minute", "hour", "day"],
      default: "hour",
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    blockedRequests: {
      type: Number,
      default: 0,
    },
    allowedRequests: {
      type: Number,
      default: 0,
    },
    challengedRequests: {
      type: Number,
      default: 0,
    },
    rateLimitedRequests: {
      type: Number,
      default: 0,
    },
    uniqueIps: {
      type: Number,
      default: 0,
    },
    attacksByCategory: {
      sqli: { type: Number, default: 0 },
      xss: { type: Number, default: 0 },
      rce: { type: Number, default: 0 },
      lfi: { type: Number, default: 0 },
      rfi: { type: Number, default: 0 },
      csrf: { type: Number, default: 0 },
      bot: { type: Number, default: 0 },
      scanner: { type: Number, default: 0 },
      custom: { type: Number, default: 0 },
    },
    topAttackingIps: [
      {
        ip: String,
        count: Number,
        country: String,
      },
    ],
    topTargetedPaths: [
      {
        path: String,
        count: Number,
      },
    ],
    avgResponseTime: {
      type: Number,
      default: 0,
    },
    bandwidth: {
      incoming: { type: Number, default: 0 },
      outgoing: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

trafficStatsSchema.index({ timestamp: -1, period: 1 });

module.exports = mongoose.model("TrafficStats", trafficStatsSchema);
