const { APIScan, APIVulnerability, APIEndpoint, APISpec } = require('../models');

// Get dashboard overview
exports.getDashboard = async (req, res) => {
  try {
    // Recent scans
    const recentScans = await APIScan.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name status targetUrl results createdAt');

    // Vulnerability counts
    const vulnCounts = await APIVulnerability.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    vulnCounts.forEach(v => { vulnerabilities[v._id] = v.count; });

    // Endpoint counts
    const totalEndpoints = await APIEndpoint.countDocuments();
    const vulnerableEndpoints = await APIEndpoint.countDocuments({ vulnerabilityCount: { $gt: 0 } });

    // API specs count
    const totalSpecs = await APISpec.countDocuments();

    // Top vulnerability types
    const topVulnTypes = await APIVulnerability.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // OWASP coverage from latest scan
    const latestCompletedScan = await APIScan.findOne({ status: 'completed' })
      .sort({ completedAt: -1 });

    // Overall security score (average of recent scans)
    const avgScoreResult = await APIScan.aggregate([
      { $match: { status: 'completed', 'results.securityScore': { $exists: true } } },
      { $sort: { completedAt: -1 } },
      { $limit: 10 },
      { $group: { _id: null, avgScore: { $avg: '$results.securityScore' } } }
    ]);

    const overallSecurityScore = avgScoreResult[0]?.avgScore || null;

    // Open vulnerabilities count
    const openVulns = await APIVulnerability.countDocuments({ status: 'open' });
    const fixedVulns = await APIVulnerability.countDocuments({ status: 'fixed' });

    res.json({
      success: true,
      data: {
        overview: {
          totalEndpoints,
          vulnerableEndpoints,
          totalSpecs,
          openVulnerabilities: openVulns,
          fixedVulnerabilities: fixedVulns,
          overallSecurityScore: overallSecurityScore ? Math.round(overallSecurityScore) : null
        },
        vulnerabilities,
        topVulnTypes: topVulnTypes.map(t => ({
          type: t._id,
          count: t.count
        })),
        recentScans,
        owaspCoverage: latestCompletedScan?.results?.owaspCoverage || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get security trends
exports.getTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Vulnerability trend by day
    const vulnTrend = await APIVulnerability.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Scan trend
    const scanTrend = await APIScan.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$results.securityScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fixed vs new vulnerabilities trend
    const fixTrend = await APIVulnerability.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: startDate } },
            { fixedAt: { $gte: startDate } }
          ]
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newVulns: { $sum: 1 },
          fixed: {
            $sum: { $cond: [{ $ne: ['$fixedAt', null] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        vulnerabilityTrend: vulnTrend,
        scanTrend,
        fixTrend,
        period: `${days} days`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Export report
exports.exportReport = async (req, res) => {
  try {
    const { scanId, format = 'json' } = req.query;

    let data = {};

    if (scanId) {
      const scan = await APIScan.findById(scanId);
      const vulnerabilities = await APIVulnerability.find({ scanId });
      data = { scan, vulnerabilities };
    } else {
      // Export all recent data
      const recentScans = await APIScan.find().sort({ createdAt: -1 }).limit(10);
      const vulnerabilities = await APIVulnerability.find().sort({ createdAt: -1 }).limit(100);
      const endpoints = await APIEndpoint.find().limit(100);
      data = { scans: recentScans, vulnerabilities, endpoints };
    }

    if (format === 'json') {
      res.json({
        success: true,
        data,
        exportedAt: new Date().toISOString()
      });
    } else {
      // For CSV/PDF, would generate appropriate format
      res.json({
        success: true,
        message: `Export in ${format} format - implementation pending`,
        data
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const totalScans = await APIScan.countDocuments();
    const activeScans = await APIScan.countDocuments({ status: "running" });
    const totalVulnerabilities = await APIVulnerability.countDocuments();
    const criticalVulnerabilities = await APIVulnerability.countDocuments({ severity: "critical" });
    const totalSpecs = await APISpec.countDocuments();

    res.json({
      success: true,
      data: {
        scans: {
          total: totalScans,
          active: activeScans,
          completed: totalScans - activeScans
        },
        vulnerabilities: {
          total: totalVulnerabilities,
          critical: criticalVulnerabilities
        },
        specs: totalSpecs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get recent scans
exports.getRecentScans = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const scans = await APIScan.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("specId", "name");

    res.json({
      success: true,
      data: { scans }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get vulnerabilities summary
exports.getVulnerabilitiesSummary = async (req, res) => {
  try {
    const summary = await APIVulnerability.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    summary.forEach(item => {
      result[item._id] = item.count;
    });

    res.json({
      success: true,
      data: { summary: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get compliance status
exports.getComplianceStatus = async (req, res) => {
  try {
    const owaspCompliance = await APIVulnerability.aggregate([
      {
        $match: { category: "owasp-top-10" }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          }
        }
      }
    ]);

    const compliance = owaspCompliance[0] || { total: 0, resolved: 0 };
    const complianceScore = compliance.total > 0 ? (compliance.resolved / compliance.total) * 100 : 100;

    res.json({
      success: true,
      data: {
        owaspTop10: {
          score: Math.round(complianceScore),
          totalIssues: compliance.total,
          resolvedIssues: compliance.resolved
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get activity feed
exports.getActivityFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Get recent scans
    const recentScans = await APIScan.find()
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .select("name status createdAt");

    // Get recent vulnerabilities
    const recentVulns = await APIVulnerability.find()
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .select("title severity status createdAt");

    const activities = [
      ...recentScans.map(scan => ({
        type: "scan",
        action: `Scan ${scan.status}`,
        details: scan.name,
        timestamp: scan.createdAt
      })),
      ...recentVulns.map(vuln => ({
        type: "vulnerability",
        action: `Vulnerability ${vuln.status}`,
        details: vuln.title,
        severity: vuln.severity,
        timestamp: vuln.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get active alerts
exports.getAlerts = async (req, res) => {
  try {
    const criticalVulns = await APIVulnerability.find({
      severity: "critical",
      status: { $ne: "resolved" }
    }).limit(10);

    const alerts = criticalVulns.map(vuln => ({
      id: vuln._id,
      type: "vulnerability",
      severity: "critical",
      message: `Critical vulnerability found: ${vuln.title}`,
      timestamp: vuln.createdAt
    }));

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Acknowledge alert
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, just mark as acknowledged (could be stored in a separate collection)
    res.json({
      success: true,
      message: "Alert acknowledged"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get reports summary
exports.getReportsSummary = async (req, res) => {
  try {
    // This would typically aggregate report data
    // For now, return mock data
    res.json({
      success: true,
      data: {
        totalReports: 0,
        recentReports: [],
        reportTypes: ["executive", "technical", "compliance"]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
