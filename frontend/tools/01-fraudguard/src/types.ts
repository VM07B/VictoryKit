export type Sender = "YOU" | "AGENT" | "SYSTEM";

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  isImage?: boolean;
  groundingUrls?: string[];
  toolResults?: ToolExecutionResult[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  processingTime?: number;
  modelUsed?: string;
  tokensUsed?: number;
  confidence?: number;
}

export interface ToolExecutionResult {
  tool: string;
  success: boolean;
  result: any;
  executionTime: number;
}

export interface ChatSession {
  id: string;
  name: string;
  active: boolean;
  messages: Message[];
  settings: SettingsState;
  createdAt: string;
  lastActivity: string;
  transactionContext?: Transaction[];
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
  | "browser"
  | "fraud_analysis"
  | "threat_intel"
  | "compliance_check";

export type WorkspaceMode = "CHAT" | "PORTAL" | "CANVAS" | "DASHBOARD" | "INVESTIGATION";

export interface CanvasState {
  content: string;
  type: "text" | "code" | "html" | "video" | "image" | "report" | "chart";
  language?: string;
  title: string;
  lastModified?: string;
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
  enableRealTimeAlerts?: boolean;
  autoBlockThreshold?: number;
  notificationChannels?: string[];
}

export interface NavItem {
  label: string;
  icon: string;
  tool: NeuralTool;
  description: string;
}

// Fraud Detection Types
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TransactionStatus = "approved" | "declined" | "flagged" | "pending" | "blocked" | "chargeback";
export type PaymentMethod = "credit_card" | "debit_card" | "apple_pay" | "google_pay" | "paypal" | "crypto" | "wire_transfer" | "prepaid_card";
export type FraudType = "card_fraud" | "account_takeover" | "synthetic_identity" | "friendly_fraud" | "first_party" | "third_party" | "bot_attack" | "velocity_abuse";

export interface Transaction {
  id?: string;
  transaction_id: string;
  amount: number;
  currency: string;
  user_email: string;
  email?: string;
  user_ip: string;
  device_fingerprint: string;
  card_last_four: string;
  card_last4?: string;
  card_bin?: string;
  card_type?: string;
  card_issuer?: string;
  card_issuer_country?: string;
  merchant_category?: string;
  merchant_id?: string;
  merchant_name?: string;
  country: string;
  city?: string;
  region?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: string;
  fraud_score?: number;
  risk_level?: RiskLevel;
  status?: TransactionStatus;
  payment_method?: PaymentMethod;
  fraud_type?: FraudType;
  session_id?: string;
  user_id?: string;
  account_age_days?: number;
  previous_transactions?: number;
  is_recurring?: boolean;
  browser_info?: BrowserInfo;
  velocity_data?: VelocityData;
}

export interface BrowserInfo {
  user_agent: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  device_type: "desktop" | "mobile" | "tablet";
  screen_resolution: string;
  timezone: string;
  language: string;
  is_incognito?: boolean;
  has_webrtc_leak?: boolean;
  is_emulator?: boolean;
  is_headless?: boolean;
}

export interface VelocityData {
  transactions_last_hour: number;
  transactions_last_day: number;
  transactions_last_week: number;
  unique_cards_24h: number;
  unique_devices_24h: number;
  unique_ips_24h: number;
  amount_last_hour: number;
  amount_last_day: number;
  failed_attempts_24h: number;
}

export interface FraudIndicator {
  type: string;
  code: string;
  description: string;
  severity: RiskLevel;
  weight: number;
  confidence: number;
  evidence?: string[];
  recommendation?: string;
}

export interface FraudScore {
  transaction_id?: string;
  score: number;
  risk_level: RiskLevel;
  confidence: number;
  indicators: FraudIndicator[];
  recommendation?: string;
  action?: "approve" | "decline" | "review" | "challenge";
  model_version?: string;
  processing_time_ms?: number;
  ml_models_used?: string[];
  explainability?: ExplainableAI;
}

export interface ExplainableAI {
  top_features: { feature: string; importance: number; value: any }[];
  decision_path: string[];
  similar_cases: string[];
  model_confidence: number;
}

export interface Alert {
  id?: string;
  name: string;
  description: string;
  alert_type: AlertType;
  condition: AlertCondition;
  threshold: number;
  severity: RiskLevel;
  notification_channels: NotificationChannel[];
  active: boolean;
  created_at?: string;
  triggered_count?: number;
  last_triggered?: string;
  cooldown_minutes?: number;
  escalation_policy?: EscalationPolicy;
  filters?: AlertFilter[];
}

export type AlertType = 
  | "score_threshold"
  | "velocity_spike"
  | "amount_threshold"
  | "geo_anomaly"
  | "device_anomaly"
  | "pattern_match"
  | "blacklist_hit"
  | "model_drift"
  | "chargeback_rate";

export type AlertCondition = "greater_than" | "less_than" | "equals" | "contains" | "matches_pattern";

export interface NotificationChannel {
  type: "email" | "slack" | "sms" | "pagerduty" | "webhook";
  target: string;
  enabled: boolean;
}

export interface EscalationPolicy {
  escalate_after_minutes: number;
  escalate_to: string[];
  max_escalations: number;
}

export interface AlertFilter {
  field: string;
  operator: AlertCondition;
  value: string | number;
}

export interface AnalyticsData {
  total_transactions: number;
  fraudulent_transactions: number;
  blocked_transactions: number;
  chargebacks: number;
  false_positives: number;
  approval_rate: number;
  fraud_rate: number;
  average_score: number;
  total_amount_processed: number;
  total_amount_blocked: number;
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
    fraud_count: number;
    amount: number;
  }>;
  top_fraud_types: Array<{
    type: FraudType;
    count: number;
    percentage: number;
  }>;
  geographic_distribution: Array<{
    country: string;
    transactions: number;
    fraud_rate: number;
  }>;
}

