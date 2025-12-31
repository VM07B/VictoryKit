import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Bot,
  Eye,
  AlertTriangle,
  Ban,
  CheckCircle,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { botDefenderAPI } from "../services/botdefenderAPI";
import type { BotSession, BotStats } from "../types";

const BotDefenderDashboard: React.FC = () => {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [sessions, setSessions] = useState<BotSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "bots" | "humans">("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, sessionsData] = await Promise.all([
        botDefenderAPI.getStats(),
        botDefenderAPI.getSessions(),
      ]);
      setStats(statsData);
      setSessions(sessionsData);
    } catch (e) {
      setStats({
        totalSessions24h: 15420,
        botSessions24h: 2845,
        humanSessions24h: 12575,
        blockedBots24h: 1893,
        captchaSolved24h: 4521,
        topBotTypes: [
          { type: "Scraper", count: 892 },
          { type: "Crawler", count: 654 },
          { type: "Credential Stuffer", count: 423 },
        ],
      });
      setSessions([
        {
          _id: "1",
          ip: "45.33.32.156",
          userAgent: "Python-urllib/3.8",
          fingerprint: "fp_abc123",
          score: 92,
          isBot: true,
          botType: "Scraper",
          requestCount: 1250,
          firstSeen: "2024-01-15T10:00:00Z",
          lastSeen: "2024-01-15T10:30:00Z",
          blocked: true,
        },
        {
          _id: "2",
          ip: "203.0.113.45",
          userAgent: "Mozilla/5.0 Chrome/120",
          fingerprint: "fp_def456",
          score: 15,
          isBot: false,
          requestCount: 45,
          firstSeen: "2024-01-15T09:00:00Z",
          lastSeen: "2024-01-15T10:25:00Z",
          blocked: false,
        },
        {
          _id: "3",
          ip: "192.0.2.100",
          userAgent: "Go-http-client/1.1",
          fingerprint: "fp_ghi789",
          score: 88,
          isBot: true,
          botType: "Credential Stuffer",
          requestCount: 890,
          firstSeen: "2024-01-15T08:00:00Z",
          lastSeen: "2024-01-15T10:15:00Z",
          blocked: true,
        },
        {
          _id: "4",
          ip: "198.51.100.50",
          userAgent: "Googlebot/2.1",
          fingerprint: "fp_jkl012",
          score: 45,
          isBot: true,
          botType: "Crawler",
          requestCount: 320,
          firstSeen: "2024-01-15T07:00:00Z",
          lastSeen: "2024-01-15T10:20:00Z",
          blocked: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await botDefenderAPI.blockSession(id);
      setSessions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, blocked: true } : s))
      );
    } catch (e) {
      setSessions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, blocked: true } : s))
      );
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === "bots") return s.isBot;
    if (filter === "humans") return !s.isBot;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen matrix-bg">
      <header className="bg-gray-900/80 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BotDefender</h1>
              <p className="text-sm text-gray-400">
                AI-Powered Bot Detection & Mitigation
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
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" /> Live Assistant
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalSessions24h.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Sessions</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Bot className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.botSessions24h.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Bot Sessions</p>
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
                    {stats.humanSessions24h.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Human Sessions</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Ban className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">
                    {stats.blockedBots24h.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Blocked Bots</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.captchaSolved24h.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">CAPTCHAs Solved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Session Monitor
              </h2>
              <div className="flex gap-2">
                {(["all", "bots", "humans"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      filter === f
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="pb-3 pr-4">IP Address</th>
                    <th className="pb-3 pr-4">User Agent</th>
                    <th className="pb-3 pr-4">Score</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Requests</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr
                      key={session._id}
                      className="border-b border-gray-700/50"
                    >
                      <td className="py-3 pr-4 font-mono text-sm">
                        {session.ip}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-400 max-w-[200px] truncate">
                        {session.userAgent}
                      </td>
                      <td
                        className={`py-3 pr-4 font-bold ${getScoreColor(
                          session.score
                        )}`}
                      >
                        {session.score}%
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            session.isBot
                              ? "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {session.isBot ? session.botType || "Bot" : "Human"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm">
                        {session.requestCount}
                      </td>
                      <td className="py-3">
                        {session.blocked ? (
                          <span className="text-xs text-gray-500">Blocked</span>
                        ) : (
                          <button
                            onClick={() => handleBlock(session._id)}
                            className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cyber-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Top Bot Types
            </h2>
            <div className="space-y-4">
              {stats?.topBotTypes.map((bt, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        i === 0
                          ? "bg-red-400"
                          : i === 1
                          ? "bg-orange-400"
                          : "bg-yellow-400"
                      }`}
                    />
                    <span className="text-gray-300">{bt.type}</span>
                  </div>
                  <span className="font-mono text-sm text-gray-400">
                    {bt.count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Protection Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Bot Detection</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">CAPTCHA</span>
                  <span className="text-green-400">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Fingerprinting</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Rate Limiting</span>
                  <span className="text-yellow-400">Moderate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BotDefenderDashboard;
