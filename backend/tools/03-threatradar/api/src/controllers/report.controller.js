const ThreatReport = require('../models/Report.model');
const Threat = require('../models/Threat.model');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../shared/utils/apiError');
const radarService = require('../services/radar.service');

class ReportController {
  /**
   * Generate new threat report
   */
  async generateReport(req, res, next) {
    try {
      const { reportType, title, timeRange, format = 'pdf' } = req.body;

      const report = new ThreatReport({
        userId: req.user.id,
        reportId: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        reportType,
        title: title || `${reportType.toUpperCase()} Threat Detection Report`,
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
            query.detectedAt = { 
              $gte: new Date(timeRange.start), 
              $lte: new Date(timeRange.end) 
            };
          }

          const threats = await Threat.find(query);

          // Calculate summary
          const activeThreats = threats.filter(t => t.status === 'active' || t.status === 'investigating');
          const resolvedThreats = threats.filter(t => t.status === 'resolved');
          const falsePositives = threats.filter(t => t.status === 'false_positive');

          report.summary = {
            totalThreats: threats.length,
            criticalThreats: threats.filter(t => t.severity === 'CRITICAL').length,
            activeThreats: activeThreats.length,
            resolvedThreats: resolvedThreats.length,
            falsePositives: falsePositives.length,
            averageResponseTime: this.calculateAverageResponseTime(threats)
          };

          // Calculate metrics
          const metrics = {
            threatsBySeverity: this.groupBy(threats, 'severity'),
            threatsByType: this.groupBy(threats, 'threatType'),
            threatsBySource: this.groupBy(threats, 'detectionSource')
          };

          report.metrics = {
            ...metrics,
            detectionRate: ((threats.length - falsePositives.length) / Math.max(threats.length, 1) * 100).toFixed(2),
            responseTime: report.summary.averageResponseTime
          };

          // Generate charts
          report.charts = [
            {
              type: 'pie',
              title: 'Threats by Severity',
              data: metrics.threatsBySeverity
            },
            {
              type: 'bar',
              title: 'Threats by Type',
              data: metrics.threatsByType
            },
            {
              type: 'line',
              title: 'Threat Timeline',
              data: this.getTimelineData(threats)
            }
          ];

          // Build timeline of significant events
          report.timeline = threats
            .filter(t => t.severity === 'CRITICAL' || t.severity === 'HIGH')
            .sort((a, b) => b.detectedAt - a.detectedAt)
            .slice(0, 20)
            .map(t => ({
              timestamp: t.detectedAt,
              event: `${t.threatType} detected`,
              severity: t.severity,
              details: `Source: ${t.sourceIP || 'Unknown'}, Confidence: ${t.confidence}%`
            }));

          // Recommendations
          report.recommendations = this.generateRecommendations(threats, report.summary);

          report.fileUrl = `/reports/${report.reportId}.${format}`;
          report.status = 'completed';

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

      const report = await ThreatReport.findById(id);

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

      const reports = await ThreatReport.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-timeline') // Exclude large field
        .lean();

      const total = await ThreatReport.countDocuments(query);

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

      const report = await ThreatReport.findById(id);

      if (!report) {
        throw ApiError.notFound('Report not found');
      }

      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      if (report.status !== 'completed') {
        throw ApiError.badRequest('Report is not ready for export');
      }

      res.json(ApiResponse.success({
        reportId: report.reportId,
        format: format || report.format,
        downloadUrl: report.fileUrl,
        generatedAt: report.createdAt
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

      const report = await ThreatReport.findById(id);

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
  groupBy(threats, field) {
    const result = {};
    threats.forEach(t => {
      const key = t[field] || 'unknown';
      result[key] = (result[key] || 0) + 1;
    });
    return result;
  }

  getTimelineData(threats) {
    const byDay = {};
    threats.forEach(t => {
      const day = t.detectedAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return byDay;
  }

  calculateAverageResponseTime(threats) {
    const resolved = threats.filter(t => t.status === 'resolved');
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, t) => {
      const responseTime = (t.updatedAt - t.detectedAt) / 1000 / 60; // minutes
      return sum + responseTime;
    }, 0);

    return Math.round(totalTime / resolved.length);
  }

  generateRecommendations(threats, summary) {
    const recs = [];

    if (summary.criticalThreats > 0) {
      recs.push('Immediate response required for critical threats');
      recs.push('Activate incident response procedures');
    }

    if (summary.activeThreats > summary.totalThreats * 0.5) {
      recs.push('High number of active threats - increase monitoring');
      recs.push('Review containment strategies');
    }

    if (summary.falsePositives > summary.totalThreats * 0.2) {
      recs.push('High false positive rate - tune detection rules');
    }

    recs.push('Regular security audits recommended');
    recs.push('Update threat signatures and rules');

    return recs;
  }
}

module.exports = new ReportController();
