import { geminiService } from "./geminiService";
import { loganalyzerAPI } from "./loganalyzerAPI";

export interface ToolCall {
  name: string;
  arguments: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Function tools for LogAnalyzer
export const LOGANALYZER_TOOLS = [
  {
    name: "analyze_log_entry",
    description:
      "Analyze a specific log entry for security threats and anomalies",
    parameters: {
      type: "object",
      properties: {
        logId: {
          type: "string",
          description: "The ID of the log entry to analyze",
        },
      },
      required: ["logId"],
    },
  },
  {
    name: "run_log_analysis",
    description: "Run a comprehensive log analysis on recent entries",
    parameters: {
      type: "object",
      properties: {
        timeRange: {
          type: "object",
          properties: {
            hours: {
              type: "number",
              description: "Number of hours to analyze (default: 24)",
              default: 24,
            },
          },
        },
        filters: {
          type: "object",
          properties: {
            source: {
              type: "string",
              description: "Filter by log source",
            },
            level: {
              type: "string",
              description: "Filter by log level",
            },
          },
        },
      },
    },
  },
  {
    name: "create_alert_rule",
    description: "Create a new log alert rule based on analysis findings",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the alert rule",
        },
        conditions: {
          type: "array",
          description: "Alert trigger conditions",
          items: {
            type: "object",
            properties: {
              field: { type: "string" },
              operator: { type: "string" },
              value: { type: "string" },
            },
          },
        },
        actions: {
          type: "array",
          description: "Actions to take when alert triggers",
          items: {
            type: "string",
            enum: ["email", "webhook", "slack"],
          },
        },
        severity: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
        },
      },
      required: ["name", "conditions", "severity"],
    },
  },
  {
    name: "get_analysis_summary",
    description: "Get a summary of recent log analysis results",
    parameters: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Number of days to include in summary (default: 7)",
          default: 7,
        },
      },
    },
  },
  {
    name: "search_logs",
    description: "Search log entries with specific criteria",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query string",
        },
        source: {
          type: "string",
          description: "Filter by source",
        },
        level: {
          type: "string",
          description: "Filter by level",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 50)",
          default: 50,
        },
      },
      required: ["query"],
    },
  },
];

export async function executeTool(toolCall: ToolCall): Promise<ToolResult> {
  try {
    switch (toolCall.name) {
      case "analyze_log_entry":
        return await analyzeLogEntry(toolCall.arguments);

      case "run_log_analysis":
        return await runLogAnalysis(toolCall.arguments);

      case "create_alert_rule":
        return await createAlertRule(toolCall.arguments);

      case "get_analysis_summary":
        return await getAnalysisSummary(toolCall.arguments);

      case "search_logs":
        return await searchLogs(toolCall.arguments);

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolCall.name}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Tool execution failed",
    };
  }
}

async function analyzeLogEntry(args: any): Promise<ToolResult> {
  try {
    const logResponse = await loganalyzerAPI.getLog(args.logId);
    const logEntry = logResponse.data;

    const analysis = await geminiService.analyzeLogEntry(logEntry);

    if (analysis.success) {
      // Update the log entry with AI analysis
      await loganalyzerAPI.analyzeLog(args.logId);
    }

    return {
      success: true,
      data: {
        logEntry,
        aiAnalysis: analysis.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function runLogAnalysis(args: any): Promise<ToolResult> {
  try {
    const hours = args.timeRange?.hours || 24;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

    const analysisResponse = await loganalyzerAPI.createAnalysis({
      timeRange: { start: startDate, end: endDate },
      filters: args.filters || {},
    });

    return {
      success: true,
      data: analysisResponse.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function createAlertRule(args: any): Promise<ToolResult> {
  try {
    const alertData = {
      name: args.name,
      description: `AI-generated alert rule for ${args.name}`,
      conditions: args.conditions,
      actions: args.actions || [
        { type: "internal", target: "", template: "", enabled: true },
      ],
      severity: args.severity,
      enabled: true,
      cooldown: 60, // 1 hour default
    };

    const response = await loganalyzerAPI.createAlert(alertData);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getAnalysisSummary(args: any): Promise<ToolResult> {
  try {
    const days = args.days || 7;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const summaryResponse = await loganalyzerAPI.getAnalysisSummary({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const analysesResponse = await loganalyzerAPI.getAnalyses({
      limit: 10,
    });

    return {
      success: true,
      data: {
        summary: summaryResponse.data,
        recentAnalyses: analysesResponse.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function searchLogs(args: any): Promise<ToolResult> {
  try {
    const searchParams = {
      search: args.query,
      source: args.source,
      level: args.level,
      limit: args.limit || 50,
    };

    const response = await loganalyzerAPI.getLogs(searchParams);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export function getToolDefinitions() {
  return LOGANALYZER_TOOLS;
}
