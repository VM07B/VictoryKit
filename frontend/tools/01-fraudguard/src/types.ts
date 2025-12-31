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
  | "shopping"
  | "study"
  | "web_search"
  | "canvas"
  | "quizzes"
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

// Fraud Detection Types
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TransactionStatus = "approved" | "declined" | "flagged" | "pending";

export interface Transaction {
  id?: string;
  transaction_id: string;
  amount: number;
  currency: string;
  user_email: string;
  email?: string; // alias for user_email
  user_ip: string;
  device_fingerprint: string;
  card_last_four: string;
  card_last4?: string; // alias for card_last_four
  merchant_category?: string;
  merchant_id?: string;
  country: string;
  city?: string;
  timestamp?: string;
  fraud_score?: number;
  risk_level?: RiskLevel;
  status?: TransactionStatus;
}

export interface FraudIndicator {
  type: string;
  description: string;
  severity: RiskLevel;
  weight: number;
}

export interface FraudScore {
  transaction_id: string;
  score: number;
  risk_level: RiskLevel;
  confidence: number;
  indicators: FraudIndicator[];
  recommendation?: string;
}

export interface Alert {
  id?: string;
  name: string;
  description: string;
  alert_type: string;
  condition: string;
  threshold: number;
  severity: RiskLevel;
  notification_channels: string[];
  active: boolean;
  created_at?: string;
  triggered_count?: number;
}

export interface AnalyticsData {
  total_transactions: number;
  fraudulent_transactions: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  timeline: Array<{
    date: string;
    transactions: number;
    risk_score: number;
  }>;
}
