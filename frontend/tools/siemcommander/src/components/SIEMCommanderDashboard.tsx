import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Database,
  Bell,
  Activity,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
  Search,
  Eye,
  Check,
} from "lucide-react";
import { siemCommanderAPI } from "../services/siemcommanderAPI";
import type { SecurityEvent, Alert, SIEMStats } from "../types";

const SIEMCommanderDashboard: React.FC = () => {
  const [stats, setStats] = useState<SIEMStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, alertsData] = await Promise.all([
        siemCommanderAPI.getStats(),
        siemCommanderAPI.getAlerts(),
      ]);
      setStats(statsData);
      setAlerts(alertsData);
    } catch {
      setStats({
        eventsPerSecond: 2847,
        totalEvents24h: 245892341,
        alertsTriggered24h: 156,
        correlationRulesActive: 89,
        dataSources: 24,
        storageUsedGB: 1847,
      });
      setAlerts([
        {
          _id: "1",
          name: "Brute Force Attack Detected",
          severity: "high",
          status: "new",
          triggeredAt: "2024-01-15T10:30:00Z",
          source: "Auth Logs",
          eventCount: 1547,
          description: "Multiple failed login attempts from single IP",
        },
        {
          _id: "2",
          name: "Suspicious Outbound Connection",
          severity: "critical",
          status: "investigating",
          triggeredAt: "2024-01-15T10:15:00Z",
          source: "Firewall",
          eventCount: 23,
          description: "Connection to known C2 infrastructure",
        },
        {
          _id: "3",
          name: "Privilege Escalation Attempt",
          severity: "high",
          status: "acknowledged",
          triggeredAt: "2024-01-15T09:45:00Z",
          source: "EDR",
          eventCount: 5,
          description: "Unauthorized sudo usage detected",
        },
        {
          _id: "4",
          name: "Anomalous Data Transfer",
          severity: "medium",
          status: "new",
          triggeredAt: "2024-01-15T09:00:00Z",
          source: "DLP",
          eventCount: 12,
          description: "Large file transfer to external domain",
        },
      ]);
      setEvents([
        {
          _id: "1",
          timestamp: "2024-01-15T10:30:15Z",
          source: "auth.log",
          eventType: "LOGIN_FAILED",
          severity: "medium",
          message: "Failed login for user admin from 192.168.1.100",
          rawLog:
            "Jan 15 10:30:15 server sshd[1234]: Failed password for admin",
          parsedFields: { user: "admin", ip: "192.168.1.100" },
          correlated: true,
        },
        {
          _id: "2",
          timestamp: "2024-01-15T10:29:45Z",
          source: "firewall.log",
          eventType: "BLOCKED",
          severity: "high",
          message: "Blocked connection to malicious IP",
          rawLog: "BLOCK src=10.0.0.5 dst=45.33.32.156",
          parsedFields: { src: "10.0.0.5", dst: "45.33.32.156" },
          correlated: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await siemCommanderAPI.searchEvents(searchQuery);
      setEvents(results);
    } catch {}
  };

  const handleAcknowledge = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a._id === id ? { ...a, status: "acknowledged" as const } : a
      )
    );
    try {
      await siemCommanderAPI.acknowledgeAlert(id);
    } catch {}
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "text-red-500 bg-red-500/20",
      high: "text-orange-400 bg-orange-500/20",
      medium: "text-yellow-400 bg-yellow-500/20",
      low: "text-green-400 bg-green-500/20",
      info: "text-blue-400 bg-blue-500/20",
    };
    return colors[severity] || colors.info;
  };

  return (
    <div className="min-h-screen matrix-bg">
      <header className="bg-gray-900/80 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SIEMCommander</h1>
              <p className="text-sm text-gray-400">
                AI-Powered Security Event Management
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
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" /> Live Assistant
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="cyber-card p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search logs (e.g., source:firewall severity:high)"
                className="cyber-input pl-10"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stats.eventsPerSecond.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Events/sec</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {(stats.totalEvents24h / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-400">Events/24h</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Bell className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.alertsTriggered24h}
                  </p>
                  <p className="text-sm text-gray-400">Alerts/24h</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.correlationRulesActive}
                  </p>
                  <p className="text-sm text-gray-400">Rules Active</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.dataSources}
                  </p>
                  <p className="text-sm text-gray-400">Data Sources</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <HardDrive className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">
                    {stats.storageUsedGB}
                  </p>
                  <p className="text-sm text-gray-400">Storage (GB)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-400" /> Active Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white text-sm">
                      {alert.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {alert.source} • {alert.eventCount} events
                    </span>
                    <div className="flex gap-2">
                      {alert.status === "new" && (
                        <button
                          onClick={() => handleAcknowledge(alert._id)}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                        >
                          <Eye className="w-3 h-3" /> Ack
                        </button>
                      )}
                      {alert.status === "acknowledged" && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Check className="w-3 h-3" /> Acked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cyber-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" /> Recent Events
            </h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 font-mono text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${getSeverityColor(
                        event.severity
                      )}`}
                    >
                      {event.severity}
                    </span>
                  </div>
                  <p className="text-gray-300 truncate">{event.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-500">
                    <span>{event.source}</span>
                    {event.correlated && (
                      <span className="text-purple-400">• correlated</span>
                    )}
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

export default SIEMCommanderDashboard;
