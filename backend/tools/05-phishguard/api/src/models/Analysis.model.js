const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  analysisId: { type: String, required: true, unique: true },
  
  analysisType: { 
    type: String, 
    enum: ['domain_analysis', 'url_batch', 'threat_intelligence', 'pattern_detection', 'campaign_analysis'],
    required: true 
  },
  
  timeRange: {
    start: Date,
    end: Date
  },
  
  metrics: {
    totalUrls: { type: Number, default: 0 },
    phishingUrls: { type: Number, default: 0 },
    cleanUrls: { type: Number, default: 0 },
    suspiciousUrls: { type: Number, default: 0 },
    criticalThreats: { type: Number, default: 0 },
    avgRiskScore: { type: Number, default: 0 }
  },
  
  phishingDistribution: { type: Map, of: Number },
  
  topPhishingDomains: [{
    domain: String,
    count: Number,
    avgRiskScore: Number
  }],
  
  topTargetedBrands: [{
    brand: String,
    count: Number,
    phishingType: String
  }],
  
  geographicDistribution: [{
    country: String,
    count: Number,
    riskLevel: String
  }],
  
  insights: [{
    type: { type: String, enum: ['critical', 'warning', 'info', 'recommendation'] },
    title: String,
    description: String,
    severity: String,
    affectedUrls: Number,
    recommendations: [String]
  }],
  
  processingTime: Number,
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ analysisType: 1 });

module.exports = mongoose.model('PhishingAnalysis', analysisSchema);
