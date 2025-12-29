const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataAsset' },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataPolicy' },
  type: { 
    type: String, 
    enum: ['data-breach', 'policy-violation', 'unauthorized-access', 'data-leak', 'compliance-violation', 'suspicious-activity'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low'], 
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  details: {
    source: String,
    destination: String,
    dataAffected: {
      type: [String],
      recordCount: Number,
      dataTypes: [String]
    },
    actor: {
      type: { type: String, enum: ['user', 'service', 'external', 'unknown'] },
      identifier: String,
      ip: String,
      location: String
    }
  },
  aiAnalysis: {
    classification: String,
    riskScore: { type: Number, min: 0, max: 100 },
    potentialImpact: String,
    recommendations: [String],
    similarIncidents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DataIncident' }]
  },
  status: { 
    type: String, 
    enum: ['open', 'investigating', 'contained', 'resolved', 'false-positive'], 
    default: 'open' 
  },
  response: {
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actions: [{
      action: String,
      performedBy: String,
      performedAt: { type: Date, default: Date.now },
      notes: String
    }],
    resolution: String,
    lessonsLearned: String
  },
  timeline: [{
    event: String,
    timestamp: { type: Date, default: Date.now },
    actor: String
  }],
  detectedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

incidentSchema.index({ userId: 1, status: 1 });
incidentSchema.index({ severity: 1, detectedAt: -1 });
incidentSchema.index({ type: 1 });

module.exports = mongoose.model('DataIncident', incidentSchema);
