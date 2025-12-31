import React, { useEffect, useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  AlertOctagon,
  Check,
  Link,
  Mail,
  Globe,
  Lock,
  Unlock,
  User,
  Server,
  FileText,
  Zap,
  Eye,
  Download,
  Copy,
  Share2,
  RotateCcw,
  ExternalLink,
  Anchor,
  Hash,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  XCircle,
  CheckCircle2,
} from "lucide-react";

export type PhishingVerdict = "PHISHING" | "SUSPICIOUS" | "SPAM" | "SAFE";

export interface PhishingIndicator {
  type: "critical" | "high" | "medium" | "low";
  category: string;
  description: string;
  evidence?: string;
}

export interface PhishingResult {
  verdict: PhishingVerdict;
  confidence: number;
  riskScore: number;
  summary: string;
  indicators: PhishingIndicator[];
  senderAnalysis: {
    email: string;
    displayName: string;
    domain: string;
    spoofed: boolean;
    reputation: "trusted" | "neutral" | "suspicious" | "malicious";
  };
  linksAnalyzed: number;
  maliciousLinks: number;
  attachmentRisk: "none" | "low" | "medium" | "high";
  aiRecommendation: string;
  analysisTime: number;
}

interface AnimatedPhishResultProps {
  result: PhishingResult;
  onNewScan: () => void;
  onExport: () => void;
}

