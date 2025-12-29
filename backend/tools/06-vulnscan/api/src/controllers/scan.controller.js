const VulnScan = require('../models/Scan.model');
const { ApiResponse, ApiError } = require('../../../../shared');
const vulnService = require('../services/vuln.service');
const mlService = require('../services/ml.service');

class ScanController {
  async createScan(req, res, next) {
    try {
      const { targetType, targetIdentifier, scanType, scanConfig } = req.body;

      const scan = new VulnScan({
        userId: req.user.id,
        scanId: `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        targetType,
        targetIdentifier,
        scanType,
        scanConfig,
        status: 'scanning',
        startedAt: new Date()
      });

      await scan.save();

      setImmediate(async () => {
        try {
          // Simulate vulnerability scanning
          const mockVulns = [
            { vulnId: 'V1', cve: 'CVE-2023-12345', title: 'SQL Injection', severity: 'HIGH', cvssScore: 8.2, affectedComponent: 'web-app', remediation: 'Use parameterized queries' }
          ];

          scan.vulnerabilities = mockVulns;
          scan.summary = {
            totalVulnerabilities: mockVulns.length,
            criticalCount: mockVulns.filter(v => v.severity === 'CRITICAL').length,
            highCount: mockVulns.filter(v => v.severity === 'HIGH').length,
            mediumCount: mockVulns.filter(v => v.severity === 'MEDIUM').length,
            lowCount: mockVulns.filter(v => v.severity === 'LOW').length,
            avgCvssScore: mockVulns.reduce((sum, v) => sum + v.cvssScore, 0) / mockVulns.length
          };

          const mlResult = await mlService.analyzeScan({ vulnerabilities: mockVulns });
          scan.mlPrediction = mlResult;
          scan.status = 'completed';
          scan.completedAt = new Date();
          scan.duration = (scan.completedAt - scan.startedAt) / 1000;

          await scan.save();
        } catch (error) {
          scan.status = 'failed';
          await scan.save();
        }
      });

      res.status(201).json(ApiResponse.created(scan, 'Scan started'));
    } catch (error) {
      next(error);
    }
  }

  async getAllScans(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const scans = await VulnScan.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).select('-vulnerabilities');
      const total = await VulnScan.countDocuments({ userId: req.user.id });
      res.json(ApiResponse.success({ scans, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } }));
    } catch (error) {
      next(error);
    }
  }

  async getScanById(req, res, next) {
    try {
      const scan = await VulnScan.findById(req.params.id);
      if (!scan) throw ApiError.notFound('Scan not found');
      if (scan.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      res.json(ApiResponse.success(scan));
    } catch (error) {
      next(error);
    }
  }

  async deleteScan(req, res, next) {
    try {
      const scan = await VulnScan.findById(req.params.id);
      if (!scan) throw ApiError.notFound('Scan not found');
      if (scan.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      await scan.deleteOne();
      res.json(ApiResponse.success(null, 'Scan deleted'));
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const timeRange = startDate && endDate ? { start: new Date(startDate), end: new Date(endDate) } : null;
      const stats = await vulnService.calculateStatistics(req.user.id, timeRange);
      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScanController();
