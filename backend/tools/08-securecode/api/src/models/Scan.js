const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  codebaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Codebase', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scanType: { 
    type: String, 
    enum: ['full', 'incremental', 'targeted', 'quick'], 
    default: 'full' 
  },
  options: {
    scanSecrets: { type: Boolean, default: true },
    scanVulnerabilities: { type: Boolean, default: true },
    scanDependencies: { type: Boolean, default: true },
    scanCodeQuality: { type: Boolean, default: true },
    severity: { type: String, enum: ['all', 'high', 'critical'], default: 'all' }
  },
  status: { 
    type: String, 
    enum: ['pending', 'scanning', 'analyzing', 'completed', 'failed'], 
    default: 'pending' 
  },
  progress: { type: Number, default: 0 },
  results: {
    filesScanned: { type: Number, default: 0 },
    issuesFound: { type: Number, default: 0 },
    criticalCount: { type: Number, default: 0 },
    highCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    lowCount: { type: Number, default: 0 },
    secretsFound: { type: Number, default: 0 },
    securityScore: { type: Number, min: 0, max: 100 }
  },
  aiInsights: {
    summary: String,
    topRisks: [String],
    recommendations: [String],
    estimatedFixTime: String
  },
  startedAt: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

scanSchema.index({ codebaseId: 1, status: 1 });
scanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CodeScan', scanSchema);
