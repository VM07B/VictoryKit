import React, { useState } from "react";
import {
  ClipboardCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  ChevronDown,
  ChevronRight,
  FileText,
  Lock,
  Users,
  Database,
  Eye,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";

export interface ControlRequirement {
  id: string;
  code: string;
  name: string;
  description: string;
  status:
    | "pending"
    | "checking"
    | "compliant"
    | "partial"
    | "non-compliant"
    | "not-applicable";
  evidence?: string;
  findings?: string;
}

export interface ControlCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  requirements: ControlRequirement[];
  progress: number;
}

export interface AssessmentStage {
  name: string;
  status: "pending" | "running" | "complete" | "error";
  controlsChecked?: number;
  findingsCount?: number;
}

export interface LiveAssessmentEvent {
  type: "stage" | "control" | "finding" | "complete";
  stage?: AssessmentStage;
  control?: ControlRequirement;
  finding?: { severity: string; message: string };
  timestamp: number;
}

interface LiveCompliancePanelProps {
  frameworks: string[];
  isAssessing: boolean;
  stages: AssessmentStage[];
  categories: ControlCategory[];
  events: LiveAssessmentEvent[];
  currentControl?: string;
  totalControls: number;
  checkedControls: number;
}

const LiveCompliancePanel: React.FC<LiveCompliancePanelProps> = ({
  frameworks,
  isAssessing,
  stages,
  categories,
  events,
  currentControl,
  totalControls,
  checkedControls,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState(true);

  const getStatusIcon = (status: ControlRequirement["status"]) => {
    switch (status) {
      case "pending":
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
        );
      case "checking":
        return <Loader className="w-4 h-4 text-indigo-400 animate-spin" />;
      case "compliant":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "partial":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "non-compliant":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "not-applicable":
        return <div className="w-4 h-4 rounded-full bg-gray-600" />;
    }
  };

  const getStatusClass = (status: ControlRequirement["status"]) => {
    switch (status) {
      case "compliant":
        return "control-status compliant";
      case "partial":
        return "control-status partial";
      case "non-compliant":
        return "control-status non-compliant";
      case "not-applicable":
        return "control-status not-applicable";
      default:
        return "";
    }
  };

  const getFrameworkBadgeClass = (fw: string) => {
    const classes: Record<string, string> = {
      gdpr: "framework-badge gdpr",
      hipaa: "framework-badge hipaa",
      pci: "framework-badge pci",
      sox: "framework-badge sox",
      iso27001: "framework-badge iso27001",
      nist: "framework-badge nist",
      soc2: "framework-badge",
      ccpa: "framework-badge",
    };
    return classes[fw] || "framework-badge";
  };

  const getStageIcon = (stage: AssessmentStage) => {
    switch (stage.status) {
      case "pending":
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
        );
      case "running":
        return <Loader className="w-4 h-4 text-indigo-400 animate-spin" />;
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const progressPercent =
    totalControls > 0 ? Math.round((checkedControls / totalControls) * 100) : 0;

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="compliance-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-900/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              Live Assessment
            </h3>
            <p className="text-xs text-gray-500">
              {checkedControls} / {totalControls} controls
            </p>
          </div>
        </div>

        {/* Frameworks */}
        <div className="flex items-center gap-2">
          {frameworks.map((fw) => (
            <span
              key={fw}
              className={`${getFrameworkBadgeClass(fw)} ${
                isAssessing ? "active" : ""
              }`}
            >
              {fw.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 border-b border-indigo-900/30 bg-slate-900/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Assessment Progress</span>
          <span className="text-xs font-bold text-indigo-400">
            {progressPercent}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Assessment Stages */}
      {stages.length > 0 && (
        <div className="px-4 py-3 border-b border-indigo-900/30 bg-slate-900/20">
          <div className="flex items-center gap-3 overflow-x-auto">
            {stages.map((stage, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  stage.status === "running"
                    ? "bg-indigo-500/20 border border-indigo-500/30"
                    : stage.status === "complete"
                    ? "bg-slate-800/50 border border-slate-700"
                    : stage.status === "error"
                    ? "bg-red-500/20 border border-red-500/30"
                    : "bg-slate-800/30 border border-slate-800"
                }`}
              >
                {getStageIcon(stage)}
                <span
                  className={
                    stage.status === "running"
                      ? "text-indigo-400"
                      : stage.status === "complete"
                      ? "text-gray-300"
                      : stage.status === "error"
                      ? "text-red-400"
                      : "text-gray-500"
                  }
                >
                  {stage.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Control Categories */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="control-category">
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === category.id ? null : category.id
                    )
                  }
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <category.icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {category.requirements.length} requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mini progress */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${category.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {category.progress}%
                      </span>
                    </div>
                    {expandedCategory === category.id ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {expandedCategory === category.id && (
                  <div className="mt-3 space-y-1">
                    {category.requirements.map((req) => (
                      <div
                        key={req.id}
                        className={`requirement-row ${
                          req.status === "checking" ? "checking" : ""
                        }`}
                      >
                        {getStatusIcon(req.status)}
                        <div className="flex-1 ml-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-indigo-400">
                              {req.code}
                            </span>
                            <span className="text-xs text-gray-300">
                              {req.name}
                            </span>
                          </div>
                        </div>
                        {req.status !== "pending" &&
                          req.status !== "checking" && (
                            <span className={getStatusClass(req.status)}>
                              {req.status.replace("-", " ")}
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <ClipboardCheck className="w-8 h-8 text-indigo-500/50" />
              </div>
              <p className="text-sm text-gray-400">
                Start assessment to view controls
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Control requirements will appear here
              </p>
            </div>
          )}
        </div>

        {/* Event Feed */}
        {showEvents && (
          <div className="w-56 border-l border-indigo-900/30 bg-slate-900/20 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-indigo-900/30 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Live Events
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  isAssessing ? "bg-indigo-500 animate-pulse" : "bg-gray-600"
                }`}
              />
            </div>
            <div className="flex-1 overflow-auto">
              <div className="p-2 space-y-1">
                {recentEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-800/30 rounded-lg border border-slate-800/50 animate-fadeIn"
                  >
                    {event.type === "control" && event.control && (
                      <div className="flex items-start gap-2">
                        {getStatusIcon(event.control.status)}
                        <div>
                          <p className="text-[10px] font-mono text-indigo-400">
                            {event.control.code}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {event.control.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {event.type === "stage" && event.stage && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-indigo-400" />
                        <p className="text-[10px] text-gray-300">
                          {event.stage.name}
                        </p>
                      </div>
                    )}
                    {event.type === "finding" && event.finding && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-3 h-3 ${
                            event.finding.severity === "high"
                              ? "text-red-400"
                              : event.finding.severity === "medium"
                              ? "text-yellow-400"
                              : "text-blue-400"
                          }`}
                        />
                        <p className="text-[10px] text-gray-300">
                          {event.finding.message}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {recentEvents.length === 0 && !isAssessing && (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      Waiting for assessment
                    </p>
                  </div>
                )}
                {isAssessing && recentEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-spin" />
                    <p className="text-xs text-gray-400">Initializing...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Control */}
      {currentControl && (
        <div className="px-4 py-2 border-t border-indigo-900/30 bg-indigo-500/10">
          <div className="flex items-center gap-2">
            <Loader className="w-3 h-3 text-indigo-400 animate-spin" />
            <span className="text-xs text-indigo-400">
              Checking: {currentControl}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCompliancePanel;
