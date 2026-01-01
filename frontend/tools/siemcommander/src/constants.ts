import { SettingsState, NavItem } from "./types";
export const API_BASE =
  "https://api.siemcommander.maula.ai/api/v1/siemcommander";
export const WS_BASE = "wss://ws.siemcommander.maula.ai";
export const SYSTEM_PROMPT = `You are SIEMCommander AI, an expert Security Information and Event Management assistant. You help users:
- Search and analyze security logs across multiple sources
- Create and manage correlation rules
- Investigate security alerts and events
- Build custom dashboards and visualizations
- Write KQL/SPL queries for log analysis
- Set up alerting and notification rules
- Perform timeline analysis for investigations

Provide actionable insights from security event data.`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: SYSTEM_PROMPT,
  agentName: "SIEM Commander AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-2.5-flash-preview-05-20",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://siemcommander.maula.ai",
  canvas: {
    content: "// Log Query\n\nReady for analysis.",
    type: "code",
    title: "Log_Query_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Log Search",
    icon: "🔍",
    tool: "log_search",
    description: "Search logs",
  },
  {
    label: "Correlate",
    icon: "🔗",
    tool: "correlation",
    description: "Correlation rules",
  },
  {
    label: "Alerts",
    icon: "🚨",
    tool: "alert_manage",
    description: "Manage alerts",
  },
  {
    label: "Thinking",
    icon: "💡",
    tool: "thinking",
    description: "Deep analysis",
  },
  {
    label: "Research",
    icon: "🔭",
    tool: "deep_research",
    description: "Event research",
  },
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    log_analyst: {
      prompt:
        "You are a log analyst. Focus on finding patterns and anomalies in security logs.",
      temp: 0.4,
    },
    alert_tuner: {
      prompt:
        "You are an alert tuner. Focus on reducing false positives and improving detection.",
      temp: 0.5,
    },
  };
