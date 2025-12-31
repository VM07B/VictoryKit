export interface MobileApp {
  id: string;
  name: string;
  packageName: string;
  platform: "android" | "ios";
  version: string;
  riskScore: number;
  status: "safe" | "suspicious" | "malicious" | "unknown";
  permissions: string[];
  lastAnalyzed?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: "android" | "ios";
  osVersion: string;
  model: string;
  isRooted: boolean;
  encryptionEnabled: boolean;
  passcodeSet: boolean;
  complianceStatus: "compliant" | "non-compliant" | "partial";
  lastChecked: string;
}

export interface AppAnalysis {
  id: string;
  appId: string;
  analysisDate: string;
  vulnerabilities: Vulnerability[];
  permissions: PermissionRisk[];
  networkActivity: NetworkActivity[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface Vulnerability {
  id: string;
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  description: string;
  remediation: string;
}

export interface PermissionRisk {
  permission: string;
  riskLevel: "low" | "medium" | "high";
  justification: string;
  isExcessive: boolean;
}

export interface NetworkActivity {
  domain: string;
  ipAddress: string;
  protocol: string;
  isEncrypted: boolean;
  isSuspicious: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AnalysisResult {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}
