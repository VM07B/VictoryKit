import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Zap,
  Plus,
  RefreshCw,
  Lock,
  Activity,
  Clock,
  AlertTriangle,
  Globe,
  Key,
  Server,
} from "lucide-react";
import { apiGuardAPI } from "../services/apiguardAPI";
import { APISecurityStats, APIEndpoint, AuthEvent } from "../types";

const APIGuardDashboard: React.FC = () => {
  const [stats, setStats] = useState<APISecurityStats | null>(null);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashStats, apiEndpoints, events] = await Promise.all([
        apiGuardAPI.getStats().catch(() => null),
        apiGuardAPI.getEndpoints().catch(() => []),
        apiGuardAPI
          .getAuthEvents({ limit: "10" })
          .catch(() => ({ events: [] })),
      ]);
      if (dashStats) setStats(dashStats);
      setEndpoints(apiEndpoints);
      setAuthEvents(events.events || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen matrix-bg text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">APIGuard</h1>
              <p className="text-xs text-gray-400">VictoryKit Security Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/maula-ai"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm"
            >
              <Zap className="w-4 h-4" />
              Live Assistant
            </Link>
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Lock className="w-8 h-8 text-blue-500" />
            API Guard
          </h1>
          <p className="text-gray-400 mt-1">
            API Security & Endpoint Protection
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Protected Endpoints"
            value={stats?.protectedEndpoints || 0}
            subtitle={`${stats?.totalEndpoints || 0} total`}
            icon={<Server className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Requests (24h)"
            value={stats?.totalRequests24h || 0}
            subtitle={`${stats?.blockedRequests24h || 0} blocked`}
            icon={<Activity className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Avg Response"
            value={`${stats?.avgResponseTime || 0}ms`}
            subtitle="Response time"
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Auth Events"
            value={stats?.authEvents?.reduce((a, e) => a + e.count, 0) || 0}
            subtitle="Last 24 hours"
            icon={<Key className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints */}
          <div className="lg:col-span-2 cyber-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                API Endpoints
              </h2>
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">
                <Plus className="w-4 h-4" />
                Add Endpoint
              </button>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {endpoints.length > 0 ? (
                endpoints.slice(0, 10).map((ep) => (
                  <div
                    key={ep._id}
                    className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          ep.method === "GET"
                            ? "bg-green-500/20 text-green-400"
                            : ep.method === "POST"
                            ? "bg-blue-500/20 text-blue-400"
                            : ep.method === "DELETE"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <div>
                        <p className="font-mono text-sm">{ep.path}</p>
                        <p className="text-xs text-gray-400">
                          {ep.requestCount} requests • {ep.avgResponseTime}ms
                          avg
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ep.authRequired && (
                        <Lock className="w-4 h-4 text-yellow-500" />
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          ep.enabled
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-600 text-gray-400"
                        }`}
                      >
                        {ep.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No endpoints configured</p>
                </div>
              )}
            </div>
          </div>

          {/* Auth Events */}
          <div className="cyber-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Auth Events
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {authEvents.length > 0 ? (
                authEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-gray-800/50 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            event.success ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {event.type.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.ipAddress}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(event.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No auth events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-700/50 py-6 px-8 mt-8">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            APIGuard © {new Date().getFullYear()} VictoryKit
          </span>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300">
              Docs
            </a>
            <a href="#" className="hover:text-gray-300">
              API
            </a>
            <a href="#" className="hover:text-gray-300">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => {
  const colors: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10",
    green: "text-green-500 bg-green-500/10",
    yellow: "text-yellow-500 bg-yellow-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  };
  return (
    <div className="cyber-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default APIGuardDashboard;
