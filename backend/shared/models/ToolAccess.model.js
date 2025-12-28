const mongoose = require('mongoose');

const toolAccessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  toolId: {
    type: String,
    required: true,
    index: true,
    enum: [
      'fraudguard', 'intelliscout', 'threatradar', 'malwarehunter', 'phishguard',
      'vulnscan', 'pentestai', 'securecode', 'compliancecheck', 'dataguardian',
      'cryptoshield', 'iamcontrol', 'logintel', 'netdefender', 'endpointshield',
      'cloudsecure', 'apiguardian', 'containerwatch', 'devsecops', 'incidentcommand',
      'forensicslab', 'threathunt', 'ransomdefend', 'zerotrustnet', 'privacyshield',
      'socautomation', 'threatintelhub', 'assetdiscovery', 'patchmanager', 'backupguardian',
      'disasterrecovery', 'emailsecure', 'webappfirewall', 'botdefense', 'ddosmitigator',
      'securegateway', 'mobilesecurity', 'iotsecure', 'supplychainsec', 'brandprotect',
      'datalossprevention', 'userbehavioranalytics', 'threatmodeling', 'redteamsim',
      'blueteamops', 'purpleteamhub', 'cyberinsurance', 'securityawareness', 'vendorriskmgmt',
      'cyberthreatmap'
    ]
  },
  toolName: {
    type: String,
    required: true
  },
  paymentAmount: {
    type: Number,
    required: true,
    default: 1.00 // $1 USD
  },
  paymentCurrency: {
    type: String,
    default: 'USD'
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'crypto'],
    default: 'stripe'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index for quick access checks
toolAccessSchema.index({ userId: 1, toolId: 1, isActive: 1 });
toolAccessSchema.index({ userId: 1, expiresAt: -1 });

// Virtual to check if access is expired
toolAccessSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual to check if access is valid
toolAccessSchema.virtual('isValid').get(function() {
  return this.isActive && !this.isExpired;
});

// Virtual for remaining time
toolAccessSchema.virtual('remainingTime').get(function() {
  if (this.isExpired) return 0;
  return Math.max(0, this.expiresAt - Date.now());
});

// Method to deactivate expired access
toolAccessSchema.methods.deactivateIfExpired = function() {
  if (this.isExpired && this.isActive) {
    this.isActive = false;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to cleanup expired access
toolAccessSchema.statics.deactivateExpired = async function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      isActive: true
    },
    {
      isActive: false
    }
  );
};

// Static method to check user access to a tool
toolAccessSchema.statics.hasAccess = async function(userId, toolId) {
  const access = await this.findOne({
    userId,
    toolId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ expiresAt: -1 });

  return !!access;
};

// Static method to get active access
toolAccessSchema.statics.getActiveAccess = async function(userId, toolId) {
  return this.findOne({
    userId,
    toolId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ expiresAt: -1 });
};

module.exports = mongoose.model('ToolAccess', toolAccessSchema);
