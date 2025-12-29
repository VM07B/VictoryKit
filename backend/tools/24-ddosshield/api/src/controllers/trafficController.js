/**
 * Traffic Controller - Traffic monitoring and analysis
 */

const Traffic = require("../models/Traffic");
const ddosService = require("../services/ddosService");

const trafficController = {
  // Get traffic records
  async getAll(req, res) {
    try {
      const { interval = "5m", hours = 24, page = 1, limit = 100 } = req.query;

      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        Traffic.find({
          interval,
          timestamp: { $gte: since },
        })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Traffic.countDocuments({
          interval,
          timestamp: { $gte: since },
        }),
      ]);

      res.json({
        success: true,
        data: records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get realtime traffic
  async getRealtime(req, res) {
    try {
      const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);

      const records = await Traffic.find({
        interval: "1m",
        timestamp: { $gte: last5Minutes },
      }).sort({ timestamp: 1 });

      // Calculate current metrics
      const latest = records[records.length - 1];
      const currentMetrics = latest ? latest.metrics : null;

      // Check for anomalies
      const anomalyCheck = await ddosService.checkForAnomalies(records);

      res.json({
        success: true,
        data: {
          current: currentMetrics,
          history: records,
          anomaly: anomalyCheck,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Analyze traffic
  async analyze(req, res) {
    try {
      const trafficData = req.body;

      const analysis = await ddosService.analyzeTraffic(trafficData);

      // Store traffic record
      const record = new Traffic({
        interval: "1m",
        metrics: trafficData.metrics,
        breakdown: trafficData.breakdown,
        anomalies: {
          detected: analysis.isAnomalous,
          score: analysis.anomalyScore,
          signals: analysis.signals.map((s) => s.signal),
        },
      });
      await record.save();

      res.json({
        success: true,
        data: {
          analysis,
          recordId: record._id,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get traffic baseline
  async getBaseline(req, res) {
    try {
      const { hours = 168 } = req.query; // Default 7 days
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Calculate baseline from historical data
      const records = await Traffic.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: null,
            avgBandwidthIn: { $avg: "$metrics.bandwidth.inbound" },
            avgBandwidthOut: { $avg: "$metrics.bandwidth.outbound" },
            avgPacketsIn: { $avg: "$metrics.packets.inbound" },
            avgPacketsOut: { $avg: "$metrics.packets.outbound" },
            avgRequests: { $avg: "$metrics.requests.total" },
            avgLatency: { $avg: "$metrics.latency.avg" },
            maxBandwidthIn: { $max: "$metrics.bandwidth.inbound" },
            maxPacketsIn: { $max: "$metrics.packets.inbound" },
            maxRequests: { $max: "$metrics.requests.total" },
          },
        },
      ]);

      const baseline = records[0] || {};

      res.json({
        success: true,
        data: {
          period: `${hours} hours`,
          baseline: {
            bandwidth: {
              avg: baseline.avgBandwidthIn,
              max: baseline.maxBandwidthIn,
            },
            packets: {
              avg: baseline.avgPacketsIn,
              max: baseline.maxPacketsIn,
            },
            requests: {
              avg: baseline.avgRequests,
              max: baseline.maxRequests,
            },
            latency: {
              avg: baseline.avgLatency,
            },
          },
          thresholds: {
            bandwidth: baseline.avgBandwidthIn * 3,
            packets: baseline.avgPacketsIn * 3,
            requests: baseline.avgRequests * 3,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = trafficController;
