import { SettingsState } from "./types";

// Provider catalog for the Neural Link
export const PROVIDER_CONFIG = [
  {
    id: "gemini",
    name: "Google Gemini",
    models: ["gemini-3-flash-preview", "gemini-3-pro-preview"],
  },
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini"] },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
  },
  {
    id: "mistral",
    name: "Mistral",
    models: ["mistral-large-latest", "mistral-medium"],
  },
];

// Base URLs (no localhost). Use env or same-origin relative path.
const origin = (globalThis?.location?.origin || "").replace(/\/$/, "");
export const API_BASE =
  (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, "") ||
  `${origin}/api/v1/incidentresponse`;
export const WS_BASE =
  (import.meta.env.VITE_WS_URL as string) ||
  `${origin.replace(/^http/, "ws")}/ws`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: `You are IncidentResponse AI. You triage, classify, and coordinate response for security incidents.

Capabilities:
- classify incidents (MITRE, severity, priority)
- suggest containment/eradication steps
- map indicators (IP, domain, hash) to risk
- guide evidence handling and chain-of-custody
- propose playbooks and tasking per severity

Always be concise, action-oriented, and cite the reasoning behind recommendations.`,
  agentName: "IncidentResponse AI",
  temperature: 0.4,
  maxTokens: 2048,
  provider: "gemini",
  model: "gemini-3-flash-preview",
  activeTool: "incident_triage",
  workspaceMode: "CHAT",
  portalUrl: "https://attack.mitre.org",
  canvas: {
    content:
      "// IncidentResponse Workspace\n\nDocument timeline, actions, and findings here.",
    type: "text",
    title: "IR_Workspace",
  },
};

export const NAV_ITEMS = [
  {
    id: "triage",
    label: "Triage",
    icon: "search",
    tool: "incident_triage",
    description: "Initial incident assessment and classification",
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: "clock",
    tool: "timeline",
    description: "Chronological event timeline",
  },
  {
    id: "forensics",
    label: "Forensics",
    icon: "shield",
    tool: "forensics",
    description: "Digital evidence collection and analysis",
  },
  {
    id: "intel",
    label: "Intel",
    icon: "eye",
    tool: "threat_intel",
    description: "Threat intelligence and IOCs",
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: "alert-triangle",
    tool: "alerts",
    description: "Alert rules and notifications",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: "check-square",
    tool: "playbooks",
    description: "Response tasks and playbooks",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "file-text",
    tool: "reports",
    description: "Incident reports and exports",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    tool: "settings",
    description: "Tool configuration",
  },
];

export const NEURAL_PRESETS = {
  triage: {
    name: "Incident Triage",
    prompt:
      "You are an incident response specialist focused on triaging security incidents. Classify severity, assess impact, and recommend immediate containment actions. Be concise and action-oriented.",
    temp: 0.3,
  },
  forensics: {
    name: "Digital Forensics",
    prompt:
      "You are a digital forensics expert. Focus on evidence collection, chain of custody, and technical analysis of security incidents. Provide detailed, methodical guidance.",
    temp: 0.2,
  },
  intel: {
    name: "Threat Intelligence",
    prompt:
      "You are a threat intelligence analyst. Analyze indicators of compromise, correlate with known threats, and provide intelligence-driven recommendations for incident response.",
    temp: 0.4,
  },
  containment: {
    name: "Containment Specialist",
    prompt:
      "You specialize in incident containment and eradication. Provide step-by-step procedures to stop threat progression and remove malicious artifacts from affected systems.",
    temp: 0.3,
  },
  recovery: {
    name: "Recovery Expert",
    prompt:
      "You are a disaster recovery specialist. Focus on system restoration, data recovery, and ensuring business continuity after security incidents.",
    temp: 0.4,
  },
};
