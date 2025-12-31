import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TOOL_NAME, TOOL_DESCRIPTION, FEATURES } from "../constants";
import { BackupJob, BackupTarget, SecurityAlert } from "../types";

export default function BackupGuardDashboard() {
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [targets, setTargets] = useState<BackupTarget[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setJobs([
      {
        id: "job-001",
        name: "Production Database",
        source: "/data/postgres",
        destination: "S3://backups/db",
        type: "incremental",
        status: "completed",
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        nextRun: new Date(Date.now() + 21600000).toISOString(),
        size: 52428800000,
        retentionDays: 90,
        encrypted: true,
        immutable: true,
      },
      {
        id: "job-002",
        name: "File Server",
        source: "/mnt/shares",
        destination: "Azure://vault/files",
        type: "full",
        status: "running",
        lastRun: new Date().toISOString(),
        size: 1099511627776,
        retentionDays: 365,
        encrypted: true,
        immutable: false,
      },
      {
        id: "job-003",
        name: "Application Configs",
        source: "/etc/apps",
        destination: "Local://air-gap/configs",
        type: "differential",
        status: "scheduled",
        nextRun: new Date(Date.now() + 86400000).toISOString(),
        size: 104857600,
        retentionDays: 30,
        encrypted: true,
        immutable: true,
      },
    ]);

    setTargets([
      {
        id: "target-001",
        name: "AWS S3 Vault",
        type: "cloud",
        provider: "AWS",
        capacity: 10995116277760,
        used: 5497558138880,
        status: "online",
        lastCheck: new Date().toISOString(),
      },
      {
        id: "target-002",
        name: "Air-Gapped Storage",
        type: "air-gapped",
        capacity: 2199023255552,
        used: 549755813888,
        status: "online",
        lastCheck: new Date().toISOString(),
      },
    ]);

    setAlerts([
      {
        id: "alert-001",
        type: "anomaly",
        severity: "warning",
        message: "Unusual backup size increase detected",
        backupId: "job-002",
        timestamp: new Date().toISOString(),
        resolved: false,
      },
    ]);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "online":
      case "passed":
        return "bg-green-500";
      case "running":
        return "bg-blue-500";
      case "scheduled":
        return "bg-yellow-500";
      case "failed":
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">{TOOL_NAME}</h1>
            <p className="text-gray-400 text-sm">{TOOL_DESCRIPTION}</p>
          </div>
          <Link
            to="/maula-ai"
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all flex items-center gap-2"
          >
            <span>🤖</span> Live Assistant
          </Link>
        </div>
      </header>

      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto flex gap-4 p-2">
          {["overview", "jobs", "targets", "alerts", "integrity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeTab === tab
                  ? "bg-amber-600 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-amber-400">
                  {jobs.length}
                </div>
                <div className="text-gray-400">Backup Jobs</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-green-400">
                  {jobs.filter((j) => j.status === "completed").length}
                </div>
                <div className="text-gray-400">Completed</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-blue-400">
                  {jobs.filter((j) => j.immutable).length}
                </div>
                <div className="text-gray-400">Immutable</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-red-400">
                  {alerts.filter((a) => !a.resolved).length}
                </div>
                <div className="text-gray-400">Active Alerts</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Platform Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FEATURES.map((feature) => (
                  <div
                    key={feature}
                    className="bg-gray-700/50 rounded-lg p-3 text-center text-sm"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Storage Targets</h2>
                {targets.map((target) => (
                  <div key={target.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{target.name}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(
                          target.status
                        )}`}
                      >
                        {target.status}
                      </span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-amber-500 rounded-full h-2"
                        style={{
                          width: `${(target.used / target.capacity) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatBytes(target.used)} /{" "}
                      {formatBytes(target.capacity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                {jobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 mb-3 last:mb-0"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        job.status
                      )}`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{job.name}</div>
                      <div className="text-xs text-gray-400">
                        {job.type} backup
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatBytes(job.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Backup Jobs</h2>
              <button className="px-4 py-2 bg-amber-600 rounded-lg hover:bg-amber-500">
                + New Job
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3">Job Name</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Size</th>
                    <th className="text-left p-3">Security</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-t border-gray-700">
                      <td className="p-3">
                        <div className="font-medium">{job.name}</div>
                        <div className="text-sm text-gray-400">
                          {job.destination}
                        </div>
                      </td>
                      <td className="p-3 capitalize">{job.type}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="p-3">{formatBytes(job.size)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {job.encrypted && (
                            <span className="px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs">
                              🔐 Encrypted
                            </span>
                          )}
                          {job.immutable && (
                            <span className="px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded text-xs">
                              🛡️ Immutable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-amber-600 rounded text-sm hover:bg-amber-500">
                            Run
                          </button>
                          <button className="px-3 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500">
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-gray-800 rounded-lg p-4 border ${
                  alert.severity === "critical"
                    ? "border-red-600"
                    : alert.severity === "high"
                    ? "border-orange-600"
                    : "border-yellow-600"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`px-2 py-1 rounded text-xs uppercase ${
                        alert.severity === "critical"
                          ? "bg-red-600"
                          : alert.severity === "high"
                          ? "bg-orange-600"
                          : "bg-yellow-600"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-gray-700 rounded text-xs">
                      {alert.type}
                    </span>
                    <p className="mt-2 font-medium">{alert.message}</p>
                  </div>
                  <button className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                No active alerts
              </div>
            )}
          </div>
        )}

        {(activeTab === "targets" || activeTab === "integrity") && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-4">💾</div>
            <p>This section is available in the full application.</p>
            <Link
              to="/maula-ai"
              className="inline-block mt-4 px-4 py-2 bg-amber-600 rounded-lg hover:bg-amber-500"
            >
              Ask AI Assistant
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
