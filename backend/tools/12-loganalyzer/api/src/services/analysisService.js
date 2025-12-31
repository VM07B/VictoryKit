/**
 * Analysis Service
 * Business logic for log analysis operations
 */

const LogAnalysis = require("../models/LogAnalysis");
const LogEntry = require("../models/LogEntry");
const logService = require("./logService");

class AnalysisService {
  async performAnalysis(analysisId, userId, timeRange, filters = {}) {
    try {
      // Update status to processing
      await LogAnalysis.findByIdAndUpdate(analysisId, { status: "processing" });

      // Build query
      const query = { userId };
      if (timeRange) {
        query.timestamp = {};
        if (timeRange.start) query.timestamp.$gte = new Date(timeRange.start);
        if (timeRange.end) query.timestamp.$lte = new Date(timeRange.end);
      }
      if (filters.source) query.source = filters.source;
      if (filters.level) query.level = filters.level;

      // Get log entries
      const logEntries = await LogEntry.find(query)
        .sort({ timestamp: -1 })
        .limit(10000);

      // Perform analysis
      const summary = this.generateSummary(logEntries);
      const patterns = await logService.detectPatterns(logEntries);
      const anomalies = await this.detectAnomalies(logEntries);
      const insights = await logService.generateInsights(logEntries, {
        riskScore: this.calculateRiskScore(logEntries),
      });

      // Update analysis
      await LogAnalysis.findByIdAndUpdate(analysisId, {
        logEntryIds: logEntries.map((log) => log._id),
        timeRange,
        summary,
        patterns: patterns.map((pattern) => ({
          name: pattern,
          description: pattern,
        })),
        anomalies,
        insights,
        riskScore: this.calculateRiskScore(logEntries),
        status: "completed",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      await LogAnalysis.findByIdAndUpdate(analysisId, {
        status: "failed",
        insights: [
          {
            type: "error",
            priority: "high",
            description: "Analysis failed",
            recommendation: error.message,
          },
        ],
      });
    }
  }

  generateSummary(logEntries) {
    const sources = [...new Set(logEntries.map((log) => log.source))];
    const levels = [...new Set(logEntries.map((log) => log.level))];

    return {
      totalEntries: logEntries.length,
      errorCount: logEntries.filter((log) => log.level === "error").length,
      warningCount: logEntries.filter((log) => log.level === "warn").length,
      criticalCount: logEntries.filter((log) =>
        ["error", "critical"].includes(log.level)
      ).length,
      uniqueSources: sources.length,
      patternsDetected: 0, // Will be updated after pattern detection
    };
  }

  async detectAnomalies(logEntries) {
    const anomalies = [];

    // Simple anomaly detection
    const errorRate =
      logEntries.filter((log) => log.level === "error").length /
      logEntries.length;

    if (errorRate > 0.1) {
      anomalies.push({
        type: "high_error_rate",
        description: `Error rate of ${(errorRate * 100).toFixed(1)}% detected`,
        confidence: Math.min(1, errorRate * 10),
        evidence: [
          `${
            logEntries.filter((log) => log.level === "error").length
          } error logs out of ${logEntries.length} total`,
        ],
      });
    }

    // Add more anomaly detection logic...

    return anomalies;
  }

  calculateRiskScore(logEntries) {
    let score = 0;

    // Base score from error levels
    const errorCount = logEntries.filter((log) => log.level === "error").length;
    const criticalCount = logEntries.filter(
      (log) => log.level === "critical"
    ).length;

    score += errorCount * 2 + criticalCount * 5;

    // Cap at 100
    return Math.min(100, score);
  }
}

module.exports = new AnalysisService();
