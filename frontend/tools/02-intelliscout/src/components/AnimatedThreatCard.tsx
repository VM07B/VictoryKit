import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Globe,
  Server,
  Hash,
  Mail,
  Link2,
  Target,
  Clock,
  MapPin,
  Building2,
  Fingerprint,
  Skull,
  Bug,
  Crosshair,
  ExternalLink,
  Copy,
  Share2,
  Layers,
  Zap,
  Eye,
  Download,
  Lock,
  Sparkles,
} from "lucide-react";

export interface ThreatResult {
  indicator: string;
  indicatorType: string;
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "CLEAN";
  confidence: number;
  totalSources: number;
  hitsFound: number;
  threatType: string;
  relatedCampaigns: string[];
  recommendation: string;
  firstSeen?: string;
  lastSeen?: string;
  geoData?: {
    country?: string;
    asn?: string;
    isp?: string;
  };
  tags?: string[];
  malwareFamily?: string;
  attackVectors?: string[];
  targetSectors?: string[];
}

interface AnimatedThreatCardProps {
  data: ThreatResult | null;
  isAnalyzing?: boolean;
  onViewDetails?: () => void;
  onExport?: () => void;
}

export const AnimatedThreatCard: React.FC<AnimatedThreatCardProps> = ({
  data,
  onViewDetails,
  onExport,
}) => {
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [typedRecommendation, setTypedRecommendation] = useState("");
  const [revealedTags, setRevealedTags] = useState(0);
  const [pulseRing, setPulseRing] = useState(true);

  useEffect(() => {
    if (!data) {
      setDisplayConfidence(0);
      setShowDetails(false);
      setShowRecommendation(false);
      setRevealedTags(0);
      setTypedRecommendation("");
      return;
    }

    let current = 0;
    const target = data.confidence;
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
      setDisplayConfidence(Math.round(current));
    }, stepTime);

    return () => clearInterval(timer);
  }, [data]);

  useEffect(() => {
    if (!showDetails || !data?.tags) return;

    const interval = setInterval(() => {
      setRevealedTags((prev) => {
        if (prev >= (data.tags?.length || 0)) {
          clearInterval(interval);
          setTimeout(() => setShowRecommendation(true), 300);
          return prev;
        }
        return prev + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [showDetails, data?.tags]);

  useEffect(() => {
    if (!showRecommendation || !data?.recommendation) return;

    let index = 0;
    const text = data.recommendation;

    const interval = setInterval(() => {
      if (index <= text.length) {
        setTypedRecommendation(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setPulseRing(false);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [showRecommendation, data?.recommendation]);

  useEffect(() => {
    if (data) setPulseRing(true);
  }, [data]);

  if (!data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-cyan-500/30 p-8 text-center relative overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <div
              className="w-24 h-24 rounded-full border-4 border-dashed border-cyan-500/30 flex items-center justify-center animate-spin"
              style={{ animationDuration: "10s" }}
            >
              <Target className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Awaiting Intelligence
          </h3>
          <p className="text-gray-400 max-w-xs mx-auto">
            Submit an indicator to receive comprehensive threat intelligence
            analysis
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
        };
      case "HIGH":
        return {
          text: "text-orange-500",
          bg: "from-orange-500",
          border: "border-orange-500",
        };
      case "MEDIUM":
        return {
          text: "text-yellow-500",
          bg: "from-yellow-500",
          border: "border-yellow-500",
        };
      case "LOW":
        return {
          text: "text-blue-500",
          bg: "from-blue-500",
          border: "border-blue-500",
        };
      default:
        return {
          text: "text-green-500",
          bg: "from-green-500",
          border: "border-green-500",
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

  const getIndicatorIcon = () => {
    switch (data.indicatorType) {
      case "ip":
        return <Server className="w-5 h-5" />;
      case "domain":
        return <Globe className="w-5 h-5" />;
      case "hash":
        return <Hash className="w-5 h-5" />;
      case "email":
        return <Mail className="w-5 h-5" />;
      case "url":
        return <Link2 className="w-5 h-5" />;
      default:
        return <Fingerprint className="w-5 h-5" />;
    }
  };

  const colors = getThreatColor();

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-cyan-500/30 overflow-hidden relative">
      <div
        className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${colors.bg}/10 to-transparent pointer-events-none`}
      />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/10 to-transparent pointer-events-none" />

      <div
        className={`bg-gradient-to-r ${colors.bg}/20 to-cyan-500/10 p-6 relative overflow-hidden`}
      >
        {pulseRing && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-pulse" />
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} to-cyan-500 flex items-center justify-center shadow-lg`}
              >
                <Target className="w-7 h-7 text-white" />
              </div>
              {pulseRing && (
                <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-ping" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Threat Intelligence
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </h2>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {new Date().toLocaleTimeString()}
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

      <div className="px-6 py-4 border-b border-cyan-500/20 bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            {getIndicatorIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Analyzed Indicator
            </div>
            <div className="font-mono text-white truncate">
              {data.indicator}
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(data.indicator)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-cyan-500/20">
        <div className="grid grid-cols-3 gap-6">
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
                      2 * Math.PI * 50 * (1 - displayConfidence / 100)
                    }`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-bold tabular-nums ${colors.text}`}
                >
                  {displayConfidence}%
                </span>
                <span className="text-xs text-gray-500">Confidence</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {data.totalSources}
                </div>
                <div className="text-xs text-gray-500">Sources</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {data.hitsFound}
                </div>
                <div className="text-xs text-gray-500">Hits</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">
                Threat Type
              </div>
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-white">
                  {data.threatType}
                </span>
              </div>
            </div>
            {data.malwareFamily && (
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Malware
                </div>
                <div className="flex items-center gap-2">
                  <Skull className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-red-300">
                    {data.malwareFamily}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="p-6 border-b border-cyan-500/20">
          {data.tags && data.tags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.tags.slice(0, revealedTags).map((tag, i) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.relatedCampaigns.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                <Crosshair className="w-4 h-4" /> Campaigns
              </h4>
              <div className="space-y-2">
                {data.relatedCampaigns.map((campaign) => (
                  <div
                    key={campaign}
                    className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <Target className="w-4 h-4 text-red-400" />
                    <span className="text-red-300">{campaign}</span>
                    <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(data.geoData?.country || data.geoData?.asn) && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {data.geoData?.country && (
                <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="font-semibold text-white">
                      {data.geoData.country}
                    </div>
                  </div>
                </div>
              )}
              {data.geoData?.asn && (
                <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg">
                  <Building2 className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-xs text-gray-500">ASN</div>
                    <div className="font-semibold text-white text-sm truncate">
                      {data.geoData.asn}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showRecommendation && (
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
              {typedRecommendation}
              {typedRecommendation.length <
                (data.recommendation?.length || 0) && (
                <span className="inline-block w-0.5 h-5 bg-white animate-pulse ml-0.5" />
              )}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onViewDetails}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white py-3 px-4 rounded-xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-200 font-medium"
            >
              <Eye className="w-4 h-4" />
              Full Report
            </button>
            <button
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white py-3 px-4 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 font-medium"
            >
              <Download className="w-4 h-4" />
              Export STIX
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-4 bg-slate-900/50 border-t border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>IntelliScout Threat Intelligence Engine v2.1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Analysis Complete</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedThreatCard;
