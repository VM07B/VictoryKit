const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  analysisId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  analysisType: {
    type: String,
    enum: ['threat_landscape', 'actor_profile', 'campaign_analysis', 'ioc_correlation', 'trend_analysis'],
    required: true
  },
  timeRange: {
    start: Date,
    end: Date
  },
  filters: {
    threatTypes: [String],
    severities: [String],
    sources: [String],
    targetSectors: [String],
    targetCountries: [String]
  },
  totalThreats: {
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
  threatDistribution: {
    type: Map,
    of: Number
  },
  topThreats: [{
    intelId: String,
    title: String,
    severity: String,
    confidence: Number,
    threatType: String
  }],
  trends: [{
    period: String,
    count: Number,
    severity: String,
    threatType: String
  }],
  correlations: [{
    indicator: String,
    indicatorType: String,
    relatedThreats: Number,
    confidence: Number
  }],
  insights: [{
    type: String,
    title: String,
    description: String,
    severity: String,
    recommendations: [String]
  }],
  recommendations: [String],
  processingTime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ analysisType: 1 });
analysisSchema.index({ status: 1 });

module.exports = mongoose.model('IntelAnalysis', analysisSchema);
