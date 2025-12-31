import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Target,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  Cpu,
  RefreshCw,
  Activity,
  Search,
} from "lucide-react";
import { blueTeamAIAPI } from "../services/blueteamaiAPI";
import type { ThreatHunt, Incident, DefenseMetrics } from "../types";

const BlueTeamAIDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DefenseMetrics | null>(null);
  const [hunts, setHunts] = useState<ThreatHunt[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsData, huntsData, incidentsData] = await Promise.all([
        blueTeamAIAPI.getMetrics(),
        blueTeamAIAPI.getThreatHunts(),
        blueTeamAIAPI.getIncidents(),
      ]);
      setMetrics(metricsData);
      setHunts(huntsData);
      setIncidents(incidentsData);
    } catch {
      setMetrics({
        activeHunts: 3,
        openIncidents: 5,
        containedThreats: 127,
        meanTimeToDetect: 4.2,
        meanTimeToRespond: 18.5,
        alertsProcessed24h: 2847,
      });
      setHunts([
        {
          _id: "1",
          name: "Lateral Movement Detection",
          hypothesis:
            "Attackers using compromised credentials for lateral movement",
          status: "active",
          startTime: "2024-01-15T08:00:00Z",
          findings: 3,
          analyst: "Alice Chen",
          priority: "high",
        },
        {
          _id: "2",
          name: "Data Exfiltration Hunt",
          hypothesis: "Unusual outbound traffic patterns indicating data theft",
          status: "active",
          startTime: "2024-01-14T10:00:00Z",
          findings: 1,
          analyst: "Bob Smith",
          priority: "critical",
        },
        {
          _id: "3",
          name: "Persistence Mechanisms",
          hypothesis: "Hidden persistence mechanisms in registry/startup",
          status: "completed",
          startTime: "2024-01-13T09:00:00Z",
          endTime: "2024-01-14T18:00:00Z",
          findings: 5,
          analyst: "Carol Davis",
          priority: "medium",
        },
      ]);
      setIncidents([
        {
          _id: "1",
          title: "Suspicious PowerShell Activity",
          severity: "high",
          status: "investigating",
          detectedAt: "2024-01-15T09:30:00Z",
          source: "EDR Alert",
          affectedAssets: ["WS-001", "WS-002"],
          assignee: "Alice Chen",
        },
        {
          _id: "2",
          title: "Unauthorized Access Attempt",
          severity: "critical",
          status: "open",
          detectedAt: "2024-01-15T10:15:00Z",
          source: "SIEM",
          affectedAssets: ["SRV-DB-01"],
          assignee: "Unassigned",
        },
        {
          _id: "3",
          title: "Malware Detection",
          severity: "medium",
          status: "contained",
          detectedAt: "2024-01-15T08:00:00Z",
          source: "AV Alert",
          affectedAssets: ["WS-005"],
          assignee: "Bob Smith",
        },
      ]);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "text-red-400",
      investigating: "text-yellow-400",
      contained: "text-blue-400",
      resolved: "text-green-400",
      active: "text-blue-400",
      completed: "text-green-400",
      paused: "text-gray-400",
    };
    return colors[status] || "text-gray-400";
  };

  return (
    <div className="min-h-screen matrix-bg">
      <header className="bg-gray-900/80 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BlueTeamAI</h1>
              <p className="text-sm text-gray-400">
                AI-Powered Defensive Security Operations
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
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" /> Live Assistant
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {metrics.activeHunts}
                  </p>
                  <p className="text-sm text-gray-400">Active Hunts</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {metrics.openIncidents}
                  </p>
                  <p className="text-sm text-gray-400">Open Incidents</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {metrics.containedThreats}
                  </p>
                  <p className="text-sm text-gray-400">Contained</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {metrics.meanTimeToDetect}m
                  </p>
                  <p className="text-sm text-gray-400">MTTD</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">
                    {metrics.meanTimeToRespond}m
                  </p>
                  <p className="text-sm text-gray-400">MTTR</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Search className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {metrics.alertsProcessed24h.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Alerts/24h</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> Threat Hunts
              </h2>
            </div>
            <div className="space-y-4">
              {hunts.map((hunt) => (
                <div
                  key={hunt._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{hunt.name}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                          hunt.priority
                        )}`}
                      >
                        {hunt.priority}
                      </span>
                      <span
                        className={`text-xs ${getStatusColor(hunt.status)}`}
                      >
                        {hunt.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {hunt.hypothesis}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      <Users className="w-3 h-3 inline mr-1" />
                      {hunt.analyst}
                    </span>
                    <span>{hunt.findings} findings</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Active
                Incidents
              </h2>
            </div>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{incident.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                        incident.severity
                      )}`}
                    >
                      {incident.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{incident.source}</span>
                    <span className={getStatusColor(incident.status)}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {incident.affectedAssets.map((asset, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlueTeamAIDashboard;
