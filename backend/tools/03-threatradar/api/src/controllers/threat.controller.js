const Threat = require('../models/Threat.model');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../shared/utils/apiError');
const radarService = require('../services/radar.service');
const mlService = require('../services/ml.service');

class ThreatController {
  async createThreat(req, res, next) {
    try {
      const threat = new Threat({
        ...req.body,
        userId: req.user.id,
        threatId: `THREAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });

      const mlResult = await mlService.detectThreat(req.body);
      threat.mlPrediction = mlResult;
      threat.severity = mlResult.severity || threat.severity;
      threat.confidence = mlResult.confidence || threat.confidence;

      await threat.save();
      res.status(201).json(ApiResponse.created(threat, 'Threat detected and logged'));
    } catch (error) {
      next(error);
    }
  }

  async getAllThreats(req, res, next) {
    try {
      const { page = 1, limit = 20, severity, status, threatType } = req.query;
      const query = { userId: req.user.id };
      if (severity) query.severity = severity;
      if (status) query.status = status;
      if (threatType) query.threatType = threatType;

      const threats = await Threat.find(query)
        .sort({ detectedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Threat.countDocuments(query);

      res.json(ApiResponse.success({ threats, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } }));
    } catch (error) {
      next(error);
    }
  }

  async getThreatById(req, res, next) {
    try {
      const threat = await Threat.findById(req.params.id);
      if (!threat) throw ApiError.notFound('Threat not found');
      if (threat.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      res.json(ApiResponse.success(threat));
    } catch (error) {
      next(error);
    }
  }

  async updateThreat(req, res, next) {
    try {
      const threat = await Threat.findById(req.params.id);
      if (!threat) throw ApiError.notFound('Threat not found');
      if (threat.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');

      ['status', 'severity', 'containmentActions'].forEach(field => {
        if (req.body[field] !== undefined) threat[field] = req.body[field];
      });

      await threat.save();
      res.json(ApiResponse.success(threat, 'Threat updated'));
    } catch (error) {
      next(error);
    }
  }

  async deleteThreat(req, res, next) {
    try {
      const threat = await Threat.findById(req.params.id);
      if (!threat) throw ApiError.notFound('Threat not found');
      if (threat.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      await threat.deleteOne();
      res.json(ApiResponse.success(null, 'Threat deleted'));
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const timeRange = startDate && endDate ? { start: new Date(startDate), end: new Date(endDate) } : null;
      const stats = await radarService.calculateStatistics(req.user.id, timeRange);
      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ThreatController();
