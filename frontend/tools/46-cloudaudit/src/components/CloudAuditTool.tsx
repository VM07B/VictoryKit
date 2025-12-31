import { useState, useEffect } from "react";
import {
  ClipboardList,
  Cloud,
  Shield,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Clock,
  User,
  FileText,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  result: "success" | "failure" | "warning";
  ip: string;
}

interface ScanResult {
  totalLogs: number;
  uniqueUsers: number;
  suspiciousEvents: number;
  logs: AuditLog[];
  actionBreakdown: { action: string; count: number }[];
  scanTime: string;
}

const mockLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "14:32:15",
    user: "admin@corp.com",
    action: "DeleteBucket",
    resource: "s3://prod-data",
    result: "success",
    ip: "10.0.1.45",
  },
  {
    id: "2",
    timestamp: "14:31:42",
    user: "dev@corp.com",
    action: "ModifySecurityGroup",
    resource: "sg-abc123",
    result: "warning",
    ip: "192.168.1.20",
  },
  {
    id: "3",
    timestamp: "14:30:18",
    user: "unknown",
    action: "AssumeRole",
    resource: "arn:aws:iam::admin",
    result: "failure",
    ip: "52.23.145.67",
  },
  {
    id: "4",
    timestamp: "14:29:55",
    user: "ops@corp.com",
    action: "CreateInstance",
    resource: "i-0abc123def",
    result: "success",
    ip: "10.0.2.100",
  },
  {
    id: "5",
    timestamp: "14:28:33",
    user: "admin@corp.com",
    action: "DisableLogging",
    resource: "cloudtrail-main",
    result: "warning",
    ip: "10.0.1.45",
  },
];

export default function CloudAuditTool() {
  const [cloudProvider, setCloudProvider] = useState("aws");
  const [timeRange, setTimeRange] = useState("24h");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveLogs, setLiveLogs] = useState<AuditLog[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 15, 95));
        if (Math.random() > 0.4 && liveLogs.length < 5) {
          setLiveLogs((prev) => [...prev, mockLogs[prev.length]]);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, liveLogs.length]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setLiveLogs([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setScanProgress(100);
      setResult({
        totalLogs: 15678,
        uniqueUsers: 234,
        suspiciousEvents: 47,
        logs: mockLogs,
        actionBreakdown: [
          { action: "Read", count: 8934 },
          { action: "Write", count: 4521 },
          { action: "Delete", count: 892 },
          { action: "Admin", count: 1331 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getResultColor = (result: string) => {
    if (result === "success") return "bg-green-600";
    if (result === "failure") return "bg-red-600";
    return "bg-yellow-600";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 mb-4 animate-auditTrail">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CloudAudit</h1>
          <p className="text-fuchsia-300">Cloud Audit Trail Analysis</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-fuchsia-900/30 backdrop-blur-sm rounded-2xl border border-fuchsia-700/50 p-6">
            <h2 className="text-lg font-semibold text-fuchsia-100 mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-fuchsia-400" />
              Audit Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-fuchsia-300 mb-2">
                  Cloud Provider
                </label>
                <select
                  value={cloudProvider}
                  onChange={(e) => setCloudProvider(e.target.value)}
                  className="audit-input"
                >
                  <option value="aws">AWS CloudTrail</option>
                  <option value="azure">Azure Activity Log</option>
                  <option value="gcp">GCP Audit Logs</option>
                  <option value="multi">Multi-Cloud</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-fuchsia-300 mb-2">
                  Time Range
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="audit-input"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["IAM", "Storage", "Compute", "Network"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 p-3 rounded-lg bg-fuchsia-950/50 border border-fuchsia-700/30 cursor-pointer hover:border-fuchsia-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-fuchsia-500"
                    />
                    <span className="text-xs text-fuchsia-200">{type}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-400 hover:to-purple-400 text-white disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Logs...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze Audit Trail
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-fuchsia-900/30 backdrop-blur-sm rounded-2xl border border-fuchsia-700/50 p-6">
            <h2 className="text-lg font-semibold text-fuchsia-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-fuchsia-400" />
              Live Log Stream
              {isAnalyzing && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-fuchsia-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-fuchsia-500"></span>
                </span>
              )}
            </h2>

            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-fuchsia-300 mb-2">
                  <span>Processing</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-fuchsia-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveLogs.length === 0 && !isAnalyzing && (
                <div className="text-center py-8 text-fuchsia-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start analysis to view logs</p>
                </div>
              )}
              {liveLogs.map((log, idx) => (
                <div
                  key={log.id}
                  className="log-entry animate-logScroll"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-fuchsia-100 font-medium text-sm">
                      {log.action}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${getResultColor(
                        log.result
                      )} text-white`}
                    >
                      {log.result}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-fuchsia-400">
                    <User className="w-3 h-3" />
                    <span className="truncate">{log.user}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-fuchsia-500 mt-1">
                    <span className="truncate">{log.resource}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-fuchsia-900/30 backdrop-blur-sm rounded-2xl border border-fuchsia-700/50 p-6">
            <h2 className="text-lg font-semibold text-fuchsia-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-fuchsia-400" />
              Audit Summary
            </h2>

            {!result ? (
              <div className="text-center py-12 text-fuchsia-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Analyze audit trail to view summary</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-fuchsia-950/50 text-center">
                    <p className="text-2xl font-bold text-white">
                      {(result.totalLogs / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-fuchsia-400">Events</p>
                  </div>
                  <div className="p-3 rounded-lg bg-fuchsia-950/50 text-center">
                    <p className="text-2xl font-bold text-fuchsia-400">
                      {result.uniqueUsers}
                    </p>
                    <p className="text-xs text-fuchsia-400">Users</p>
                  </div>
                  <div className="p-3 rounded-lg bg-fuchsia-950/50 text-center">
                    <p className="text-2xl font-bold text-red-400">
                      {result.suspiciousEvents}
                    </p>
                    <p className="text-xs text-fuchsia-400">Suspicious</p>
                  </div>
                </div>

                {/* Action Breakdown */}
                <div>
                  <p className="text-sm font-medium text-fuchsia-300 mb-2">
                    Action Breakdown
                  </p>
                  <div className="space-y-2">
                    {result.actionBreakdown.map((item) => (
                      <div
                        key={item.action}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-fuchsia-400 w-12">
                          {item.action}
                        </span>
                        <div className="flex-1 h-2 bg-fuchsia-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-fuchsia-500"
                            style={{
                              width: `${
                                (item.count / result.totalLogs) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-fuchsia-300">
                          {(item.count / 1000).toFixed(1)}k
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Suspicious */}
                <div>
                  <p className="text-sm font-medium text-fuchsia-300 mb-2">
                    Suspicious Activity
                  </p>
                  <div className="space-y-1">
                    {result.logs
                      .filter((l) => l.result !== "success")
                      .slice(0, 3)
                      .map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between text-xs p-2 rounded bg-fuchsia-950/30"
                        >
                          <span className="text-fuchsia-200 truncate flex-1">
                            {log.action}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${getResultColor(
                              log.result
                            )} text-white`}
                          >
                            {log.result}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <p className="text-xs text-fuchsia-500 text-center">
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
