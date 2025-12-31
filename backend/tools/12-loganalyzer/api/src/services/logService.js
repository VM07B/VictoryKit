/**
 * Log Service
 * Business logic for log operations
 */

const axios = require("axios");

class LogService {
  async analyzeLogEntry(logEntry) {
    try {
      // AI-powered analysis using Gemini
      const prompt = `Analyze this log entry for security anomalies, patterns, and recommendations:

Log Level: ${logEntry.level}
Source: ${logEntry.source}
Message: ${logEntry.message}
Metadata: ${JSON.stringify(logEntry.metadata)}
Structured Data: ${JSON.stringify(logEntry.structuredData)}

Provide analysis in JSON format with:
- anomalies: array of detected anomalies
- patterns: array of identified patterns
- recommendations: array of security recommendations
- riskScore: number from 0-100`;

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
        }
      );

      const analysisText = response.data.candidates[0].content.parts[0].text;
      const analysis = JSON.parse(
        analysisText.replace(/```json\n?|\n?```/g, "")
      );

      return {
        anomalies: analysis.anomalies || [],
        patterns: analysis.patterns || [],
        recommendations: analysis.recommendations || [],
        riskScore: Math.min(100, Math.max(0, analysis.riskScore || 0)),
      };
    } catch (error) {
      console.error("Log analysis error:", error);
      return {
        anomalies: ["Analysis failed"],
        patterns: [],
        recommendations: ["Manual review recommended"],
        riskScore: 50,
      };
    }
  }

  async detectPatterns(logEntries) {
    // Pattern detection logic
    const patterns = [];
    const errorLogs = logEntries.filter((log) => log.level === "error");

    if (errorLogs.length > logEntries.length * 0.1) {
      patterns.push("High error rate detected");
    }

    // Add more pattern detection logic...

    return patterns;
  }

  async generateInsights(logEntries, analysis) {
    const insights = [];

    if (analysis.riskScore > 70) {
      insights.push({
        type: "critical",
        priority: "high",
        description: "High risk score detected in log analysis",
        recommendation: "Immediate security review required",
      });
    }

    // Add more insight generation logic...

    return insights;
  }
}

module.exports = new LogService();
