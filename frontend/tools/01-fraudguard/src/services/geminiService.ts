import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SettingsState, CanvasState, FraudScore, Transaction } from "../types";
import { getToolDefinitions, executeTool } from "./fraudguard-tools";
import { FRAUDGUARD_SYSTEM_PROMPT } from "../constants";

// Production API Key management
const getApiKey = (): string => {
  // Priority: Environment variable > localStorage > fallback
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    localStorage.getItem('gemini_api_key') ||
    ''
  );
};

const navigatePortalTool: FunctionDeclaration = {
  name: "navigate_portal",
  parameters: {
    type: Type.OBJECT,
    description: "Opens a specific URL in the user's Neural Portal for investigation.",
    properties: {
      url: { type: Type.STRING, description: "The full URL to navigate to." },
      reason: { type: Type.STRING, description: "Why this URL is relevant to the fraud investigation." },
    },
    required: ["url"],
  },
};

const updateCanvasTool: FunctionDeclaration = {
  name: "update_canvas",
  parameters: {
    type: Type.OBJECT,
    description:
      "Updates the Neural Canvas workspace with fraud analysis results, reports, or visualizations.",
    properties: {
      content: {
        type: Type.STRING,
        description: "The content or source URL for the canvas.",
      },
      type: {
        type: Type.STRING,
        enum: ["text", "code", "html", "video", "image", "report", "chart"],
        description: "The type of content being synchronized.",
      },
      language: {
        type: Type.STRING,
        description:
          "If type is code, specify the language (e.g., javascript, python).",
      },
      title: {
        type: Type.STRING,
        description: "A title for this canvas state.",
      },
    },
    required: ["content", "type"],
  },
};

// Advanced fraud-specific tool declarations
const generateFraudReportTool: FunctionDeclaration = {
  name: "generate_fraud_report",
  parameters: {
    type: Type.OBJECT,
    description: "Generate a comprehensive fraud analysis report with risk assessment and recommendations.",
    properties: {
      transaction_ids: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of transaction IDs to include in the report." 
      },
      report_type: { 
        type: Type.STRING, 
        enum: ["summary", "detailed", "executive", "technical"],
        description: "Type of report to generate." 
      },
      include_visualizations: { type: Type.BOOLEAN, description: "Include charts and graphs." },
      include_recommendations: { type: Type.BOOLEAN, description: "Include actionable recommendations." },
    },
    required: ["transaction_ids", "report_type"],
  },
};

const queryThreatIntelTool: FunctionDeclaration = {
  name: "query_threat_intel",
  parameters: {
    type: Type.OBJECT,
    description: "Query threat intelligence databases for IP, email, or device reputation.",
    properties: {
      query_type: { 
        type: Type.STRING, 
        enum: ["ip", "email", "device", "card_bin"],
        description: "Type of entity to query." 
      },
      value: { type: Type.STRING, description: "The value to look up." },
      include_history: { type: Type.BOOLEAN, description: "Include historical data." },
    },
    required: ["query_type", "value"],
  },
};

const createInvestigationTool: FunctionDeclaration = {
  name: "create_investigation",
  parameters: {
    type: Type.OBJECT,
    description: "Create a new fraud investigation case for suspicious transactions.",
    properties: {
      title: { type: Type.STRING, description: "Investigation title." },
      description: { type: Type.STRING, description: "Detailed description of the suspected fraud." },
      transaction_ids: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Related transaction IDs." 
      },
      priority: { 
        type: Type.STRING, 
        enum: ["low", "medium", "high", "critical"],
        description: "Investigation priority level." 
      },
    },
    required: ["title", "description"],
  },
};

const blockEntityTool: FunctionDeclaration = {
  name: "block_entity",
  parameters: {
    type: Type.OBJECT,
    description: "Block an IP, email, device, or card from future transactions.",
    properties: {
      entity_type: { 
        type: Type.STRING, 
        enum: ["ip", "email", "device", "card"],
        description: "Type of entity to block." 
      },
      value: { type: Type.STRING, description: "The value to block." },
      reason: { type: Type.STRING, description: "Reason for blocking." },
      duration_hours: { type: Type.NUMBER, description: "Block duration in hours (0 = permanent)." },
    },
    required: ["entity_type", "value", "reason"],
  },
};

const analyzeFraudPatternTool: FunctionDeclaration = {
  name: "analyze_fraud_pattern",
  parameters: {
    type: Type.OBJECT,
    description: "Analyze transaction patterns to detect fraud rings or coordinated attacks.",
    properties: {
      pattern_type: { 
        type: Type.STRING, 
        enum: ["velocity", "geographic", "device_cluster", "amount_pattern", "time_pattern"],
        description: "Type of pattern to analyze." 
      },
      time_range_hours: { type: Type.NUMBER, description: "Time range in hours to analyze." },
      min_transactions: { type: Type.NUMBER, description: "Minimum transactions to consider." },
    },
    required: ["pattern_type"],
  },
};

