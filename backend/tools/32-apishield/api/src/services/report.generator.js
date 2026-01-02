class ReportGenerator {
  constructor() {
    this.templates = {
      executive: this.generateExecutiveSummary.bind(this),
      technical: this.generateTechnicalReport.bind(this),
      compliance: this.generateComplianceReport.bind(this),
      json: this.generateJSONReport.bind(this)
    };
  }

  async generateReport(scanData, format = 'technical') {
    if (!this.templates[format]) {
      throw new Error(`Unsupported report format: ${format}`);
    }

    return this.templates[format](scanData);
  }

  generateExecutiveSummary(scanData) {
    const { scan, vulnerabilities, endpoints } = scanData;

    const vulnBySeverity = this.groupBySeverity(vulnerabilities);
    const totalEndpoints = endpoints?.length || 0;
    const vulnerableEndpoints = endpoints?.filter(e => e.vulnerabilityCount > 0).length || 0;

    return {
      title: 'API Security Assessment Executive Summary',
      date: new Date().toISOString().split('T')[0],
      target: scan.targetUrl,
      summary: {
        totalEndpoints,
        testedEndpoints: scan.results?.testedEndpoints || 0,
        vulnerableEndpoints,
        totalVulnerabilities: vulnerabilities.length,
        securityScore: scan.results?.securityScore || 0,
        scanDuration: scan.duration ? `${Math.round(scan.duration / 60)} minutes` : 'N/A'
      },
      riskAssessment: this.calculateRiskLevel(vulnBySeverity),
      topVulnerabilities: this.getTopVulnerabilities(vulnerabilities, 5),
      owaspCoverage: this.generateOWASPSummary(scan.results?.owaspCoverage || []),
      recommendations: this.generateExecutiveRecommendations(vulnBySeverity)
    };
  }

  generateTechnicalReport(scanData) {
    const { scan, vulnerabilities, endpoints } = scanData;

    return {
      title: 'API Security Assessment Technical Report',
      scanInfo: {
        id: scan._id,
        name: scan.name,
        targetUrl: scan.targetUrl,
        scanType: scan.scanType,
        startedAt: scan.startedAt,
        completedAt: scan.completedAt,
        duration: scan.duration
      },
      configuration: {
        authentication: scan.authentication,
        settings: scan.settings,
        testCategories: scan.testCategories
      },
      results: {
        endpoints: endpoints?.map(e => ({
          method: e.method,
          path: e.path,
          riskLevel: e.riskLevel,
          vulnerabilityCount: e.vulnerabilityCount,
          requiresAuth: e.requiresAuth
        })),
        vulnerabilities: vulnerabilities.map(v => ({
          type: v.type,
          severity: v.severity,
          endpoint: v.endpoint,
          description: v.description,
          cweId: v.cweId,
          owaspCategory: v.owaspCategory,
          evidence: v.evidence,
          recommendation: v.recommendation
        })),
        statistics: this.generateStatistics(vulnerabilities, endpoints)
      },
      rawData: scanData
    };
  }

  generateComplianceReport(scanData) {
    const { scan, vulnerabilities } = scanData;

    const complianceFrameworks = {
      'OWASP API Top 10': this.checkOWASPCompliance(vulnerabilities),
      'PCI DSS': this.checkPCICompliance(vulnerabilities),
      'GDPR': this.checkGDPRCompliance(vulnerabilities),
      'HIPAA': this.checkHIPAACompliance(vulnerabilities)
    };

    return {
      title: 'API Security Compliance Report',
      assessmentDate: new Date().toISOString(),
      target: scan.targetUrl,
      frameworks: complianceFrameworks,
      overallCompliance: this.calculateOverallCompliance(complianceFrameworks),
      remediationTimeline: this.generateRemediationTimeline(vulnerabilities)
    };
  }

  generateJSONReport(scanData) {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        tool: 'APIShield'
      },
      data: scanData
    };
  }

  groupBySeverity(vulnerabilities) {
    return vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0, info: 0 });
  }

  calculateRiskLevel(severityCounts) {
    const total = Object.values(severityCounts).reduce((a, b) => a + b, 0);
    const riskScore = (
      severityCounts.critical * 10 +
      severityCounts.high * 7 +
      severityCounts.medium * 4 +
      severityCounts.low * 2 +
      severityCounts.info * 1
    ) / Math.max(total, 1);

    if (riskScore >= 8) return { level: 'Critical', color: 'red' };
    if (riskScore >= 6) return { level: 'High', color: 'orange' };
    if (riskScore >= 4) return { level: 'Medium', color: 'yellow' };
    if (riskScore >= 2) return { level: 'Low', color: 'green' };
    return { level: 'Info', color: 'blue' };
  }

  getTopVulnerabilities(vulnerabilities, limit = 5) {
    return vulnerabilities
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, limit)
      .map(v => ({
        type: v.type,
        severity: v.severity,
        endpoint: v.endpoint,
        description: v.description
      }));
  }

  generateOWASPSummary(owaspCoverage) {
    const summary = {};
    owaspCoverage.forEach(item => {
      summary[item.category] = {
        tested: item.tested,
        passed: item.passed,
        findings: item.findings
      };
    });
    return summary;
  }

  generateExecutiveRecommendations(severityCounts) {
    const recommendations = [];

    if (severityCounts.critical > 0) {
      recommendations.push('Immediate remediation required for critical vulnerabilities');
    }

    if (severityCounts.high > 0) {
      recommendations.push('High-priority vulnerabilities should be addressed within 30 days');
    }

    if (!severityCounts.critical && !severityCounts.high) {
      recommendations.push('Implement continuous security testing in CI/CD pipeline');
    }

    recommendations.push('Regular security assessments recommended every 90 days');
    recommendations.push('Security training for development team');

    return recommendations;
  }

  generateStatistics(vulnerabilities, endpoints) {
    const byType = vulnerabilities.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {});

    const byCategory = vulnerabilities.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {});

    const byEndpoint = vulnerabilities.reduce((acc, v) => {
      acc[v.endpoint] = (acc[v.endpoint] || 0) + 1;
      return acc;
    }, {});

    return {
      totalVulnerabilities: vulnerabilities.length,
      totalEndpoints: endpoints?.length || 0,
      vulnerableEndpoints: endpoints?.filter(e => e.vulnerabilityCount > 0).length || 0,
      bySeverity: this.groupBySeverity(vulnerabilities),
      byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
      byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
      byEndpoint: Object.entries(byEndpoint).map(([endpoint, count]) => ({ endpoint, count }))
    };
  }

  checkOWASPCompliance(vulnerabilities) {
    const owaspCategories = {
      'API1:2023': 'Broken Object Level Authorization',
      'API2:2023': 'Broken Authentication',
      'API3:2023': 'Broken Object Property Level Authorization',
      'API4:2023': 'Unrestricted Resource Consumption',
      'API5:2023': 'Broken Function Level Authorization',
      'API6:2023': 'Unrestricted Access to Sensitive Business Flows',
      'API7:2023': 'Server Side Request Forgery',
      'API8:2023': 'Security Misconfiguration',
      'API9:2023': 'Improper Inventory Management',
      'API10:2023': 'Unsafe Consumption of APIs'
    };

    const results = {};
    for (const [code, name] of Object.entries(owaspCategories)) {
      const categoryVulns = vulnerabilities.filter(v => v.owaspCategory === `owasp-${code.toLowerCase()}`);
      results[code] = {
        name,
        compliant: categoryVulns.length === 0,
        findings: categoryVulns.length,
        severity: categoryVulns.length > 0 ? Math.max(...categoryVulns.map(v => this.severityToNumber(v.severity))) : 0
      };
    }

    return results;
  }

  checkPCICompliance(vulnerabilities) {
    // Simplified PCI DSS checks
    const pciChecks = {
      'Data Protection': !vulnerabilities.some(v => v.type.includes('INJECTION') || v.type.includes('EXPOSURE')),
      'Authentication': !vulnerabilities.some(v => v.owaspCategory === 'owasp-api-2'),
      'Access Control': !vulnerabilities.some(v => v.owaspCategory === 'owasp-api-1' || v.owaspCategory === 'owasp-api-5'),
      'Logging': !vulnerabilities.some(v => v.type === 'NO_RATE_LIMITING')
    };

    return pciChecks;
  }

  checkGDPRCompliance(vulnerabilities) {
    const gdprChecks = {
      'Data Minimization': !vulnerabilities.some(v => v.type.includes('EXPOSURE')),
      'Purpose Limitation': !vulnerabilities.some(v => v.type === 'MASS_ASSIGNMENT'),
      'Data Security': !vulnerabilities.some(v => v.category === 'data-exposure'),
      'Breach Notification': !vulnerabilities.some(v => v.severity === 'critical')
    };

    return gdprChecks;
  }

  checkHIPAACompliance(vulnerabilities) {
    const hipaaChecks = {
      'Access Control': !vulnerabilities.some(v => v.owaspCategory === 'owasp-api-1'),
      'Audit Controls': !vulnerabilities.some(v => v.type === 'VERBOSE_ERROR'),
      'Data Encryption': !vulnerabilities.some(v => v.category === 'data-exposure'),
      'Security Management': !vulnerabilities.some(v => v.owaspCategory === 'owasp-api-8')
    };

    return hipaaChecks;
  }

  calculateOverallCompliance(frameworks) {
    const scores = {};

    for (const [framework, checks] of Object.entries(frameworks)) {
      if (framework === 'OWASP API Top 10') {
        const owaspResults = Object.values(checks);
        const compliant = owaspResults.filter(r => r.compliant).length;
        scores[framework] = Math.round((compliant / owaspResults.length) * 100);
      } else {
        const compliant = Object.values(checks).filter(Boolean).length;
        scores[framework] = Math.round((compliant / Object.values(checks).length) * 100);
      }
    }

    return scores;
  }

  generateRemediationTimeline(vulnerabilities) {
    const timeline = {
      immediate: vulnerabilities.filter(v => v.severity === 'critical'),
      '30days': vulnerabilities.filter(v => v.severity === 'high'),
      '90days': vulnerabilities.filter(v => v.severity === 'medium'),
      '180days': vulnerabilities.filter(v => v.severity === 'low'),
      monitoring: vulnerabilities.filter(v => v.severity === 'info')
    };

    return Object.entries(timeline).map(([timeframe, vulns]) => ({
      timeframe,
      vulnerabilities: vulns.length,
      priority: this.getPriorityLevel(timeframe)
    }));
  }

  severityToNumber(severity) {
    const map = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
    return map[severity] || 0;
  }

  getPriorityLevel(timeframe) {
    const levels = {
      immediate: 'Critical',
      '30days': 'High',
      '90days': 'Medium',
      '180days': 'Low',
      monitoring: 'Info'
    };
    return levels[timeframe] || 'Unknown';
  }
}

module.exports = new ReportGenerator();
