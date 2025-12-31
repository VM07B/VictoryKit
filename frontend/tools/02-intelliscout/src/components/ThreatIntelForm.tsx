import React, { useState } from "react";
import {
  Search,
  Globe,
  Hash,
  Mail,
  Link2,
  Server,
  Target,
  Zap,
  Shield,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ThreatIntelFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

type IndicatorType = "ip" | "domain" | "hash" | "email" | "url" | "auto";

const INDICATOR_TYPES: {
  type: IndicatorType;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
}[] = [
  {
    type: "auto",
    label: "Auto-Detect",
    icon: <Sparkles className="w-4 h-4" />,
    placeholder: "Enter any indicator...",
  },
  {
    type: "ip",
    label: "IP Address",
    icon: <Server className="w-4 h-4" />,
    placeholder: "192.168.1.1",
  },
  {
    type: "domain",
    label: "Domain",
    icon: <Globe className="w-4 h-4" />,
    placeholder: "malicious-domain.com",
  },
  {
    type: "hash",
    label: "File Hash",
    icon: <Hash className="w-4 h-4" />,
    placeholder: "SHA256/MD5 hash...",
  },
  {
    type: "email",
    label: "Email",
    icon: <Mail className="w-4 h-4" />,
    placeholder: "attacker@example.com",
  },
  {
    type: "url",
    label: "URL",
    icon: <Link2 className="w-4 h-4" />,
    placeholder: "https://...",
  },
];

const THREAT_SOURCES = [
  { id: "all", label: "All Sources", count: 47 },
  { id: "misp", label: "MISP", count: 12 },
  { id: "virustotal", label: "VirusTotal", count: 8 },
  { id: "alienvault", label: "AlienVault OTX", count: 15 },
  { id: "abuse", label: "AbuseIPDB", count: 6 },
  { id: "shodan", label: "Shodan", count: 4 },
  { id: "custom", label: "Custom Feeds", count: 2 },
];

export const ThreatIntelForm: React.FC<ThreatIntelFormProps> = ({
  onSubmit,
  loading,
}) => {
  const [indicatorType, setIndicatorType] = useState<IndicatorType>("auto");
  const [indicator, setIndicator] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["all"]);
  const [deepAnalysis, setDeepAnalysis] = useState(true);
  const [correlateThreats, setCorrelateThreats] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      indicator,
      type: indicatorType,
      sources: selectedSources,
      deepAnalysis,
      correlateThreats,
      timestamp: new Date().toISOString(),
    });
  };

  const toggleSource = (sourceId: string) => {
    if (sourceId === "all") {
      setSelectedSources(["all"]);
    } else {
      const newSources = selectedSources.filter((s) => s !== "all");
      if (newSources.includes(sourceId)) {
        setSelectedSources(newSources.filter((s) => s !== sourceId));
      } else {
        setSelectedSources([...newSources, sourceId]);
      }
    }
  };

  const detectIndicatorType = (value: string): string => {
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return "IP Address";
    if (/^[a-fA-F0-9]{32,64}$/.test(value)) return "File Hash";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email";
    if (/^https?:\/\//.test(value)) return "URL";
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(value)) return "Domain";
    return "Unknown";
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-emerald-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-4 border-b border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Threat Intelligence Lookup
            </h2>
            <p className="text-sm text-gray-400">
              Search across 47 threat intel sources
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Indicator Type Selection */}
        <div>
          <label className="block text-sm font-medium text-emerald-200 mb-3">
            Indicator Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {INDICATOR_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setIndicatorType(type)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  indicatorType === type
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-900/50 border-slate-700/50 text-gray-400 hover:border-emerald-500/30"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Indicator Input */}
        <div>
          <label className="block text-sm font-medium text-emerald-200 mb-2">
            Indicator Value
            {indicatorType === "auto" && indicator && (
              <span className="ml-2 text-xs text-cyan-400">
                Detected: {detectIndicatorType(indicator)}
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              placeholder={
                INDICATOR_TYPES.find((t) => t.type === indicatorType)
                  ?.placeholder
              }
              className="w-full bg-slate-900/50 border border-emerald-500/30 rounded-lg px-4 py-3.5 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Target className="w-5 h-5 text-emerald-400/50" />
            </div>
          </div>
        </div>

        {/* Source Selection */}
        <div>
          <label className="block text-sm font-medium text-emerald-200 mb-3">
            Intelligence Sources
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THREAT_SOURCES.map(({ id, label, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleSource(id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  selectedSources.includes(id)
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                    : "bg-slate-900/50 border-slate-700/50 text-gray-400 hover:border-cyan-500/30"
                }`}
              >
                <span>{label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800/50">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Options */}
        <div className="border-t border-emerald-500/20 pt-4">
          <label className="block text-sm font-medium text-emerald-200 mb-3">
            Analysis Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-all ${
                  deepAnalysis ? "bg-emerald-500" : "bg-slate-700"
                } relative`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    deepAnalysis ? "left-5" : "left-1"
                  }`}
                />
              </div>
              <input
                type="checkbox"
                checked={deepAnalysis}
                onChange={(e) => setDeepAnalysis(e.target.checked)}
                className="sr-only"
              />
              <div>
                <span className="text-sm text-white group-hover:text-emerald-300 transition-colors">
                  Deep Analysis Mode
                </span>
                <p className="text-xs text-gray-500">
                  Run ML models for threat classification
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-all ${
                  correlateThreats ? "bg-cyan-500" : "bg-slate-700"
                } relative`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    correlateThreats ? "left-5" : "left-1"
                  }`}
                />
              </div>
              <input
                type="checkbox"
                checked={correlateThreats}
                onChange={(e) => setCorrelateThreats(e.target.checked)}
                className="sr-only"
              />
              <div>
                <span className="text-sm text-white group-hover:text-cyan-300 transition-colors">
                  Correlate Related Threats
                </span>
                <p className="text-xs text-gray-500">
                  Link to known campaigns & actors
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !indicator.trim()}
          className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gathering Intelligence...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Initiate Threat Lookup
            </>
          )}
        </button>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
            <div className="text-2xl font-bold text-emerald-400">47</div>
            <div className="text-xs text-gray-500">Sources</div>
          </div>
          <div className="text-center p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
            <div className="text-2xl font-bold text-cyan-400">2.3M</div>
            <div className="text-xs text-gray-500">IOCs</div>
          </div>
          <div className="text-center p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
            <div className="text-2xl font-bold text-yellow-400">&lt;1s</div>
            <div className="text-xs text-gray-500">Avg Time</div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ThreatIntelForm;
