import React, { useEffect, useState } from "react";
import {
  Code,
  FileCode,
  AlertTriangle,
  Bug,
  Lock,
  Eye,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  FileWarning,
  Package,
  GitBranch,
} from "lucide-react";

export interface ScanStage {
  name: string;
  status: "pending" | "running" | "complete" | "error";
  message?: string;
  filesScanned?: number;
  issuesFound?: number;
}

export interface CodeIssue {
  id: string;
  line: number;
  column: number;
  severity: "critical" | "high" | "medium" | "low" | "info";
  type: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface LiveScanEvent {
  type: "stage" | "issue" | "file" | "dependency" | "complete";
  stage?: ScanStage;
  issue?: CodeIssue;
  file?: string;
  dependency?: { name: string; version: string; vulnerability?: string };
  timestamp: number;
}

interface LiveCodePanelProps {
  code: string;
  language: string;
  isAnalyzing: boolean;
  stages: ScanStage[];
  issues: CodeIssue[];
  events: LiveScanEvent[];
  filesScanned: number;
  dependenciesChecked: number;
}

const LiveCodePanel: React.FC<LiveCodePanelProps> = ({
  code,
  language,
  isAnalyzing,
  stages,
  issues,
  events,
  filesScanned,
  dependenciesChecked,
}) => {
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [showEvents, setShowEvents] = useState(true);

  const codeLines = code.split("\n");

  const getLineIssues = (lineNum: number) =>
    issues.filter((i) => i.line === lineNum);

  const getLineClass = (lineNum: number) => {
    const lineIssues = getLineIssues(lineNum);
    if (lineIssues.length === 0) return "";
    const severity = lineIssues[0].severity;
    switch (severity) {
      case "critical":
      case "high":
        return "line-vulnerable";
      case "medium":
        return "line-warning";
      default:
        return "";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/20";
      case "high":
        return "text-orange-400 bg-orange-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "low":
        return "text-blue-400 bg-blue-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return XCircle;
      case "high":
        return AlertTriangle;
      case "medium":
        return AlertCircle;
      default:
        return Eye;
    }
  };

  const getStageIcon = (stage: ScanStage) => {
    switch (stage.status) {
      case "pending":
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
        );
      case "running":
        return <Loader className="w-4 h-4 text-green-400 animate-spin" />;
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const tokenize = (line: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    const patterns = [
      { regex: /^(\/\/.*|#.*)/, className: "syntax-comment" },
      { regex: /^(["'`].*?["'`])/, className: "syntax-string" },
      {
        regex:
          /^(\b(const|let|var|function|class|if|else|return|import|export|from|async|await|try|catch|throw|new|this|def|for|while|in|of)\b)/,
        className: "syntax-keyword",
      },
      { regex: /^(\b\d+\.?\d*\b)/, className: "syntax-number" },
      { regex: /^(\b[A-Z][a-zA-Z0-9]*\b)/, className: "syntax-function" },
      {
        regex: /^(\b[a-z_][a-zA-Z0-9_]*\s*(?=\())/,
        className: "syntax-function",
      },
    ];

    while (remaining.length > 0) {
      let matched = false;
      for (const pattern of patterns) {
        const match = remaining.match(pattern.regex);
        if (match) {
          tokens.push(
            <span key={key++} className={pattern.className}>
              {match[0]}
            </span>
          );
          remaining = remaining.slice(match[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        tokens.push(<span key={key++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  };

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="code-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Live Analysis</h3>
            <p className="text-xs text-gray-500">
              {language} • {codeLines.length} lines
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileCode className="w-3 h-3" />
            <span>{filesScanned} files</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Package className="w-3 h-3" />
            <span>{dependenciesChecked} deps</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Bug className="w-3 h-3 text-red-400" />
            <span
              className={issues.length > 0 ? "text-red-400" : "text-gray-400"}
            >
              {issues.length} issues
            </span>
          </div>
        </div>
      </div>

      {/* Analysis Stages */}
      {stages.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center gap-3 overflow-x-auto">
            {stages.map((stage, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  stage.status === "running"
                    ? "bg-green-500/20 border border-green-500/30"
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
                      ? "text-green-400"
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
        {/* Code Editor */}
        <div className="flex-1 overflow-auto code-editor">
          <div className="flex min-w-max">
            {/* Line Numbers */}
            <div className="line-numbers select-none">
              {codeLines.map((_, idx) => {
                const lineNum = idx + 1;
                const lineIssues = getLineIssues(lineNum);
                return (
                  <div
                    key={lineNum}
                    className={`line-number ${
                      highlightedLine === lineNum ? "bg-green-500/20" : ""
                    }`}
                    onMouseEnter={() => setHighlightedLine(lineNum)}
                    onMouseLeave={() => setHighlightedLine(null)}
                  >
                    {lineIssues.length > 0 ? (
                      <div className="relative group">
                        {React.createElement(
                          getSeverityIcon(lineIssues[0].severity),
                          {
                            className: `w-3 h-3 ${
                              getSeverityColor(lineIssues[0].severity).split(
                                " "
                              )[0]
                            }`,
                          }
                        )}
                        <div className="absolute left-6 top-0 z-10 hidden group-hover:block">
                          <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl min-w-[200px]">
                            {lineIssues.map((issue) => (
                              <div key={issue.id} className="text-xs">
                                <span
                                  className={`font-medium ${
                                    getSeverityColor(issue.severity).split(
                                      " "
                                    )[0]
                                  }`}
                                >
                                  {issue.type}
                                </span>
                                <p className="text-gray-400 mt-1">
                                  {issue.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      lineNum
                    )}
                  </div>
                );
              })}
            </div>

            {/* Code */}
            <div className="flex-1 pl-4 pr-4 py-2">
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                return (
                  <div
                    key={lineNum}
                    className={`code-line ${getLineClass(lineNum)} ${
                      highlightedLine === lineNum ? "bg-green-500/10" : ""
                    }`}
                    onMouseEnter={() => setHighlightedLine(lineNum)}
                    onMouseLeave={() => setHighlightedLine(null)}
                  >
                    <pre className="font-mono text-xs text-gray-300">
                      {tokenize(line)}
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Feed */}
        {showEvents && (
          <div className="w-64 border-l border-slate-800/50 bg-slate-900/20 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-slate-800/50 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Live Events
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  isAnalyzing ? "bg-green-500 animate-pulse" : "bg-gray-600"
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
                    {event.type === "issue" && event.issue && (
                      <div className="flex items-start gap-2">
                        <Bug
                          className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                            getSeverityColor(event.issue.severity).split(" ")[0]
                          }`}
                        />
                        <div>
                          <p className="text-[10px] text-gray-300">
                            {event.issue.type}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Line {event.issue.line}
                          </p>
                        </div>
                      </div>
                    )}
                    {event.type === "stage" && event.stage && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-green-400" />
                        <p className="text-[10px] text-gray-300">
                          {event.stage.name}
                        </p>
                      </div>
                    )}
                    {event.type === "file" && (
                      <div className="flex items-center gap-2">
                        <FileCode className="w-3 h-3 text-blue-400" />
                        <p className="text-[10px] text-gray-300 truncate">
                          {event.file}
                        </p>
                      </div>
                    )}
                    {event.type === "dependency" && event.dependency && (
                      <div className="flex items-center gap-2">
                        <Package
                          className={`w-3 h-3 ${
                            event.dependency.vulnerability
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        />
                        <p className="text-[10px] text-gray-300">
                          {event.dependency.name}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {recentEvents.length === 0 && !isAnalyzing && (
                  <div className="text-center py-8">
                    <Shield className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      Start analysis to see events
                    </p>
                  </div>
                )}
                {isAnalyzing && recentEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 text-green-400 mx-auto mb-2 animate-spin" />
                    <p className="text-xs text-gray-400">Scanning...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Issue Summary */}
      {issues.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center gap-4">
            {["critical", "high", "medium", "low"].map((sev) => {
              const count = issues.filter((i) => i.severity === sev).length;
              if (count === 0) return null;
              return (
                <div
                  key={sev}
                  className={`flex items-center gap-1 px-2 py-1 rounded ${getSeverityColor(
                    sev
                  )}`}
                >
                  <span className="text-xs font-medium">{count}</span>
                  <span className="text-xs capitalize">{sev}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCodePanel;
