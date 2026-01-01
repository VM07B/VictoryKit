import { SettingsState, NavItem } from "./types";

export const API_BASE = "https://api.apiguard.maula.ai/api/v1/apiguard";
export const WS_BASE = "wss://ws.apiguard.maula.ai";

export const SYSTEM_PROMPT = `You are APIGuard AI, an expert API security assistant. You help users:
- Monitor and protect API endpoints
- Configure rate limiting and throttling
- Analyze authentication patterns and detect anomalies
- Identify API vulnerabilities and misconfigurations
- Implement API security best practices
- Track and investigate suspicious API activity

You have deep knowledge of:
- REST, GraphQL, and gRPC security
- OAuth 2.0, JWT, and API key management
- Rate limiting strategies and algorithms
- API gateway security patterns
- OWASP API Security Top 10

Provide actionable security recommendations with clear implementation steps.`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: SYSTEM_PROMPT,
  agentName: "APIGuard AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-2.5-flash-preview-05-20",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://apiguard.maula.ai",
  canvas: {
    content: "// API Security Configuration\n\nReady for endpoint analysis.",
    type: "code",
    title: "API_Config_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Scan Endpoints",
    icon: "🔍",
    tool: "api_scan",
    description: "Scan API endpoints for vulnerabilities",
  },
  {
    label: "Rate Limiting",
    icon: "⏱️",
    tool: "rate_limit",
    description: "Configure rate limits",
  },
  {
    label: "Auth Monitor",
    icon: "🔐",
    tool: "auth_monitor",
    description: "Monitor authentication events",
  },
  {
    label: "Thinking",
    icon: "💡",
    tool: "thinking",
    description: "Deep security analysis",
  },
  {
    label: "Research",
    icon: "🔭",
    tool: "deep_research",
    description: "API security research",
  },
  {
    label: "Web Search",
    icon: "🌐",
    tool: "web_search",
    description: "Search security databases",
  },
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    security_auditor: {
      prompt:
        "You are an API security auditor. Focus on identifying vulnerabilities and compliance issues.",
      temp: 0.3,
    },
    performance_analyst: {
      prompt:
        "You are a performance analyst. Optimize API response times and rate limiting.",
      temp: 0.5,
    },
    incident_responder: {
      prompt:
        "You are an incident responder. Investigate and remediate API security incidents.",
      temp: 0.6,
    },
  };
