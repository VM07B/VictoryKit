export type Sender = "YOU" | "AGENT" | "SYSTEM";
export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
}
export interface ChatSession {
  id: string;
  name: string;
  active: boolean;
  messages: Message[];
  settings: SettingsState;
}
export type NeuralTool =
  | "none"
  | "threat_hunt"
  | "incident_response"
  | "forensics"
  | "thinking"
  | "deep_research";
export type WorkspaceMode = "CHAT" | "PORTAL" | "CANVAS";
export interface CanvasState {
  content: string;
  type: "text" | "code";
  title: string;
}
export interface SettingsState {
  customPrompt: string;
  agentName: string;
  temperature: number;
  maxTokens: number;
  provider: string;
  model: string;
  activeTool: NeuralTool;
  workspaceMode: WorkspaceMode;
  portalUrl: string;
  canvas: CanvasState;
}
export interface NavItem {
  label: string;
  icon: string;
  tool: NeuralTool;
  description: string;
}
export interface ThreatHunt {
  _id: string;
  name: string;
  hypothesis: string;
  status: "active" | "completed" | "paused";
  startTime: string;
  endTime?: string;
  findings: number;
  analyst: string;
  priority: "low" | "medium" | "high" | "critical";
}
export interface Incident {
  _id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "contained" | "resolved";
  detectedAt: string;
  source: string;
  affectedAssets: string[];
  assignee: string;
}
export interface DefenseMetrics {
  activeHunts: number;
  openIncidents: number;
  containedThreats: number;
  meanTimeToDetect: number;
  meanTimeToRespond: number;
  alertsProcessed24h: number;
}
