// LogAnalyzer Constants

import {
  FileText,
  TrendingUp,
  AlertTriangle,
  Settings,
  MessageSquare,
} from "lucide-react";
import { Tab, SettingsState, WorkspaceMode } from "./types";

export const NAV_ITEMS: Tab[] = [
  { id: "logs", label: "Log Entries", icon: FileText },
  { id: "analysis", label: "Analysis", icon: TrendingUp },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "chat", label: "AI Assistant", icon: MessageSquare },
];

export const DEFAULT_SETTINGS: SettingsState = {
  selectedProvider: "gemini",
  apiKey: "",
  theme: "light",
  notifications: true,
  autoAnalyze: false,
};

export const PROVIDER_CONFIG = {
  gemini: {
    name: "Gemini",
    model: "gemini-pro",
    apiUrl:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  },
};

export const WORKSPACE_MODES: WorkspaceMode[] = [
  {
    id: "log-analysis",
    name: "Log Analysis",
    description: "Analyze log files for security threats and anomalies",
  },
  {
    id: "threat-hunting",
    name: "Threat Hunting",
    description: "Proactive threat detection and investigation",
  },
  {
    id: "compliance-monitoring",
    name: "Compliance Monitoring",
    description: "Monitor logs for compliance violations",
  },
  {
    id: "incident-response",
    name: "Incident Response",
    description: "Support incident response with log correlation",
  },
];

export const NEURAL_PRESETS = {
  "log-analysis": {
    systemPrompt: `You are an expert cybersecurity analyst specializing in log analysis and threat detection. Your role is to help users analyze log files, identify security threats, detect anomalies, and provide actionable recommendations for improving security posture.

Key capabilities:
- Analyze log patterns and anomalies
- Identify potential security threats
- Provide recommendations for log monitoring
- Help with incident response planning
- Explain technical log concepts clearly

Always provide specific, actionable advice based on the log data provided.`,
    temperature: 0.3,
    maxTokens: 2000,
  },
  "threat-hunting": {
    systemPrompt: `You are a cybersecurity threat hunter specializing in proactive threat detection through log analysis. Your expertise includes:

- Advanced persistent threat (APT) detection
- Anomaly detection in log patterns
- Indicator of compromise (IoC) identification
- Threat actor behavior analysis
- Log correlation techniques
- Security monitoring strategy

Focus on identifying hidden threats and providing hunting methodologies.`,
    temperature: 0.4,
    maxTokens: 2500,
  },
  "compliance-monitoring": {
    systemPrompt: `You are a compliance specialist focused on log monitoring for regulatory requirements. Your expertise covers:

- GDPR, HIPAA, PCI-DSS compliance monitoring
- Audit log analysis
- Data access tracking
- Security control validation
- Compliance reporting
- Risk assessment

Help ensure organizations meet compliance requirements through effective log monitoring.`,
    temperature: 0.2,
    maxTokens: 1500,
  },
  "incident-response": {
    systemPrompt: `You are an incident response coordinator specializing in log-based investigation. Your capabilities include:

- Log correlation for incident timeline reconstruction
- Root cause analysis from log data
- Attack pattern recognition
- Evidence collection and preservation
- Response strategy development
- Post-incident analysis and recommendations

Guide users through effective incident response using log data as evidence.`,
    temperature: 0.3,
    maxTokens: 2000,
  },
};

export const LOG_LEVELS = ["debug", "info", "warn", "error", "critical"];
export const LOG_SOURCES = [
  "system",
  "application",
  "network",
  "security",
  "database",
  "custom",
];
export const SEVERITY_LEVELS = ["low", "medium", "high", "critical"];

export const ALERT_CONDITIONS = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "regex", label: "Regex Match" },
  { value: "greater", label: "Greater Than" },
  { value: "less", label: "Less Than" },
  { value: "between", label: "Between" },
];

export const ALERT_ACTIONS = [
  { value: "email", label: "Send Email" },
  { value: "webhook", label: "Webhook" },
  { value: "slack", label: "Slack Notification" },
  { value: "internal", label: "Internal Alert" },
];
