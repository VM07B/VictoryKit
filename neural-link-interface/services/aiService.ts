/**
 * Vercel AI SDK Service for VictoryKit Neural Link Interface
 * Provides streaming AI responses with multi-provider support
 */

import {
  streamText,
  generateText,
  StreamTextResult,
  GenerateTextResult,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { SettingsState, CanvasState } from "../types";

// Provider types
type AIProvider = "openai" | "anthropic" | "gemini";

// Provider instances cache
let openaiInstance: ReturnType<typeof createOpenAI> | null = null;
let anthropicInstance: ReturnType<typeof createAnthropic> | null = null;
let geminiInstance: ReturnType<typeof createGoogleGenerativeAI> | null = null;

/**
 * Initialize AI providers
 */
export function initializeProviders(config: {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
}) {
  if (config.openaiApiKey) {
    openaiInstance = createOpenAI({ apiKey: config.openaiApiKey });
  }
  if (config.anthropicApiKey) {
    anthropicInstance = createAnthropic({ apiKey: config.anthropicApiKey });
  }
  if (config.geminiApiKey) {
    geminiInstance = createGoogleGenerativeAI({ apiKey: config.geminiApiKey });
  }
}

/**
 * Get model instance based on provider
 */
function getModel(provider: AIProvider, modelName?: string) {
  switch (provider) {
    case "openai":
      if (!openaiInstance) throw new Error("OpenAI not initialized");
      return openaiInstance(modelName || "gpt-4-turbo-preview");
    case "anthropic":
      if (!anthropicInstance) throw new Error("Anthropic not initialized");
      return anthropicInstance(modelName || "claude-3-opus-20240229");
    case "gemini":
      if (!geminiInstance) throw new Error("Gemini not initialized");
      return geminiInstance(modelName || "gemini-pro");
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Security-focused system prompts
 */
export const securitySystemPrompts = {
  default: `You are ARIA (Advanced Real-time Intelligence Assistant), the AI core of VictoryKit - 
    a comprehensive cybersecurity platform. You help security professionals with threat analysis, 
    vulnerability assessment, incident response, and security best practices.
    
    Always provide accurate, actionable security advice while considering:
    - OWASP Top 10 vulnerabilities
    - Common attack vectors and TTPs
    - Defense-in-depth strategies
    - Compliance requirements (GDPR, HIPAA, PCI-DSS, SOC2)
    - Industry best practices`,

  malwareAnalysis: `You are a malware analysis expert. Analyze samples for:
    - Behavioral indicators
    - IOCs (Indicators of Compromise)
    - Attack techniques and tactics
    - Remediation recommendations`,

  threatIntelligence: `You are a threat intelligence analyst. Provide:
    - Threat actor profiling
    - Campaign analysis
    - Tactical indicators
    - Strategic threat assessments`,

  incidentResponse: `You are an incident response specialist following NIST guidelines:
    - Identification and scoping
    - Containment strategies
    - Eradication procedures
    - Recovery steps
    - Lessons learned`,

  vulnerabilityAssessment: `You are a vulnerability assessment expert:
    - Identify security weaknesses
    - Provide CVSS scoring context
    - Prioritize remediation
    - Suggest security controls`,
};

export interface StreamChatOptions {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: Record<string, any>;
  onChunk?: (chunk: string) => void;
  abortSignal?: AbortSignal;
}

export interface ChatResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
  }>;
}

/**
 * Stream chat response with real-time updates
 */
export async function streamChat(
  options: StreamChatOptions
): Promise<ChatResponse> {
  const {
    messages,
    provider = "gemini",
    model,
    temperature = 0.7,
    maxTokens = 4096,
    systemPrompt = securitySystemPrompts.default,
    tools,
    onChunk,
    abortSignal,
  } = options;

  const modelInstance = getModel(provider, model);

  // Prepend system message if not present
  const fullMessages =
    messages[0]?.role === "system"
      ? messages
      : [{ role: "system" as const, content: systemPrompt }, ...messages];

  const result = await streamText({
    model: modelInstance,
    messages: fullMessages,
    temperature,
    maxTokens,
    abortSignal,
    ...(tools && { tools }),
  });

  let fullText = "";

  // Process stream
  for await (const chunk of result.textStream) {
    fullText += chunk;
    if (onChunk) {
      onChunk(chunk);
    }
  }

  // Get final usage and tool calls
  const finalResult = await result;

  return {
    text: fullText,
    usage: finalResult.usage
      ? {
          promptTokens: finalResult.usage.promptTokens,
          completionTokens: finalResult.usage.completionTokens,
          totalTokens: finalResult.usage.totalTokens,
        }
      : undefined,
    toolCalls: finalResult.toolCalls?.map((tc) => ({
      name: tc.toolName,
      args: tc.args,
    })),
  };
}

/**
 * Generate text without streaming
 */
export async function generateResponse(
  options: Omit<StreamChatOptions, "onChunk">
): Promise<ChatResponse> {
  const {
    messages,
    provider = "gemini",
    model,
    temperature = 0.7,
    maxTokens = 4096,
    systemPrompt = securitySystemPrompts.default,
    tools,
  } = options;

  const modelInstance = getModel(provider, model);

  const fullMessages =
    messages[0]?.role === "system"
      ? messages
      : [{ role: "system" as const, content: systemPrompt }, ...messages];

  const result = await generateText({
    model: modelInstance,
    messages: fullMessages,
    temperature,
    maxTokens,
    ...(tools && { tools }),
  });

  return {
    text: result.text,
    usage: result.usage
      ? {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
        }
      : undefined,
    toolCalls: result.toolCalls?.map((tc) => ({
      name: tc.toolName,
      args: tc.args,
    })),
  };
}

/**
 * VictoryKit tool definitions for AI agents
 */
export const victoryKitTools = {
  navigate_portal: {
    description: "Opens a specific URL in the user's Neural Portal browser",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "The full URL to navigate to" },
        reason: {
          type: "string",
          description: "Explanation for the navigation",
        },
      },
      required: ["url"],
    },
  },

  update_canvas: {
    description: "Updates the Neural Canvas workspace with content",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "The content or source URL" },
        type: {
          type: "string",
          enum: ["text", "code", "html", "video", "image"],
          description: "Content type",
        },
        language: {
          type: "string",
          description: "Programming language if type is code",
        },
        title: { type: "string", description: "Title for this canvas state" },
      },
      required: ["content", "type"],
    },
  },

  scan_url: {
    description: "Scan a URL for security threats using PhishGuard",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to scan" },
        deepScan: {
          type: "boolean",
          description: "Perform deep content analysis",
        },
      },
      required: ["url"],
    },
  },

  analyze_file: {
    description: "Analyze a file hash for malware using MalwareHunter",
    parameters: {
      type: "object",
      properties: {
        hash: {
          type: "string",
          description: "File hash (MD5, SHA1, or SHA256)",
        },
        hashType: { type: "string", enum: ["md5", "sha1", "sha256"] },
      },
      required: ["hash"],
    },
  },

  check_vulnerability: {
    description: "Look up vulnerability information using VulnScan",
    parameters: {
      type: "object",
      properties: {
        cveId: {
          type: "string",
          description: "CVE identifier (e.g., CVE-2024-1234)",
        },
      },
      required: ["cveId"],
    },
  },

  scan_code: {
    description: "Scan code for security vulnerabilities using SecureCode",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "Code snippet to analyze" },
        language: { type: "string", description: "Programming language" },
      },
      required: ["code", "language"],
    },
  },
};

