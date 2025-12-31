import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Database,
  Cloud,
  FileText,
  Globe,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  Heart,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  FileBarChart,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  Zap,
  Target,
  Layers,
  RefreshCcw,
} from "lucide-react";

interface DataFinding {
  id: string;
  type: "pii" | "phi" | "pci" | "confidential" | "credentials" | "ip";
  category: string;
  location: string;
  source: string;
  count: number;
  risk: "critical" | "high" | "medium" | "low";
  encrypted: boolean;
  samples?: string[];
}

interface Recommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  regulations: string[];
}

interface AnimatedDataGuardianResultProps {
  result: {
    scanId: string;
    scanName: string;
    completedAt: Date;
    duration: number;
    privacyScore: number;
    protectionLevel: "excellent" | "good" | "moderate" | "poor" | "critical";
    totalRecords: number;
    totalFindings: number;
    findingsByType: { type: string; count: number; risk: string }[];
    findingsBySource: { source: string; sourceType: string; count: number }[];
    topRisks: DataFinding[];
    encryptionStatus: {
      encrypted: number;
      unencrypted: number;
      partial: number;
    };
    regulationCompliance: {
      regulation: string;
      status: "compliant" | "partial" | "non-compliant";
      issues: number;
    }[];
    recommendations: Recommendation[];
    dataMap: {
      category: string;
      locations: string[];
      totalCount: number;
    }[];
  };
  onReset: () => void;
}

