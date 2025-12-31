export type Sender = "YOU" | "AGENT" | "SYSTEM";

export interface FunctionCallResult {
  name: string;
  args: Record<string, any>;
  result?: any;
}

export interface Message {
  id: string;
  sender?: Sender;
  role?: "user" | "assistant" | "system";
  text?: string;
  content?: string;
  timestamp: string | Date;
  provider?: string;
  isImage?: boolean;
  groundingUrls?: string[];
  functionCall?: FunctionCallResult;
  attachments?: ForensicArtifact[];
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
  | "incident_triage"
  | "threat_intel"
  | "forensics"
  | "network_analysis"
  | "containment"
  | "playbooks"
  | "timeline"
  | "alerts"
  | "reports"
  | "case_notes"
  | "command_center"
  | "web_search"
  | "canvas"
  | "browser"
  // legacy values kept for compatibility while UI migrates
  | "fraud_analysis"
  | "risk_visualization"
  | "transaction_history";

export type WorkspaceMode =
  | "CHAT"
  | "TIMELINE"
  | "PLAYBOOK"
  | "CANVAS"
  | "INCIDENT_ROOM"
  | "COMMAND"
  // legacy until UI refactor completes
  | "fraud-detection"
  | "analytics"
  | "monitoring";

export interface CanvasState {
  content: string;
  type: "text" | "code" | "html" | "video" | "image" | "chart";
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

export type IncidentSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "informational";

export type IncidentStatus =
  | "open"
  | "in_progress"
  | "contained"
  | "eradicated"
  | "resolved"
  | "closed";

export type IncidentCategory =
  | "malware"
  | "phishing"
  | "ransomware"
  | "data_breach"
  | "insider_threat"
  | "ddos"
  | "vulnerability"
  | "policy_violation"
  | "other";

export interface Responder {
  id: string;
  name: string;
  role?: string;
  contact?: string;
  shift?: "primary" | "secondary" | "on_call";
}

export interface Indicator {
  id: string;
  type:
    | "ip"
    | "domain"
    | "url"
    | "hash"
    | "email"
    | "process"
    | "file"
    | "registry"
    | "behavior"
    | "account";
  value: string;
  source?: string;
  reputation?: "benign" | "suspicious" | "malicious" | "unknown";
  confidence?: number;
  first_seen?: string;
  last_seen?: string;
  tags?: string[];
}

export interface ForensicArtifact {
  id: string;
  type:
    | "memory_dump"
    | "disk_image"
    | "pcap"
    | "log"
    | "email"
    | "endpoint_snapshot"
    | "persistence"
    | "registry"
    | "other";
  source: string;
  location: string;
  collected_at: string;
  integrity_hash?: string;
  notes?: string;
  tags?: string[];
  size_mb?: number;
}

export interface TimelineEvent {
  id: string;
  occurred_at: string;
  actor: string;
  action: string;
  severity: IncidentSeverity;
  description: string;
  source?: string;
  related_asset?: string;
  tags?: string[];
  indicators?: Indicator[];
  artifacts?: ForensicArtifact[];
}

export interface ContainmentAction {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  owner?: Responder;
  started_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface PlaybookStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "done" | "skipped" | "blocked";
  owner?: Responder;
  evidence?: string[];
  updated_at?: string;
}

export interface PlaybookRun {
  id: string;
  name: string;
  status: "not_started" | "running" | "completed" | "failed" | "cancelled";
  started_at: string;
  completed_at?: string;
  steps: PlaybookStep[];
  owner?: Responder;
  summary?: string;
}

export interface CaseNote {
  id: string;
  author: string;
  content: string;
  created_at: string;
  visibility?: "internal" | "customer";
}

export interface DetectionEvent {
  id: string;
  rule_id?: string;
  title: string;
  severity: IncidentSeverity;
  category: IncidentCategory;
  source: string;
  detected_at: string;
  asset?: string;
  summary?: string;
  status?: IncidentStatus;
  indicators?: Indicator[];
}

export interface IndicatorFinding extends Indicator {
  reasoning?: string;
  weight?: number;
  evidence?: string[];
}

export interface IncidentAssessment {
  incident_id: string;
  score: number;
  severity: IncidentSeverity;
  confidence: number;
  risk_level: "critical" | "high" | "medium" | "low";
  stage:
    | "triage"
    | "investigation"
    | "containment"
    | "eradication"
    | "recovery";
  indicators: IndicatorFinding[];
  recommendations: string[];
  assessed_at: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  severity: IncidentSeverity;
  enabled: boolean;
  channel: ("email" | "webhook" | "pagerduty" | "slack")[];
  conditions: string[];
  created_at: string;
  updated_at?: string;
}

export interface Incident {
  id: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  priority?: "p0" | "p1" | "p2" | "p3";
  assets: string[];
  detected_at: string;
  reported_at?: string;
  updated_at?: string;
  owner?: Responder;
  responders?: Responder[];
  indicators?: Indicator[];
  artifacts?: ForensicArtifact[];
  timeline?: TimelineEvent[];
  containment?: ContainmentAction[];
  playbook?: PlaybookRun;
  notes?: CaseNote[];
  detections?: DetectionEvent[];
  tags?: string[];
  environment?: string;
}

export interface IncidentAnalytics {
  open: number;
  contained: number;
  closed: number;
  mtta_minutes?: number;
  mttr_minutes?: number;
  bySeverity: Record<IncidentSeverity, number>;
  topCategories: { category: IncidentCategory; count: number }[];
  detectionsPast7d: { date: string; count: number }[];
}

export interface Tab {
  id:
    | "triage"
    | "timeline"
    | "forensics"
    | "intel"
    | "alerts"
    | "tasks"
    | "reports"
    | "settings"
    | "workspace"
    | "chat"
    | "maula-ai"
    | "dashboard"
    | "playbooks"
    | "canvas"
    | "command"
    // legacy until layout migration completes
    | "analyze"
    | "visualize"
    | "history";
  type:
    | "chat"
    | "web"
    | "code"
    | "chart"
    | "incident"
    | "report"
    | "timeline"
    | "intel"
    | "canvas";
  title: string;
  content: any;
  status: "loading" | "active" | "complete" | "error";
  aiGenerated: boolean;
}

// Legacy compatibility while FraudGuard UI is replaced
export interface Transaction extends Partial<Incident> {
  transaction_id?: string;
  amount?: number;
  currency?: string;
  user_ip?: string;
  device_fingerprint?: string;
  email?: string;
  card_last4?: string;
  merchant_id?: string;
  timestamp?: string;
  status?: "pending" | "approved" | "declined" | "flagged";
  fraud_score?: number;
  risk_level?: "low" | "medium" | "high" | "critical";
}

export interface FraudIndicator extends IndicatorFinding {}

export interface FraudScore extends Partial<IncidentAssessment> {
  transaction_id?: string;
  recommendation?: string;
  ml_model_version?: string;
}

export interface Alert extends AlertRule {
  triggered_count?: number;
}

export interface AnalyticsData extends IncidentAnalytics {}
