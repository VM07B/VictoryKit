export interface DataAsset {
  id: string;
  name: string;
  type: string;
  classification: "public" | "internal" | "confidential" | "restricted";
  piiCategories: string[];
  location: string;
  owner: string;
  retentionPeriod: number;
  legalBasis: string;
  lastScanned: string;
}

export interface DSAR {
  id: string;
  requestType:
    | "access"
    | "deletion"
    | "rectification"
    | "portability"
    | "restriction";
  subject: string;
  email: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  submittedDate: string;
  dueDate: string;
  completedDate?: string;
  notes: string;
}

export interface ConsentRecord {
  id: string;
  subjectId: string;
  purpose: string;
  status: "granted" | "withdrawn" | "pending";
  grantedDate: string;
  expiryDate?: string;
  source: string;
  version: string;
}

export interface PrivacyImpactAssessment {
  id: string;
  projectName: string;
  status: "draft" | "in-review" | "approved" | "rejected";
  riskLevel: "low" | "medium" | "high" | "very-high";
  createdDate: string;
  assessor: string;
  findings: string[];
  mitigations: string[];
}

export interface DataBreach {
  id: string;
  title: string;
  discoveredDate: string;
  reportedDate?: string;
  affectedSubjects: number;
  dataTypes: string[];
  severity: "low" | "medium" | "high" | "critical";
  status: "investigating" | "contained" | "notified" | "closed";
  regulatoryNotification: boolean;
}

export interface ComplianceStatus {
  regulation: string;
  status: "compliant" | "partial" | "non-compliant";
  score: number;
  lastAssessment: string;
  gaps: string[];
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
