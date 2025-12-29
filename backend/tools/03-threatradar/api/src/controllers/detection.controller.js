const Detection = require('../models/Detection.model');
const Threat = require('../models/Threat.model');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../shared/utils/apiError');
const radarService = require('../services/radar.service');

class DetectionController {
  /**
   * Create new detection analysis
   */
  async createDetection(req, res, next) {
    try {
      const startTime = Date.now();
      const { detectionType, timeRange, filters } = req.body;

      const detection = new Detection({
        userId: req.user.id,
        detectionId: `DETECT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        detectionType,
        timeRange,
        status: 'processing'
      });

      await detection.save();

      // Perform detection analysis asynchronously
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

          // Calculate metrics
          detection.totalDetections = threats.length;
          detection.criticalThreats = threats.filter(t => t.severity === 'CRITICAL').length;
          detection.highThreats = threats.filter(t => t.severity === 'HIGH').length;
          detection.mediumThreats = threats.filter(t => t.severity === 'MEDIUM').length;
          detection.lowThreats = threats.filter(t => t.severity === 'LOW').length;
          detection.activeThreats = threats.filter(t => t.status === 'active' || t.status === 'investigating').length;
          detection.resolvedThreats = threats.filter(t => t.status === 'resolved').length;

          // Detections by source
          const bySource = {};
          threats.forEach(t => {
            bySource[t.detectionSource] = (bySource[t.detectionSource] || 0) + 1;
          });
          detection.detectionsBySource = bySource;

          // Detections by type
          const byType = {};
          threats.forEach(t => {
            byType[t.threatType] = (byType[t.threatType] || 0) + 1;
          });
          detection.detectionsByType = byType;

          // Top threats (by confidence)
          detection.topThreats = threats
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 10)
            .map(t => ({
              threatId: t.threatId,
              threatType: t.threatType,
              severity: t.severity,
              confidence: t.confidence,
              detectedAt: t.detectedAt
            }));

          // Top targets (by affected assets)
          const targetCounts = {};
          threats.forEach(t => {
            t.affectedAssets?.forEach(asset => {
              const key = asset.ipAddress || asset.hostname;
              if (key) {
                if (!targetCounts[key]) {
                  targetCounts[key] = {
                    assetId: asset.assetId,
                    hostname: asset.hostname,
                    ipAddress: asset.ipAddress,
                    threatCount: 0
                  };
                }
                targetCounts[key].threatCount++;
              }
            });
          });
          detection.topTargets = Object.values(targetCounts)
            .sort((a, b) => b.threatCount - a.threatCount)
            .slice(0, 10);

          // Top attackers (by source IP)
          const attackerCounts = {};
          threats.forEach(t => {
            if (t.sourceIP) {
              if (!attackerCounts[t.sourceIP]) {
                attackerCounts[t.sourceIP] = {
                  sourceIP: t.sourceIP,
                  country: 'Unknown', // Would integrate with GeoIP
                  threatCount: 0,
                  lastSeen: t.lastSeen
                };
              }
              attackerCounts[t.sourceIP].threatCount++;
              if (t.lastSeen > attackerCounts[t.sourceIP].lastSeen) {
                attackerCounts[t.sourceIP].lastSeen = t.lastSeen;
              }
            }
          });
          detection.topAttackers = Object.values(attackerCounts)
            .sort((a, b) => b.threatCount - a.threatCount)
            .slice(0, 10);

          // Generate insights
          const anomalies = radarService.detectAnomalies(threats);
          detection.insights = anomalies.map(a => ({
            type: a.type,
            title: `Anomaly Detected: ${a.type.replace(/_/g, ' ')}`,
            description: `${a.ip} shows ${a.count} occurrences`,
            severity: a.severity,
            recommendations: [
              'Investigate source IP address',
              'Review firewall rules',
              'Consider IP blocking if malicious'
            ]
          }));

          if (detection.criticalThreats > 0) {
            detection.insights.unshift({
              type: 'critical_alert',
              title: 'Critical Threats Detected',
              description: `${detection.criticalThreats} critical severity threats require immediate attention`,
              severity: 'CRITICAL',
              recommendations: [
                'Activate incident response team',
                'Implement immediate containment',
                'Review and prioritize threats'
              ]
            });
          }

          detection.status = 'completed';
          await detection.save();
        } catch (error) {
          detection.status = 'failed';
          await detection.save();
        }
      });

      res.status(201).json(
        ApiResponse.created(detection, 'Detection analysis started')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detection by ID
   */
  async getDetectionById(req, res, next) {
    try {
      const { id } = req.params;

      const detection = await Detection.findById(id);

      if (!detection) {
        throw ApiError.notFound('Detection not found');
      }

      if (detection.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(detection));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all detections
   */
  async getAllDetections(req, res, next) {
    try {
      const { page = 1, limit = 20, detectionType, status } = req.query;

      const query = { userId: req.user.id };
      if (detectionType) query.detectionType = detectionType;
      if (status) query.status = status;

      const detections = await Detection.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Detection.countDocuments(query);

      res.json(ApiResponse.success({
        detections,
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
   * Delete detection
   */
  async deleteDetection(req, res, next) {
    try {
      const { id } = req.params;

      const detection = await Detection.findById(id);

      if (!detection) {
        throw ApiError.notFound('Detection not found');
      }

      if (detection.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await detection.deleteOne();

      res.json(ApiResponse.success(null, 'Detection deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DetectionController();
