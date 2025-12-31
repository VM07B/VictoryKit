import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Workflow,
  Zap,
  Plug,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Cpu,
  Activity,
} from "lucide-react";
import { soarEngineAPI } from "../services/soarengineAPI";
import type { Playbook, PlaybookRun, Integration, SOARStats } from "../types";

const SOAREngineDashboard: React.FC = () => {
  const [stats, setStats] = useState<SOARStats | null>(null);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [runs, setRuns] = useState<PlaybookRun[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, playbooksData, runsData, integrationsData] =
        await Promise.all([
          soarEngineAPI.getStats(),
          soarEngineAPI.getPlaybooks(),
          soarEngineAPI.getPlaybookRuns(),
          soarEngineAPI.getIntegrations(),
        ]);
      setStats(statsData);
      setPlaybooks(playbooksData);
      setRuns(runsData);
      setIntegrations(integrationsData);
    } catch {
      setStats({
        activePlaybooks: 47,
        runsToday: 234,
        automatedActions: 1847,
        integrationsActive: 18,
        avgResponseTime: 4.2,
        successRate: 98.7,
      });
      setPlaybooks([
        {
          _id: "1",
          name: "Phishing Response",
          description: "Automated phishing incident response",
          triggerType: "alert",
          status: "active",
          lastRun: "2024-01-15T10:30:00Z",
          runCount: 156,
          avgDuration: 45,
          steps: [],
        },
        {
          _id: "2",
          name: "Malware Containment",
          description: "Isolate and contain malware infections",
          triggerType: "alert",
          status: "active",
          lastRun: "2024-01-15T09:15:00Z",
          runCount: 89,
          avgDuration: 120,
          steps: [],
        },
        {
          _id: "3",
          name: "User Offboarding",
          description: "Disable access for departed employees",
          triggerType: "manual",
          status: "active",
          lastRun: "2024-01-14T16:00:00Z",
          runCount: 234,
          avgDuration: 30,
          steps: [],
        },
        {
          _id: "4",
          name: "Threat Intel Enrichment",
          description: "Enrich IOCs with threat intelligence",
          triggerType: "webhook",
          status: "active",
          lastRun: "2024-01-15T10:45:00Z",
          runCount: 567,
          avgDuration: 8,
          steps: [],
        },
      ]);
      setRuns([
        {
          _id: "1",
          playbookId: "1",
          playbookName: "Phishing Response",
          status: "running",
          startedAt: "2024-01-15T10:35:00Z",
          completedAt: null,
          triggeredBy: "Alert Rule",
          stepsCompleted: 3,
          totalSteps: 6,
        },
        {
          _id: "2",
          playbookId: "2",
          playbookName: "Malware Containment",
          status: "completed",
          startedAt: "2024-01-15T10:20:00Z",
          completedAt: "2024-01-15T10:22:00Z",
          triggeredBy: "EDR Alert",
          stepsCompleted: 5,
          totalSteps: 5,
        },
        {
          _id: "3",
          playbookId: "4",
          playbookName: "Threat Intel Enrichment",
          status: "completed",
          startedAt: "2024-01-15T10:45:00Z",
          completedAt: "2024-01-15T10:45:08Z",
          triggeredBy: "Webhook",
          stepsCompleted: 3,
          totalSteps: 3,
        },
      ]);
      setIntegrations([
        {
          _id: "1",
          name: "CrowdStrike",
          type: "EDR",
          status: "connected",
          lastSync: "2024-01-15T10:30:00Z",
          actionsAvailable: 24,
        },
        {
          _id: "2",
          name: "Splunk",
          type: "SIEM",
          status: "connected",
          lastSync: "2024-01-15T10:29:00Z",
          actionsAvailable: 18,
        },
        {
          _id: "3",
          name: "ServiceNow",
          type: "ITSM",
          status: "connected",
          lastSync: "2024-01-15T10:28:00Z",
          actionsAvailable: 12,
        },
        {
          _id: "4",
          name: "Slack",
          type: "Communication",
          status: "error",
          lastSync: "2024-01-15T08:00:00Z",
          actionsAvailable: 5,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPlaybook = async (id: string) => {
    try {
      const run = await soarEngineAPI.runPlaybook(id);
      setRuns((prev) => [run, ...prev]);
    } catch {}
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      running: "text-cyan-400 bg-cyan-500/20",
      completed: "text-green-400 bg-green-500/20",
      failed: "text-red-400 bg-red-500/20",
      cancelled: "text-gray-400 bg-gray-500/20",
      connected: "text-green-400 bg-green-500/20",
      disconnected: "text-gray-400 bg-gray-500/20",
      error: "text-red-400 bg-red-500/20",
    };
    return colors[status] || colors.connected;
  };

  const getTriggerIcon = (type: string) => {
    const icons: Record<string, string> = {
      manual: "👆",
      alert: "🚨",
      schedule: "⏰",
      webhook: "🔗",
    };
    return icons[type] || "📋";
  };

  return (
    <div className="min-h-screen matrix-bg">
      <header className="bg-gray-900/80 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Workflow className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SOAREngine</h1>
              <p className="text-sm text-gray-400">
                AI-Powered Security Orchestration & Automation
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
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" /> Live Assistant
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Workflow className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.activePlaybooks}
                  </p>
                  <p className="text-sm text-gray-400">Active Playbooks</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Play className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.runsToday}
                  </p>
                  <p className="text-sm text-gray-400">Runs Today</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.automatedActions.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Actions</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Plug className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.integrationsActive}
                  </p>
                  <p className="text-sm text-gray-400">Integrations</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">
                    {stats.avgResponseTime}s
                  </p>
                  <p className="text-sm text-gray-400">Avg Response</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.successRate}%
                  </p>
                  <p className="text-sm text-gray-400">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-cyan-400" /> Playbooks
            </h2>
            <div className="space-y-3">
              {playbooks.map((playbook) => (
                <div
                  key={playbook._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getTriggerIcon(playbook.triggerType)}
                      </span>
                      <h3 className="font-medium text-white">
                        {playbook.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleRunPlaybook(playbook._id)}
                      className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {playbook.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {playbook.runCount} runs • avg {playbook.avgDuration}s
                    </span>
                    {playbook.lastRun && (
                      <span>
                        Last: {new Date(playbook.lastRun).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="cyber-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" /> Recent Runs
              </h2>
              <div className="space-y-3">
                {runs.map((run) => (
                  <div
                    key={run._id}
                    className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white text-sm">
                        {run.playbookName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${getStatusColor(
                          run.status
                        )}`}
                      >
                        {run.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{run.triggeredBy}</span>
                      <span>
                        {run.stepsCompleted}/{run.totalSteps} steps
                      </span>
                    </div>
                    {run.status === "running" && (
                      <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full animate-pulse"
                          style={{
                            width: `${
                              (run.stepsCompleted / run.totalSteps) * 100
                            }%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="cyber-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Plug className="w-5 h-5 text-blue-400" /> Integrations
              </h2>
              <div className="space-y-2">
                {integrations.map((integration) => (
                  <div
                    key={integration._id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {integration.status === "connected" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : integration.status === "error" ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <span className="font-medium text-white text-sm">
                          {integration.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({integration.type})
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {integration.actionsAvailable} actions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SOAREngineDashboard;
