const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  urlId: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  domain: { type: String, required: true, index: true },
  protocol: { type: String, enum: ['http', 'https', 'ftp', 'unknown'], default: 'unknown' },
  urlHash: { type: String, required: true, index: true },
  
  phishingType: { 
    type: String, 
    enum: ['credential_harvesting', 'malware_delivery', 'social_engineering', 'fake_login', 'scam', 'fake_service', 'unknown'],
    default: 'unknown'
  },
  
  isPhishing: { type: Boolean, default: false },
  riskScore: { type: Number, min: 0, max: 100, default: 0 },
  confidence: { type: Number, min: 0, max: 100, default: 0 },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  
  urlFeatures: {
    length: Number,
    numDots: Number,
    numHyphens: Number,
    numDigits: Number,
    numSpecialChars: Number,
    hasIpAddress: Boolean,
    isShortenedUrl: Boolean,
    hasSuspiciousKeywords: Boolean,
    isHttps: Boolean,
    domainAge: Number,
    pageRank: Number
  },
  
  domainInfo: {
    registrar: String,
    creationDate: Date,
    expirationDate: Date,
    whoisInfo: String,
    dnsRecords: [String],
    ipAddress: String,
    location: String
  },
  
  contentAnalysis: {
    title: String,
    hasLoginForm: Boolean,
    hasSuspiciousForms: Boolean,
    externalLinks: Number,
    hiddenFields: Number,
    iframeCount: Number,
    scriptCount: Number,
    suspiciousKeywords: [String]
  },
  
  screenshots: [{
    url: String,
    timestamp: Date
  }],
  
  similarUrls: [{
    url: String,
    similarity: Number,
    isPhishing: Boolean
  }],
  
  reputation: {
    blacklisted: Boolean,
    blacklistSources: [String],
    reports: Number,
    lastReportDate: Date
  },
  
  mlPrediction: {
    isPhishing: Boolean,
    confidence: Number,
    modelName: String,
    features: Map,
    timestamp: Date
  },
  
  status: { type: String, enum: ['pending', 'analyzing', 'completed', 'failed'], default: 'pending' },
  checkedAt: { type: Date, default: Date.now },
  lastCheckedAt: Date
}, { timestamps: true });

urlSchema.index({ userId: 1, checkedAt: -1 });
urlSchema.index({ domain: 1, isPhishing: 1 });
urlSchema.index({ riskScore: -1 });

urlSchema.virtual('isHighRisk').get(function() {
  return this.riskScore >= 70 && this.isPhishing;
});

module.exports = mongoose.model('PhishingUrl', urlSchema);
