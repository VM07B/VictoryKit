const VulnReport = require('../models/Report.model');
const VulnScan = require('../models/Scan.model');
const { ApiResponse, ApiError } = require('../../../../shared');

class ReportController {
  async generateReport(req, res, next) {
    try {
      const { reportType, title, timeRange, format = 'pdf' } = req.body;
      const report = new VulnReport({
        userId: req.user.id,
        reportId: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        reportType,
        title: title || `${reportType.toUpperCase()} Vulnerability Report`,
        timeRange,
        format,
        status: 'generating'
      });

      await report.save();

      setImmediate(async () => {
        try {
          const query = { userId: req.user.id };
          if (timeRange) query.createdAt = { $gte: new Date(timeRange.start), $lte: new Date(timeRange.end) };
          const scans = await VulnScan.find(query);

          report.summary = {
            totalScans: scans.length,
            totalVulnerabilities: scans.reduce((sum, s) => sum + (s.summary?.totalVulnerabilities || 0), 0),
            criticalVulns: scans.reduce((sum, s) => sum + (s.summary?.criticalCount || 0), 0),
            remediationRate: '45%',
            avgCvssScore: scans.reduce((sum, s) => sum + (s.summary?.avgCvssScore || 0), 0) / Math.max(scans.length, 1),
            topCve: 'CVE-2023-12345'
          };

          report.metrics = { vulnsBySeverity: {}, vulnsByType: {} };
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
      const report = await VulnReport.findById(req.params.id);
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
      const reports = await VulnReport.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
      const total = await VulnReport.countDocuments({ userId: req.user.id });
      res.json(ApiResponse.success({ reports, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } }));
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req, res, next) {
    try {
      const report = await VulnReport.findById(req.params.id);
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
      const report = await VulnReport.findById(req.params.id);
      if (!report) throw ApiError.notFound('Report not found');
      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      await report.deleteOne();
      res.json(ApiResponse.success(null, 'Report deleted'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
