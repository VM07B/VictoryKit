import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
} from "lucide-react";
import type {
  ControlCategory,
  ControlRequirement,
} from "./LiveCompliancePanel";

export interface ComplianceMetrics {
  overallScore: number;
  status: "compliant" | "partial" | "non-compliant";
  frameworks: {
    id: string;
    name: string;
    score: number;
    status: "compliant" | "partial" | "non-compliant";
    controlsPassed: number;
    controlsFailed: number;
    controlsPartial: number;
    controlsNA: number;
  }[];
  summary: {
    totalControls: number;
    compliant: number;
    partial: number;
    nonCompliant: number;
    notApplicable: number;
  };
  riskAreas: {
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    count: number;
  }[];
  remediationItems: {
    id: string;
    control: string;
    issue: string;
    recommendation: string;
    priority: "critical" | "high" | "medium" | "low";
    effort: "low" | "medium" | "high";
  }[];
  assessmentDate: string;
  nextAssessmentDue: string;
}

interface AnimatedComplianceResultProps {
  metrics: ComplianceMetrics;
  categories: ControlCategory[];
  isVisible: boolean;
}

const AnimatedComplianceResult: React.FC<AnimatedComplianceResultProps> = ({
  metrics,
  categories,
  isVisible,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [expandedFramework, setExpandedFramework] = useState<string | null>(
    null
  );
  const [showRemediation, setShowRemediation] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "frameworks" | "remediation"
  >("overview");

  useEffect(() => {
    if (isVisible) {
      const duration = 1500;
      const steps = 60;
      const increment = metrics.overallScore / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= metrics.overallScore) {
          setDisplayScore(metrics.overallScore);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isVisible, metrics.overallScore]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#22c55e";
    if (score >= 70) return "#84cc16";
    if (score >= 50) return "#eab308";
    if (score >= 30) return "#f97316";
    return "#ef4444";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "compliant":
        return {
          color: "text-green-400",
          bg: "bg-green-500/20",
          border: "border-green-500/30",
        };
      case "partial":
        return {
          color: "text-yellow-400",
          bg: "bg-yellow-500/20",
          border: "border-yellow-500/30",
        };
      case "non-compliant":
        return {
          color: "text-red-400",
          bg: "bg-red-500/20",
          border: "border-red-500/30",
        };
      default:
        return {
          color: "text-gray-400",
          bg: "bg-gray-500/20",
          border: "border-gray-500/30",
        };
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return { color: "text-red-400", bg: "bg-red-500/20" };
      case "high":
        return { color: "text-orange-400", bg: "bg-orange-500/20" };
      case "medium":
        return { color: "text-yellow-400", bg: "bg-yellow-500/20" };
      case "low":
        return { color: "text-green-400", bg: "bg-green-500/20" };
      default:
        return { color: "text-gray-400", bg: "bg-gray-500/20" };
    }
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getStatusIcon = () => {
    switch (metrics.status) {
      case "compliant":
        return <ShieldCheck className="w-5 h-5 text-green-400" />;
      case "partial":
        return <ShieldAlert className="w-5 h-5 text-yellow-400" />;
      case "non-compliant":
        return <ShieldX className="w-5 h-5 text-red-400" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="compliance-card p-6 space-y-6 animate-fadeIn">
      {/* Header with Score */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Animated Score Ring */}
          <div className="relative w-28 h-28">
            <svg className="progress-ring" viewBox="0 0 100 100">
              <circle className="progress-ring-bg" cx="50" cy="50" r="45" />
              <circle
                className="progress-ring-fill"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  stroke: getScoreColor(displayScore),
                  transition: "stroke-dashoffset 1.5s ease-out",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {displayScore}%
              </span>
              <span className="text-xs text-gray-500">Compliant</span>
            </div>
          </div>

          <div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                getStatusStyle(metrics.status).bg
              } border ${getStatusStyle(metrics.status).border}`}
            >
              {getStatusIcon()}
              <span
                className={`font-bold capitalize ${
                  getStatusStyle(metrics.status).color
                }`}
              >
                {metrics.status.replace("-", " ")}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {metrics.status === "compliant"
                ? "All requirements met"
                : metrics.status === "partial"
                ? "Some gaps identified"
                : "Critical gaps found"}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{metrics.assessmentDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Next: {metrics.nextAssessmentDue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <p className="text-lg font-bold text-green-400">
              {metrics.summary.compliant}
            </p>
            <p className="text-[10px] text-gray-500">Compliant</p>
          </div>
          <div className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
            <p className="text-lg font-bold text-yellow-400">
              {metrics.summary.partial}
            </p>
            <p className="text-[10px] text-gray-500">Partial</p>
          </div>
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            <p className="text-lg font-bold text-red-400">
              {metrics.summary.nonCompliant}
            </p>
            <p className="text-[10px] text-gray-500">Non-Compliant</p>
          </div>
          <div className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-400">
              {metrics.summary.notApplicable}
            </p>
            <p className="text-[10px] text-gray-500">N/A</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-indigo-900/30">
        {[
          { id: "overview", label: "Overview", icon: PieChart },
          { id: "frameworks", label: "Frameworks", icon: Shield },
          { id: "remediation", label: "Remediation", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Risk Areas */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-indigo-400" />
              Risk Areas
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {metrics.riskAreas.map((area, idx) => {
                const style = getSeverityStyle(area.severity);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${style.bg} border border-opacity-30`}
                    style={{ borderColor: style.color.replace("text-", "") }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">
                        {area.category}
                      </span>
                      <span className={`text-xs font-bold ${style.color}`}>
                        {area.count}
                      </span>
                    </div>
                    <span className={`text-[10px] capitalize ${style.color}`}>
                      {area.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Control Distribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Control Distribution
            </h4>
            <div className="space-y-2">
              {[
                {
                  label: "Compliant",
                  count: metrics.summary.compliant,
                  color: "bg-green-500",
                },
                {
                  label: "Partial",
                  count: metrics.summary.partial,
                  color: "bg-yellow-500",
                },
                {
                  label: "Non-Compliant",
                  count: metrics.summary.nonCompliant,
                  color: "bg-red-500",
                },
                {
                  label: "Not Applicable",
                  count: metrics.summary.notApplicable,
                  color: "bg-gray-500",
                },
              ].map((item) => {
                const percent =
                  metrics.summary.totalControls > 0
                    ? Math.round(
                        (item.count / metrics.summary.totalControls) * 100
                      )
                    : 0;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-400">
                      {item.label}
                    </div>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-xs text-gray-300">
                        {item.count}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({percent}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "frameworks" && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {metrics.frameworks.map((fw) => {
            const style = getStatusStyle(fw.status);
            const isExpanded = expandedFramework === fw.id;
            return (
              <div
                key={fw.id}
                className={`rounded-lg border ${style.border} ${style.bg} overflow-hidden transition-all`}
              >
                <button
                  onClick={() =>
                    setExpandedFramework(isExpanded ? null : fw.id)
                  }
                  className="w-full p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-400">
                        {fw.name}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {fw.name}
                      </p>
                      <p className={`text-xs capitalize ${style.color}`}>
                        {fw.status.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {fw.score}%
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 grid grid-cols-4 gap-2 border-t border-slate-700/50 pt-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-green-400">
                        {fw.controlsPassed}
                      </p>
                      <p className="text-[10px] text-gray-500">Passed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-yellow-400">
                        {fw.controlsPartial}
                      </p>
                      <p className="text-[10px] text-gray-500">Partial</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-red-400">
                        {fw.controlsFailed}
                      </p>
                      <p className="text-[10px] text-gray-500">Failed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-400">
                        {fw.controlsNA}
                      </p>
                      <p className="text-[10px] text-gray-500">N/A</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "remediation" && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {metrics.remediationItems.length > 0 ? (
            metrics.remediationItems.map((item) => {
              const style = getSeverityStyle(item.priority);
              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-indigo-400">
                        {item.control}
                      </span>
                      <p className="text-sm text-white mt-1">{item.issue}</p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${style.bg} ${style.color}`}
                    >
                      {item.priority}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{item.recommendation}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Effort:</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        item.effort === "low"
                          ? "bg-green-500/20 text-green-400"
                          : item.effort === "medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.effort}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-gray-300">
                No remediation items needed
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All controls are compliant
              </p>
            </div>
          )}
        </div>
      )}

      {/* Export */}
      <div className="flex gap-2 pt-4 border-t border-indigo-900/30">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500/30 transition-all text-sm">
          <Download className="w-4 h-4" />
          Export Report
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 transition-all text-sm">
          <FileText className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
};

export default AnimatedComplianceResult;
