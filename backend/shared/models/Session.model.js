const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    unique: true,
    sparse: true
  },
  ipAddress: String,
  userAgent: String,
  deviceInfo: {
    type: String,
    browser: String,
    os: String,
    device: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - auto-delete expired sessions
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ expiresAt: 1 });

// Update last activity
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = Date.now();
  return this.save();
};

// Revoke session
sessionSchema.methods.revoke = function() {
  this.isActive = false;
  return this.save();
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Session', sessionSchema);
