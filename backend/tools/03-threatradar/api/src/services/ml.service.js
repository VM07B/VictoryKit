const axios = require('axios');
const { ApiError } = require('../../../../shared/utils/apiError');

class MLService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8003';
  }

  async detectThreat(threatData) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/detect`, threatData, { timeout: 5000 });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') return this.ruleBasedDetection(threatData);
      throw new ApiError(500, 'ML detection failed: ' + error.message);
    }
  }

  async classifyThreat(features) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/classify`, features, { timeout: 3000 });
      return response.data;
    } catch (error) {
      return this.ruleBasedClassification(features);
    }
  }

  ruleBasedDetection(data) {
    let severity = 'MEDIUM', confidence = 60;
    if (data.sourceIP && this.isKnownMaliciousIP(data.sourceIP)) {
      severity = 'HIGH';
      confidence = 85;
    }
    if (data.threatType === 'ddos' || data.threatType === 'data_exfiltration') {
      severity = 'CRITICAL';
      confidence = 90;
    }
    return { severity, confidence, threatType: data.threatType, model: 'rule-based', timestamp: new Date() };
  }

  ruleBasedClassification(features) {
    return { threatType: features.threatType || 'unknown', confidence: 50, model: 'rule-based' };
  }

  isKnownMaliciousIP(ip) {
    return false; // Placeholder
  }

  async getModelMetrics() {
    try {
      const response = await axios.get(`${this.mlEngineUrl}/metrics`);
      return response.data;
    } catch (error) {
      return { status: 'unavailable' };
    }
  }
}

module.exports = new MLService();
