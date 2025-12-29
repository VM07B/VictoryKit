const ThreatIntel = require('../models/ThreatIntel.model');

class IntelService {
  /**
   * Calculate confidence score based on sources and indicators
   */
  calculateConfidence(intel) {
    let score = 50; // Base score

    // Source reliability
    if (intel.sources && intel.sources.length > 0) {
      const reliableSourcesCount = intel.sources.filter(s => 
        s.reliability === 'high' || s.reliability === 'verified'
      ).length;
      score += reliableSourcesCount * 10;
    }

    // Multiple indicators increase confidence
    if (intel.indicators) {
      const totalIndicators = 
        (intel.indicators.ips?.length || 0) +
        (intel.indicators.domains?.length || 0) +
        (intel.indicators.urls?.length || 0) +
        (intel.indicators.hashes?.length || 0);
      
      score += Math.min(totalIndicators * 2, 30);
    }

    // MITRE ATT&CK mapping increases confidence
    if (intel.mitreTactics && intel.mitreTactics.length > 0) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Determine severity based on threat characteristics
   */
  determineSeverity(intel) {
    // Critical threats
    if (intel.threatType === 'apt' || 
        intel.threatType === 'ransomware' ||
        (intel.mitreTactics && intel.mitreTactics.includes('TA0040'))) { // Impact tactic
      return 'CRITICAL';
    }

    // High severity
    if (intel.threatType === 'exploit' ||
        intel.threatType === 'data_leak' ||
        (intel.attackVectors && intel.attackVectors.length >= 3)) {
      return 'HIGH';
    }

    // Medium severity
    if (intel.threatType === 'malware' ||
        intel.threatType === 'phishing') {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Analyze threat landscape trends
   */
  async analyzeTrends(timeRange, filters = {}) {
    const query = { createdAt: { $gte: timeRange.start, $lte: timeRange.end } };
    
    if (filters.threatTypes && filters.threatTypes.length > 0) {
      query.threatType = { $in: filters.threatTypes };
    }
    if (filters.severities && filters.severities.length > 0) {
      query.severity = { $in: filters.severities };
    }

    const threats = await ThreatIntel.find(query);

    // Calculate trends
    const trends = {
      totalThreats: threats.length,
      byType: {},
      bySeverity: {},
      bySource: {},
      topIndicators: { ips: {}, domains: {}, hashes: {} },
      timeline: {}
    };

    threats.forEach(threat => {
      // By type
      trends.byType[threat.threatType] = (trends.byType[threat.threatType] || 0) + 1;
      
      // By severity
      trends.bySeverity[threat.severity] = (trends.bySeverity[threat.severity] || 0) + 1;
      
      // By source
      if (threat.sourceType) {
        trends.bySource[threat.sourceType] = (trends.bySource[threat.sourceType] || 0) + 1;
      }

      // Timeline (by day)
      const day = threat.createdAt.toISOString().split('T')[0];
      trends.timeline[day] = (trends.timeline[day] || 0) + 1;

      // Top indicators
      if (threat.indicators) {
        threat.indicators.ips?.forEach(ip => {
          trends.topIndicators.ips[ip] = (trends.topIndicators.ips[ip] || 0) + 1;
        });
        threat.indicators.domains?.forEach(domain => {
          trends.topIndicators.domains[domain] = (trends.topIndicators.domains[domain] || 0) + 1;
        });
        threat.indicators.hashes?.forEach(hash => {
          trends.topIndicators.hashes[hash] = (trends.topIndicators.hashes[hash] || 0) + 1;
        });
      }
    });

    return trends;
  }

  /**
   * Correlate indicators across threats
   */
  async correlateIndicators(indicators) {
    const correlations = [];

    // Search for threats containing these indicators
    if (indicators.ips && indicators.ips.length > 0) {
      const relatedThreats = await ThreatIntel.find({
        'indicators.ips': { $in: indicators.ips }
      }).select('intelId title severity confidenceScore threatType');

      if (relatedThreats.length > 0) {
        correlations.push({
          indicatorType: 'ip',
          indicators: indicators.ips,
          relatedThreats: relatedThreats.length,
          threats: relatedThreats
        });
      }
    }

    if (indicators.domains && indicators.domains.length > 0) {
      const relatedThreats = await ThreatIntel.find({
        'indicators.domains': { $in: indicators.domains }
      }).select('intelId title severity confidenceScore threatType');

      if (relatedThreats.length > 0) {
        correlations.push({
          indicatorType: 'domain',
          indicators: indicators.domains,
          relatedThreats: relatedThreats.length,
          threats: relatedThreats
        });
      }
    }

    if (indicators.hashes && indicators.hashes.length > 0) {
      const relatedThreats = await ThreatIntel.find({
        'indicators.hashes': { $in: indicators.hashes }
      }).select('intelId title severity confidenceScore threatType');

      if (relatedThreats.length > 0) {
        correlations.push({
          indicatorType: 'hash',
          indicators: indicators.hashes,
          relatedThreats: relatedThreats.length,
          threats: relatedThreats
        });
      }
    }

    return correlations;
  }

  /**
   * Generate insights from intelligence data
   */
  generateInsights(threats) {
    const insights = [];

    // Calculate statistics
    const criticalCount = threats.filter(t => t.severity === 'CRITICAL').length;
    const aptCount = threats.filter(t => t.threatType === 'apt').length;
    const targetedSectors = new Set();
    const attackVectors = new Set();

    threats.forEach(threat => {
      threat.targetSectors?.forEach(sector => targetedSectors.add(sector));
      threat.attackVectors?.forEach(vector => attackVectors.add(vector));
    });

    // Critical threats insight
    if (criticalCount > 0) {
      insights.push({
        type: 'critical_alert',
        title: 'Critical Threats Detected',
        description: `${criticalCount} critical threats require immediate attention`,
        severity: 'CRITICAL',
        recommendations: [
          'Review and prioritize critical threats',
          'Implement immediate containment measures',
          'Alert security team and stakeholders'
        ]
      });
    }

    // APT activity insight
    if (aptCount > 0) {
      insights.push({
        type: 'apt_activity',
        title: 'Advanced Persistent Threat Activity',
        description: `Detected ${aptCount} APT-related threats`,
        severity: 'HIGH',
        recommendations: [
          'Enable enhanced monitoring for targeted systems',
          'Review network segmentation',
          'Conduct threat hunting activities'
        ]
      });
    }

    // Targeted sectors insight
    if (targetedSectors.size > 0) {
      insights.push({
        type: 'sector_targeting',
        title: 'Industry Sector Targeting',
        description: `Threats targeting: ${Array.from(targetedSectors).join(', ')}`,
        severity: 'MEDIUM',
        recommendations: [
          'Assess exposure in targeted sectors',
          'Review sector-specific security controls',
          'Share intelligence with industry peers'
        ]
      });
    }

    // Attack vectors insight
    if (attackVectors.size >= 3) {
      insights.push({
        type: 'multiple_vectors',
        title: 'Multiple Attack Vectors Identified',
        description: `${attackVectors.size} different attack vectors detected`,
        severity: 'HIGH',
        recommendations: [
          'Strengthen defenses across all attack vectors',
          'Conduct vulnerability assessments',
          'Update incident response playbooks'
        ]
      });
    }

    return insights;
  }

  /**
   * Calculate statistics for dashboard
   */
  async calculateStatistics(userId, timeRange) {
    const query = { userId };
    
    if (timeRange) {
      query.createdAt = { $gte: timeRange.start, $lte: timeRange.end };
    }

    const stats = await ThreatIntel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalThreats: { $sum: 1 },
          criticalThreats: {
            $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] }
          },
          highThreats: {
            $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] }
          },
          mediumThreats: {
            $sum: { $cond: [{ $eq: ['$severity', 'MEDIUM'] }, 1, 0] }
          },
          lowThreats: {
            $sum: { $cond: [{ $eq: ['$severity', 'LOW'] }, 1, 0] }
          },
          avgConfidence: { $avg: '$confidenceScore' },
          activeThreats: {
            $sum: { 
              $cond: [
                { 
                  $in: ['$status', ['new', 'investigating', 'confirmed']] 
                }, 
                1, 
                0
              ] 
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalThreats: 0,
      criticalThreats: 0,
      highThreats: 0,
      mediumThreats: 0,
      lowThreats: 0,
      avgConfidence: 0,
      activeThreats: 0
    };
  }
}

module.exports = new IntelService();
