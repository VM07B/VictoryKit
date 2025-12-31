import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  Server,
  Ban,
  Cpu,
  RefreshCw,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { ddosShieldAPI } from "../services/ddosshieldAPI";
import type { DDoSAttack, TrafficStats, MitigationRule } from "../types";

const DDoSShieldDashboard: React.FC = () => {
  const [traffic, setTraffic] = useState<TrafficStats | null>(null);
  const [attacks, setAttacks] = useState<DDoSAttack[]>([]);
  const [rules, setRules] = useState<MitigationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trafficData, attacksData, rulesData] = await Promise.all([
        ddosShieldAPI.getTrafficStats(),
        ddosShieldAPI.getActiveAttacks(),
        ddosShieldAPI.getMitigationRules(),
      ]);
      setTraffic(trafficData);
      setAttacks(attacksData);
      setRules(rulesData);
    } catch {
      setTraffic({
        inboundBandwidth: 8.5,
        outboundBandwidth: 2.3,
        packetsPerSecond: 125000,
        connectionsPerSecond: 4500,
        blockedRequests: 89234,
        cleanTraffic: 98.7,
      });
      setAttacks([
        {
          _id: "1",
          type: "volumetric",
          source: ["45.33.32.156", "203.0.113.45"],
          target: "api.fyzo.xyz",
          peakBandwidth: 45,
          packetsPerSecond: 8500000,
          startTime: "2024-01-15T10:00:00Z",
          status: "active",
          severity: "high",
        },
        {
          _id: "2",
          type: "application",
          source: ["192.0.2.100"],
          target: "dashboard.fyzo.xyz",
          peakBandwidth: 2.5,
          packetsPerSecond: 50000,
          startTime: "2024-01-15T09:30:00Z",
          endTime: "2024-01-15T10:00:00Z",
          status: "mitigated",
          severity: "medium",
        },
      ]);
      setRules([
        {
          _id: "1",
          name: "SYN Flood Protection",
          type: "protocol",
          threshold: 10000,
          action: "rate_limit",
          enabled: true,
          triggeredCount: 1523,
        },
        {
          _id: "2",
          name: "HTTP Flood Protection",
          type: "application",
          threshold: 1000,
          action: "challenge",
          enabled: true,
          triggeredCount: 892,
        },
        {
          _id: "3",
          name: "UDP Amplification Block",
          type: "volumetric",
          threshold: 100,
          action: "block",
          enabled: true,
          triggeredCount: 456,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (id: string, enabled: boolean) => {
    setRules((prev) => prev.map((r) => (r._id === id ? { ...r, enabled } : r)));
    try {
      await ddosShieldAPI.toggleRule(id, enabled);
    } catch {}
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "text-red-500 bg-red-500/20",
      high: "text-orange-400 bg-orange-500/20",
      medium: "text-yellow-400 bg-yellow-500/20",
      low: "text-green-400 bg-green-500/20",
    };
    return colors[severity] || colors.low;
  };

  return (
    <div className="min-h-screen matrix-bg">
      <header className="bg-gray-900/80 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DDoSShield</h1>
              <p className="text-sm text-gray-400">
                AI-Powered DDoS Attack Mitigation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-300 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
            <Link
              to="/maula-ai"
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" /> Live Assistant
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {traffic && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {traffic.inboundBandwidth} Gbps
                  </p>
                  <p className="text-sm text-gray-400">Inbound</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {traffic.outboundBandwidth} Gbps
                  </p>
                  <p className="text-sm text-gray-400">Outbound</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {(traffic.packetsPerSecond / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-gray-400">Packets/sec</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Wifi className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {traffic.connectionsPerSecond.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Conn/sec</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {(traffic.blockedRequests / 1000).toFixed(1)}K
                  </p>
                  <p className="text-sm text-gray-400">Blocked</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {traffic.cleanTraffic}%
                  </p>
                  <p className="text-sm text-gray-400">Clean Traffic</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Active
                Attacks
              </h2>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                {attacks.filter((a) => a.status === "active").length} active
              </span>
            </div>
            <div className="space-y-4">
              {attacks.map((attack) => (
                <div
                  key={attack._id}
                  className={`p-4 rounded-lg border ${
                    attack.status === "active"
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-gray-700 bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                          attack.severity
                        )}`}
                      >
                        {attack.severity.toUpperCase()}
                      </span>
                      <span className="text-sm font-mono text-gray-300">
                        {attack.type}
                      </span>
                    </div>
                    <span
                      className={`text-xs ${
                        attack.status === "active"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {attack.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Target:</span>{" "}
                      <span className="text-gray-300">{attack.target}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Peak:</span>{" "}
                      <span className="text-gray-300">
                        {attack.peakBandwidth} Gbps
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sources:</span>{" "}
                      <span className="text-gray-300">
                        {attack.source.length} IPs
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">PPS:</span>{" "}
                      <span className="text-gray-300">
                        {(attack.packetsPerSecond / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" /> Mitigation Rules
              </h2>
            </div>
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule._id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRule(rule._id, !rule.enabled)}
                      className={`w-10 h-6 rounded-full transition ${
                        rule.enabled ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition transform ${
                          rule.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {rule.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {rule.type} • {rule.action} @ {rule.threshold}/s
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {rule.triggeredCount.toLocaleString()} triggers
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DDoSShieldDashboard;
