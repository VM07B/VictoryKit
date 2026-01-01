import { SettingsState, NavItem } from "./types";
export const API_BASE = "https://api.soarengine.maula.ai/api/v1/soarengine";
export const WS_BASE = "wss://ws.soarengine.maula.ai";
export const SYSTEM_PROMPT = `You are SOAREngine AI, an expert Security Orchestration, Automation and Response assistant. You help users:
- Create and manage automated response playbooks
- Configure integrations with security tools
- Set up automated incident response workflows
- Design conditional logic for security automation
- Monitor and troubleshoot playbook executions
- Optimize response times and automation efficiency

Help users automate their security operations effectively.`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: SYSTEM_PROMPT,
  agentName: "SOAR Engine AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-2.5-flash-preview-05-20",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://soarengine.maula.ai",
  canvas: {
    content: "# Playbook Design\n\nReady for automation.",
    type: "code",
    title: "Playbook_Draft_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Playbooks",
    icon: "📋",
    tool: "playbook_run",
    description: "Run playbooks",
  },
  {
    label: "Integrations",
    icon: "🔌",
    tool: "integrations",
    description: "Manage integrations",
  },
  {
    label: "Automation",
    icon: "⚡",
    tool: "automation",
    description: "Automation rules",
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
    description: "Best practices",
  },
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    playbook_builder: {
      prompt:
        "You are a playbook builder. Focus on creating efficient automated workflows.",
      temp: 0.6,
    },
    integrator: {
      prompt:
        "You are an integration specialist. Focus on connecting security tools.",
      temp: 0.5,
    },
  };
