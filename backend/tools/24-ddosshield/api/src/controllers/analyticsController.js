/**
 * Analytics Controller - DDoS analytics and dashboard
 */

const Attack = require("../models/Attack");
const Protection = require("../models/Protection");
const Traffic = require("../models/Traffic");
const Blocklist = require("../models/Blocklist");

const analyticsController = {
  // Get overview
  async getOverview(req, res) {
    try {
      const now = new Date();
      const last24h = new Date(now - 24 * 60 * 60 * 1000);
      const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);

      const [
        totalAttacks,
        activeAttacks,
        attacks24h,
        attacks7d,
        mitigatedAttacks,
        activeProtections,
        blockedIps,
      ] = await Promise.all([
        Attack.countDocuments(),
        Attack.countDocuments({
          status: { $in: ["detected", "active", "mitigating"] },
        }),
        Attack.countDocuments({ "timeline.detected": { $gte: last24h } }),
        Attack.countDocuments({ "timeline.detected": { $gte: last7d } }),
        Attack.countDocuments({ status: "mitigated" }),
        Protection.countDocuments({ status: "active" }),
        Blocklist.countDocuments({ status: "active" }),
      ]);

      res.json({
        success: true,
        data: {
          attacks: {
            total: totalAttacks,
            active: activeAttacks,
            last24h: attacks24h,
            last7d: attacks7d,
            mitigated: mitigatedAttacks,
          },
          protection: {
            activeRules: activeProtections,
            blockedIps: blockedIps,
          },
          status: activeAttacks > 0 ? "under_attack" : "normal",
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get attack statistics
  async getAttackStats(req, res) {
    try {
      const { days = 30 } = req.query;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [byType, byStatus, timeline, topTargets] = await Promise.all([
        Attack.aggregate([
          { $match: { "timeline.detected": { $gte: since } } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Attack.aggregate([
          { $match: { "timeline.detected": { $gte: since } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Attack.aggregate([
          { $match: { "timeline.detected": { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$timeline.detected",
                },
              },
              count: { $sum: 1 },
              avgDuration: { $avg: "$metrics.duration" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Attack.aggregate([
          { $match: { "timeline.detected": { $gte: since } } },
          { $group: { _id: "$target.value", attacks: { $sum: 1 } } },
          { $sort: { attacks: -1 } },
          { $limit: 10 },
        ]),
      ]);

      res.json({
        success: true,
        data: {
          byType,
          byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
          timeline,
          topTargets,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get traffic statistics
  async getTrafficStats(req, res) {
    try {
      const { hours = 24 } = req.query;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const stats = await Traffic.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: null,
            avgBandwidth: { $avg: "$metrics.bandwidth.inbound" },
            maxBandwidth: { $max: "$metrics.bandwidth.inbound" },
            avgPackets: { $avg: "$metrics.packets.inbound" },
            maxPackets: { $max: "$metrics.packets.inbound" },
            totalRequests: { $sum: "$metrics.requests.total" },
            avgLatency: { $avg: "$metrics.latency.avg" },
            anomalies: { $sum: { $cond: ["$anomalies.detected", 1, 0] } },
          },
        },
      ]);

      const timeline = await Traffic.aggregate([
        { $match: { timestamp: { $gte: since }, interval: "5m" } },
        { $sort: { timestamp: 1 } },
        {
          $project: {
            timestamp: 1,
            bandwidth: "$metrics.bandwidth.inbound",
            packets: "$metrics.packets.inbound",
            requests: "$metrics.requests.total",
            anomaly: "$anomalies.detected",
          },
        },
      ]);

      res.json({
        success: true,
        data: {
          summary: stats[0] || {},
          timeline,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get dashboard
  async getDashboard(req, res) {
    try {
      const now = new Date();
      const last24h = new Date(now - 24 * 60 * 60 * 1000);

      const [
        activeAttacks,
        recentAttacks,
        protectionStats,
        trafficStats,
        topBlockedIps,
      ] = await Promise.all([
        Attack.find({ status: { $in: ["active", "mitigating"] } })
          .select("attackId type target.value metrics.peakBandwidth status")
          .limit(5),
        Attack.find({ "timeline.detected": { $gte: last24h } })
          .sort({ "timeline.detected": -1 })
          .select("attackId type status timeline.detected")
          .limit(10),
        Protection.aggregate([
          { $match: { status: "active" } },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
              blockedRequests: { $sum: "$statistics.blockedRequests" },
            },
          },
        ]),
        Traffic.findOne({ interval: "1m" }).sort({ timestamp: -1 }),
        Blocklist.aggregate([
          { $match: { status: "active", type: "ip" } },
          { $sort: { "statistics.blockedRequests": -1 } },
          { $limit: 10 },
          {
            $project: { value: 1, "statistics.blockedRequests": 1, reason: 1 },
          },
        ]),
      ]);

      res.json({
        success: true,
        data: {
          status: activeAttacks.length > 0 ? "under_attack" : "protected",
          activeAttacks,
          recentAttacks,
          protections: protectionStats,
          currentTraffic: trafficStats?.metrics || null,
          topBlockedIps,
          lastUpdated: now.toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = analyticsController;
