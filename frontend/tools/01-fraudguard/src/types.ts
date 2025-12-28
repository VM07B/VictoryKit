export type Sender = 'YOU' | 'AGENT' | 'SYSTEM';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  isImage?: boolean;
  groundingUrls?: string[];
  functionCall?: FunctionCallResult;
}

export interface FunctionCallResult {
  name: string;
  args: Record<string, any>;
  result?: any;
}

export interface ChatSession {
  id: string;
  name: string;
  active: boolean;
  messages: Message[];
  settings: SettingsState;
}

export type NeuralTool = 
  | 'none' 
  | 'fraud_analysis'
  | 'risk_visualization'
  | 'transaction_history'
  | 'alerts'
  | 'reports'
  | 'web_search'
  | 'canvas'
  | 'browser';

export type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS' | 'FRAUD_DASHBOARD';

export interface CanvasState {
  content: string;
  type: 'text' | 'code' | 'html' | 'video' | 'image' | 'chart';
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

// FraudGuard Specific Types
export interface Transaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  user_ip?: string;
  device_fingerprint?: string;
  email?: string;
  card_last4?: string;
  merchant_id?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'declined' | 'flagged';
  fraud_score?: number;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface FraudScore {
  transaction_id: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
  indicators: FraudIndicator[];
  recommendation: string;
  ml_model_version: string;
  analyzed_at: string;
}

export interface FraudIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  weight: number;
}

export interface Alert {
  id: string;
  alert_type: 'high_risk_transaction' | 'suspicious_pattern' | 'velocity_breach' | 'unusual_location';
  threshold: number;
  notification_channels: ('email' | 'webhook' | 'sms' | 'slack')[];
  active: boolean;
  created_at: string;
  triggered_count: number;
}

export interface AnalyticsData {
  total_transactions: number;
  flagged_transactions: number;
  average_fraud_score: number;
  high_risk_percentage: number;
  transactions_by_day: { date: string; count: number; flagged: number }[];
  risk_distribution: { level: string; count: number }[];
  top_fraud_indicators: { indicator: string; count: number }[];
}

export interface Tab {
  id: string;
  type: 'chat' | 'web' | 'code' | 'chart' | 'transaction' | 'report';
  title: string;
  content: any;
  status: 'loading' | 'active' | 'complete' | 'error';
  aiGenerated: boolean;
}
