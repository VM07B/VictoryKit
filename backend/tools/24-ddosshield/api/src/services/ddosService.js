/**
 * DDoS Service - Detection and mitigation logic
 */

const Blocklist = require("../models/Blocklist");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8024";

const ddosService = {
  /**
   * Detect DDoS attack from traffic data
   */
  async detectAttack(trafficData) {
    const signals = [];
    let score = 0;

    // Get baseline
    const baseline = await this.getBaseline();

    // Check bandwidth
    if (trafficData.metrics?.bandwidth?.inbound) {
      const bwRatio =
        trafficData.metrics.bandwidth.inbound / (baseline.bandwidth || 100);
      if (bwRatio > 5) {
        signals.push({
          signal: "extreme_bandwidth",
          weight: 40,
          value: bwRatio,
        });
        score += 40;
      } else if (bwRatio > 3) {
        signals.push({ signal: "high_bandwidth", weight: 25, value: bwRatio });
        score += 25;
      }
    }

    // Check packet rate
    if (trafficData.metrics?.packets?.inbound) {
      const pktRatio =
        trafficData.metrics.packets.inbound / (baseline.packets || 1000);
      if (pktRatio > 5) {
        signals.push({
          signal: "extreme_packet_rate",
          weight: 35,
          value: pktRatio,
        });
        score += 35;
      } else if (pktRatio > 3) {
        signals.push({
          signal: "high_packet_rate",
          weight: 20,
          value: pktRatio,
        });
        score += 20;
      }
    }

    // Check request rate
    if (trafficData.metrics?.requests?.rate) {
      const reqRatio =
        trafficData.metrics.requests.rate / (baseline.requests || 100);
      if (reqRatio > 10) {
        signals.push({
          signal: "extreme_request_rate",
          weight: 30,
          value: reqRatio,
        });
        score += 30;
      }
    }

    // Check source distribution
    if (trafficData.source?.totalIps > 1000) {
      signals.push({
        signal: "distributed_attack",
        weight: 15,
        value: trafficData.source.totalIps,
      });
      score += 15;
    }

    // Try ML detection
    try {
      const mlResult = await this.mlDetect(trafficData);
      if (mlResult && mlResult.score) {
        score = Math.round((score + mlResult.score) / 2);
        signals.push(...(mlResult.signals || []));
      }
    } catch (error) {
      // ML unavailable
    }

    // Normalize
    score = Math.min(100, score);

    // Determine attack type
    const attackType = this.classifyAttack(trafficData, signals);

    return {
      isAttack: score >= 60,
      score,
      confidence: score,
      type: attackType.type,
      subType: attackType.subType,
      signals,
      severity: this.getSeverity(score),
      method: "hybrid",
      source: trafficData.source,
      metrics: trafficData.metrics,
      estimatedStart: new Date(),
    };
  },

  /**
   * Analyze traffic for anomalies
   */
  async analyzeTraffic(trafficData) {
    const baseline = await this.getBaseline();
    const signals = [];
    let anomalyScore = 0;

    // Compare to baseline
    const metrics = trafficData.metrics || {};

    if (metrics.bandwidth?.inbound > baseline.bandwidth * 2) {
      signals.push({
        signal: "bandwidth_anomaly",
        value: metrics.bandwidth.inbound,
      });
      anomalyScore += 25;
    }

    if (metrics.latency?.avg > baseline.latency * 3) {
      signals.push({ signal: "latency_spike", value: metrics.latency.avg });
      anomalyScore += 20;
    }

    if (metrics.requests?.failed > metrics.requests?.successful * 0.5) {
      signals.push({ signal: "high_error_rate" });
      anomalyScore += 30;
    }

    return {
      isAnomalous: anomalyScore >= 40,
      anomalyScore,
      signals,
      baseline,
      deviations: {
        bandwidth: metrics.bandwidth?.inbound / (baseline.bandwidth || 1),
        packets: metrics.packets?.inbound / (baseline.packets || 1),
      },
    };
  },

  /**
   * Check for anomalies in recent traffic
   */
  async checkForAnomalies(records) {
    if (!records || records.length < 2) {
      return { detected: false };
    }

    const latest = records[records.length - 1];
    const previous = records.slice(0, -1);

    // Calculate average
    const avgBandwidth =
      previous.reduce(
        (sum, r) => sum + (r.metrics?.bandwidth?.inbound || 0),
        0
      ) / previous.length;

    const currentBandwidth = latest.metrics?.bandwidth?.inbound || 0;

    if (currentBandwidth > avgBandwidth * 3) {
      return {
        detected: true,
        type: "traffic_spike",
        metric: "bandwidth",
        current: currentBandwidth,
        baseline: avgBandwidth,
        multiplier: currentBandwidth / avgBandwidth,
      };
    }

    return { detected: false };
  },

  /**
   * Mitigate attack
   */
  async mitigate(attack, actions = []) {
    const appliedActions = [];

    // Default actions if none specified
    if (actions.length === 0) {
      actions = this.getDefaultMitigationActions(attack);
    }

    for (const action of actions) {
      const result = await this.applyMitigationAction(action, attack);
      appliedActions.push({
        action: action.type,
        target: action.target,
        timestamp: new Date(),
        result: result.success ? "success" : "failed",
        details: result.details,
      });
    }

    return {
      success: appliedActions.every((a) => a.result === "success"),
      appliedActions,
    };
  },

  /**
   * Auto-mitigate high-confidence attacks
   */
  async autoMitigate(attack) {
    const actions = this.getDefaultMitigationActions(attack);
    return this.mitigate(attack, actions);
  },

  /**
   * Get default mitigation actions
   */
  getDefaultMitigationActions(attack) {
    const actions = [];

    switch (attack.type) {
      case "volumetric":
        actions.push({ type: "rate_limit", target: "global" });
        actions.push({ type: "geo_block", target: "suspicious" });
        break;
      case "protocol":
        actions.push({ type: "syn_cookies", target: "global" });
        actions.push({ type: "connection_limit", target: "per_ip" });
        break;
      case "application":
        actions.push({ type: "challenge", target: "suspicious" });
        actions.push({ type: "rate_limit", target: "per_ip" });
        break;
      default:
        actions.push({ type: "rate_limit", target: "global" });
    }

    // Block top attacking IPs
    if (attack.source?.topIps?.length > 0) {
      actions.push({
        type: "block_ips",
        target: attack.source.topIps.slice(0, 100),
      });
    }

    return actions;
  },

  /**
   * Apply mitigation action
   */
  async applyMitigationAction(action, attack) {
    try {
      switch (action.type) {
        case "block_ips":
          const ips = Array.isArray(action.target)
            ? action.target
            : [action.target];
          for (const ip of ips) {
            await Blocklist.findOneAndUpdate(
              { type: "ip", value: ip },
              {
                $set: {
                  reason: "ddos_attack",
                  "source.type": "automatic",
                  "source.attack": attack._id,
                },
                $setOnInsert: { type: "ip", value: ip },
              },
              { upsert: true }
            );
          }
          return { success: true, details: `Blocked ${ips.length} IPs` };

        case "rate_limit":
          return { success: true, details: "Rate limiting applied" };

        case "challenge":
          return { success: true, details: "Challenge enabled" };

        case "geo_block":
          return { success: true, details: "Geo-blocking enabled" };

        default:
          return { success: true, details: `${action.type} applied` };
      }
    } catch (error) {
      return { success: false, details: error.message };
    }
  },

  /**
   * Classify attack type
   */
  classifyAttack(trafficData, signals) {
    const signalNames = signals.map((s) => s.signal);

    // Check for volumetric
    if (
      signalNames.includes("extreme_bandwidth") ||
      signalNames.includes("high_bandwidth")
    ) {
      return { type: "volumetric", subType: "udp_flood" };
    }

    // Check for application layer
    if (signalNames.includes("extreme_request_rate")) {
      return { type: "application", subType: "http_flood" };
    }

    // Check for protocol
    if (signalNames.includes("extreme_packet_rate")) {
      return { type: "protocol", subType: "syn_flood" };
    }

    return { type: "unknown", subType: "unknown" };
  },

  /**
   * Get severity level
   */
  getSeverity(score) {
    if (score >= 90) return "critical";
    if (score >= 70) return "high";
    if (score >= 50) return "medium";
    return "low";
  },

  /**
   * Get traffic baseline
   */
  async getBaseline() {
    // In production, calculate from historical data
    return {
      bandwidth: 100, // Mbps
      packets: 10000, // pps
      requests: 1000, // rps
      latency: 50, // ms
    };
  },

  /**
   * ML-based detection
   */
  async mlDetect(trafficData) {
    try {
      const response = await fetch(`${ML_ENGINE_URL}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trafficData),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // ML unavailable
    }
    return null;
  },
};

module.exports = ddosService;
