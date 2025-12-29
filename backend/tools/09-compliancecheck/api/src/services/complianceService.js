const { logger } = require('../../../../../shared');
const mlService = require('./mlService');

class ComplianceService {
  constructor() {
    this.frameworks = {
      'SOC2': { controls: 64, categories: ['Security', 'Availability', 'Confidentiality', 'Integrity', 'Privacy'] },
      'ISO27001': { controls: 114, categories: ['Information Security', 'Access Control', 'Cryptography', 'Operations', 'Communications'] },
      'HIPAA': { controls: 75, categories: ['Administrative', 'Physical', 'Technical', 'Privacy', 'Breach Notification'] },
      'PCI-DSS': { controls: 78, categories: ['Network Security', 'Data Protection', 'Vulnerability Management', 'Access Control', 'Monitoring'] },
      'GDPR': { controls: 45, categories: ['Lawfulness', 'Rights', 'Accountability', 'Security', 'Transfers'] },
      'NIST': { controls: 110, categories: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'] },
      'CIS': { controls: 153, categories: ['Basic', 'Foundational', 'Organizational'] }
    };
  }

  getFrameworkDetails(name) {
    return this.frameworks[name] || null;
  }

  generateControlsForFramework(framework) {
    const details = this.frameworks[framework];
    if (!details) return [];

    const controls = [];
    let controlNum = 1;

    details.categories.forEach((category, catIndex) => {
      const controlsPerCategory = Math.ceil(details.controls / details.categories.length);
      
      for (let i = 0; i < controlsPerCategory && controls.length < details.controls; i++) {
        controls.push({
          controlId: `${framework}-${String(catIndex + 1).padStart(2, '0')}.${String(i + 1).padStart(2, '0')}`,
          title: `${category} Control ${i + 1}`,
          description: `Requirement for ${category.toLowerCase()} in ${framework} framework`,
          category,
          priority: i < 3 ? 'critical' : i < 8 ? 'high' : 'medium'
        });
        controlNum++;
      }
    });

    return controls;
  }

  async assessAudit(audit, controls) {
    const results = {
      passed: 0,
      failed: 0,
      partial: 0,
      notApplicable: 0,
      notAssessed: 0
    };

    controls.forEach(control => {
      switch (control.status) {
        case 'passed': results.passed++; break;
        case 'failed': results.failed++; break;
        case 'partial': results.partial++; break;
        case 'not-applicable': results.notApplicable++; break;
        default: results.notAssessed++;
      }
    });

    const totalApplicable = controls.length - results.notApplicable;
    const score = totalApplicable > 0 
      ? Math.round(((results.passed + (results.partial * 0.5)) / totalApplicable) * 100)
      : 0;

    // Determine risk level
    let riskLevel = 'minimal';
    if (score < 50) riskLevel = 'critical';
    else if (score < 70) riskLevel = 'high';
    else if (score < 85) riskLevel = 'medium';
    else if (score < 95) riskLevel = 'low';

    // Get AI analysis
    const gapAnalysis = await mlService.analyzeGaps(audit, controls);
    const recommendations = await mlService.generateRecommendations(gapAnalysis.gaps, audit.frameworks);

    return {
      overallScore: score,
      passedControls: results.passed,
      failedControls: results.failed,
      partialControls: results.partial,
      notApplicable: results.notApplicable,
      riskLevel,
      gaps: gapAnalysis.gaps,
      recommendations: recommendations.recommendations
    };
  }

  calculateRemediationTime(failedControls, priority) {
    const baseHours = {
      critical: 40,
      high: 24,
      medium: 16,
      low: 8
    };

    let totalHours = 0;
    failedControls.forEach(control => {
      totalHours += baseHours[control.priority] || 16;
    });

    if (totalHours < 40) return `${totalHours} hours`;
    if (totalHours < 200) return `${Math.ceil(totalHours / 40)} weeks`;
    return `${Math.ceil(totalHours / 160)} months`;
  }
}

module.exports = new ComplianceService();