const AnimatedPhishResult: React.FC<AnimatedPhishResultProps> = ({
  result,
  onNewScan,
  onExport,
}) => {
  const [showDetails, setShowDetails] = useState(false);
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

  const getVerdictStyle = () => {
    switch (result.verdict) {
      case "PHISHING":
        return {
          bg: "bg-gradient-to-br from-red-600/30 to-red-900/20",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: <ShieldX className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(239,68,68,0.3)]",
          label: "PHISHING DETECTED",
          description: "This message contains strong phishing indicators",
        };
      case "SUSPICIOUS":
        return {
          bg: "bg-gradient-to-br from-orange-600/30 to-orange-900/20",
          border: "border-orange-500/50",
          text: "text-orange-400",
          icon: <ShieldAlert className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(249,115,22,0.3)]",
          label: "SUSPICIOUS",
          description: "Exercise caution - multiple warning signs detected",
        };
      case "SPAM":
        return {
          bg: "bg-gradient-to-br from-yellow-600/30 to-yellow-900/20",
          border: "border-yellow-500/50",
          text: "text-yellow-400",
          icon: <AlertTriangle className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(234,179,8,0.3)]",
          label: "LIKELY SPAM",
          description: "This appears to be unsolicited commercial email",
        };
      case "SAFE":
        return {
          bg: "bg-gradient-to-br from-green-600/30 to-green-900/20",
          border: "border-green-500/50",
          text: "text-green-400",
          icon: <ShieldCheck className="w-16 h-16" />,
          glow: "shadow-[0_0_50px_rgba(34,197,94,0.3)]",
          label: "SAFE",
          description: "No phishing indicators detected",
        };
    }
  };

  const style = getVerdictStyle();

  const getIndicatorBadge = (type: PhishingIndicator["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getReputationStyle = (rep: string) => {
    switch (rep) {
      case "trusted":
        return {
          color: "text-green-400",
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case "malicious":
        return { color: "text-red-400", icon: <XCircle className="w-4 h-4" /> };
      case "suspicious":
        return {
          color: "text-orange-400",
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      default:
        return { color: "text-gray-400", icon: <Shield className="w-4 h-4" /> };
    }
  };

  const handleCopy = async () => {
    const report = `PhishGuard Analysis Report
══════════════════════════════════════
Verdict: ${result.verdict}
Confidence: ${result.confidence}%
Risk Score: ${result.riskScore}/100

Summary: ${result.summary}

Sender Analysis:
• Email: ${result.senderAnalysis.email}
• Domain: ${result.senderAnalysis.domain}
• Reputation: ${result.senderAnalysis.reputation}
• Spoofed: ${result.senderAnalysis.spoofed ? "Yes" : "No"}

Links: ${result.maliciousLinks}/${result.linksAnalyzed} malicious

Indicators Found: ${result.indicators.length}
${result.indicators
  .map((i) => `• [${i.type.toUpperCase()}] ${i.description}`)
  .join("\n")}

AI Recommendation:
${result.aiRecommendation}

Analysis completed in ${(result.analysisTime / 1000).toFixed(2)}s
Generated by PhishGuard v5.0`;

    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const criticalCount = result.indicators.filter(
    (i) => i.type === "critical"
  ).length;
  const highCount = result.indicators.filter((i) => i.type === "high").length;

  return (
    <div
      className={`phish-card overflow-hidden transition-all duration-500 ${
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Verdict Header */}
      <div className={`relative p-8 ${style.bg} ${style.glow}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        <div className="relative z-10 text-center">
          <div className={`inline-flex ${style.text} mb-4 animate-phishHook`}>
            {style.icon}
          </div>
          <h2 className={`text-3xl font-bold ${style.text} mb-2`}>
            {style.label}
          </h2>
          <p className="text-gray-400">{style.description}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-gray-500">Confidence:</span>
            <span className={`text-lg font-bold ${style.text}`}>
              {result.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Risk Score Gauge */}
      <div className="p-6 border-b border-orange-500/20">
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
                : "bg-gradient-to-r from-green-600 to-green-400"
            }`}
            style={{ width: `${animatedScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Safe</span>
          <span>Critical</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-px bg-slate-800">
        <div className="bg-slate-900 p-4 text-center">
          <div className="text-2xl font-bold text-white tabular-nums">
            {result.indicators.length}
          </div>
          <div className="text-xs text-gray-500">Indicators</div>
        </div>
        <div className="bg-slate-900 p-4 text-center">
          <div className="text-2xl font-bold text-red-400 tabular-nums">
            {criticalCount}
          </div>
          <div className="text-xs text-gray-500">Critical</div>
        </div>
        <div className="bg-slate-900 p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400 tabular-nums">
            {result.linksAnalyzed}
          </div>
          <div className="text-xs text-gray-500">Links Checked</div>
        </div>
        <div className="bg-slate-900 p-4 text-center">
          <div
            className={`text-2xl font-bold tabular-nums ${
              result.maliciousLinks > 0 ? "text-red-400" : "text-green-400"
            }`}
          >
            {result.maliciousLinks}
          </div>
          <div className="text-xs text-gray-500">Malicious</div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-b border-orange-500/20">
        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Analysis Summary
        </h3>
        <p className="text-white leading-relaxed">{result.summary}</p>
      </div>

      {/* Sender Analysis */}
      <div className="p-6 border-b border-orange-500/20">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />
          Sender Analysis
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Email Address</div>
            <div className="text-sm text-white font-mono truncate">
              {result.senderAnalysis.email}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Domain</div>
            <div className="text-sm text-white font-mono">
              {result.senderAnalysis.domain}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Reputation</div>
            <div
              className={`flex items-center gap-2 ${
                getReputationStyle(result.senderAnalysis.reputation).color
              }`}
            >
              {getReputationStyle(result.senderAnalysis.reputation).icon}
              <span className="text-sm capitalize">
                {result.senderAnalysis.reputation}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Spoofing</div>
            <div
              className={`flex items-center gap-2 ${
                result.senderAnalysis.spoofed
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {result.senderAnalysis.spoofed ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span className="text-sm">
                {result.senderAnalysis.spoofed ? "Likely Spoofed" : "Verified"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators List */}
      <div className="p-6 border-b border-orange-500/20">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Anchor className="w-4 h-4" />
            Detected Indicators ({result.indicators.length})
          </h3>
          {showDetails ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showDetails && (
          <div className="mt-4 space-y-3">
            {result.indicators.map((indicator, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${getIndicatorBadge(
                  indicator.type
                )}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium uppercase border ${getIndicatorBadge(
                      indicator.type
                    )}`}
                  >
                    {indicator.type}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm text-white">
                      {indicator.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {indicator.category}
                    </div>
                    {indicator.evidence && (
                      <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-gray-400 font-mono truncate">
                        {indicator.evidence}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendation */}
      <div className="p-6 border-b border-orange-500/20 bg-gradient-to-r from-purple-500/5 to-transparent">
        <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          AI Recommendation
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {result.aiRecommendation}
        </p>
      </div>

      {/* Actions */}
      <div className="p-6 flex items-center justify-between gap-4">
        <div className="text-xs text-gray-600">
          <Clock className="w-3 h-3 inline mr-1" />
          Analyzed in {(result.analysisTime / 1000).toFixed(2)}s
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
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-orange-500/25"
          >
            <RotateCcw className="w-4 h-4" />
            New Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimatedPhishResult;
