const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  name: { type: String, required: true },
  frameworks: [{
    type: String,
    enum: ['SOC2', 'ISO27001', 'HIPAA', 'PCI-DSS', 'GDPR', 'NIST', 'CIS', 'CCPA', 'FedRAMP']
  }],
  scope: {
    systems: [String],
    departments: [String],
    dataTypes: [String],
    regions: [String]
  },
  status: { 
    type: String, 
    enum: ['draft', 'in-progress', 'review', 'completed', 'archived'], 
    default: 'draft' 
  },
  progress: { type: Number, default: 0 },
  results: {
    overallScore: { type: Number, min: 0, max: 100 },
    passedControls: { type: Number, default: 0 },
    failedControls: { type: Number, default: 0 },
    partialControls: { type: Number, default: 0 },
    notApplicable: { type: Number, default: 0 }
  },
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'minimal'],
    default: 'medium'
  },
  aiSummary: {
    overview: String,
    keyFindings: [String],
    criticalGaps: [String],
    recommendations: [String],
    estimatedRemediationTime: String
  },
  schedule: {
    startDate: Date,
    targetEndDate: Date,
    actualEndDate: Date
  },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

auditSchema.index({ userId: 1, status: 1 });
auditSchema.index({ frameworks: 1 });

module.exports = mongoose.model('ComplianceAudit', auditSchema);
