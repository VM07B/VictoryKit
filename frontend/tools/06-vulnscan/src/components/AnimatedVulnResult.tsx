import React, { useEffect, useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  AlertOctagon,
  Check,
  Server,
  Globe,
  Lock,
  Unlock,
  Bug,
  Zap,
  Download,
  Copy,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  Wifi,
  FileWarning,
} from "lucide-react";

export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SECURE";

export interface Vulnerability {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  cve?: string;
  cvss?: number;
  port?: number;
  service?: string;
  remediation?: string;
}

export interface ScanResult {
  riskLevel: RiskLevel;
  riskScore: number;
  target: string;
  scanType: string;
  summary: string;
  portsScanned: number;
  portsOpen: number;
  servicesDetected: number;
  vulnerabilities: Vulnerability[];
  osDetected?: string;
  sslGrade?: string;
  headerScore?: number;
  recommendations: string[];
  scanDuration: number;
}

interface AnimatedVulnResultProps {
  result: ScanResult;
  onNewScan: () => void;
  onExport: () => void;
}

const AnimatedVulnResult: React.FC<AnimatedVulnResultProps> = ({
  result,
  onNewScan,
  onExport,
}) => {
  const [showVulns, setShowVulns] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = result.riskScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= result.riskScore) {
        setAnimatedScore(result.riskScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.riskScore]);

  const getRiskStyle = () => {
    switch (result.riskLevel) {
      case "CRITICAL":
        return {
          bg: "bg-gradient-to-br from-red-600/30 to-red-900/20",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: <ShieldX className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(239,68,68,0.3)]",
          label: "CRITICAL RISK",
          description:
            "Immediate action required - critical vulnerabilities found",
        };
      case "HIGH":
        return {
          bg: "bg-gradient-to-br from-orange-600/30 to-orange-900/20",
          border: "border-orange-500/50",
          text: "text-orange-400",
          icon: <ShieldAlert className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(249,115,22,0.3)]",
          label: "HIGH RISK",
          description: "Significant vulnerabilities require attention",
        };
      case "MEDIUM":
        return {
          bg: "bg-gradient-to-br from-yellow-600/30 to-yellow-900/20",
          border: "border-yellow-500/50",
          text: "text-yellow-400",
          icon: <AlertTriangle className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(234,179,8,0.3)]",
          label: "MEDIUM RISK",
          description: "Moderate vulnerabilities should be addressed",
        };
      case "LOW":
        return {
          bg: "bg-gradient-to-br from-blue-600/30 to-blue-900/20",
          border: "border-blue-500/50",
          text: "text-blue-400",
          icon: <Shield className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(59,130,246,0.3)]",
          label: "LOW RISK",
          description: "Minor issues found - good security posture",
        };
      case "SECURE":
        return {
          bg: "bg-gradient-to-br from-green-600/30 to-green-900/20",
          border: "border-green-500/50",
          text: "text-green-400",
          icon: <ShieldCheck className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(34,197,94,0.3)]",
          label: "SECURE",
          description: "No significant vulnerabilities detected",
        };
    }
  };

  const style = getRiskStyle();

  const getSeverityBadge = (severity: Vulnerability["severity"]) => {
    switch (severity) {
      case "critical":
        return "severity-critical";
      case "high":
        return "severity-high";
      case "medium":
        return "severity-medium";
      case "low":
        return "severity-low";
      default:
        return "severity-info";
    }
  };

  const handleCopy = async () => {
    const report = `VulnScan Security Report
══════════════════════════════════════
Target: ${result.target}
Scan Type: ${result.scanType}
Risk Level: ${result.riskLevel}
Risk Score: ${result.riskScore}/100

Summary: ${result.summary}

Scan Statistics:
• Ports Scanned: ${result.portsScanned}
• Open Ports: ${result.portsOpen}
• Services Detected: ${result.servicesDetected}
${result.osDetected ? `• OS Detected: ${result.osDetected}` : ""}
${result.sslGrade ? `• SSL Grade: ${result.sslGrade}` : ""}

Vulnerabilities Found: ${result.vulnerabilities.length}
${result.vulnerabilities
  .map(
    (v) =>
      `• [${v.severity.toUpperCase()}] ${v.title}${v.cve ? ` (${v.cve})` : ""}`
  )
  .join("\n")}

Recommendations:
${result.recommendations.map((r) => `• ${r}`).join("\n")}

Scan completed in ${(result.scanDuration / 1000).toFixed(2)}s
Generated by VulnScan v6.0`;

    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const criticalCount = result.vulnerabilities.filter(
    (v) => v.severity === "critical"
  ).length;
  const highCount = result.vulnerabilities.filter(
    (v) => v.severity === "high"
  ).length;
  const mediumCount = result.vulnerabilities.filter(
    (v) => v.severity === "medium"
  ).length;
  const lowCount = result.vulnerabilities.filter(
    (v) => v.severity === "low"
  ).length;

  return (
    <div
      className={`vuln-card overflow-hidden transition-all duration-500 ${
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Risk Header */}
      <div className={`relative p-8 ${style.bg} ${style.glow}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        <div className="relative z-10 text-center">
          <div className={`inline-flex ${style.text} mb-4 animate-vulnPulse`}>
            {style.icon}
          </div>
          <h2 className={`text-3xl font-bold ${style.text} mb-2`}>
            {style.label}
          </h2>
          <p className="text-gray-400">{style.description}</p>
          <div className="mt-4 p-2 bg-slate-800/50 rounded-lg inline-block">
            <span className="text-sm text-gray-500 font-mono">
              {result.target}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Score */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Risk Score</span>
          <span
            className={`text-3xl font-bold tabular-nums ${
              animatedScore >= 80
                ? "text-red-400"
                : animatedScore >= 60
                ? "text-orange-400"
                : animatedScore >= 40
                ? "text-yellow-400"
                : animatedScore >= 20
                ? "text-blue-400"
                : "text-green-400"
            }`}
          >
            {animatedScore}
            <span className="text-lg text-gray-500">/100</span>
          </span>
        </div>
        <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              animatedScore >= 80
                ? "bg-gradient-to-r from-red-600 to-red-400"
                : animatedScore >= 60
                ? "bg-gradient-to-r from-orange-600 to-orange-400"
                : animatedScore >= 40
                ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                : animatedScore >= 20
                ? "bg-gradient-to-r from-blue-600 to-blue-400"
                : "bg-gradient-to-r from-green-600 to-green-400"
            }`}
            style={{ width: `${animatedScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Secure</span>
          <span>Critical</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-px bg-slate-800">
        <div className="bg-slate-900 p-4 text-center">
          <div className="text-2xl font-bold text-white tabular-nums">
            {result.portsScanned}
          </div>
          <div className="text-xs text-gray-500">Ports Scanned</div>
        </div>
        <div className="bg-slate-900 p-4 text-center">
          <div className="text-2xl font-bold text-green-400 tabular-nums">
            {result.portsOpen}
          </div>
          <div className="text-xs text-gray-500">Open Ports</div>
        </div>
        <div className="bg-slate-900 p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400 tabular-nums">
            {result.servicesDetected}
          </div>
          <div className="text-xs text-gray-500">Services</div>
        </div>
        <div className="bg-slate-900 p-4 text-center">
          <div
            className={`text-2xl font-bold tabular-nums ${
              result.vulnerabilities.length > 0
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {result.vulnerabilities.length}
          </div>
          <div className="text-xs text-gray-500">Vulnerabilities</div>
        </div>
      </div>

      {/* Vulnerability Breakdown */}
      {result.vulnerabilities.length > 0 && (
        <div className="p-6 border-b border-purple-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Vulnerability Breakdown
          </h3>
          <div className="flex gap-3">
            {criticalCount > 0 && (
              <div className="vuln-counter flex items-center gap-2 px-3 py-2 severity-critical rounded-lg">
                <span className="text-lg font-bold">{criticalCount}</span>
                <span className="text-xs">Critical</span>
              </div>
            )}
            {highCount > 0 && (
              <div
                className="vuln-counter flex items-center gap-2 px-3 py-2 severity-high rounded-lg"
                style={{ animationDelay: "100ms" }}
              >
                <span className="text-lg font-bold">{highCount}</span>
                <span className="text-xs">High</span>
              </div>
            )}
            {mediumCount > 0 && (
              <div
                className="vuln-counter flex items-center gap-2 px-3 py-2 severity-medium rounded-lg"
                style={{ animationDelay: "200ms" }}
              >
                <span className="text-lg font-bold">{mediumCount}</span>
                <span className="text-xs">Medium</span>
              </div>
            )}
            {lowCount > 0 && (
              <div
                className="vuln-counter flex items-center gap-2 px-3 py-2 severity-low rounded-lg"
                style={{ animationDelay: "300ms" }}
              >
                <span className="text-lg font-bold">{lowCount}</span>
                <span className="text-xs">Low</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-6 border-b border-purple-500/20">
        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Scan Summary
        </h3>
        <p className="text-white leading-relaxed">{result.summary}</p>
      </div>

      {/* Additional Info */}
      <div className="p-6 border-b border-purple-500/20 grid grid-cols-3 gap-4">
        {result.osDetected && (
          <div>
            <div className="text-xs text-gray-500 mb-1">OS Detected</div>
            <div className="text-sm text-white">{result.osDetected}</div>
          </div>
        )}
        {result.sslGrade && (
          <div>
            <div className="text-xs text-gray-500 mb-1">SSL Grade</div>
            <div
              className={`text-sm font-bold ${
                result.sslGrade === "A+" || result.sslGrade === "A"
                  ? "text-green-400"
                  : result.sslGrade === "B"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {result.sslGrade}
            </div>
          </div>
        )}
        {result.headerScore !== undefined && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Security Headers</div>
            <div
              className={`text-sm font-bold ${
                result.headerScore >= 80
                  ? "text-green-400"
                  : result.headerScore >= 50
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {result.headerScore}/100
            </div>
          </div>
        )}
      </div>

      {/* Vulnerabilities List */}
      {result.vulnerabilities.length > 0 && (
        <div className="p-6 border-b border-purple-500/20">
          <button
            onClick={() => setShowVulns(!showVulns)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Vulnerabilities ({result.vulnerabilities.length})
            </h3>
            {showVulns ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showVulns && (
            <div className="mt-4 space-y-3">
              {result.vulnerabilities.map((vuln, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${getSeverityBadge(
                    vuln.severity
                  )}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getSeverityBadge(
                          vuln.severity
                        )}`}
                      >
                        {vuln.severity}
                      </span>
                      {vuln.cvss && (
                        <span className="text-xs text-gray-500">
                          CVSS: {vuln.cvss}
                        </span>
                      )}
                    </div>
                    {vuln.cve && (
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${vuln.cve}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                      >
                        {vuln.cve}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <h4 className="text-white font-medium mb-1">{vuln.title}</h4>
                  <p className="text-sm text-gray-400">{vuln.description}</p>
                  {vuln.port && (
                    <div className="mt-2 text-xs text-gray-500">
                      Port {vuln.port} {vuln.service && `(${vuln.service})`}
                    </div>
                  )}
                  {vuln.remediation && (
                    <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-gray-400">
                      <span className="text-purple-400 font-medium">Fix: </span>
                      {vuln.remediation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-transparent">
          <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 flex items-center justify-between gap-4">
        <div className="text-xs text-gray-600">
          <Clock className="w-3 h-3 inline mr-1" />
          Completed in {(result.scanDuration / 1000).toFixed(2)}s
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={onNewScan}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25"
          >
            <RotateCcw className="w-4 h-4" />
            New Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimatedVulnResult;
