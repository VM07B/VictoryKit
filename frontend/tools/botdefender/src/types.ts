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
  | "bot_detect"
  | "captcha_manage"
  | "behavior_analyze"
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
export interface BotSession {
  _id: string;
  ip: string;
  userAgent: string;
  fingerprint: string;
  score: number;
  isBot: boolean;
  botType?: string;
  requestCount: number;
  firstSeen: string;
  lastSeen: string;
  blocked: boolean;
}
export interface CaptchaChallenge {
  _id: string;
  type: "image" | "audio" | "invisible" | "turnstile";
  sessionId: string;
  solved: boolean;
  attempts: number;
  createdAt: string;
}
export interface BotStats {
  totalSessions24h: number;
  botSessions24h: number;
  humanSessions24h: number;
  blockedBots24h: number;
  captchaSolved24h: number;
  topBotTypes: { type: string; count: number }[];
}