export const callGemini = async (
  prompt: string,
  settings: SettingsState,
  context?: { transaction?: Transaction; previousAnalysis?: FraudScore }
): Promise<{
  text: string;
  isImage?: boolean;
  urls?: string[];
  navigationUrl?: string;
  canvasUpdate?: Partial<CanvasState>;
  toolResults?: any[];
  processingTime?: number;
  tokensUsed?: number;
}> => {
  const apiKey = getApiKey();
  if (!apiKey) return { text: "ERROR: GEMINI_API_KEY not configured. Please set up your API key in environment variables." };

  const ai = new GoogleGenAI({ apiKey });

  try {
    let modelToUse = settings.model;
    
    // Build context-aware system prompt
    let systemPrompt = settings.customPrompt || FRAUDGUARD_SYSTEM_PROMPT;
    
    // Inject transaction context if available
    if (context?.transaction) {
      systemPrompt += `\n\n[CURRENT_TRANSACTION_CONTEXT]:
Transaction ID: ${context.transaction.transaction_id}
Amount: ${context.transaction.currency} ${context.transaction.amount}
User IP: ${context.transaction.user_ip}
Device: ${context.transaction.device_fingerprint?.substring(0, 16)}...
Country: ${context.transaction.country}
Timestamp: ${context.transaction.timestamp}`;
    }

    if (context?.previousAnalysis) {
      systemPrompt += `\n\n[PREVIOUS_ANALYSIS]:
Fraud Score: ${context.previousAnalysis.score}/100
Risk Level: ${context.previousAnalysis.risk_level?.toUpperCase()}
Confidence: ${context.previousAnalysis.confidence}%
Top Indicators: ${context.previousAnalysis.indicators?.slice(0, 3).map(i => i.type).join(', ')}`;
    }

    const config: any = {
      systemInstruction: systemPrompt + `

FRAUDGUARD_CAPABILITIES:
1. NEURAL_PORTAL: Use 'navigate_portal' to open threat intel sites, WHOIS lookups, or IP reputation checkers.
2. CANVAS_SYNC: Use 'update_canvas' to generate fraud reports, visualizations, and analysis documents.
3. FRAUD_TOOLS: Execute analyze_transaction, get_fraud_score, query_threat_intel, create_investigation.
4. BLOCKING: Use block_entity to immediately blacklist suspicious IPs, emails, devices, or cards.
5. PATTERNS: Use analyze_fraud_pattern to detect coordinated attacks and fraud rings.

Always provide actionable intelligence with specific recommendations. Reference confidence scores and explain your reasoning.`,
      temperature: settings.temperature,
      maxOutputTokens: settings.maxTokens,
      tools: [
        {
          functionDeclarations: [
            navigatePortalTool,
            updateCanvasTool,
            generateFraudReportTool,
            queryThreatIntelTool,
            createInvestigationTool,
            blockEntityTool,
            analyzeFraudPatternTool,
            ...getToolDefinitions(),
          ],
        },
      ],
    };

    // Enhanced tool configuration based on active mode
    if (
      settings.activeTool === "web_search" ||
      settings.activeTool === "browser" ||
      settings.activeTool === "deep_research"
    ) {
      config.tools = [{ googleSearch: {} }];
      modelToUse = "gemini-3-pro-preview";
    }

    if (settings.activeTool === "thinking") {
      config.thinkingConfig = { thinkingBudget: 2048 };
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: config,
    });

    const functionCalls = response.functionCalls;
    let navigationUrl: string | undefined;
    let canvasUpdate: Partial<CanvasState> | undefined;
    let toolResults: any[] = [];

    if (functionCalls) {
      for (const call of functionCalls) {
        const toolStartTime = performance.now();
        const args = call.args || {};
        const toolName = call.name || '';
        
        if (toolName === "navigate_portal") {
          navigationUrl = args.url as string;
        } else if (toolName === "update_canvas") {
          canvasUpdate = {
            content: args.content as string,
            type: args.type as any,
            language: args.language as string,
            title: (args.title as string) || settings.canvas.title,
            lastModified: new Date().toISOString(),
          };
        } else if (toolName) {
          // Handle all fraud detection tools
          try {
            const result = await executeTool(toolName, args);
            toolResults.push({
              tool: toolName,
              result: result,
              params: args,
              executionTime: performance.now() - toolStartTime,
            });
          } catch (error) {
            console.error(`Error executing tool ${toolName}:`, error);
            toolResults.push({
              tool: toolName,
              result: {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              },
              params: args,
              executionTime: performance.now() - toolStartTime,
            });
          }
        }
      }
    }

    // Fix: Extract grounding URLs from groundingMetadata
    const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web?.uri)
      .filter(Boolean);

    let textResponse = response.text || "";
    if (navigationUrl)
      textResponse += `\n\n[SYSTEM_ACTION]: Portal initialized at ${navigationUrl}`;
    if (canvasUpdate)
      textResponse += `\n\n[SYSTEM_ACTION]: Workspace synchronized with ${canvasUpdate.title}`;

    // Add tool execution results to response
    if (toolResults.length > 0) {
      textResponse += "\n\n[TOOL_EXECUTION_RESULTS]:";
      toolResults.forEach((toolResult, index) => {
        textResponse += `\n${index + 1}. ${toolResult.tool}: ${
          toolResult.result.success ? "SUCCESS" : "FAILED"
        }`;
        if (toolResult.result.error) {
          textResponse += ` - ${toolResult.result.error}`;
        }
      });
    }

    return {
      text: textResponse || "Command processed successfully.",
      urls: urls,
      navigationUrl,
      canvasUpdate,
      toolResults,
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { text: `CRITICAL_ERROR: ${error.message || "Uplink failure"}` };
  }
};
