export interface BackupJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  type: "full" | "incremental" | "differential";
  status: "running" | "completed" | "failed" | "scheduled";
  lastRun?: string;
  nextRun?: string;
  size: number;
  retentionDays: number;
  encrypted: boolean;
  immutable: boolean;
}

export interface BackupTarget {
  id: string;
  name: string;
  type: "local" | "cloud" | "tape" | "air-gapped";
  provider?: string;
  capacity: number;
  used: number;
  status: "online" | "offline" | "degraded";
  lastCheck: string;
}

export interface IntegrityCheck {
  id: string;
  backupId: string;
  checkDate: string;
  status: "passed" | "failed" | "warning";
  checksumValid: boolean;
  recoverable: boolean;
  issues: string[];
}

export interface RestoreTest {
  id: string;
  backupId: string;
  testDate: string;
  status: "success" | "partial" | "failed";
  duration: number;
  filesRecovered: number;
  totalFiles: number;
  notes: string;
}

export interface SecurityAlert {
  id: string;
  type: "ransomware" | "anomaly" | "access" | "integrity";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  backupId?: string;
  timestamp: string;
  resolved: boolean;
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