const AnimatedDataGuardianResult: React.FC<AnimatedDataGuardianResultProps> = ({
  result,
  onReset,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "findings" | "compliance" | "recommendations"
  >("overview");
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = result.privacyScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= result.privacyScore) {
        setAnimatedScore(result.privacyScore);
        clearInterval(timer);
        setTimeout(() => setShowDetails(true), 300);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.privacyScore]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreStroke = (score: number) => {
    if (score >= 90) return "#4ade80";
    if (score >= 75) return "#34d399";
    if (score >= 60) return "#facc15";
    if (score >= 40) return "#fb923c";
    return "#f87171";
  };

  const getProtectionIcon = () => {
    switch (result.protectionLevel) {
      case "excellent":
        return ShieldCheck;
      case "good":
        return Shield;
      case "moderate":
        return ShieldAlert;
      case "poor":
        return ShieldAlert;
      case "critical":
        return ShieldX;
      default:
        return Shield;
    }
  };

  const getProtectionColor = () => {
    switch (result.protectionLevel) {
      case "excellent":
        return "text-green-400 bg-green-900/30 border-green-500/30";
      case "good":
        return "text-emerald-400 bg-emerald-900/30 border-emerald-500/30";
      case "moderate":
        return "text-yellow-400 bg-yellow-900/30 border-yellow-500/30";
      case "poor":
        return "text-orange-400 bg-orange-900/30 border-orange-500/30";
      case "critical":
        return "text-red-400 bg-red-900/30 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-900/30 border-gray-500/30";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pii":
        return "bg-red-500";
      case "phi":
        return "bg-purple-500";
      case "pci":
        return "bg-amber-500";
      case "confidential":
        return "bg-blue-500";
      case "credentials":
        return "bg-rose-500";
      case "ip":
        return "bg-cyan-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "database":
        return Database;
      case "cloud":
        return Cloud;
      case "file":
        return FileText;
      case "api":
        return Globe;
      default:
        return Database;
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "critical":
        return XCircle;
      case "high":
        return AlertTriangle;
      case "medium":
        return AlertCircle;
      case "low":
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  const ProtectionIcon = getProtectionIcon();

  const toggleRisk = (riskId: string) => {
    const newExpanded = new Set(expandedRisks);
    if (newExpanded.has(riskId)) {
      newExpanded.delete(riskId);
    } else {
      newExpanded.add(riskId);
    }
    setExpandedRisks(newExpanded);
  };

  return (
    <div className="bg-green-950/30 rounded-2xl border border-green-800/30 overflow-hidden">
      {/* Header with Score */}
      <div className="p-6 text-center border-b border-green-800/30 bg-gradient-to-b from-green-900/20 to-transparent">
        {/* Animated Score Ring */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <svg className="w-36 h-36 score-ring">
            <circle
              cx="72"
              cy="72"
              r="54"
              fill="none"
              strokeWidth="8"
              className="score-ring-bg"
            />
            <circle
              cx="72"
              cy="72"
              r="54"
              fill="none"
              strokeWidth="8"
              stroke={getScoreStroke(animatedScore)}
              strokeLinecap="round"
              className="score-ring-progress"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl font-bold ${getScoreColor(animatedScore)}`}
            >
              {animatedScore}
            </span>
            <span className="text-xs text-green-500">Privacy Score</span>
          </div>
        </div>

        {/* Protection Level Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getProtectionColor()}`}
        >
          <ProtectionIcon className="w-5 h-5" />
          <span className="font-semibold capitalize">
            {result.protectionLevel} Protection
          </span>
        </div>

        {/* Quick Stats */}
        <div
          className={`grid grid-cols-4 gap-3 mt-6 transition-all duration-500 ${
            showDetails
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div className="text-center p-3 bg-green-900/30 rounded-lg">
            <Database className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-100">
              {result.totalRecords.toLocaleString()}
            </p>
            <p className="text-xs text-green-500">Records Scanned</p>
          </div>
          <div className="text-center p-3 bg-red-900/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-400">
              {result.totalFindings}
            </p>
            <p className="text-xs text-green-500">Findings</p>
          </div>
          <div className="text-center p-3 bg-green-900/30 rounded-lg">
            <Lock className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-400">
              {result.encryptionStatus.encrypted}
            </p>
            <p className="text-xs text-green-500">Encrypted</p>
          </div>
          <div className="text-center p-3 bg-orange-900/30 rounded-lg">
            <Unlock className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-400">
              {result.encryptionStatus.unencrypted}
            </p>
            <p className="text-xs text-green-500">Unencrypted</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-800/30">
        {[
          { id: "overview", label: "Overview", icon: PieChart },
          { id: "findings", label: "Findings", icon: Eye },
          { id: "compliance", label: "Compliance", icon: ShieldCheck },
          { id: "recommendations", label: "Remediation", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "text-green-300 border-b-2 border-green-400 bg-green-900/20"
                  : "text-green-500 hover:text-green-400 hover:bg-green-900/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div
            className={`space-y-6 transition-all duration-500 ${
              showDetails ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Findings by Type */}
            <div>
              <h4 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Findings Distribution
              </h4>
              <div className="space-y-2">
                {result.findingsByType.map((item, idx) => {
                  const maxCount = Math.max(
                    ...result.findingsByType.map((f) => f.count)
                  );
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-green-400 w-20 uppercase">
                        {item.type}
                      </span>
                      <div className="flex-1 h-2 bg-green-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getTypeColor(
                            item.type
                          )}`}
                          style={{
                            width: `${percentage}%`,
                            transition: "width 1s ease-out",
                          }}
                        />
                      </div>
                      <span className="text-xs text-green-300 w-12 text-right">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Findings by Source */}
            <div>
              <h4 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" /> By Data Source
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {result.findingsBySource.map((source, idx) => {
                  const Icon = getSourceIcon(source.sourceType);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-800/30"
                    >
                      <div className={`source-icon ${source.sourceType}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-green-200 truncate">
                          {source.source}
                        </p>
                        <p className="text-xs text-green-500">
                          {source.count} findings
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Map */}
            <div>
              <h4 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Sensitive Data Map
              </h4>
              <div className="space-y-2">
                {result.dataMap.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-200">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-500">
                        {item.locations.length} locations
                      </span>
                      <span className="text-xs text-green-400 font-medium">
                        {item.totalCount} records
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Findings Tab */}
        {activeTab === "findings" && (
          <div className="space-y-3">
            {result.topRisks.map((risk) => {
              const RiskIcon = getRiskIcon(risk.risk);
              const isExpanded = expandedRisks.has(risk.id);

              return (
                <div
                  key={risk.id}
                  className={`rounded-lg border overflow-hidden transition-all ${
                    risk.risk === "critical"
                      ? "bg-red-900/20 border-red-800/30"
                      : risk.risk === "high"
                      ? "bg-orange-900/20 border-orange-800/30"
                      : risk.risk === "medium"
                      ? "bg-yellow-900/20 border-yellow-800/30"
                      : "bg-green-900/20 border-green-800/30"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => toggleRisk(risk.id)}
                  >
                    <RiskIcon
                      className={`w-5 h-5 ${
                        risk.risk === "critical"
                          ? "text-red-400"
                          : risk.risk === "high"
                          ? "text-orange-400"
                          : risk.risk === "medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`privacy-badge ${risk.type} active`}>
                          {risk.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-green-200">
                          {risk.category}
                        </span>
                      </div>
                      <p className="text-xs text-green-500 truncate mt-1">
                        {risk.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-200">
                        {risk.count}
                      </p>
                      <p className="text-xs text-green-500">records</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-green-500" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-500">
                          Source: {risk.source}
                        </span>
                        {risk.encrypted ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Encrypted
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Unencrypted
                          </span>
                        )}
                      </div>
                      {risk.samples && risk.samples.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-green-500 mb-1">
                            Sample (masked):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {risk.samples.map((sample, idx) => (
                              <code
                                key={idx}
                                className="px-2 py-1 bg-green-950/50 rounded text-xs text-green-300"
                              >
                                {sample}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === "compliance" && (
          <div className="space-y-4">
            {result.regulationCompliance.map((reg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  reg.status === "compliant"
                    ? "bg-green-900/20 border-green-700/30"
                    : reg.status === "partial"
                    ? "bg-yellow-900/20 border-yellow-700/30"
                    : "bg-red-900/20 border-red-700/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {reg.status === "compliant" && (
                      <ShieldCheck className="w-5 h-5 text-green-400" />
                    )}
                    {reg.status === "partial" && (
                      <ShieldAlert className="w-5 h-5 text-yellow-400" />
                    )}
                    {reg.status === "non-compliant" && (
                      <ShieldX className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-lg font-semibold text-green-200">
                      {reg.regulation}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reg.status === "compliant"
                          ? "bg-green-600 text-white"
                          : reg.status === "partial"
                          ? "bg-yellow-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {reg.status === "compliant"
                        ? "Compliant"
                        : reg.status === "partial"
                        ? "Partial"
                        : "Non-Compliant"}
                    </span>
                  </div>
                </div>
                {reg.issues > 0 && (
                  <p className="text-sm text-green-400 mt-2">
                    {reg.issues} issue{reg.issues > 1 ? "s" : ""} require
                    attention
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="space-y-3">
            {result.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border ${
                  rec.priority === "critical"
                    ? "bg-red-900/20 border-red-800/30"
                    : rec.priority === "high"
                    ? "bg-orange-900/20 border-orange-800/30"
                    : rec.priority === "medium"
                    ? "bg-yellow-900/20 border-yellow-800/30"
                    : "bg-green-900/20 border-green-800/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      rec.priority === "critical"
                        ? "bg-red-900/50"
                        : rec.priority === "high"
                        ? "bg-orange-900/50"
                        : rec.priority === "medium"
                        ? "bg-yellow-900/50"
                        : "bg-green-900/50"
                    }`}
                  >
                    <Zap
                      className={`w-4 h-4 ${
                        rec.priority === "critical"
                          ? "text-red-400"
                          : rec.priority === "high"
                          ? "text-orange-400"
                          : rec.priority === "medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                          rec.priority === "critical"
                            ? "bg-red-600 text-white"
                            : rec.priority === "high"
                            ? "bg-orange-600 text-white"
                            : rec.priority === "medium"
                            ? "bg-yellow-600 text-white"
                            : "bg-green-600 text-white"
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <span className="text-xs text-green-500">
                        {rec.category}
                      </span>
                    </div>
                    <h5 className="text-sm font-semibold text-green-200">
                      {rec.title}
                    </h5>
                    <p className="text-xs text-green-400 mt-1">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-green-500">
                        Impact: {rec.impact}
                      </span>
                      <span
                        className={`${
                          rec.effort === "low"
                            ? "text-green-400"
                            : rec.effort === "medium"
                            ? "text-yellow-400"
                            : "text-orange-400"
                        }`}
                      >
                        Effort: {rec.effort}
                      </span>
                    </div>
                    {rec.regulations.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-green-600">
                          Regulations:
                        </span>
                        {rec.regulations.map((r) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.5 bg-green-900/50 rounded text-xs text-green-300"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-green-800/30 bg-green-900/10">
        <div className="flex items-center justify-between">
          <div className="text-xs text-green-500 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Completed in {Math.round(result.duration / 1000)}s at{" "}
            {result.completedAt.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-green-900/30 border border-green-700/50 rounded-lg text-sm text-green-300 hover:bg-green-800/30 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              New Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedDataGuardianResult;