/**
 * Process tool calls from AI response
 */
export async function processToolCalls(
  toolCalls: ChatResponse["toolCalls"],
  settings: SettingsState
): Promise<{
  navigationUrl?: string;
  canvasUpdate?: Partial<CanvasState>;
  scanResults?: any[];
}> {
  if (!toolCalls || toolCalls.length === 0) {
    return {};
  }

  const results: {
    navigationUrl?: string;
    canvasUpdate?: Partial<CanvasState>;
    scanResults?: any[];
  } = {
    scanResults: [],
  };

  for (const call of toolCalls) {
    switch (call.name) {
      case "navigate_portal":
        results.navigationUrl = call.args.url as string;
        break;

      case "update_canvas":
        results.canvasUpdate = {
          content: call.args.content as string,
          type: call.args.type as "text" | "code" | "html" | "video" | "image",
          language: call.args.language as string,
          title: (call.args.title as string) || settings.canvas?.title,
        };
        break;

      case "scan_url":
      case "analyze_file":
      case "check_vulnerability":
      case "scan_code":
        // These would call the actual API endpoints
        results.scanResults?.push({
          tool: call.name,
          args: call.args,
          status: "pending",
          note: "Connect to actual API endpoint",
        });
        break;
    }
  }

  return results;
}

/**
 * Legacy compatibility wrapper for existing geminiService calls
 */
export async function callAI(
  prompt: string,
  settings: SettingsState
): Promise<{
  text: string;
  isImage?: boolean;
  urls?: string[];
  navigationUrl?: string;
  canvasUpdate?: Partial<CanvasState>;
}> {
  try {
    // Initialize with environment API key if not already done
    if (!geminiInstance && process.env.API_KEY) {
      initializeProviders({ geminiApiKey: process.env.API_KEY });
    }

    const response = await generateResponse({
      messages: [{ role: "user", content: prompt }],
      provider: "gemini",
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      systemPrompt: settings.customPrompt || securitySystemPrompts.default,
      tools: victoryKitTools,
    });

    const toolResults = await processToolCalls(response.toolCalls, settings);

    return {
      text: response.text,
      navigationUrl: toolResults.navigationUrl,
      canvasUpdate: toolResults.canvasUpdate,
    };
  } catch (error) {
    console.error("AI call failed:", error);
    return {
      text: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export default {
  initializeProviders,
  streamChat,
  generateResponse,
  processToolCalls,
  callAI,
  securitySystemPrompts,
  victoryKitTools,
};
