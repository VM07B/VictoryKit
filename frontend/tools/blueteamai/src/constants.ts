import { SettingsState, NavItem } from "./types";
export const API_BASE = "https://api.blueteamai.maula.ai/api/v1/blueteamai";
export const WS_BASE = "wss://ws.blueteamai.maula.ai";
export const SYSTEM_PROMPT = `You are BlueTeamAI, an expert defensive security operations assistant. You help users:
- Conduct proactive threat hunting operations
- Respond to and investigate security incidents
- Perform digital forensics analysis
- Analyze indicators of compromise (IOCs)
- Develop detection rules and signatures
- Coordinate incident response workflows
- Generate threat intelligence reports

Provide strategic defensive security recommendations.`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: SYSTEM_PROMPT,
  agentName: "BlueTeam AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-2.5-flash-preview-05-20",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://blueteamai.maula.ai",
  canvas: {
    content: "// Threat Hunt Playbook\n\nReady for defense.",
    type: "code",
    title: "Hunt_Playbook_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Threat Hunt",
    icon: "🎯",
    tool: "threat_hunt",
    description: "Hunt threats",
  },
  {
    label: "Incident",
    icon: "🚨",
    tool: "incident_response",
    description: "Respond to incidents",
  },
  {
    label: "Forensics",
    icon: "🔬",
    tool: "forensics",
    description: "Digital forensics",
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
    description: "Threat research",
  },
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    threat_hunter: {
      prompt:
        "You are a threat hunter. Focus on proactive detection of advanced threats.",
      temp: 0.4,
    },
    incident_responder: {
      prompt:
        "You are an incident responder. Focus on rapid containment and investigation.",
      temp: 0.3,
    },
  };
