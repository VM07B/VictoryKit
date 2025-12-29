const Threat = require('../models/Threat.model');

class RadarService {
  calculateRisk(threat) {
    let score = 0;
    if (threat.severity === 'CRITICAL') score += 40;
    else if (threat.severity === 'HIGH') score += 30;
    else if (threat.severity === 'MEDIUM') score += 20;
    else score += 10;
    
    if (threat.confidence > 80) score += 30;
    else if (threat.confidence > 60) score += 20;
    else score += 10;
    
    if (threat.affectedAssets && threat.affectedAssets.length > 5) score += 20;
    else if (threat.affectedAssets && threat.affectedAssets.length > 0) score += 10;
    
    return Math.min(score, 100);
  }

  async analyzePattern(userId, timeRange) {
    const threats = await Threat.find({
      userId,
      detectedAt: { $gte: timeRange.start, $lte: timeRange.end }
    });

    const patterns = {
      topSources: {},
      topDestinations: {},
      topThreatTypes: {},
      timeline: {}
    };

    threats.forEach(t => {
      if (t.sourceIP) patterns.topSources[t.sourceIP] = (patterns.topSources[t.sourceIP] || 0) + 1;
      if (t.destinationIP) patterns.topDestinations[t.destinationIP] = (patterns.topDestinations[t.destinationIP] || 0) + 1;
      patterns.topThreatTypes[t.threatType] = (patterns.topThreatTypes[t.threatType] || 0) + 1;
      
      const day = t.detectedAt.toISOString().split('T')[0];
      patterns.timeline[day] = (patterns.timeline[day] || 0) + 1;
    });

    return patterns;
  }

  detectAnomalies(threats) {
    const anomalies = [];
    const ipCounts = {};
    
    threats.forEach(t => {
      if (t.sourceIP) {
        ipCounts[t.sourceIP] = (ipCounts[t.sourceIP] || 0) + 1;
      }
    });

    Object.entries(ipCounts).forEach(([ip, count]) => {
      if (count > 10) {
        anomalies.push({
          type: 'high_frequency_source',
          ip,
          count,
          severity: count > 50 ? 'CRITICAL' : 'HIGH'
        });
      }
    });

    return anomalies;
  }

  generateAlerts(threat) {
    const alerts = [];
    if (threat.severity === 'CRITICAL') {
      alerts.push({
        level: 'urgent',
        message: `Critical threat detected: ${threat.threatType}`,
        action: 'Immediate investigation required'
      });
    }
    if (threat.occurrences > 5) {
      alerts.push({
        level: 'warning',
        message: `Recurring threat detected (${threat.occurrences} times)`,
        action: 'Review containment strategy'
      });
    }
    return alerts;
  }

  async calculateStatistics(userId, timeRange) {
    const query = { userId };
    if (timeRange) query.detectedAt = { $gte: timeRange.start, $lte: timeRange.end };

    const stats = await Threat.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalThreats: { $sum: 1 },
          criticalThreats: { $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] } },
          highThreats: { $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] } },
          mediumThreats: { $sum: { $cond: [{ $eq: ['$severity', 'MEDIUM'] }, 1, 0] } },
          lowThreats: { $sum: { $cond: [{ $eq: ['$severity', 'LOW'] }, 1, 0] } },
          activeThreats: { $sum: { $cond: [{ $in: ['$status', ['active', 'investigating']] }, 1, 0] } },
          resolvedThreats: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);

    return stats[0] || {
      totalThreats: 0,
      criticalThreats: 0,
      highThreats: 0,
      mediumThreats: 0,
      lowThreats: 0,
      activeThreats: 0,
      resolvedThreats: 0,
      avgConfidence: 0
    };
  }
}

module.exports = new RadarService();
