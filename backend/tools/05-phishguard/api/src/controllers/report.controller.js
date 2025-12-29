const PhishingReport = require('../models/Report.model');
const PhishingUrl = require('../models/URL.model');
const { ApiResponse, ApiError } = require('../../../../shared');

class ReportController {
  async generateReport(req, res, next) {
    try {
      const { reportType, title, timeRange, format = 'pdf' } = req.body;

      const report = new PhishingReport({
        userId: req.user.id,
        reportId: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        reportType,
        title: title || `${reportType.toUpperCase()} Phishing Analysis Report`,
        timeRange,
        format,
        status: 'generating'
      });

      await report.save();

      setImmediate(async () => {
        try {
          const query = { userId: req.user.id };
          if (timeRange) query.checkedAt = { $gte: new Date(timeRange.start), $lte: new Date(timeRange.end) };

          const urls = await PhishingUrl.find(query);

          report.summary = {
            totalUrls: urls.length,
            phishingUrls: urls.filter(u => u.isPhishing).length,
            blockedUrls: urls.filter(u => u.isPhishing).length,
            criticalThreats: urls.filter(u => u.severity === 'CRITICAL').length,
            topPhishingType: this.getTopType(urls),
            detectionRate: (urls.filter(u => u.isPhishing).length / Math.max(urls.length, 1) * 100).toFixed(2)
          };

          report.metrics = {
            phishingByType: this.groupBy(urls.filter(u => u.isPhishing), 'phishingType'),
            phishingBySeverity: this.groupBy(urls, 'severity')
          };

          report.topThreats = urls
            .filter(u => u.isPhishing)
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 10)
            .map(u => ({
              urlId: u.urlId,
              url: u.originalUrl,
              phishingType: u.phishingType,
              riskScore: u.riskScore,
              severity: u.severity
            }));

          report.recommendations = this.generateRecommendations(report.summary);
          report.fileUrl = `/reports/${report.reportId}.${format}`;
          report.status = 'completed';

          await report.save();
        } catch (error) {
          report.status = 'failed';
          await report.save();
        }
      });

      res.status(201).json(ApiResponse.created(report, 'Report generation started'));
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req, res, next) {
    try {
      const report = await PhishingReport.findById(req.params.id);
      if (!report) throw ApiError.notFound('Report not found');
      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      res.json(ApiResponse.success(report));
    } catch (error) {
      next(error);
    }
  }

  async getAllReports(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const reports = await PhishingReport.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      const total = await PhishingReport.countDocuments({ userId: req.user.id });
      res.json(ApiResponse.success({ 
        reports, 
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } 
      }));
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req, res, next) {
    try {
      const report = await PhishingReport.findById(req.params.id);
      if (!report) throw ApiError.notFound('Report not found');
      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      if (report.status !== 'completed') throw ApiError.badRequest('Report not ready');
      res.json(ApiResponse.success({ reportId: report.reportId, format: report.format, downloadUrl: report.fileUrl }));
    } catch (error) {
      next(error);
    }
  }

  async deleteReport(req, res, next) {
    try {
      const report = await PhishingReport.findById(req.params.id);
      if (!report) throw ApiError.notFound('Report not found');
      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      await report.deleteOne();
      res.json(ApiResponse.success(null, 'Report deleted'));
    } catch (error) {
      next(error);
    }
  }

  groupBy(items, field) {
    const result = {};
    items.forEach(i => {
      const key = i[field] || 'unknown';
      result[key] = (result[key] || 0) + 1;
    });
    return result;
  }

  getTopType(urls) {
    const counts = {};
    urls.filter(u => u.isPhishing).forEach(u => {
      counts[u.phishingType] = (counts[u.phishingType] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  }

  generateRecommendations(summary) {
    const recs = [];
    if (summary.criticalThreats > 0) recs.push({ priority: 'CRITICAL', title: 'Block Critical Phishing URLs', description: `${summary.criticalThreats} critical phishing attempts detected`, actionItems: ['Block URLs immediately', 'Alert users', 'Review email filters'] });
    if (summary.detectionRate > 30) recs.push({ priority: 'HIGH', title: 'High Phishing Rate', description: `${summary.detectionRate}% detection rate is concerning`, actionItems: ['Strengthen email security', 'Deploy advanced threat protection', 'Conduct training'] });
    recs.push({ priority: 'MEDIUM', title: 'Continuous Monitoring', description: 'Maintain vigilance against phishing', actionItems: ['Enable real-time scanning', 'Update threat intelligence', 'Monitor user reports'] });
    return recs;
  }
}

module.exports = new ReportController();
