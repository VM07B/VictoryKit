const mongoose = require('mongoose');

const controlSchema = new mongoose.Schema({
  auditId: { type: mongoose.Schema.Types.ObjectId, ref: 'ComplianceAudit', required: true },
  framework: { type: String, required: true },
  controlId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  category: String,
  status: { 
    type: String, 
    enum: ['not-assessed', 'passed', 'failed', 'partial', 'not-applicable'], 
    default: 'not-assessed' 
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  evidence: [{
    type: { type: String, enum: ['document', 'screenshot', 'log', 'config', 'attestation'] },
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  findings: {
    observation: String,
    gap: String,
    risk: String,
    recommendation: String
  },
  aiAssessment: {
    suggestedStatus: String,
    confidence: { type: Number, min: 0, max: 100 },
    reasoning: String,
    autoEvidence: [String]
  },
  remediation: {
    plan: String,
    owner: String,
    dueDate: Date,
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
  },
  assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assessedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

controlSchema.index({ auditId: 1, framework: 1 });
controlSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('ComplianceControl', controlSchema);
