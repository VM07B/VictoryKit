import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Globe,
  Server,
  Target,
  Clock,
  MapPin,
  Skull,
  Bug,
  Crosshair,
  ExternalLink,
  Copy,
  Share2,
  Zap,
  Eye,
  Download,
  Lock,
  Sparkles,
  Activity,
  Network,
  AlertOctagon,
  Ban,
  Play,
  ShieldOff,
  ShieldCheck,
} from "lucide-react";

export interface ThreatDetectionResult {
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "CLEAN";
  riskScore: number;
  totalThreats: number;
  totalAssets: number;
  scanDuration: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  topThreats: {
    name: string;
    type: string;
    severity: string;
    source: string;
    asset: string;
  }[];
  recommendations: string[];
  mitigationActions: string[];
}

interface AnimatedThreatResultProps {
  data: ThreatDetectionResult | null;
  isScanning?: boolean;
  onViewDetails?: () => void;
  onTakeAction?: () => void;
}

export const AnimatedThreatResult: React.FC<AnimatedThreatResultProps> = ({
  data,
  onViewDetails,
  onTakeAction,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [typedRec, setTypedRec] = useState("");
  const [revealedThreats, setRevealedThreats] = useState(0);
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    if (!data) {
      setDisplayScore(0);
      setShowDetails(false);
      setShowRecommendations(false);
      setRevealedThreats(0);
      setTypedRec("");
      return;
    }

    // Animate risk score
    let current = 0;
    const target = data.riskScore;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
        setTimeout(() => setShowDetails(true), 300);
      }
      setDisplayScore(Math.round(current));
    }, stepTime);

    return () => clearInterval(timer);
  }, [data]);

  useEffect(() => {
    if (!showDetails || !data?.topThreats) return;

    const interval = setInterval(() => {
      setRevealedThreats((prev) => {
        if (prev >= data.topThreats.length) {
          clearInterval(interval);
          setTimeout(() => setShowRecommendations(true), 300);
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showDetails, data?.topThreats]);

  useEffect(() => {
    if (!showRecommendations || !data?.recommendations?.[0]) return;

    let index = 0;
    const text = data.recommendations[0];

    const interval = setInterval(() => {
      if (index <= text.length) {
        setTypedRec(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setPulseActive(false);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [showRecommendations, data?.recommendations]);

  useEffect(() => {
    if (data) setPulseActive(true);
  }, [data]);

  if (!data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 p-8 text-center relative overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-red-500/30 flex items-center justify-center">
              <Shield className="w-12 h-12 text-red-400 opacity-50" />
            </div>
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500/50 animate-spin"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Awaiting Detection
          </h3>
          <p className="text-gray-400 max-w-xs mx-auto">
            Configure and start a threat detection scan to see results
          </p>
        </div>
      </div>
    );
  }

  const getThreatColor = () => {
    switch (data.threatLevel) {
      case "CRITICAL":
        return {
          text: "text-red-500",
          bg: "from-red-500",
          border: "border-red-500",
          glow: "shadow-red-500/30",
        };
      case "HIGH":
        return {
          text: "text-orange-500",
          bg: "from-orange-500",
          border: "border-orange-500",
          glow: "shadow-orange-500/30",
        };
      case "MEDIUM":
        return {
          text: "text-yellow-500",
          bg: "from-yellow-500",
          border: "border-yellow-500",
          glow: "shadow-yellow-500/30",
        };
      case "LOW":
        return {
          text: "text-blue-500",
          bg: "from-blue-500",
          border: "border-blue-500",
          glow: "shadow-blue-500/30",
        };
      default:
        return {
          text: "text-green-500",
          bg: "from-green-500",
          border: "border-green-500",
          glow: "shadow-green-500/30",
        };
    }
  };

  const getThreatIcon = () => {
    switch (data.threatLevel) {
      case "CRITICAL":
        return <Skull className="w-8 h-8 text-red-500" />;
      case "HIGH":
        return <AlertTriangle className="w-8 h-8 text-orange-500" />;
      case "MEDIUM":
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      case "LOW":
        return <Shield className="w-8 h-8 text-blue-500" />;
      default:
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Skull className="w-4 h-4 text-red-400" />;
      case "HIGH":
        return <AlertOctagon className="w-4 h-4 text-orange-400" />;
      case "MEDIUM":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  const colors = getThreatColor();

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden relative">
      {/* Background Gradient */}
      <div
        className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${colors.bg}/10 to-transparent pointer-events-none`}
      />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-slate-900/50 to-transparent pointer-events-none" />

      {/* Header */}
      <div
        className={`bg-gradient-to-r ${colors.bg}/20 to-slate-800/50 p-6 relative overflow-hidden`}
      >
        {pulseActive && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-pulse" />
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} to-slate-700 flex items-center justify-center shadow-lg ${colors.glow}`}
              >
                <Target className="w-7 h-7 text-white" />
              </div>
              {pulseActive && (
                <div
                  className={`absolute inset-0 rounded-xl border-2 ${colors.border}/30 animate-ping`}
                />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Detection Results
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </h2>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Scan completed in {data.scanDuration.toFixed(1)}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getThreatIcon()}
            <span className={`text-lg font-bold uppercase ${colors.text}`}>
              {data.threatLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Score & Stats */}
      <div className="p-6 border-b border-red-500/20">
        <div className="grid grid-cols-3 gap-6">
          {/* Risk Score Gauge */}
          <div className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-700/50"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="56"
                  cy="56"
                />
                <circle
                  className={`transition-all duration-1000 ${colors.text}`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="56"
                  cy="56"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 50}`,
                    strokeDashoffset: `${
                      2 * Math.PI * 50 * (1 - displayScore / 100)
                    }`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-bold tabular-nums ${colors.text}`}
                >
                  {displayScore}
                </span>
                <span className="text-xs text-gray-500">Risk Score</span>
              </div>
            </div>
          </div>

          {/* Threat Counts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg border border-red-500/30">
              <span className="text-xs text-gray-400">Critical</span>
              <span className="text-lg font-bold text-red-400">
                {data.criticalThreats}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg border border-orange-500/30">
              <span className="text-xs text-gray-400">High</span>
              <span className="text-lg font-bold text-orange-400">
                {data.highThreats}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <span className="text-xs text-gray-400">Medium</span>
              <span className="text-lg font-bold text-yellow-400">
                {data.mediumThreats}
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">
                Total Threats
              </div>
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-400" />
                <span className="text-xl font-bold text-white">
                  {data.totalThreats}
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">
                Assets Scanned
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <span className="text-xl font-bold text-white">
                  {data.totalAssets}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Threats */}
      {showDetails && data.topThreats.length > 0 && (
        <div className="p-6 border-b border-red-500/20">
          <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
            <Crosshair className="w-4 h-4" /> Top Detected Threats
          </h4>
          <div className="space-y-2">
            {data.topThreats.slice(0, revealedThreats).map((threat, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border transition-all detection-card ${
                  threat.severity === "CRITICAL"
                    ? "bg-red-500/10 border-red-500/30"
                    : threat.severity === "HIGH"
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {getSeverityIcon(threat.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">
                      {threat.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {threat.type} • {threat.source} • {threat.asset}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      threat.severity === "CRITICAL"
                        ? "text-red-400"
                        : threat.severity === "HIGH"
                        ? "text-orange-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {threat.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      {showRecommendations && (
        <div className="p-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            AI Recommendation
          </h3>
          <div
            className={`p-5 rounded-xl border ${
              data.threatLevel === "CRITICAL" || data.threatLevel === "HIGH"
                ? "bg-red-500/10 border-red-500/30"
                : data.threatLevel === "MEDIUM"
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-green-500/10 border-green-500/30"
            }`}
          >
            <p className="text-gray-200 leading-relaxed">
              {typedRec}
              {typedRec.length < (data.recommendations?.[0]?.length || 0) && (
                <span className="inline-block w-0.5 h-5 bg-white animate-pulse ml-0.5" />
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onTakeAction}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-white py-3 px-4 rounded-xl hover:from-red-500/30 hover:to-orange-500/30 transition-all duration-200 font-medium"
            >
              <Ban className="w-4 h-4" />
              Block Threats
            </button>
            <button
              onClick={onViewDetails}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white py-3 px-4 rounded-xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-200 font-medium"
            >
              <Eye className="w-4 h-4" />
              Full Report
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-900/50 border-t border-red-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>ThreatRadar Detection Engine v3.0</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Detection Complete</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedThreatResult;
