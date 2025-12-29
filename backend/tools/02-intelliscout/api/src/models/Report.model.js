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
    enum: ['daily', 'weekly', 'monthly', 'custom', 'incident', 'executive'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  timeRange: {
    start: Date,
    end: Date
  },
  summary: {
    totalThreats: Number,
    criticalThreats: Number,
    newThreats: Number,
    mitigatedThreats: Number,
    averageConfidence: Number,
    topThreatType: String
  },
  sections: [{
    title: String,
    content: String,
    order: Number,
    data: mongoose.Schema.Types.Mixed
  }],
  metrics: {
    threatsByType: {
      type: Map,
      of: Number
    },
    threatsBySeverity: {
      type: Map,
      of: Number
    },
    threatsBySource: {
      type: Map,
      of: Number
    },
    threatsByCountry: {
      type: Map,
      of: Number
    },
    threatsBySector: {
      type: Map,
      of: Number
    }
  },
  charts: [{
    type: String,
    title: String,
    data: mongoose.Schema.Types.Mixed,
    config: mongoose.Schema.Types.Mixed
  }],
  keyFindings: [String],
  recommendations: [{
    priority: String,
    title: String,
    description: String,
    actionItems: [String]
  }],
  format: {
    type: String,
    enum: ['pdf', 'html', 'json', 'csv'],
    default: 'pdf'
  },
  fileUrl: String,
  fileSize: Number,
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ 'timeRange.start': 1, 'timeRange.end': 1 });

module.exports = mongoose.model('IntelReport', reportSchema);
