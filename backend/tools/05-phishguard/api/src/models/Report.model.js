const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reportId: { type: String, required: true, unique: true },
  
  reportType: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'campaign', 'incident', 'executive'],
    required: true 
  },
  
  title: { type: String, required: true },
  
  timeRange: {
    start: Date,
    end: Date
  },
  
  summary: {
    totalUrls: Number,
    phishingUrls: Number,
    blockedUrls: Number,
    criticalThreats: Number,
    topPhishingType: String,
    detectionRate: String
  },
  
  metrics: {
    phishingByType: { type: Map, of: Number },
    phishingBySeverity: { type: Map, of: Number },
    phishingByDomain: { type: Map, of: Number },
    targetedBrands: { type: Map, of: Number }
  },
  
  charts: [{
    type: String,
    title: String,
    data: mongoose.Schema.Types.Mixed
  }],
  
  topThreats: [{
    urlId: String,
    url: String,
    phishingType: String,
    riskScore: Number,
    severity: String
  }],
  
  recommendations: [{
    priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
    title: String,
    description: String,
    actionItems: [String]
  }],
  
  format: { type: String, enum: ['pdf', 'html', 'json'], default: 'pdf' },
  fileUrl: String,
  status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });

reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PhishingReport', reportSchema);
