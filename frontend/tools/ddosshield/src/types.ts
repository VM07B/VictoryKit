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
  | "attack_detect"
  | "traffic_analyze"
  | "mitigation"
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
export interface DDoSAttack {
  _id: string;
  type: "volumetric" | "protocol" | "application";
  source: string[];
  target: string;
  peakBandwidth: number;
  packetsPerSecond: number;
  startTime: string;
  endTime?: string;
  status: "active" | "mitigated" | "blocked";
  severity: "low" | "medium" | "high" | "critical";
}
export interface TrafficStats {
  inboundBandwidth: number;
  outboundBandwidth: number;
  packetsPerSecond: number;
  connectionsPerSecond: number;
  blockedRequests: number;
  cleanTraffic: number;
}
export interface MitigationRule {
  _id: string;
  name: string;
  type: string;
  threshold: number;
  action: "rate_limit" | "block" | "challenge";
  enabled: boolean;
  triggeredCount: number;
}
