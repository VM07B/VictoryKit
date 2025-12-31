import React, { useState } from "react";
import {
  Search,
  Globe,
  Server,
  Wifi,
  Shield,
  Target,
  Zap,
  Loader2,
  Sparkles,
  Network,
  HardDrive,
  Cloud,
  Mail,
  Clock,
  Activity,
} from "lucide-react";

interface ThreatScanFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

type ScanTarget = "network" | "endpoint" | "cloud" | "all";
type ScanDepth = "quick" | "standard" | "deep";

const SCAN_TARGETS: {
  type: ScanTarget;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    type: "all",
    label: "Full Scan",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Comprehensive scan of all assets",
  },
  {
    type: "network",
    label: "Network",
    icon: <Network className="w-4 h-4" />,
    description: "Network traffic and connections",
  },
  {
    type: "endpoint",
    label: "Endpoint",
    icon: <HardDrive className="w-4 h-4" />,
    description: "Workstations and servers",
  },
  {
    type: "cloud",
    label: "Cloud",
    icon: <Cloud className="w-4 h-4" />,
    description: "Cloud infrastructure and services",
  },
];

const DETECTION_RULES = [
  { id: "malware", label: "Malware Detection", enabled: true },
  { id: "intrusion", label: "Intrusion Detection", enabled: true },
  { id: "anomaly", label: "Behavioral Anomaly", enabled: true },
  { id: "policy", label: "Policy Violations", enabled: false },
  { id: "lateral", label: "Lateral Movement", enabled: true },
  { id: "exfiltration", label: "Data Exfiltration", enabled: true },
];

export const ThreatScanForm: React.FC<ThreatScanFormProps> = ({
  onSubmit,
  loading,
}) => {
  const [scanTarget, setScanTarget] = useState<ScanTarget>("all");
  const [scanDepth, setScanDepth] = useState<ScanDepth>("standard");
  const [targetAsset, setTargetAsset] = useState("");
  const [selectedRules, setSelectedRules] = useState<string[]>(
    DETECTION_RULES.filter((r) => r.enabled).map((r) => r.id)
  );
  const [realTimeMonitor, setRealTimeMonitor] = useState(true);
  const [autoResponse, setAutoResponse] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      scanTarget,
      scanDepth,
      targetAsset: targetAsset || "all-assets",
      selectedRules,
      realTimeMonitor,
      autoResponse,
      timestamp: new Date().toISOString(),
    });
  };

  const toggleRule = (ruleId: string) => {
    setSelectedRules((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/10 p-4 border-b border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Threat Detection</h2>
            <p className="text-xs text-gray-400">Configure and initiate scan</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Scan Target Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Scan Target
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SCAN_TARGETS.map((target) => (
              <button
                key={target.type}
                type="button"
                onClick={() => setScanTarget(target.type)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  scanTarget === target.type
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-slate-900/50 border-slate-700/50 text-gray-400 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {target.icon}
                  <span className="font-medium text-sm">{target.label}</span>
                </div>
                <p className="text-xs text-gray-500">{target.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Target Asset Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Asset (Optional)
          </label>
          <div className="relative">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={targetAsset}
              onChange={(e) => setTargetAsset(e.target.value)}
              placeholder="IP, hostname, or asset group..."
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
            />
          </div>
        </div>

        {/* Scan Depth */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Scan Depth
          </label>
          <div className="flex gap-2">
            {(["quick", "standard", "deep"] as ScanDepth[]).map((depth) => (
              <button
                key={depth}
                type="button"
                onClick={() => setScanDepth(depth)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  scanDepth === depth
                    ? depth === "quick"
                      ? "bg-green-500/20 border border-green-500/50 text-green-300"
                      : depth === "standard"
                      ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300"
                      : "bg-red-500/20 border border-red-500/50 text-red-300"
                    : "bg-slate-900/50 border border-slate-700/50 text-gray-400 hover:border-slate-600"
                }`}
              >
                {depth.charAt(0).toUpperCase() + depth.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {scanDepth === "quick" &&
              "Fast scan with essential checks (~2 min)"}
            {scanDepth === "standard" &&
              "Balanced scan with thorough analysis (~5 min)"}
            {scanDepth === "deep" &&
              "Comprehensive scan with full analysis (~15 min)"}
          </p>
        </div>

        {/* Detection Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Detection Rules
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DETECTION_RULES.map((rule) => (
              <button
                key={rule.id}
                type="button"
                onClick={() => toggleRule(rule.id)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  selectedRules.includes(rule.id)
                    ? "bg-red-500/20 border border-red-500/50 text-red-300"
                    : "bg-slate-900/50 border border-slate-700/50 text-gray-500 hover:border-slate-600"
                }`}
              >
                {rule.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${
                realTimeMonitor ? "bg-red-500" : "bg-slate-700"
              }`}
              onClick={() => setRealTimeMonitor(!realTimeMonitor)}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  realTimeMonitor ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <div>
              <span className="text-sm text-gray-300">
                Real-time Monitoring
              </span>
              <p className="text-xs text-gray-500">
                Continue monitoring after scan
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${
                autoResponse ? "bg-orange-500" : "bg-slate-700"
              }`}
              onClick={() => setAutoResponse(!autoResponse)}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoResponse ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <div>
              <span className="text-sm text-gray-300">Auto Response</span>
              <p className="text-xs text-gray-500">
                Automatically block detected threats
              </p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-semibold text-white hover:from-red-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Start Threat Detection</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ThreatScanForm;
