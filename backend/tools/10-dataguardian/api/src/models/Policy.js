const mongoose = require('mongoose');

const policySc = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['data-classification', 'access-control', 'retention', 'encryption', 'privacy', 'dlp', 'backup'],
    required: true 
  },
  scope: {
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DataAsset' }],
    dataTypes: [String],
    classifications: [String]
  },
  rules: [{
    condition: {
      field: String,
      operator: { type: String, enum: ['equals', 'contains', 'matches', 'greater', 'less'] },
      value: mongoose.Schema.Types.Mixed
    },
    action: {
      type: { type: String, enum: ['allow', 'deny', 'alert', 'encrypt', 'mask', 'log', 'quarantine'] },
      params: mongoose.Schema.Types.Mixed
    },
    priority: { type: Number, default: 100 }
  }],
  enforcement: {
    mode: { type: String, enum: ['monitor', 'enforce', 'disabled'], default: 'monitor' },
    startDate: Date,
    endDate: Date
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    channels: [{ type: String, enum: ['email', 'slack', 'webhook', 'sms'] }],
    recipients: [String]
  },
  status: { type: String, enum: ['draft', 'active', 'paused', 'archived'], default: 'draft' },
  violations: { type: Number, default: 0 },
  lastTriggered: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

policySc.index({ userId: 1, type: 1 });
policySc.index({ status: 1 });

module.exports = mongoose.model('DataPolicy', policySc);
