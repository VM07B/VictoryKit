import { SettingsState, NavItem } from "./types";
export const API_BASE = "https://api.sslmonitor.fyzo.xyz/api/v1/sslmonitor";
export const WS_BASE = "wss://ws.sslmonitor.fyzo.xyz";
export const SYSTEM_PROMPT = `You are SSLMonitor AI, an expert SSL/TLS certificate monitoring assistant. You help users:
- Scan and analyze SSL/TLS certificates
- Monitor certificate expiration dates
- Evaluate security grades (A+ to F)
- Identify weak ciphers and protocols
- Set up expiration alerts
- Automate certificate renewal workflows
- Analyze certificate chains and trust

Provide actionable recommendations for certificate security.`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: SYSTEM_PROMPT,
  agentName: "SSLMonitor AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-2.5-flash-preview-05-20",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://sslmonitor.fyzo.xyz",
  canvas: {
    content: "// SSL Certificate Analysis\n\nReady for monitoring.",
    type: "code",
    title: "SSL_Analysis_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Scan Cert",
    icon: "🔐",
    tool: "cert_scan",
    description: "Scan certificates",
  },
  {
    label: "Expiry",
    icon: "⏰",
    tool: "expiry_check",
    description: "Check expirations",
  },
  {
    label: "Grade",
    icon: "📊",
    tool: "grade_analysis",
    description: "Analyze grades",
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
    description: "SSL research",
  },
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    security_auditor: {
      prompt:
        "You are a security auditor. Focus on identifying weak SSL configurations.",
      temp: 0.4,
    },
    renewal_planner: {
      prompt:
        "You are a renewal planner. Focus on certificate lifecycle management.",
      temp: 0.5,
    },
  };
