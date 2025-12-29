const axios = require('axios');
const logger = require('../../../../shared/utils/logger');

class MLService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8005';
  }

  async analyzeUrl(urlData) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/analyze`, urlData, { timeout: 10000 });
      return response.data;
    } catch (error) {
      logger.warn('ML engine unavailable, using rule-based analysis');
      return this.ruleBasedAnalysis(urlData);
    }
  }

  async checkReputation(url) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/reputation`, { url }, { timeout: 5000 });
      return response.data;
    } catch (error) {
      logger.warn('Reputation check failed');
      return { blacklisted: false, reports: 0 };
    }
  }

  async detectCampaign(urls) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/campaign`, { urls }, { timeout: 8000 });
      return response.data;
    } catch (error) {
      logger.warn('Campaign detection failed');
      return { campaignDetected: false };
    }
  }

  ruleBasedAnalysis(data) {
    const { url, domain, urlFeatures } = data;
    let riskScore = 30;
    let isPhishing = false;
    let phishingType = 'unknown';

    const suspiciousKeywords = ['login', 'verify', 'account', 'secure', 'update', 'confirm', 'suspended', 'alert'];
    const phishingDomains = ['paypa1', 'amaz0n', 'g00gle', 'micros0ft'];

    if (urlFeatures?.hasIpAddress) riskScore += 20;
    if (urlFeatures?.length > 75) riskScore += 15;
    if (!urlFeatures?.isHttps) riskScore += 10;
    if (urlFeatures?.isShortenedUrl) riskScore += 25;
    if (urlFeatures?.numHyphens > 3) riskScore += 10;
    
    if (suspiciousKeywords.some(kw => url.toLowerCase().includes(kw))) {
      riskScore += 15;
      phishingType = 'credential_harvesting';
    }

    if (phishingDomains.some(pd => domain.toLowerCase().includes(pd))) {
      riskScore += 30;
      isPhishing = true;
      phishingType = 'fake_service';
    }

    if (riskScore >= 70) isPhishing = true;

    return {
      isPhishing,
      riskScore: Math.min(riskScore, 100),
      phishingType,
      confidence: Math.min(riskScore, 100),
      modelName: 'rule-based',
      timestamp: new Date()
    };
  }
}

module.exports = new MLService();
