import React, { useEffect, useRef } from "react";
import {
  Shield,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  Mail,
  Link,
  Globe,
  User,
  Server,
  Eye,
  FileText,
  Zap,
  AlertOctagon,
  Anchor,
  Lock,
  Unlock,
} from "lucide-react";

export interface AnalysisStep {
  id: string;
  label: string;
  status: "pending" | "running" | "complete" | "warning" | "error";
  detail?: string;
  progress?: number;
}

export interface AnalysisEvent {
  timestamp: number;
  type: "analysis" | "warning" | "detection" | "info";
  severity: "info" | "low" | "medium" | "high" | "critical";
  message: string;
  indicator?: string;
}

interface LiveAnalysisPanelProps {
  steps: AnalysisStep[];
  events: AnalysisEvent[];
  isAnalyzing: boolean;
  linksChecked: number;
  indicatorsFound: number;
  currentItem?: string;
}

const LiveAnalysisPanel: React.FC<LiveAnalysisPanelProps> = ({
  steps,
  events,
  isAnalyzing,
  linksChecked,
  indicatorsFound,
  currentItem,
}) => {
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventsRef.current) {
      eventsRef.current.scrollTop = 0;
    }
  }, [events]);

  const getStepIcon = (stepId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      init: <Shield className="w-4 h-4" />,
      sender: <User className="w-4 h-4" />,
      headers: <FileText className="w-4 h-4" />,
      domain: <Globe className="w-4 h-4" />,
      links: <Link className="w-4 h-4" />,
      content: <Mail className="w-4 h-4" />,
      visual: <Eye className="w-4 h-4" />,
      reputation: <Server className="w-4 h-4" />,
      ssl: <Lock className="w-4 h-4" />,
      ai: <Zap className="w-4 h-4" />,
    };
    return iconMap[stepId] || <Shield className="w-4 h-4" />;
  };

  const getStepStatus = (status: AnalysisStep["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "error":
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: AnalysisEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      default:
        return "text-gray-400 bg-slate-800/50 border-slate-700";
    }
  };

  const getEventIcon = (event: AnalysisEvent) => {
    if (event.severity === "critical")
      return <AlertOctagon className="w-3.5 h-3.5" />;
    if (event.severity === "high")
      return <AlertTriangle className="w-3.5 h-3.5" />;
    if (event.type === "detection") return <Anchor className="w-3.5 h-3.5" />;
    return <Shield className="w-3.5 h-3.5" />;
  };

  const completedSteps = steps.filter((s) => s.status === "complete").length;
  const warningSteps = steps.filter((s) => s.status === "warning").length;

  return (
    <div className="phish-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-orange-400" />
            </div>
            {isAnalyzing && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Analysis</h3>
            <p className="text-xs text-gray-500">
              {isAnalyzing
                ? "Scanning for phishing indicators..."
                : "Awaiting analysis"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-400 tabular-nums">
            {completedSteps}/{steps.length}
          </div>
          <div className="text-xs text-gray-500">
            {warningSteps > 0 && (
              <span className="text-yellow-400">{warningSteps} warnings</span>
            )}
          </div>
        </div>
      </div>

      {/* Current Item */}
      {isAnalyzing && currentItem && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-orange-500/20 relative overflow-hidden">
          <div className="absolute inset-0 scan-gradient pointer-events-none" />
          <div className="relative z-10">
            <div className="text-xs text-gray-500 mb-1">Currently Checking</div>
            <div className="text-sm text-white truncate font-mono">
              {currentItem}
            </div>
          </div>
        </div>
      )}

      {/* Live Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Link className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-500">Links Checked</span>
          </div>
          <div className="text-xl font-bold text-white tabular-nums">
            {linksChecked}
          </div>
        </div>
        <div
          className={`p-3 rounded-lg border ${
            indicatorsFound > 0
              ? "bg-red-500/10 border-red-500/30"
              : "bg-slate-800/50 border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Anchor
              className={`w-4 h-4 ${
                indicatorsFound > 0 ? "text-red-400" : "text-gray-400"
              }`}
            />
            <span className="text-xs text-gray-500">Indicators Found</span>
          </div>
          <div
            className={`text-xl font-bold tabular-nums ${
              indicatorsFound > 0 ? "text-red-400" : "text-white"
            }`}
          >
            {indicatorsFound}
          </div>
        </div>
      </div>

      {/* Analysis Steps */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">
          Analysis Stages
        </h4>
        <div className="space-y-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                step.status === "running"
                  ? "bg-orange-500/10 border border-orange-500/30"
                  : step.status === "complete"
                  ? "bg-green-500/5"
                  : step.status === "warning"
                  ? "bg-yellow-500/10 border border-yellow-500/30"
                  : "bg-transparent"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.status === "complete"
                    ? "bg-green-500/20 text-green-400"
                    : step.status === "running"
                    ? "bg-orange-500/20 text-orange-400"
                    : step.status === "warning"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-slate-800 text-gray-600"
                }`}
              >
                {getStepIcon(step.id)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      step.status === "running"
                        ? "text-orange-400"
                        : step.status === "complete"
                        ? "text-white"
                        : step.status === "warning"
                        ? "text-yellow-400"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {step.detail && (
                  <p className="text-xs text-gray-500 truncate">
                    {step.detail}
                  </p>
                )}
              </div>
              {getStepStatus(step.status)}
            </div>
          ))}
        </div>
      </div>

      {/* Event Log */}
      <div className="flex-1 min-h-0">
        <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Detection Events
        </h4>
        <div ref={eventsRef} className="h-48 overflow-y-auto space-y-2 pr-1">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              {isAnalyzing
                ? "Scanning for indicators..."
                : "Start analysis to see events"}
            </div>
          ) : (
            events.map((event, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border text-xs detection-item ${getSeverityColor(
                  event.severity
                )}`}
              >
                <div className="flex items-start gap-2">
                  {getEventIcon(event)}
                  <div className="flex-1 min-w-0">
                    <p className="leading-relaxed">{event.message}</p>
                    {event.indicator && (
                      <p className="text-gray-500 truncate mt-1 font-mono text-xs">
                        {event.indicator}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-600 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="mt-4 pt-4 border-t border-orange-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isAnalyzing ? "bg-green-500 animate-pulse" : "bg-gray-600"
            }`}
          />
          <span className="text-xs text-gray-500">
            {isAnalyzing ? "Analysis engine active" : "Engine idle"}
          </span>
        </div>
        <div className="text-xs text-gray-600">PhishGuard v5.0</div>
      </div>
    </div>
  );
};

export default LiveAnalysisPanel;
