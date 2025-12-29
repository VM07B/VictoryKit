const axios = require('axios');
const { ApiError } = require('../../../../shared/utils/apiError');

class MLService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8002';
  }

  /**
   * Analyze threat intelligence using ML
   */
  async analyzeThreat(threatData) {
    try {
      const response = await axios.post(
        `${this.mlEngineUrl}/analyze`,
        threatData,
        {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        // Fallback to rule-based analysis
        return this.ruleBasedAnalysis(threatData);
      }
      throw new ApiError(500, 'ML analysis failed: ' + error.message);
    }
  }

  /**
   * Classify threat type using ML
   */
  async classifyThreat(indicators) {
    try {
      const response = await axios.post(
        `${this.mlEngineUrl}/classify`,
        { indicators },
        {
          timeout: 3000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;
    } catch (error) {
      return this.ruleBasedClassification(indicators);
    }
  }

  /**
   * Correlate IOCs using ML
   */
  async correlateIndicators(indicators) {
    try {
      const response = await axios.post(
        `${this.mlEngineUrl}/correlate`,
        { indicators },
        {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;
    } catch (error) {
      return { correlations: [], confidence: 0 };
    }
  }

  /**
   * Rule-based fallback analysis
   */
  ruleBasedAnalysis(threatData) {
    let severity = 'MEDIUM';
    let confidence = 50;
    let threatCategory = threatData.threatType || 'unknown';

    // Severity rules
    if (threatData.indicators) {
      const totalIndicators = 
        (threatData.indicators.ips?.length || 0) +
        (threatData.indicators.domains?.length || 0) +
        (threatData.indicators.urls?.length || 0) +
        (threatData.indicators.hashes?.length || 0);

      if (totalIndicators > 10) {
        severity = 'HIGH';
        confidence = 70;
      }
      if (totalIndicators > 20) {
        severity = 'CRITICAL';
        confidence = 85;
      }
    }

    // APT and ransomware are always high severity
    if (threatData.threatType === 'apt' || threatData.threatType === 'ransomware') {
      severity = 'CRITICAL';
      confidence = 90;
    }

    // Multiple attack vectors increase severity
    if (threatData.attackVectors && threatData.attackVectors.length > 3) {
      severity = severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      confidence = Math.min(confidence + 15, 95);
    }

    return {
      severity,
      confidence,
      threatCategory,
      model: 'rule-based-fallback',
      timestamp: new Date(),
      features: {
        indicatorCount: threatData.indicators ? Object.keys(threatData.indicators).length : 0,
        threatType: threatData.threatType,
        attackVectors: threatData.attackVectors?.length || 0
      }
    };
  }

  /**
   * Rule-based threat classification
   */
  ruleBasedClassification(indicators) {
    const classifications = [];

    if (indicators.hashes && indicators.hashes.length > 0) {
      classifications.push({ type: 'malware', confidence: 80 });
    }
    if (indicators.urls && indicators.urls.length > 0) {
      classifications.push({ type: 'phishing', confidence: 70 });
    }
    if (indicators.ips && indicators.ips.length > 5) {
      classifications.push({ type: 'botnet', confidence: 75 });
    }

    return {
      classifications,
      primaryType: classifications[0]?.type || 'unknown',
      confidence: classifications[0]?.confidence || 50,
      model: 'rule-based'
    };
  }

  /**
   * Get ML model metrics
   */
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
