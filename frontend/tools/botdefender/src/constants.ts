import { SettingsState, NavItem } from "./types";
export const API_BASE = "https://api.botdefender.maula.ai/api/v1/botdefender";
export const WS_BASE = "wss://ws.botdefender.maula.ai";
export const SYSTEM_PROMPT = `You are BotDefender AI, an expert bot detection and mitigation assistant. You help users:
- Detect and classify bot traffic (scrapers, crawlers, credential stuffers)
- Configure CAPTCHA challenges and invisible detection
- Analyze behavior patterns to distinguish bots from humans
- Set up bot blocking rules and rate limiting
- Implement fingerprinting and session tracking
- Protect against automated attacks and abuse

Provide actionable recommendations for bot protection.`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: SYSTEM_PROMPT,
  agentName: "BotDefender AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-2.5-flash-preview-05-20",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://botdefender.maula.ai",
  canvas: {
    content: "// Bot Detection Config\n\nReady for analysis.",
    type: "code",
    title: "Bot_Config_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Detect Bots",
    icon: "🤖",
    tool: "bot_detect",
    description: "Analyze traffic for bots",
  },
  {
    label: "CAPTCHA",
    icon: "🔐",
    tool: "captcha_manage",
    description: "Manage challenges",
  },
  {
    label: "Behavior",
    icon: "📊",
    tool: "behavior_analyze",
    description: "Behavior analysis",
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
    description: "Bot research",
  },
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    bot_hunter: {
      prompt:
        "You are a bot hunter. Focus on identifying and blocking malicious automated traffic.",
      temp: 0.4,
    },
    behavior_analyst: {
      prompt:
        "You are a behavior analyst. Focus on distinguishing human from bot patterns.",
      temp: 0.5,
    },
  };
