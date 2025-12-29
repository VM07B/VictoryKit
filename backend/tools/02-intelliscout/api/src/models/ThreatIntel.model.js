const mongoose = require('mongoose');

const threatIntelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  intelId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sourceType: {
    type: String,
    enum: ['osint', 'darkweb', 'social_media', 'threat_feed', 'honeypot', 'ioc', 'other'],
    required: true
  },
  threatType: {
    type: String,
    enum: ['malware', 'phishing', 'ransomware', 'apt', 'botnet', 'exploit', 'vulnerability', 'data_leak', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  indicators: {
    ips: [String],
    domains: [String],
    urls: [String],
    hashes: [String],
    emails: [String],
    fileNames: [String]
  },
  targetSectors: [{
    type: String
  }],
  targetCountries: [{
    type: String
  }],
  attackVectors: [{
    type: String
  }],
  mitreTactics: [{
    type: String
  }],
  mitreTechniques: [{
    type: String
  }],
  sources: [{
    name: String,
    url: String,
    reliability: String,
    timestamp: Date
  }],
  relatedThreats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ThreatIntel'
  }],
  mlPrediction: {
    severity: String,
    confidence: Number,
    threatCategory: String,
    model: String,
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['new', 'investigating', 'confirmed', 'mitigated', 'false_positive'],
    default: 'new'
  },
  tags: [String],
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
threatIntelSchema.index({ userId: 1, createdAt: -1 });
threatIntelSchema.index({ threatType: 1, severity: 1 });
threatIntelSchema.index({ confidenceScore: -1 });
threatIntelSchema.index({ status: 1 });
threatIntelSchema.index({ 'indicators.ips': 1 });
threatIntelSchema.index({ 'indicators.domains': 1 });
threatIntelSchema.index({ tags: 1 });

// Virtual for critical status
threatIntelSchema.virtual('isCritical').get(function() {
  return this.severity === 'CRITICAL' || this.confidenceScore >= 90;
});

// Virtual for active threat
threatIntelSchema.virtual('isActive').get(function() {
  return this.status !== 'mitigated' && this.status !== 'false_positive';
});

module.exports = mongoose.model('ThreatIntel', threatIntelSchema);
