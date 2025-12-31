import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async generateResponse(prompt: string, context?: any) {
    try {
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        data: text,
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate response",
      };
    }
  }

  async analyzeLogEntry(logData: any) {
    const prompt = `Analyze this log entry for security anomalies and provide insights:

Log Details:
- Level: ${logData.level}
- Source: ${logData.source}
- Message: ${logData.message}
- Timestamp: ${logData.timestamp}
- Metadata: ${JSON.stringify(logData.metadata || {})}

Please provide:
1. Potential security implications
2. Recommended actions
3. Risk assessment (Low/Medium/High/Critical)
4. Any patterns or anomalies detected

Format your response as a structured analysis.`;

    return this.generateResponse(prompt);
  }

  async generateAlertRecommendations(logData: any) {
    const prompt = `Based on this log analysis, suggest appropriate alert configurations:

Analysis Summary:
- Total Entries: ${logData.totalEntries}
- Error Count: ${logData.errorCount}
- Warning Count: ${logData.warningCount}
- Critical Count: ${logData.criticalCount}
- Risk Score: ${logData.riskScore}

Suggest specific alert rules that should be configured to monitor for similar issues in the future. Include:
1. Alert conditions (what to monitor)
2. Thresholds for triggering
3. Recommended actions when triggered
4. Alert severity levels`;

    return this.generateResponse(prompt);
  }

  async explainAnomaly(anomalyData: any) {
    const prompt = `Explain this security anomaly in simple terms:

Anomaly: ${anomalyData.description}
Confidence: ${anomalyData.confidence}
Evidence: ${JSON.stringify(anomalyData.evidence)}

Provide:
1. What this anomaly means
2. Why it's concerning
3. What actions should be taken
4. How to prevent similar anomalies`;

    return this.generateResponse(prompt);
  }
}

export const geminiService = new GeminiService();
