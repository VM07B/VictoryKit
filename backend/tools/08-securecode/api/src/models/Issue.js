const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodeScan', required: true },
  codebaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Codebase', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['vulnerability', 'secret', 'dependency', 'code-smell', 'security-hotspot'],
    required: true 
  },
  category: {
    type: String,
    enum: [
      'sql-injection', 'xss', 'csrf', 'ssrf', 'rce', 'path-traversal',
      'hardcoded-secret', 'api-key', 'password', 'token',
      'outdated-dependency', 'vulnerable-package',
      'insecure-random', 'weak-crypto', 'unsafe-deserialization',
      'open-redirect', 'information-disclosure', 'other'
    ],
    required: true
  },
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low', 'info'], 
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  location: {
    file: { type: String, required: true },
    startLine: Number,
    endLine: Number,
    column: Number,
    snippet: String
  },
  cweId: String,
  cvssScore: { type: Number, min: 0, max: 10 },
  fix: {
    suggestion: String,
    autoFixable: { type: Boolean, default: false },
    fixCode: String,
    references: [String]
  },
  status: { 
    type: String, 
    enum: ['open', 'confirmed', 'fixed', 'false-positive', 'wont-fix'], 
    default: 'open' 
  },
  aiConfidence: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

issueSchema.index({ scanId: 1, severity: 1 });
issueSchema.index({ codebaseId: 1, status: 1, type: 1 });
issueSchema.index({ 'location.file': 1 });

module.exports = mongoose.model('CodeIssue', issueSchema);
