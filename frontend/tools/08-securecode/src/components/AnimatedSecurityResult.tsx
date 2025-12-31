import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Bug,
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Code,
  Package,
  Lock,
  Eye,
  ExternalLink,
  Copy,
  FileCode,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { CodeIssue } from "./LiveCodePanel";

export interface Vulnerability {
  id: string;
  package: string;
  version: string;
  severity: "critical" | "high" | "medium" | "low";
  cve?: string;
  title: string;
  fixVersion?: string;
}

export interface SecurityMetrics {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  categories: {
    injection: number;
    xss: number;
    secrets: number;
    crypto: number;
    auth: number;
    dependencies: number;
    other: number;
  };
  vulnerabilities: Vulnerability[];
  scannedFiles: number;
  scannedLines: number;
  analysisTime: number;
}

interface AnimatedSecurityResultProps {
  metrics: SecurityMetrics;
  issues: CodeIssue[];
  isVisible: boolean;
}

const AnimatedSecurityResult: React.FC<AnimatedSecurityResultProps> = ({
  metrics,
  issues,
  isVisible,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [showVulnerabilities, setShowVulnerabilities] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      const duration = 1500;
      const steps = 60;
      const increment = metrics.score / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= metrics.score) {
          setDisplayScore(metrics.score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isVisible, metrics.score]);

  const getGradeColor = () => {
    switch (metrics.grade) {
      case "A":
        return "text-green-400";
      case "B":
        return "text-emerald-400";
      case "C":
        return "text-yellow-400";
      case "D":
        return "text-orange-400";
      case "F":
        return "text-red-400";
    }
  };

  const getGradeBg = () => {
    switch (metrics.grade) {
      case "A":
        return "from-green-500/20 to-emerald-500/20 border-green-500/30";
      case "B":
        return "from-emerald-500/20 to-teal-500/20 border-emerald-500/30";
      case "C":
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case "D":
        return "from-orange-500/20 to-red-500/20 border-orange-500/30";
      case "F":
        return "from-red-500/20 to-rose-500/20 border-red-500/30";
    }
  };

  const getScoreRingColor = () => {
    if (metrics.score >= 90) return "#22c55e";
    if (metrics.score >= 70) return "#84cc16";
    if (metrics.score >= 50) return "#eab308";
    if (metrics.score >= 30) return "#f97316";
    return "#ef4444";
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          color: "text-red-400",
          bg: "bg-red-500/20",
          border: "border-red-500/30",
          icon: XCircle,
        };
      case "high":
        return {
          color: "text-orange-400",
          bg: "bg-orange-500/20",
          border: "border-orange-500/30",
          icon: AlertTriangle,
        };
      case "medium":
        return {
          color: "text-yellow-400",
          bg: "bg-yellow-500/20",
          border: "border-yellow-500/30",
          icon: AlertCircle,
        };
      case "low":
        return {
          color: "text-blue-400",
          bg: "bg-blue-500/20",
          border: "border-blue-500/30",
          icon: Eye,
        };
      default:
        return {
          color: "text-gray-400",
          bg: "bg-gray-500/20",
          border: "border-gray-500/30",
          icon: Eye,
        };
    }
  };

  const categories = [
    {
      key: "injection",
      label: "Injection",
      icon: Bug,
      count: metrics.categories.injection,
    },
    { key: "xss", label: "XSS", icon: Code, count: metrics.categories.xss },
    {
      key: "secrets",
      label: "Secrets",
      icon: Lock,
      count: metrics.categories.secrets,
    },
    {
      key: "crypto",
      label: "Weak Crypto",
      icon: Shield,
      count: metrics.categories.crypto,
    },
    {
      key: "auth",
      label: "Auth Issues",
      icon: ShieldAlert,
      count: metrics.categories.auth,
    },
    {
      key: "dependencies",
      label: "Dependencies",
      icon: Package,
      count: metrics.categories.dependencies,
    },
  ].filter((c) => c.count > 0);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalIssues =
    metrics.issues.critical +
    metrics.issues.high +
    metrics.issues.medium +
    metrics.issues.low;

  if (!isVisible) return null;

  return (
    <div className="code-card p-6 space-y-6 animate-fadeIn">
      {/* Header with Score */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Animated Score Ring */}
          <div className="relative w-28 h-28">
            <svg className="score-ring" viewBox="0 0 100 100">
              <circle className="score-ring-bg" cx="50" cy="50" r="45" />
              <circle
                className="score-ring-fill"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  stroke: getScoreRingColor(),
                  transition: "stroke-dashoffset 1.5s ease-out",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getGradeColor()}`}>
                {displayScore}
              </span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
          </div>

          <div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getGradeBg()} border`}
            >
              {metrics.grade === "A" || metrics.grade === "B" ? (
                <ShieldCheck className={`w-4 h-4 ${getGradeColor()}`} />
              ) : metrics.grade === "C" ? (
                <Shield className={`w-4 h-4 ${getGradeColor()}`} />
              ) : (
                <ShieldX className={`w-4 h-4 ${getGradeColor()}`} />
              )}
              <span className={`font-bold ${getGradeColor()}`}>
                Grade {metrics.grade}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {metrics.score >= 90
                ? "Excellent security posture"
                : metrics.score >= 70
                ? "Good with minor issues"
                : metrics.score >= 50
                ? "Needs improvement"
                : "Critical issues detected"}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-right">
          <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
            <p className="text-lg font-bold text-white">
              {metrics.scannedFiles}
            </p>
            <p className="text-[10px] text-gray-500">Files Scanned</p>
          </div>
          <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
            <p className="text-lg font-bold text-white">
              {metrics.scannedLines.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500">Lines Analyzed</p>
          </div>
          <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
            <p className="text-lg font-bold text-white">{totalIssues}</p>
            <p className="text-[10px] text-gray-500">Issues Found</p>
          </div>
          <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
            <p className="text-lg font-bold text-white">
              {metrics.analysisTime}s
            </p>
            <p className="text-[10px] text-gray-500">Analysis Time</p>
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Bug className="w-4 h-4 text-green-400" />
          Issues by Severity
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              key: "critical",
              label: "Critical",
              count: metrics.issues.critical,
              color: "bg-red-500",
            },
            {
              key: "high",
              label: "High",
              count: metrics.issues.high,
              color: "bg-orange-500",
            },
            {
              key: "medium",
              label: "Medium",
              count: metrics.issues.medium,
              color: "bg-yellow-500",
            },
            {
              key: "low",
              label: "Low",
              count: metrics.issues.low,
              color: "bg-blue-500",
            },
          ].map((sev) => (
            <div
              key={sev.key}
              className={`p-3 rounded-lg border transition-all ${
                sev.count > 0
                  ? `${getSeverityStyle(sev.key).bg} ${
                      getSeverityStyle(sev.key).border
                    }`
                  : "bg-slate-800/30 border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${sev.color}`} />
                <span
                  className={`text-xs ${
                    sev.count > 0
                      ? getSeverityStyle(sev.key).color
                      : "text-gray-500"
                  }`}
                >
                  {sev.label}
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  sev.count > 0 ? "text-white" : "text-gray-600"
                }`}
              >
                {sev.count}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            Issue Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.key ? null : cat.key
                  )
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  selectedCategory === cat.key
                    ? "bg-green-500/20 border-green-500/50 text-white"
                    : "bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600"
                }`}
              >
                <cat.icon className="w-3 h-3" />
                <span className="text-xs">{cat.label}</span>
                <span className="text-xs font-bold text-green-400">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Issue Details */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-green-400" />
            Detected Issues
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {issues
              .filter(
                (issue) =>
                  !selectedCategory ||
                  issue.type.toLowerCase().includes(selectedCategory)
              )
              .slice(0, 10)
              .map((issue) => {
                const style = getSeverityStyle(issue.severity);
                const isExpanded = expandedIssue === issue.id;
                return (
                  <div
                    key={issue.id}
                    className={`rounded-lg border ${style.border} ${style.bg} transition-all overflow-hidden`}
                  >
                    <button
                      onClick={() =>
                        setExpandedIssue(isExpanded ? null : issue.id)
                      }
                      className="w-full p-3 flex items-start justify-between text-left"
                    >
                      <div className="flex items-start gap-3">
                        {React.createElement(style.icon, {
                          className: `w-4 h-4 mt-0.5 ${style.color}`,
                        })}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {issue.type}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {issue.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Line {issue.line}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t border-slate-700/50">
                        <div className="mt-2">
                          <p className="text-[10px] text-gray-500 mb-1">
                            Vulnerable Code
                          </p>
                          <div className="relative">
                            <pre className="p-2 bg-slate-900/80 rounded text-xs text-red-300 font-mono overflow-x-auto">
                              {issue.code}
                            </pre>
                            <button
                              onClick={() =>
                                copyToClipboard(issue.code, issue.id)
                              }
                              className="absolute top-1 right-1 p-1 rounded bg-slate-800 hover:bg-slate-700"
                            >
                              {copiedId === issue.id ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        {issue.suggestion && (
                          <div>
                            <p className="text-[10px] text-gray-500 mb-1">
                              Suggested Fix
                            </p>
                            <pre className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-300 font-mono overflow-x-auto">
                              {issue.suggestion}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Vulnerable Dependencies */}
      {metrics.vulnerabilities.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowVulnerabilities(!showVulnerabilities)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-300 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-green-400" />
              <span>Vulnerable Dependencies</span>
              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                {metrics.vulnerabilities.length}
              </span>
            </div>
            {showVulnerabilities ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showVulnerabilities && (
            <div className="space-y-2">
              {metrics.vulnerabilities.map((vuln) => {
                const style = getSeverityStyle(vuln.severity);
                return (
                  <div
                    key={vuln.id}
                    className={`p-3 rounded-lg border ${style.border} ${style.bg} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`dependency-badge ${
                          vuln.severity === "critical" ||
                          vuln.severity === "high"
                            ? "vulnerable"
                            : "outdated"
                        }`}
                      >
                        {vuln.severity}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {vuln.package}@{vuln.version}
                        </p>
                        <p className="text-xs text-gray-400">{vuln.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {vuln.cve && (
                        <a
                          href={`https://nvd.nist.gov/vuln/detail/${vuln.cve}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          {vuln.cve}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {vuln.fixVersion && (
                        <p className="text-xs text-green-400 mt-1">
                          Fix: {vuln.fixVersion}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {totalIssues === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            No Issues Detected!
          </h3>
          <p className="text-sm text-gray-400">
            Your code passed all security checks.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimatedSecurityResult;
