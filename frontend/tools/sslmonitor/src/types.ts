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
  | "cert_scan"
  | "expiry_check"
  | "grade_analysis"
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
export interface Certificate {
  _id: string;
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  protocol: string;
  keySize: number;
  signatureAlgorithm: string;
  status: "valid" | "expiring" | "expired" | "revoked";
  lastChecked: string;
}
export interface CertStats {
  totalCertificates: number;
  validCertificates: number;
  expiringCertificates: number;
  expiredCertificates: number;
  avgGrade: string;
  avgDaysToExpiry: number;
}
