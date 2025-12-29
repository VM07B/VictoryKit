const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  detectionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  detectionType: {
    type: String,
    enum: ['signature', 'behavioral', 'anomaly', 'heuristic', 'ml_based'],
    required: true
  },
  timeRange: {
    start: Date,
    end: Date
  },
  totalDetections: {
    type: Number,
    default: 0
  },
  criticalThreats: {
    type: Number,
    default: 0
  },
  highThreats: {
    type: Number,
    default: 0
  },
  mediumThreats: {
    type: Number,
    default: 0
  },
  lowThreats: {
    type: Number,
    default: 0
  },
  activeThreats: {
    type: Number,
    default: 0
  },
  resolvedThreats: {
    type: Number,
    default: 0
  },
  detectionsBySource: {
    type: Map,
    of: Number
  },
  detectionsByType: {
    type: Map,
    of: Number
  },
  topThreats: [{
    threatId: String,
    threatType: String,
    severity: String,
    confidence: Number,
    detectedAt: Date
  }],
  topTargets: [{
    assetId: String,
    hostname: String,
    ipAddress: String,
    threatCount: Number
  }],
  topAttackers: [{
    sourceIP: String,
    country: String,
    threatCount: Number,
    lastSeen: Date
  }],
  insights: [{
    type: String,
    title: String,
    description: String,
    severity: String,
    recommendations: [String]
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

detectionSchema.index({ userId: 1, createdAt: -1 });
detectionSchema.index({ detectionType: 1 });
detectionSchema.index({ status: 1 });

module.exports = mongoose.model('Detection', detectionSchema);
