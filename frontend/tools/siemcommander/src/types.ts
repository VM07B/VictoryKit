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
  | "log_search"
  | "correlation"
  | "alert_manage"
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
export interface SecurityEvent {
  _id: string;
  timestamp: string;
  source: string;
  eventType: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  message: string;
  rawLog: string;
  parsedFields: Record<string, string>;
  correlated: boolean;
}
export interface Alert {
  _id: string;
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "new" | "acknowledged" | "investigating" | "resolved";
  triggeredAt: string;
  source: string;
  eventCount: number;
  description: string;
}
export interface SIEMStats {
  eventsPerSecond: number;
  totalEvents24h: number;
  alertsTriggered24h: number;
  correlationRulesActive: number;
  dataSources: number;
  storageUsedGB: number;
}
