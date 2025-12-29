const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reportId: { type: String, required: true, unique: true },
  reportType: { type: String, enum: ['scan_summary', 'compliance', 'trending', 'executive', 'technical'], required: true },
  title: { type: String, required: true },
  
  timeRange: {
    start: Date,
    end: Date
  },
  
  summary: {
    totalScans: Number,
    totalVulnerabilities: Number,
    criticalVulns: Number,
    remediationRate: String,
    avgCvssScore: Number,
    topCve: String
  },
  
  metrics: {
    vulnsBySeverity: { type: Map, of: Number },
    vulnsByType: { type: Map, of: Number },
    vulnsByCwe: { type: Map, of: Number },
    affectedAssets: { type: Map, of: Number }
  },
  
  charts: [{
    type: String,
    title: String,
    data: mongoose.Schema.Types.Mixed
  }],
  
  topVulnerabilities: [{
    vulnId: String,
    cve: String,
    title: String,
    severity: String,
    cvssScore: Number,
    affectedAssets: Number
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

module.exports = mongoose.model('VulnerabilityReport', reportSchema);
