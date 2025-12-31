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
  | "playbook_run"
  | "integrations"
  | "automation"
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
export interface Playbook {
  _id: string;
  name: string;
  description: string;
  triggerType: "manual" | "alert" | "schedule" | "webhook";
  status: "active" | "inactive" | "draft";
  lastRun: string | null;
  runCount: number;
  avgDuration: number;
  steps: PlaybookStep[];
}
export interface PlaybookStep {
  id: string;
  name: string;
  type: "action" | "condition" | "integration";
  config: Record<string, unknown>;
}
export interface PlaybookRun {
  _id: string;
  playbookId: string;
  playbookName: string;
  status: "running" | "completed" | "failed" | "cancelled";
  startedAt: string;
  completedAt: string | null;
  triggeredBy: string;
  stepsCompleted: number;
  totalSteps: number;
}
export interface Integration {
  _id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  actionsAvailable: number;
}
export interface SOARStats {
  activePlaybooks: number;
  runsToday: number;
  automatedActions: number;
  integrationsActive: number;
  avgResponseTime: number;
  successRate: number;
}
