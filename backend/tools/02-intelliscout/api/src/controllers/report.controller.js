const IntelReport = require('../models/Report.model');
const ThreatIntel = require('../models/ThreatIntel.model');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../shared/utils/apiError');
const intelService = require('../services/intel.service');

class ReportController {
  /**
   * Generate new report
   */
  async generateReport(req, res, next) {
    try {
      const {
        reportType,
        title,
        timeRange,
        format = 'pdf'
      } = req.body;

      // Create report record
      const report = new IntelReport({
        userId: req.user.id,
        reportId: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        reportType,
        title: title || `${reportType.toUpperCase()} Threat Intelligence Report`,
        timeRange,
        format,
        status: 'generating'
      });

      await report.save();

      // Generate report asynchronously
      setImmediate(async () => {
        try {
          const query = { userId: req.user.id };
          
          if (timeRange) {
            query.createdAt = { 
              $gte: new Date(timeRange.start), 
              $lte: new Date(timeRange.end) 
            };
          }

          const threats = await ThreatIntel.find(query);

          // Calculate summary
          report.summary = {
            totalThreats: threats.length,
            criticalThreats: threats.filter(t => t.severity === 'CRITICAL').length,
            newThreats: threats.filter(t => t.status === 'new').length,
            mitigatedThreats: threats.filter(t => t.status === 'mitigated').length,
            averageConfidence: threats.reduce((sum, t) => sum + t.confidenceScore, 0) / threats.length || 0,
            topThreatType: this.getTopThreatType(threats)
          };

          // Build sections
          report.sections = [
            {
              title: 'Executive Summary',
              content: this.generateExecutiveSummary(threats),
              order: 1
            },
            {
              title: 'Threat Landscape Overview',
              content: this.generateThreatLandscape(threats),
              order: 2
            },
            {
              title: 'Critical Threats',
              content: this.generateCriticalThreats(threats),
              order: 3,
              data: threats.filter(t => t.severity === 'CRITICAL')
            },
            {
              title: 'Indicators of Compromise',
              content: this.generateIOCSection(threats),
              order: 4
            },
            {
              title: 'Recommendations',
              content: this.generateRecommendations(threats),
              order: 5
            }
          ];

          // Calculate metrics
          report.metrics = {
            threatsByType: this.groupBy(threats, 'threatType'),
            threatsBySeverity: this.groupBy(threats, 'severity'),
            threatsBySource: this.groupBy(threats, 'sourceType'),
            threatsByCountry: {},
            threatsBySector: {}
          };

          // Generate charts
          report.charts = [
            {
              type: 'pie',
              title: 'Threats by Severity',
              data: report.metrics.threatsBySeverity,
              config: { legend: true, colors: ['#22c55e', '#eab308', '#f97316', '#ef4444'] }
            },
            {
              type: 'bar',
              title: 'Threats by Type',
              data: report.metrics.threatsByType,
              config: { horizontal: true }
            },
            {
              type: 'line',
              title: 'Threat Trend Over Time',
              data: this.getTrendData(threats),
              config: { smooth: true }
            }
          ];

          // Key findings
          report.keyFindings = [
            `${report.summary.criticalThreats} critical severity threats detected`,
            `${report.summary.newThreats} new threats identified in the reporting period`,
            `Average threat confidence: ${report.summary.averageConfidence.toFixed(1)}%`,
            `Most prevalent threat type: ${report.summary.topThreatType}`
          ];

          // Recommendations
          const insights = intelService.generateInsights(threats);
          report.recommendations = insights.map(insight => ({
            priority: insight.severity,
            title: insight.title,
            description: insight.description,
            actionItems: insight.recommendations
          }));

          report.generatedAt = new Date();
          report.status = 'completed';
          report.fileUrl = `/reports/${report.reportId}.${format}`;
          report.fileSize = Math.floor(Math.random() * 1000000) + 500000; // Simulated file size

          await report.save();
        } catch (error) {
          report.status = 'failed';
          await report.save();
        }
      });

      res.status(201).json(
        ApiResponse.created(report, 'Report generation started')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(req, res, next) {
    try {
      const { id } = req.params;

      const report = await IntelReport.findById(id);

      if (!report) {
        throw ApiError.notFound('Report not found');
      }

      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(report));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reports
   */
  async getAllReports(req, res, next) {
    try {
      const { page = 1, limit = 20, reportType, status } = req.query;

      const query = { userId: req.user.id };
      if (reportType) query.reportType = reportType;
      if (status) query.status = status;

      const reports = await IntelReport.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-sections') // Exclude large sections field
        .lean();

      const total = await IntelReport.countDocuments(query);

      res.json(ApiResponse.success({
        reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export report
   */
  async exportReport(req, res, next) {
    try {
      const { id } = req.params;
      const { format } = req.query;

      const report = await IntelReport.findById(id);

      if (!report) {
        throw ApiError.notFound('Report not found');
      }

      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      if (report.status !== 'completed') {
        throw ApiError.badRequest('Report is not ready for export');
      }

      // Return download URL or file data based on format
      res.json(ApiResponse.success({
        reportId: report.reportId,
        format: format || report.format,
        downloadUrl: report.fileUrl,
        fileSize: report.fileSize,
        generatedAt: report.generatedAt
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete report
   */
  async deleteReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await IntelReport.findById(id);

      if (!report) {
        throw ApiError.notFound('Report not found');
      }

      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await report.deleteOne();

      res.json(ApiResponse.success(null, 'Report deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Helper methods
  getTopThreatType(threats) {
    const counts = {};
    threats.forEach(t => {
      counts[t.threatType] = (counts[t.threatType] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  }

  generateExecutiveSummary(threats) {
    const critical = threats.filter(t => t.severity === 'CRITICAL').length;
    const high = threats.filter(t => t.severity === 'HIGH').length;
    
    return `This report covers ${threats.length} threat intelligence items collected during the reporting period. ` +
           `${critical} critical and ${high} high severity threats require immediate attention. ` +
           `The threat landscape shows continued activity across multiple threat categories with ` +
           `particular focus on ${this.getTopThreatType(threats)} related threats.`;
  }

  generateThreatLandscape(threats) {
    return `Analysis of ${threats.length} threats reveals diverse attack patterns targeting ` +
           `multiple industry sectors. Key trends include increased sophistication in attack ` +
           `methodologies and broader use of multi-vector approaches.`;
  }

  generateCriticalThreats(threats) {
    const critical = threats.filter(t => t.severity === 'CRITICAL');
    return `${critical.length} critical threats identified requiring immediate remediation. ` +
           `These threats demonstrate high confidence indicators and potential for significant impact.`;
  }

  generateIOCSection(threats) {
    const totalIPs = threats.reduce((sum, t) => sum + (t.indicators?.ips?.length || 0), 0);
    const totalDomains = threats.reduce((sum, t) => sum + (t.indicators?.domains?.length || 0), 0);
    const totalHashes = threats.reduce((sum, t) => sum + (t.indicators?.hashes?.length || 0), 0);
    
    return `Identified ${totalIPs} IP addresses, ${totalDomains} domains, and ${totalHashes} file hashes ` +
           `as indicators of compromise. These IOCs should be implemented in blocking rules and monitoring systems.`;
  }

  generateRecommendations(threats) {
    return `Based on the threat analysis, immediate actions include: ` +
           `enhanced monitoring for critical threats, implementation of IOC blocking rules, ` +
           `and review of security controls against identified attack vectors.`;
  }

  groupBy(threats, field) {
    const result = {};
    threats.forEach(t => {
      const key = t[field] || 'unknown';
      result[key] = (result[key] || 0) + 1;
    });
    return result;
  }

  getTrendData(threats) {
    const byDay = {};
    threats.forEach(t => {
      const day = t.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return byDay;
  }
}

module.exports = new ReportController();
