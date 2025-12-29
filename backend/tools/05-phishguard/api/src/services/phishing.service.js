const crypto = require('crypto');

class PhishingService {
  calculateUrlHash(url) {
    return crypto.createHash('sha256').update(url).digest('hex');
  }

  extractUrlFeatures(url) {
    const features = {
      length: url.length,
      numDots: (url.match(/\./g) || []).length,
      numHyphens: (url.match(/-/g) || []).length,
      numDigits: (url.match(/\d/g) || []).length,
      numSpecialChars: (url.match(/[^a-zA-Z0-9]/g) || []).length,
      hasIpAddress: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url),
      isShortenedUrl: /bit\.ly|tinyurl|goo\.gl|ow\.ly/.test(url),
      hasSuspiciousKeywords: /login|verify|account|secure|update|banking|paypal/.test(url.toLowerCase()),
      isHttps: url.startsWith('https://')
    };

    return features;
  }

  determineSeverity(url) {
    if (url.riskScore >= 80 && url.isPhishing) return 'CRITICAL';
    if (url.riskScore >= 60) return 'HIGH';
    if (url.riskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  generateInsights(urls) {
    const insights = [];

    const criticalPhishing = urls.filter(u => u.isPhishing && u.severity === 'CRITICAL');
    if (criticalPhishing.length > 0) {
      insights.push({
        type: 'critical',
        title: 'Critical Phishing Threats Detected',
        description: `${criticalPhishing.length} high-risk phishing URLs detected that pose immediate threat`,
        severity: 'CRITICAL',
        affectedUrls: criticalPhishing.length,
        recommendations: [
          'Block these URLs immediately',
          'Alert affected users',
          'Review email gateway rules',
          'Conduct security awareness training'
        ]
      });
    }

    const phishingRate = (urls.filter(u => u.isPhishing).length / Math.max(urls.length, 1)) * 100;
    if (phishingRate > 30) {
      insights.push({
        type: 'warning',
        title: 'High Phishing Rate Detected',
        description: `${phishingRate.toFixed(1)}% of analyzed URLs are phishing attempts`,
        severity: 'HIGH',
        affectedUrls: urls.filter(u => u.isPhishing).length,
        recommendations: [
          'Increase email filtering sensitivity',
          'Deploy advanced threat protection',
          'Review user access patterns'
        ]
      });
    }

    const credentialHarvesting = urls.filter(u => u.phishingType === 'credential_harvesting');
    if (credentialHarvesting.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Credential Harvesting Campaign',
        description: 'Detected phishing attempts targeting user credentials',
        severity: 'HIGH',
        affectedUrls: credentialHarvesting.length,
        recommendations: [
          'Enable multi-factor authentication',
          'Reset compromised passwords',
          'Monitor for unauthorized access'
        ]
      });
    }

    return insights;
  }

  async calculateStatistics(userId, timeRange) {
    const PhishingUrl = require('../models/URL.model');
    
    const query = { userId };
    if (timeRange) query.checkedAt = { $gte: timeRange.start, $lte: timeRange.end };

    const urls = await PhishingUrl.find(query);

    return {
      totalUrls: urls.length,
      phishingUrls: urls.filter(u => u.isPhishing).length,
      cleanUrls: urls.filter(u => !u.isPhishing).length,
      criticalThreats: urls.filter(u => u.severity === 'CRITICAL').length,
      highThreats: urls.filter(u => u.severity === 'HIGH').length,
      mediumThreats: urls.filter(u => u.severity === 'MEDIUM').length,
      lowThreats: urls.filter(u => u.severity === 'LOW').length,
      avgRiskScore: urls.reduce((sum, u) => sum + u.riskScore, 0) / Math.max(urls.length, 1)
    };
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url.split('/')[0];
    }
  }

  extractProtocol(url) {
    if (url.startsWith('https://')) return 'https';
    if (url.startsWith('http://')) return 'http';
    if (url.startsWith('ftp://')) return 'ftp';
    return 'unknown';
  }
}

module.exports = new PhishingService();
