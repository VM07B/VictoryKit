export type Sender = "YOU" | "AGENT" | "SYSTEM";

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  isImage?: boolean;
  groundingUrls?: string[];
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
  | "api_scan"
  | "rate_limit"
  | "auth_monitor"
  | "thinking"
  | "deep_research"
  | "web_search"
  | "browser";

export type WorkspaceMode = "CHAT" | "PORTAL" | "CANVAS";

export interface CanvasState {
  content: string;
  type: "text" | "code" | "html" | "video" | "image";
  language?: string;
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

// API Guard specific types
export interface APIEndpoint {
  _id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description?: string;
  authRequired: boolean;
  rateLimit: number;
  rateLimitWindow: number;
  enabled: boolean;
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  lastAccessed?: string;
  createdAt: string;
}

export interface RateLimitRule {
  _id: string;
  name: string;
  endpoint: string;
  limit: number;
  windowMs: number;
  blockDuration: number;
  enabled: boolean;
  hitCount: number;
  blockedCount: number;
}

export interface AuthEvent {
  _id: string;
  type: "login" | "logout" | "token_refresh" | "failed_attempt" | "suspicious";
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  message?: string;
  createdAt: string;
}

export interface APISecurityStats {
  totalEndpoints: number;
  protectedEndpoints: number;
  totalRequests24h: number;
  blockedRequests24h: number;
  avgResponseTime: number;
  topEndpoints: { path: string; count: number }[];
  authEvents: { type: string; count: number }[];
}
