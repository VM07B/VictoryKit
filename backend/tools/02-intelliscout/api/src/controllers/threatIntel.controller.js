const ThreatIntel = require('../models/ThreatIntel.model');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../shared/utils/apiError');
const intelService = require('../services/intel.service');
const mlService = require('../services/ml.service');

class ThreatIntelController {
  /**
   * Create new threat intelligence entry
   */
  async createThreatIntel(req, res, next) {
    try {
      const {
        sourceType,
        threatType,
        title,
        description,
        indicators,
        targetSectors,
        targetCountries,
        attackVectors,
        mitreTactics,
        mitreTechniques,
        sources,
        tags
      } = req.body;

      // Create threat intel record
      const threatIntel = new ThreatIntel({
        userId: req.user.id,
        intelId: `INTEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sourceType,
        threatType,
        title,
        description,
        indicators,
        targetSectors,
        targetCountries,
        attackVectors,
        mitreTactics,
        mitreTechniques,
        sources,
        tags
      });

      // Get ML analysis
      try {
        const mlPrediction = await mlService.analyzeThreat({
          sourceType,
          threatType,
          indicators,
          attackVectors,
          mitreTactics
        });

        threatIntel.mlPrediction = mlPrediction;
        threatIntel.severity = mlPrediction.severity || intelService.determineSeverity(threatIntel);
        threatIntel.confidenceScore = mlPrediction.confidence || intelService.calculateConfidence(threatIntel);
      } catch (mlError) {
        // Use rule-based fallback
        threatIntel.severity = intelService.determineSeverity(threatIntel);
        threatIntel.confidenceScore = intelService.calculateConfidence(threatIntel);
      }

      await threatIntel.save();

      res.status(201).json(
        ApiResponse.created(threatIntel, 'Threat intelligence created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all threat intelligence (with pagination and filters)
   */
  async getThreatIntel(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        severity,
        threatType,
        status,
        sourceType,
        search
      } = req.query;

      const query = { userId: req.user.id };

      if (severity) query.severity = severity;
      if (threatType) query.threatType = threatType;
      if (status) query.status = status;
      if (sourceType) query.sourceType = sourceType;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      const threats = await ThreatIntel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await ThreatIntel.countDocuments(query);

      res.json(ApiResponse.success({
        threats,
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
   * Get threat intelligence by ID
   */
  async getThreatIntelById(req, res, next) {
    try {
      const { id } = req.params;

      const threat = await ThreatIntel.findById(id).populate('relatedThreats');

      if (!threat) {
        throw ApiError.notFound('Threat intelligence not found');
      }

      if (threat.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(threat));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update threat intelligence
   */
  async updateThreatIntel(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const threat = await ThreatIntel.findById(id);

      if (!threat) {
        throw ApiError.notFound('Threat intelligence not found');
      }

      if (threat.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      // Update allowed fields
      const allowedUpdates = [
        'status', 'severity', 'indicators', 'tags',
        'targetSectors', 'targetCountries', 'attackVectors',
        'mitreTactics', 'mitreTechniques', 'sources', 'metadata'
      ];

      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          threat[field] = updates[field];
        }
      });

      threat.lastSeen = new Date();

      await threat.save();

      res.json(ApiResponse.success(threat, 'Threat intelligence updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete threat intelligence
   */
  async deleteThreatIntel(req, res, next) {
    try {
      const { id } = req.params;

      const threat = await ThreatIntel.findById(id);

      if (!threat) {
        throw ApiError.notFound('Threat intelligence not found');
      }

      if (threat.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await threat.deleteOne();

      res.json(ApiResponse.success(null, 'Threat intelligence deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Correlate indicators
   */
  async correlateIndicators(req, res, next) {
    try {
      const { indicators } = req.body;

      if (!indicators || Object.keys(indicators).length === 0) {
        throw ApiError.badRequest('No indicators provided');
      }

      const correlations = await intelService.correlateIndicators(indicators);

      res.json(ApiResponse.success({
        indicators,
        correlations,
        totalRelatedThreats: correlations.reduce((sum, c) => sum + c.relatedThreats, 0)
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get threat intelligence statistics
   */
  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const timeRange = startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : null;

      const stats = await intelService.calculateStatistics(req.user.id, timeRange);

      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ThreatIntelController();
