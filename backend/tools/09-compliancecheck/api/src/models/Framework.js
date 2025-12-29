const mongoose = require('mongoose');

const frameworkSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    enum: [
      'SOC2', 'ISO27001', 'HIPAA', 'PCI-DSS', 'GDPR', 'NIST', 
      'CIS', 'CCPA', 'FedRAMP', 'COBIT', 'HITRUST', 'SOX'
    ]
  },
  version: { type: String, default: '1.0' },
  description: String,
  category: {
    type: String,
    enum: ['security', 'privacy', 'industry', 'government', 'general'],
    default: 'security'
  },
  totalControls: { type: Number, default: 0 },
  controlCategories: [{
    name: String,
    description: String,
    controlCount: Number
  }],
  requirements: [{
    id: String,
    title: String,
    description: String,
    category: String,
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

frameworkSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('ComplianceFramework', frameworkSchema);
