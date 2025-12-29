const mongoose = require('mongoose');

const dataAssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['database', 'file-storage', 'api', 'application', 'cloud-service', 'endpoint'],
    required: true 
  },
  classification: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted', 'top-secret'],
    default: 'internal'
  },
  dataTypes: [{
    type: String,
    enum: ['PII', 'PHI', 'PCI', 'financial', 'credentials', 'intellectual-property', 'general']
  }],
  location: {
    provider: { type: String, enum: ['aws', 'azure', 'gcp', 'on-premise', 'hybrid'] },
    region: String,
    service: String,
    identifier: String
  },
  encryption: {
    atRest: { type: Boolean, default: false },
    inTransit: { type: Boolean, default: false },
    algorithm: String,
    keyManagement: String
  },
  accessControl: {
    authentication: [String],
    authorization: String,
    accessList: [{
      entity: String,
      type: { type: String, enum: ['user', 'role', 'service', 'application'] },
      permissions: [String]
    }]
  },
  retention: {
    policy: String,
    duration: String,
    autoDelete: { type: Boolean, default: false }
  },
  compliance: {
    frameworks: [String],
    lastAudit: Date,
    nextAudit: Date
  },
  riskScore: { type: Number, min: 0, max: 100, default: 50 },
  status: { type: String, enum: ['active', 'archived', 'pending-review'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

dataAssetSchema.index({ userId: 1, classification: 1 });
dataAssetSchema.index({ dataTypes: 1 });
dataAssetSchema.index({ riskScore: -1 });

module.exports = mongoose.model('DataAsset', dataAssetSchema);
