import { useState, useEffect } from "react";
import {
  Flame,
  Shield,
  AlertTriangle,
  CheckCircle,
  Globe,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  ArrowRight,
  ArrowLeft,
  Ban,
} from "lucide-react";

interface Rule {
  id: string;
  name: string;
  source: string;
  destination: string;
  port: string;
  protocol: string;
  action: "allow" | "deny" | "drop";
  hits: number;
}

interface ScanResult {
  totalRules: number;
  activeRules: number;
  blockedToday: number;
  rules: Rule[];
  trafficStats: { direction: string; allowed: number; blocked: number }[];
  scanTime: string;
}

const mockRules: Rule[] = [
  {
    id: "1",
    name: "Allow HTTPS Inbound",
    source: "0.0.0.0/0",
    destination: "10.0.1.0/24",
    port: "443",
    protocol: "TCP",
    action: "allow",
    hits: 45678,
  },
  {
    id: "2",
    name: "Block SSH External",
    source: "0.0.0.0/0",
    destination: "10.0.0.0/8",
    port: "22",
    protocol: "TCP",
    action: "deny",
    hits: 1234,
  },
  {
    id: "3",
    name: "Allow Internal DNS",
    source: "10.0.0.0/8",
    destination: "10.0.1.53",
    port: "53",
    protocol: "UDP",
    action: "allow",
    hits: 89012,
  },
  {
    id: "4",
    name: "Drop ICMP Flood",
    source: "Any",
    destination: "Any",
    port: "*",
    protocol: "ICMP",
    action: "drop",
    hits: 567,
  },
  {
    id: "5",
    name: "Allow DB Access",
    source: "10.0.2.0/24",
    destination: "10.0.1.20",
    port: "5432",
    protocol: "TCP",
    action: "allow",
    hits: 23456,
  },
];

export default function FirewallManagerTool() {
  const [firewallName, setFirewallName] = useState("");
  const [ruleType, setRuleType] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveRules, setLiveRules] = useState<Rule[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 12, 95));
        if (Math.random() > 0.5 && liveRules.length < 5) {
          setLiveRules((prev) => [...prev, mockRules[prev.length]]);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, liveRules.length]);

  const handleAnalyze = () => {
    if (!firewallName) return;
    setIsAnalyzing(true);
    setLiveRules([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setScanProgress(100);
      setResult({
        totalRules: 156,
        activeRules: 142,
        blockedToday: 12456,
        rules: mockRules,
        trafficStats: [
          { direction: "Inbound", allowed: 456789, blocked: 12345 },
          { direction: "Outbound", allowed: 789012, blocked: 567 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getActionColor = (action: string) => {
    if (action === "allow") return "bg-green-600 text-white";
    if (action === "deny") return "bg-red-600 text-white";
    return "bg-gray-600 text-white";
  };

  const getActionIcon = (action: string) => {
    if (action === "allow") return <CheckCircle className="w-3 h-3" />;
    if (action === "deny") return <Ban className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 mb-4 animate-flameFlicker">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            FirewallManager
          </h1>
          <p className="text-red-300">Firewall Configuration Management</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-red-900/30 backdrop-blur-sm rounded-2xl border border-red-700/50 p-6">
            <h2 className="text-lg font-semibold text-red-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Firewall Config
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2">
                  Firewall Name
                </label>
                <input
                  type="text"
                  value={firewallName}
                  onChange={(e) => setFirewallName(e.target.value)}
                  placeholder="prod-firewall-01"
                  className="firewall-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2">
                  Rule Type
                </label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                  className="firewall-input w-full"
                >
                  <option value="all">All Rules</option>
                  <option value="allow">Allow Rules</option>
                  <option value="deny">Deny Rules</option>
                  <option value="inactive">Inactive Rules</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Inbound", "Outbound", "NAT", "VPN"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-700/30 cursor-pointer hover:border-red-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-red-500"
                    />
                    <span className="text-xs text-red-200">{type}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !firewallName}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Rules...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze Firewall
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-red-900/30 backdrop-blur-sm rounded-2xl border border-red-700/50 p-6">
            <h2 className="text-lg font-semibold text-red-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" />
              Rule Analysis
              {isAnalyzing && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </h2>

            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-red-300 mb-2">
                  <span>Analyzing</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-red-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveRules.length === 0 && !isAnalyzing && (
                <div className="text-center py-8 text-red-500">
                  <Flame className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter firewall name to analyze</p>
                </div>
              )}
              {liveRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="firewall-card animate-shieldBlock"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-red-100 font-medium truncate flex-1">
                      {rule.name}
                    </span>
                    <span
                      className={`rule-action ${rule.action} flex items-center gap-1`}
                    >
                      {getActionIcon(rule.action)}
                      {rule.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <span className="truncate">{rule.source}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{rule.destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-red-500">
                      {rule.protocol}:{rule.port}
                    </span>
                    <span className="text-red-400">
                      {rule.hits.toLocaleString()} hits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-red-900/30 backdrop-blur-sm rounded-2xl border border-red-700/50 p-6">
            <h2 className="text-lg font-semibold text-red-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-400" />
              Firewall Status
            </h2>

            {!result ? (
              <div className="text-center py-12 text-red-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Analyze firewall to view status</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-red-950/50 text-center">
                    <p className="text-2xl font-bold text-white">
                      {result.totalRules}
                    </p>
                    <p className="text-xs text-red-400">Rules</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-950/50 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {result.activeRules}
                    </p>
                    <p className="text-xs text-red-400">Active</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-950/50 text-center">
                    <p className="text-2xl font-bold text-orange-400">
                      {(result.blockedToday / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-red-400">Blocked</p>
                  </div>
                </div>

                {/* Traffic Stats */}
                <div>
                  <p className="text-sm font-medium text-red-300 mb-2">
                    Traffic Analysis
                  </p>
                  <div className="space-y-3">
                    {result.trafficStats.map((stat) => (
                      <div
                        key={stat.direction}
                        className="p-3 rounded-lg bg-red-950/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-red-100 flex items-center gap-2">
                            {stat.direction === "Inbound" ? (
                              <ArrowLeft className="w-4 h-4" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                            {stat.direction}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span className="text-green-400">
                            ✓ {(stat.allowed / 1000).toFixed(0)}k allowed
                          </span>
                          <span className="text-red-400">
                            ✗ {(stat.blocked / 1000).toFixed(1)}k blocked
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Rules */}
                <div>
                  <p className="text-sm font-medium text-red-300 mb-2">
                    Top Rules
                  </p>
                  <div className="space-y-1">
                    {result.rules.slice(0, 3).map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between text-xs p-2 rounded bg-red-950/30"
                      >
                        <span className="text-red-200 truncate flex-1">
                          {rule.name}
                        </span>
                        <span className="text-red-400">
                          {(rule.hits / 1000).toFixed(1)}k
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-red-500 text-center">
                  Analyzed at {result.scanTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
