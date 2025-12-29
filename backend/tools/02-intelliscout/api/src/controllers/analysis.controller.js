const IntelAnalysis = require('../models/Analysis.model');
const ThreatIntel = require('../models/ThreatIntel.model');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../shared/utils/apiError');
const intelService = require('../services/intel.service');

class AnalysisController {
  /**
   * Create new analysis
   */
  async createAnalysis(req, res, next) {
    try {
      const startTime = Date.now();
      const {
        analysisType,
        timeRange,
        filters
      } = req.body;

      // Create analysis record
      const analysis = new IntelAnalysis({
        userId: req.user.id,
        analysisId: `ANALYSIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        analysisType,
        timeRange,
        filters,
        status: 'processing'
      });

      await analysis.save();

      // Perform analysis asynchronously
      setImmediate(async () => {
        try {
          const query = { userId: req.user.id };
          
          if (timeRange) {
            query.createdAt = { $gte: new Date(timeRange.start), $lte: new Date(timeRange.end) };
          }

          if (filters) {
            if (filters.threatTypes?.length > 0) query.threatType = { $in: filters.threatTypes };
            if (filters.severities?.length > 0) query.severity = { $in: filters.severities };
            if (filters.sources?.length > 0) query.sourceType = { $in: filters.sources };
          }

          const threats = await ThreatIntel.find(query);

          // Calculate metrics
          analysis.totalThreats = threats.length;
          analysis.criticalThreats = threats.filter(t => t.severity === 'CRITICAL').length;
          analysis.highThreats = threats.filter(t => t.severity === 'HIGH').length;
          analysis.mediumThreats = threats.filter(t => t.severity === 'MEDIUM').length;
          analysis.lowThreats = threats.filter(t => t.severity === 'LOW').length;

          // Threat distribution
          const distribution = {};
          threats.forEach(t => {
            distribution[t.threatType] = (distribution[t.threatType] || 0) + 1;
          });
          analysis.threatDistribution = distribution;

          // Top threats
          analysis.topThreats = threats
            .sort((a, b) => b.confidenceScore - a.confidenceScore)
            .slice(0, 10)
            .map(t => ({
              intelId: t.intelId,
              title: t.title,
              severity: t.severity,
              confidence: t.confidenceScore,
              threatType: t.threatType
            }));

          // Trends
          const trends = await intelService.analyzeTrends(timeRange, filters);
          analysis.trends = Object.entries(trends.timeline).map(([period, count]) => ({
            period,
            count,
            severity: 'MEDIUM',
            threatType: 'mixed'
          }));

          // Correlations (sample top indicators)
          const topIPs = Object.entries(trends.topIndicators.ips)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
          
          analysis.correlations = topIPs.map(([ip, count]) => ({
            indicator: ip,
            indicatorType: 'ip',
            relatedThreats: count,
            confidence: Math.min(count * 10, 90)
          }));

          // Generate insights
          analysis.insights = intelService.generateInsights(threats);

          // Recommendations
          analysis.recommendations = [
            'Monitor critical severity threats closely',
            'Implement blocking rules for identified IOCs',
            'Conduct threat hunting for APT indicators',
            'Update security controls based on attack vectors',
            'Share intelligence with trusted partners'
          ];

          analysis.processingTime = Date.now() - startTime;
          analysis.status = 'completed';

          await analysis.save();
        } catch (error) {
          analysis.status = 'failed';
          await analysis.save();
        }
      });

      res.status(201).json(
        ApiResponse.created(analysis, 'Analysis started successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get analysis by ID
   */
  async getAnalysisById(req, res, next) {
    try {
      const { id } = req.params;

      const analysis = await IntelAnalysis.findById(id);

      if (!analysis) {
        throw ApiError.notFound('Analysis not found');
      }

      if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(analysis));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all analyses
   */
  async getAllAnalyses(req, res, next) {
    try {
      const { page = 1, limit = 20, analysisType, status } = req.query;

      const query = { userId: req.user.id };
      if (analysisType) query.analysisType = analysisType;
      if (status) query.status = status;

      const analyses = await IntelAnalysis.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await IntelAnalysis.countDocuments(query);

      res.json(ApiResponse.success({
        analyses,
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
   * Delete analysis
   */
  async deleteAnalysis(req, res, next) {
    try {
      const { id } = req.params;

      const analysis = await IntelAnalysis.findById(id);

      if (!analysis) {
        throw ApiError.notFound('Analysis not found');
      }

      if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await analysis.deleteOne();

      res.json(ApiResponse.success(null, 'Analysis deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalysisController();
