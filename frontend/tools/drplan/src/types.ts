export interface DRPlan {
  id: string;
  name: string;
  description: string;
  version: string;
  status: "draft" | "active" | "archived";
  lastUpdated: string;
  lastTested?: string;
  rto: number; // minutes
  rpo: number; // minutes
  owner: string;
  criticalSystems: string[];
}

export interface CriticalSystem {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  rto: number;
  rpo: number;
  dependencies: string[];
  recoveryProcedure: string;
  primaryLocation: string;
  failoverLocation: string;
  status: "operational" | "degraded" | "down";
}

export interface DRDrill {
  id: string;
  planId: string;
  name: string;
  type: "tabletop" | "simulation" | "full";
  scheduledDate: string;
  executedDate?: string;
  status: "scheduled" | "in-progress" | "completed" | "failed";
  participants: string[];
  results?: DrillResult;
}

export interface DrillResult {
  rtoAchieved: number;
  rpoAchieved: number;
  successRate: number;
  issues: string[];
  recommendations: string[];
}

export interface Runbook {
  id: string;
  systemId: string;
  name: string;
  steps: RunbookStep[];
  estimatedTime: number;
  lastExecuted?: string;
  automated: boolean;
}

export interface RunbookStep {
  order: number;
  action: string;
  responsible: string;
  estimatedTime: number;
  automated: boolean;
  verificationCriteria: string;
}

export interface RiskAssessment {
  id: string;
  scenario: string;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high" | "critical";
  mitigations: string[];
  residualRisk: "low" | "medium" | "high";
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
