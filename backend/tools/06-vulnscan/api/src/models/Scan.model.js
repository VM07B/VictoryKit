const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scanId: { type: String, required: true, unique: true },
  targetType: { type: String, enum: ['network', 'web_application', 'host', 'container', 'cloud', 'api'], required: true },
  targetIdentifier: { type: String, required: true },
  scanType: { type: String, enum: ['full', 'quick', 'compliance', 'authenticated', 'unauthenticated'], default: 'quick' },
  
  scanConfig: {
    ports: [Number],
    depth: Number,
    timeout: Number,
    concurrent: Number,
    credentials: mongoose.Schema.Types.Mixed
  },
  
  vulnerabilities: [{
    vulnId: String,
    cve: String,
    title: String,
    description: String,
    severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] },
    cvssScore: Number,
    cvssVector: String,
    affectedComponent: String,
    port: Number,
    service: String,
    exploit: { available: Boolean, public: Boolean, metasploitModule: String },
    remediation: String,
    references: [String],
    cwe: String
  }],
  
  openPorts: [{
    port: Number,
    protocol: String,
    service: String,
    version: String,
    state: String
  }],
  
  services: [{
    name: String,
    version: String,
    vulnerabilities: [String]
  }],
  
  summary: {
    totalVulnerabilities: { type: Number, default: 0 },
    criticalCount: { type: Number, default: 0 },
    highCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    lowCount: { type: Number, default: 0 },
    avgCvssScore: { type: Number, default: 0 }
  },
  
  mlPrediction: {
    riskLevel: String,
    confidence: Number,
    recommendations: [String],
    timestamp: Date
  },
  
  status: { type: String, enum: ['pending', 'scanning', 'completed', 'failed'], default: 'pending' },
  startedAt: Date,
  completedAt: Date,
  duration: Number
}, { timestamps: true });

scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ targetIdentifier: 1 });
scanSchema.index({ status: 1 });

module.exports = mongoose.model('VulnerabilityScan', scanSchema);
