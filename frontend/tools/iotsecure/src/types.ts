export interface IoTDevice {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  status: "secure" | "vulnerable" | "compromised" | "unknown";
  lastSeen: string;
  protocols: string[];
  riskScore: number;
}

export interface DeviceScan {
  id: string;
  networkRange: string;
  startTime: string;
  endTime?: string;
  status: "running" | "completed" | "failed";
  devicesFound: number;
  vulnerabilitiesFound: number;
}

export interface FirmwareAnalysis {
  id: string;
  deviceId: string;
  firmwareVersion: string;
  analysisDate: string;
  vulnerabilities: Vulnerability[];
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
}

export interface Vulnerability {
  id: string;
  cve?: string;
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  remediation: string;
}

export interface ProtocolAlert {
  id: string;
  deviceId: string;
  protocol: string;
  alertType: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: string;
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
