const axios = require('axios');
const { logger } = require('../../../../../shared');

class MLService {
  constructor() {
    this.baseUrl = process.env.ML_DATAGUARDIAN_URL || 'http://localhost:8010';
  }

  async classifyData(content, context = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/classify`, {
        content,
        context
      }, { timeout: 60000 });
      return response.data;
    } catch (error) {
      logger.warn('ML service unavailable, using pattern-based classification');
      return this.fallbackClassification(content);
    }
  }

  async detectPII(content) {
    try {
      const response = await axios.post(`${this.baseUrl}/detect-pii`, {
        content
      }, { timeout: 30000 });
      return response.data;
    } catch (error) {
      return this.fallbackPIIDetection(content);
    }
  }

  async analyzeIncident(incident) {
    try {
      const response = await axios.post(`${this.baseUrl}/analyze-incident`, {
        incident
      }, { timeout: 60000 });
      return response.data;
    } catch (error) {
      return this.fallbackIncidentAnalysis(incident);
    }
  }

  async assessRisk(asset) {
    try {
      const response = await axios.post(`${this.baseUrl}/risk-assessment`, {
        asset
      }, { timeout: 30000 });
      return response.data;
    } catch (error) {
      return this.fallbackRiskAssessment(asset);
    }
  }

  fallbackClassification(content) {
    const patterns = {
      'PII': [/\b\d{3}-\d{2}-\d{4}\b/, /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/],
      'PHI': [/\b(diagnosis|patient|medical|health|prescription)\b/i],
      'PCI': [/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, /\b(cvv|cvc|card\s*number)\b/i],
      'financial': [/\b(bank|account|routing|swift|iban)\b/i],
      'credentials': [/\b(password|secret|api[_-]?key|token|credential)\b/i]
    };

    const detected = [];
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    Object.entries(patterns).forEach(([type, regexes]) => {
      if (regexes.some(regex => regex.test(contentStr))) {
        detected.push(type);
      }
    });

    return {
      dataTypes: detected,
      classification: this.deriveClassification(detected),
      confidence: 70,
      method: 'pattern-based'
    };
  }

  deriveClassification(dataTypes) {
    if (dataTypes.includes('credentials') || dataTypes.includes('PHI')) return 'restricted';
    if (dataTypes.includes('PCI') || dataTypes.includes('PII')) return 'confidential';
    if (dataTypes.includes('financial')) return 'confidential';
    return 'internal';
  }

  fallbackPIIDetection(content) {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const findings = [];

    const patterns = [
      { type: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g, risk: 'high' },
      { type: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, risk: 'medium' },
      { type: 'phone', regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, risk: 'medium' },
      { type: 'credit-card', regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, risk: 'critical' },
      { type: 'ip-address', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, risk: 'low' }
    ];

    patterns.forEach(pattern => {
      const matches = contentStr.match(pattern.regex);
      if (matches) {
        findings.push({
          type: pattern.type,
          count: matches.length,
          risk: pattern.risk,
          samples: matches.slice(0, 3).map(m => m.replace(/./g, (c, i) => i > 2 && i < m.length - 2 ? '*' : c))
        });
      }
    });

    return { findings, totalPII: findings.reduce((acc, f) => acc + f.count, 0) };
  }

  fallbackIncidentAnalysis(incident) {
    const severityWeights = { critical: 100, high: 75, medium: 50, low: 25 };
    const riskScore = severityWeights[incident.severity] || 50;

    return {
      classification: incident.type,
      riskScore,
      potentialImpact: riskScore > 70 ? 'High regulatory and reputational risk' : 'Moderate operational risk',
      recommendations: [
        'Contain the incident immediately',
        'Document all affected data and systems',
        'Notify relevant stakeholders',
        'Review and update security controls'
      ]
    };
  }

  fallbackRiskAssessment(asset) {
    let riskScore = 30;

    // Increase risk based on data types
    if (asset.dataTypes?.includes('PII')) riskScore += 20;
    if (asset.dataTypes?.includes('PHI')) riskScore += 25;
    if (asset.dataTypes?.includes('PCI')) riskScore += 25;
    if (asset.dataTypes?.includes('credentials')) riskScore += 30;

    // Decrease risk based on security controls
    if (asset.encryption?.atRest) riskScore -= 10;
    if (asset.encryption?.inTransit) riskScore -= 10;
    if (asset.accessControl?.authentication?.length > 1) riskScore -= 5;

    return {
      riskScore: Math.max(0, Math.min(100, riskScore)),
      factors: {
        dataTypesRisk: asset.dataTypes?.length || 0,
        encryptionMitigation: (asset.encryption?.atRest ? 1 : 0) + (asset.encryption?.inTransit ? 1 : 0),
        accessControlStrength: asset.accessControl?.authentication?.length || 0
      }
    };
  }
}

module.exports = new MLService();
