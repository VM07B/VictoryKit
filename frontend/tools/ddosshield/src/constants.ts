import { SettingsState, NavItem } from "./types";
export const API_BASE = "https://api.ddosshield.maula.ai/api/v1/ddosshield";
export const WS_BASE = "wss://ws.ddosshield.maula.ai";
export const SYSTEM_PROMPT = `You are DDoSShield AI, an expert DDoS attack detection and mitigation assistant. You help users:
- Detect and classify DDoS attacks (volumetric, protocol, application layer)
- Configure mitigation rules and rate limiting
- Analyze traffic patterns and anomalies
- Set up automatic response mechanisms
- Monitor bandwidth and connection metrics
- Implement scrubbing and traffic cleaning

Provide real-time recommendations for attack mitigation.`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: SYSTEM_PROMPT,
  agentName: "DDoSShield AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-2.5-flash-preview-05-20",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://ddosshield.maula.ai",
  canvas: {
    content: "// DDoS Mitigation Config\n\nReady for defense.",
    type: "code",
    title: "Mitigation_Config_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Detect Attack",
    icon: "⚡",
    tool: "attack_detect",
    description: "Detect active attacks",
  },
  {
    label: "Traffic",
    icon: "📊",
    tool: "traffic_analyze",
    description: "Analyze traffic",
  },
  {
    label: "Mitigate",
    icon: "🛡️",
    tool: "mitigation",
    description: "Configure mitigation",
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
    description: "Attack research",
  },
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    attack_responder: {
      prompt:
        "You are an attack responder. Focus on immediate mitigation of active DDoS attacks.",
      temp: 0.3,
    },
    traffic_analyst: {
      prompt:
        "You are a traffic analyst. Focus on identifying anomalies and attack patterns.",
      temp: 0.5,
    },
  };
