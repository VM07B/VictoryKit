const mongoose = require("mongoose");

const wafRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ruleType: {
      type: String,
      enum: ["block", "allow", "challenge", "rate_limit", "log"],
      default: "block",
    },
    pattern: {
      type: String,
      required: true,
    },
    patternType: {
      type: String,
      enum: ["regex", "exact", "contains", "starts_with", "ends_with"],
      default: "regex",
    },
    target: {
      type: String,
      enum: ["uri", "headers", "body", "query", "ip", "user_agent", "cookie"],
      default: "uri",
    },
    priority: {
      type: Number,
      default: 100,
      min: 1,
      max: 10000,
    },
    enabled: {
      type: Boolean,
      default: true,
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
      ],
      default: "custom",
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "medium",
    },
    matchCount: {
      type: Number,
      default: 0,
    },
    lastMatched: {
      type: Date,
    },
    createdBy: {
      type: String,
      default: "system",
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

wafRuleSchema.index({ enabled: 1, priority: 1 });
wafRuleSchema.index({ category: 1 });
wafRuleSchema.index({ ruleType: 1 });

module.exports = mongoose.model("WAFRule", wafRuleSchema);
