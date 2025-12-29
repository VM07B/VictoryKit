const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  threatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  detectionSource: {
    type: String,
    enum: ['network', 'endpoint', 'email', 'web', 'cloud', 'iot', 'other'],
    required: true
  },
  threatType: {
    type: String,
    enum: ['malware', 'intrusion', 'ddos', 'data_exfiltration', 'unauthorized_access', 'anomaly', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'contained', 'resolved', 'false_positive'],
    default: 'active'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  sourceIP: String,
  destinationIP: String,
  sourcePort: Number,
  destinationPort: Number,
  protocol: String,
  affectedAssets: [{
    assetId: String,
    assetType: String,
    hostname: String,
    ipAddress: String
  }],
  indicators: {
    signatures: [String],
    behaviors: [String],
    fileHashes: [String],
    urls: [String],
    domains: [String]
  },
  attackVector: String,
  mitreTechnique: [String],
  mitreTactic: [String],
  description: String,
  impactAssessment: {
    scope: String,
    dataAtRisk: String,
    systemsAffected: Number,
    estimatedImpact: String
  },
  mlPrediction: {
    threatType: String,
    confidence: Number,
    model: String,
    features: mongoose.Schema.Types.Mixed,
    timestamp: Date
  },
  detectedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  occurrences: {
    type: Number,
    default: 1
  },
  containmentActions: [{
    action: String,
    timestamp: Date,
    performedBy: String,
    result: String
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
threatSchema.index({ userId: 1, detectedAt: -1 });
threatSchema.index({ severity: 1, status: 1 });
threatSchema.index({ threatType: 1 });
threatSchema.index({ sourceIP: 1 });
threatSchema.index({ destinationIP: 1 });

// Virtuals
threatSchema.virtual('isActive').get(function() {
  return this.status === 'active' || this.status === 'investigating';
});

threatSchema.virtual('isCritical').get(function() {
  return this.severity === 'CRITICAL';
});

module.exports = mongoose.model('Threat', threatSchema);
