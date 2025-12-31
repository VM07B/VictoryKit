// LogAnalyzer Types

export interface LogEntry {
  _id: string;
  userId: string;
  source:
    | "system"
    | "application"
    | "network"
    | "security"
    | "database"
    | "custom";
  level: "debug" | "info" | "warn" | "error" | "critical";
  timestamp: Date;
  message: string;
  metadata: {
    hostname?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
  };
  structuredData?: any;
  tags: string[];
  severity: "low" | "medium" | "high" | "critical";
  analyzed: boolean;
  analysis?: {
    anomalies: string[];
    patterns: string[];
    recommendations: string[];
    riskScore: number;
  };
}

export interface LogAnalysis {
  _id: string;
  userId: string;
  logEntryIds: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEntries: number;
    errorCount: number;
    warningCount: number;
    criticalCount: number;
    uniqueSources: number;
    patternsDetected: number;
  };
  patterns: Array<{
    name: string;
    regex?: string;
    description: string;
    severity: string;
    category: string;
  }>;
  anomalies: Array<{
    type: string;
    description: string;
    confidence: number;
    evidence: string[];
    timestamp: Date;
  }>;
  insights: Array<{
    type: string;
    priority: "low" | "medium" | "high" | "critical";
    description: string;
    recommendation: string;
  }>;
  riskScore: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export interface LogAlert {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: Array<{
    field: string;
    operator: "equals" | "contains" | "regex" | "greater" | "less" | "between";
    value: any;
    caseSensitive: boolean;
  }>;
  actions: Array<{
    type: "email" | "webhook" | "slack" | "sms" | "internal";
    target: string;
    template?: string;
    enabled: boolean;
  }>;
  severity: "low" | "medium" | "high" | "critical";
  cooldown: number; // minutes
  lastTriggered?: Date;
  triggerCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tab {
  id: string;
  label: string;
  icon: any;
}

export interface SettingsState {
  selectedProvider: string;
  apiKey: string;
  theme: "light" | "dark";
  notifications: boolean;
  autoAnalyze: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider: string;
}

export interface WorkspaceMode {
  id: string;
  name: string;
  description: string;
}
