/**
 * LogAlert Model
 * Log-based alerts and notifications
 */

const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema({
  field: String,
  operator: {
    type: String,
    enum: ["equals", "contains", "regex", "greater", "less", "between"],
  },
  value: mongoose.Schema.Types.Mixed,
  caseSensitive: { type: Boolean, default: false },
});

const actionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["email", "webhook", "slack", "sms", "internal"],
  },
  target: String, // email address, webhook URL, etc.
  template: String, // alert message template
  enabled: { type: Boolean, default: true },
});

const logAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    enabled: {
      type: Boolean,
      default: true,
    },
    conditions: [conditionSchema],
    actions: [actionSchema],
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    cooldown: {
      type: Number, // minutes
      default: 60,
    },
    lastTriggered: Date,
    triggerCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
logAlertSchema.index({ userId: 1, enabled: 1 });
logAlertSchema.index({ tags: 1 });

module.exports = mongoose.model("LogAlert", logAlertSchema);
