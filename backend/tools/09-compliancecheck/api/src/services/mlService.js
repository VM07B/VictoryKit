const axios = require('axios');
const { logger } = require('../../../../../shared');

class MLService {
  constructor() {
    this.baseUrl = process.env.ML_COMPLIANCE_URL || 'http://localhost:8009';
  }

  async assessControl(control, evidence, context = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/assess`, {
        control,
        evidence,
        context
      }, { timeout: 60000 });
      return response.data;
    } catch (error) {
      logger.warn('ML service unavailable, using rule-based assessment');
      return this.fallbackAssessment(control, evidence);
    }
  }

  async analyzeGaps(audit, controls) {
    try {
      const response = await axios.post(`${this.baseUrl}/gaps`, {
        audit,
        controls
      }, { timeout: 120000 });
      return response.data;
    } catch (error) {
      return this.fallbackGapAnalysis(controls);
    }
  }

  async generateRecommendations(gaps, framework) {
    try {
      const response = await axios.post(`${this.baseUrl}/recommendations`, {
        gaps,
        framework
      }, { timeout: 60000 });
      return response.data;
    } catch (error) {
      return this.fallbackRecommendations(gaps);
    }
  }

  fallbackAssessment(control, evidence) {
    const hasEvidence = evidence && evidence.length > 0;
    const hasDocumentation = evidence?.some(e => e.type === 'document');
    
    let suggestedStatus = 'not-assessed';
    let confidence = 50;

    if (hasEvidence && hasDocumentation) {
      suggestedStatus = 'passed';
      confidence = 70;
    } else if (hasEvidence) {
      suggestedStatus = 'partial';
      confidence = 60;
    }

    return {
      suggestedStatus,
      confidence,
      reasoning: hasEvidence 
        ? 'Evidence provided supports compliance' 
        : 'No evidence provided for assessment',
      assessmentType: 'rule-based'
    };
  }

  fallbackGapAnalysis(controls) {
    const gaps = controls
      .filter(c => c.status === 'failed' || c.status === 'not-assessed')
      .map(c => ({
        controlId: c.controlId,
        framework: c.framework,
        severity: c.priority,
        gap: `Control ${c.controlId} requires attention`
      }));

    return {
      gaps,
      riskLevel: gaps.length > 10 ? 'high' : gaps.length > 5 ? 'medium' : 'low',
      analysisType: 'rule-based'
    };
  }

  fallbackRecommendations(gaps) {
    const recommendations = [
      'Implement missing security controls',
      'Document existing processes and procedures',
      'Conduct regular security assessments',
      'Train staff on compliance requirements'
    ];

    return {
      recommendations: recommendations.slice(0, Math.min(gaps.length, 4)),
      priority: gaps.length > 5 ? 'immediate' : 'scheduled'
    };
  }
}

module.exports = new MLService();
