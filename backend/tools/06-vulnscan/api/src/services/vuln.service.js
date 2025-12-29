class VulnService {
  calculateCvss(vulnData) {
    // Simplified CVSS calculation
    let score = 0;
    if (vulnData.exploit?.public) score += 3;
    if (vulnData.networkAccessible) score += 2;
    if (vulnData.authRequired === false) score += 2;
    return Math.min(score + 3, 10);
  }

  determineSeverity(cvssScore) {
    if (cvssScore >= 9) return 'CRITICAL';
    if (cvssScore >= 7) return 'HIGH';
    if (cvssScore >= 4) return 'MEDIUM';
    if (cvssScore > 0) return 'LOW';
    return 'INFO';
  }

  generateInsights(scans) {
    const insights = [];
    const criticalVulns = scans.reduce((sum, s) => sum + (s.summary?.criticalCount || 0), 0);
    
    if (criticalVulns > 0) {
      insights.push({
        type: 'critical',
        title: 'Critical Vulnerabilities Detected',
        description: `${criticalVulns} critical vulnerabilities require immediate patching`,
        severity: 'CRITICAL',
        affectedScans: scans.filter(s => s.summary?.criticalCount > 0).length,
        recommendations: ['Apply patches immediately', 'Isolate affected systems', 'Monitor for exploitation']
      });
    }

    return insights;
  }

  async calculateStatistics(userId, timeRange) {
    const VulnScan = require('../models/Scan.model');
    const query = { userId };
    if (timeRange) query.createdAt = { $gte: timeRange.start, $lte: timeRange.end };
    
    const scans = await VulnScan.find(query);
    return {
      totalScans: scans.length,
      totalVulnerabilities: scans.reduce((sum, s) => sum + (s.summary?.totalVulnerabilities || 0), 0),
      criticalCount: scans.reduce((sum, s) => sum + (s.summary?.criticalCount || 0), 0),
      highCount: scans.reduce((sum, s) => sum + (s.summary?.highCount || 0), 0),
      avgCvssScore: scans.reduce((sum, s) => sum + (s.summary?.avgCvssScore || 0), 0) / Math.max(scans.length, 1)
    };
  }
}

module.exports = new VulnService();
