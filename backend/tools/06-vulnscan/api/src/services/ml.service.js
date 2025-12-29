const axios = require('axios');
const logger = require('../../../../shared/utils/logger');

class MLService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8006';
  }

  async analyzeScan(scanData) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/analyze`, scanData, { timeout: 10000 });
      return response.data;
    } catch (error) {
      logger.warn('ML engine unavailable, using rule-based');
      return this.ruleBasedAnalysis(scanData);
    }
  }

  async predictExploit(vulnData) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/exploit-prediction`, vulnData, { timeout: 5000 });
      return response.data;
    } catch (error) {
      return { available: false, confidence: 0 };
    }
  }

  ruleBasedAnalysis(data) {
    const { vulnerabilities } = data;
    const critical = vulnerabilities.filter(v => v.cvssScore >= 9).length;
    const high = vulnerabilities.filter(v => v.cvssScore >= 7 && v.cvssScore < 9).length;

    let riskLevel = 'LOW';
    if (critical > 0) riskLevel = 'CRITICAL';
    else if (high > 3) riskLevel = 'HIGH';
    else if (high > 0) riskLevel = 'MEDIUM';

    return {
      riskLevel,
      confidence: 80,
      recommendations: ['Patch critical vulnerabilities', 'Review high-severity findings', 'Implement defense controls'],
      timestamp: new Date()
    };
  }
}

module.exports = new MLService();
