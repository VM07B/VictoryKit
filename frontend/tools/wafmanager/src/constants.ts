import { SettingsState, NavItem } from "./types";

export const API_BASE = "https://api.wafmanager.maula.ai/api/v1/wafmanager";
export const WS_BASE = "wss://ws.wafmanager.maula.ai";

export const SYSTEM_PROMPT = `You are WAFManager AI, an expert Web Application Firewall security assistant. You help users:
- Create and manage WAF rules to protect web applications
- Analyze attack patterns and identify threats
- Configure traffic filtering and rate limiting
- Review attack logs and security events
- Generate AI-powered security recommendations
- Optimize firewall performance and reduce false positives

You have deep knowledge of:
- OWASP Top 10 vulnerabilities (SQL Injection, XSS, CSRF, etc.)
- Attack detection patterns and signatures
- Web application security best practices
- Regulatory compliance (PCI-DSS, GDPR, etc.)
- Traffic analysis and anomaly detection

Always provide actionable security advice and explain the reasoning behind recommendations.`;

export const PROVIDER_CONFIG = [
  {
    id: "gemini",
    name: "Google Gemini",
    models: [
      "gemini-2.5-flash-preview-05-20",
      "gemini-2.5-pro-preview-05-06",
      "gemini-2.0-flash",
    ],
  },
];

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: SYSTEM_PROMPT,
  agentName: "WAFManager AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-2.5-flash-preview-05-20",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://wafmanager.maula.ai",
  canvas: {
    content: "// WAF Rule Configuration\n\nReady for security analysis.",
    type: "code",
    title: "WAF_Config_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Analyze Attack",
    icon: "🎯",
    tool: "waf_analyze",
    description: "Analyze attack patterns",
  },
  {
    label: "Generate Rules",
    icon: "🛡️",
    tool: "rule_generator",
    description: "AI-powered rule generation",
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
    description: "Threat intelligence research",
  },
  {
    label: "Web Portal",
    icon: "🌐",
    tool: "browser",
    description: "Security portal access",
  },
  {
    label: "Search",
    icon: "🔍",
    tool: "web_search",
    description: "Security database search",
  },
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    security_analyst: {
      prompt:
        "You are a senior security analyst specializing in WAF management. Provide detailed technical analysis.",
      temp: 0.3,
    },
    threat_hunter: {
      prompt:
        "You are a threat hunter. Identify attack patterns and suggest proactive defenses.",
      temp: 0.5,
    },
    compliance_expert: {
      prompt:
        "You are a compliance expert. Focus on regulatory requirements and security standards.",
      temp: 0.4,
    },
    incident_responder: {
      prompt:
        "You are an incident responder. Provide rapid analysis and remediation steps.",
      temp: 0.6,
    },
  };

export const ATTACK_CATEGORIES = [
  { id: "sqli", name: "SQL Injection", color: "text-red-500" },
  { id: "xss", name: "Cross-Site Scripting", color: "text-orange-500" },
  { id: "rce", name: "Remote Code Execution", color: "text-red-600" },
  { id: "lfi", name: "Local File Inclusion", color: "text-yellow-500" },
  { id: "rfi", name: "Remote File Inclusion", color: "text-yellow-600" },
  { id: "csrf", name: "Cross-Site Request Forgery", color: "text-purple-500" },
  { id: "bot", name: "Bot Traffic", color: "text-blue-500" },
  { id: "scanner", name: "Scanner Detection", color: "text-cyan-500" },
  { id: "custom", name: "Custom Rules", color: "text-gray-500" },
];

export const SEVERITY_LEVELS = [
  { id: "critical", name: "Critical", color: "bg-red-500" },
  { id: "high", name: "High", color: "bg-orange-500" },
  { id: "medium", name: "Medium", color: "bg-yellow-500" },
  { id: "low", name: "Low", color: "bg-blue-500" },
  { id: "info", name: "Info", color: "bg-gray-500" },
];
