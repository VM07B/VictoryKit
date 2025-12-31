// WAFManager Types

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
  | "image_gen"
  | "thinking"
  | "deep_research"
  | "study"
  | "web_search"
  | "canvas"
  | "browser"
  | "waf_analyze"
  | "rule_generator";

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

// WAF-specific types
export interface WAFRule {
  _id: string;
  name: string;
  description?: string;
  ruleType: "block" | "allow" | "challenge" | "rate_limit" | "log";
  pattern: string;
  patternType: "regex" | "exact" | "contains" | "starts_with" | "ends_with";
  target: "uri" | "headers" | "body" | "query" | "ip" | "user_agent" | "cookie";
  priority: number;
  enabled: boolean;
  category:
    | "sqli"
    | "xss"
    | "rce"
    | "lfi"
    | "rfi"
    | "csrf"
    | "custom"
    | "bot"
    | "scanner";
  severity: "critical" | "high" | "medium" | "low" | "info";
  matchCount: number;
  lastMatched?: string;
  createdBy: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AttackLog {
  _id: string;
  ruleId?: string;
  ruleName?: string;
  sourceIp: string;
  targetUri: string;
  method: string;
  userAgent?: string;
  payload?: string;
  matchedPattern?: string;
  action: "blocked" | "allowed" | "challenged" | "rate_limited" | "logged";
  category: string;
  severity: string;
  geoLocation?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: string;
}

export interface TrafficStats {
  _id: string;
  timestamp: string;
  period: "minute" | "hour" | "day";
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  challengedRequests: number;
  rateLimitedRequests: number;
  uniqueIps: number;
  attacksByCategory: {
    sqli: number;
    xss: number;
    rce: number;
    lfi: number;
    rfi: number;
    csrf: number;
    bot: number;
    scanner: number;
    custom: number;
  };
}

export interface DashboardStats {
  totalRules: number;
  enabledRules: number;
  attacks24h: number;
  attacksHour: number;
  topCategories: { category: string; count: number }[];
  topAttackingIps: { ip: string; count: number }[];
  blockRate: number;
}
