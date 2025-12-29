const mongoose = require('mongoose');

const codebaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  repository: {
    url: String,
    branch: { type: String, default: 'main' },
    type: { type: String, enum: ['github', 'gitlab', 'bitbucket', 'local'], default: 'local' }
  },
  languages: [{ type: String }],
  frameworks: [{ type: String }],
  stats: {
    totalFiles: { type: Number, default: 0 },
    totalLines: { type: Number, default: 0 },
    lastCommit: String
  },
  status: { 
    type: String, 
    enum: ['active', 'archived', 'syncing'], 
    default: 'active' 
  },
  lastScanAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

codebaseSchema.index({ userId: 1, status: 1 });
codebaseSchema.index({ 'repository.url': 1 });

module.exports = mongoose.model('Codebase', codebaseSchema);