// Threat Intelligence Types
export interface ThreatIntelligence {
  ip_reputation: IPReputation;
  email_reputation: EmailReputation;
  device_reputation: DeviceReputation;
  threat_feeds: ThreatFeedMatch[];
}

export interface IPReputation {
  ip: string;
  score: number;
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_datacenter: boolean;
  is_bot: boolean;
  abuse_reports: number;
  country: string;
  isp: string;
  asn: string;
  threat_types: string[];
}

export interface EmailReputation {
  email: string;
  score: number;
  is_disposable: boolean;
  is_free_provider: boolean;
  domain_age_days: number;
  has_mx_records: boolean;
  is_deliverable: boolean;
  data_breaches: number;
  first_seen: string;
  profiles_found: string[];
}

export interface DeviceReputation {
  fingerprint: string;
  score: number;
  is_emulator: boolean;
  is_rooted: boolean;
  is_headless: boolean;
  fraud_history: number;
  first_seen: string;
  associated_accounts: number;
}

export interface ThreatFeedMatch {
  feed_name: string;
  match_type: "ip" | "email" | "device" | "card_bin";
  match_value: string;
  threat_category: string;
  confidence: number;
  last_updated: string;
}

// Investigation Types
export interface Investigation {
  id: string;
  title: string;
  status: "open" | "in_progress" | "resolved" | "escalated";
  priority: RiskLevel;
  assigned_to?: string;
  transactions: string[];
  notes: InvestigationNote[];
  timeline: InvestigationEvent[];
  created_at: string;
  updated_at: string;
  resolution?: string;
}

export interface InvestigationNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface InvestigationEvent {
  timestamp: string;
  event_type: string;
  description: string;
  actor: string;
  data?: any;
}

// Real-time Streaming Types
export interface StreamingTransaction {
  transaction: Transaction;
  fraud_score: FraudScore;
  processing_time: number;
  timestamp: string;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  requests_per_second: number;
  average_latency_ms: number;
  error_rate: number;
  ml_models_status: Record<string, "online" | "offline" | "retraining">;
  queue_depth: number;
  last_check: string;
}

// Report Types
export interface FraudReport {
  id: string;
  title: string;
  type: "daily" | "weekly" | "monthly" | "custom" | "incident";
  date_range: { start: string; end: string };
  summary: AnalyticsData;
  top_risks: FraudIndicator[];
  recommendations: string[];
  generated_at: string;
  generated_by: string;
}
