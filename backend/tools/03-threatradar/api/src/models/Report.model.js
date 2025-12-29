const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  reportType: {
    type: String,
    enum: ['realtime', 'hourly', 'daily', 'weekly', 'incident', 'summary'],
    required: true
  },
  title: String,
  timeRange: {
    start: Date,
    end: Date
  },
  summary: {
    totalThreats: Number,
    criticalThreats: Number,
    activeThreats: Number,
    resolvedThreats: Number,
    falsePositives: Number,
    averageResponseTime: Number
  },
  metrics: {
    threatsBySeverity: {
      type: Map,
      of: Number
    },
    threatsByType: {
      type: Map,
      of: Number
    },
    threatsBySource: {
      type: Map,
      of: Number
    },
    detectionRate: Number,
    responseTime: Number
  },
  charts: [{
    type: String,
    title: String,
    data: mongoose.Schema.Types.Mixed
  }],
  timeline: [{
    timestamp: Date,
    event: String,
    severity: String,
    details: String
  }],
  recommendations: [String],
  format: {
    type: String,
    enum: ['pdf', 'html', 'json'],
    default: 'pdf'
  },
  fileUrl: String,
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ reportType: 1 });

module.exports = mongoose.model('ThreatReport', reportSchema);
