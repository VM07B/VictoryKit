const PhishingAnalysis = require('../models/Analysis.model');
const PhishingUrl = require('../models/URL.model');
const { ApiResponse, ApiError } = require('../../../../shared');
const phishingService = require('../services/phishing.service');

class AnalysisController {
  async createAnalysis(req, res, next) {
    try {
      const { analysisType, timeRange } = req.body;

      const analysis = new PhishingAnalysis({
        userId: req.user.id,
        analysisId: `ANALYSIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        analysisType,
        timeRange,
        status: 'processing'
      });

      await analysis.save();

      setImmediate(async () => {
        try {
          const query = { userId: req.user.id };
          if (timeRange) query.checkedAt = { $gte: new Date(timeRange.start), $lte: new Date(timeRange.end) };

          const urls = await PhishingUrl.find(query);

          analysis.metrics = {
            totalUrls: urls.length,
            phishingUrls: urls.filter(u => u.isPhishing).length,
            cleanUrls: urls.filter(u => !u.isPhishing).length,
            suspiciousUrls: urls.filter(u => u.riskScore > 50 && u.riskScore < 70).length,
            criticalThreats: urls.filter(u => u.severity === 'CRITICAL').length,
            avgRiskScore: urls.reduce((sum, u) => sum + u.riskScore, 0) / Math.max(urls.length, 1)
          };

          const distribution = {};
          urls.filter(u => u.isPhishing).forEach(u => {
            distribution[u.phishingType] = (distribution[u.phishingType] || 0) + 1;
          });
          analysis.phishingDistribution = distribution;

          const domainCounts = {};
          urls.forEach(u => {
            domainCounts[u.domain] = (domainCounts[u.domain] || 0) + 1;
          });
          analysis.topPhishingDomains = Object.entries(domainCounts)
            .map(([domain, count]) => ({ domain, count, avgRiskScore: 65 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          analysis.insights = phishingService.generateInsights(urls);
          analysis.status = 'completed';

          await analysis.save();
        } catch (error) {
          analysis.status = 'failed';
          await analysis.save();
        }
      });

      res.status(201).json(ApiResponse.created(analysis, 'Analysis started'));
    } catch (error) {
      next(error);
    }
  }

  async getAnalysisById(req, res, next) {
    try {
      const analysis = await PhishingAnalysis.findById(req.params.id);
      if (!analysis) throw ApiError.notFound('Analysis not found');
      if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      res.json(ApiResponse.success(analysis));
    } catch (error) {
      next(error);
    }
  }

  async getAllAnalyses(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const analyses = await PhishingAnalysis.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      const total = await PhishingAnalysis.countDocuments({ userId: req.user.id });
      res.json(ApiResponse.success({ 
        analyses, 
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } 
      }));
    } catch (error) {
      next(error);
    }
  }

  async deleteAnalysis(req, res, next) {
    try {
      const analysis = await PhishingAnalysis.findById(req.params.id);
      if (!analysis) throw ApiError.notFound('Analysis not found');
      if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      await analysis.deleteOne();
      res.json(ApiResponse.success(null, 'Analysis deleted'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalysisController();
