import { useState, useEffect } from "react";
import {
  BarChart3,
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Clock,
  Bell,
} from "lucide-react";

interface SecurityEvent {
  id: string;
  timestamp: string;
  source: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  message: string;
  count: number;
}

interface ScanResult {
  totalEvents: number;
  criticalAlerts: number;
  eventsPerHour: number;
  events: SecurityEvent[];
  categories: { name: string; count: number }[];
  threatLevel: "low" | "medium" | "high" | "critical";
  scanTime: string;
}

const mockEvents: SecurityEvent[] = [
  {
    id: "1",
    timestamp: "14:32:15",
    source: "10.0.1.45",
    type: "Failed Login",
    severity: "high",
    message: "Multiple failed login attempts detected",
    count: 23,
  },
  {
    id: "2",
    timestamp: "14:31:42",
    source: "52.23.145.67",
    type: "Port Scan",
    severity: "medium",
    message: "Port scanning activity from external IP",
    count: 1,
  },
  {
    id: "3",
    timestamp: "14:30:18",
    source: "firewall-01",
    type: "Rule Triggered",
    severity: "info",
    message: "Outbound connection blocked to known C2",
    count: 5,
  },
  {
    id: "4",
    timestamp: "14:29:55",
    source: "prod-web-01",
    type: "Malware Alert",
    severity: "critical",
    message: "Potential ransomware behavior detected",
    count: 1,
  },
  {
    id: "5",
    timestamp: "14:28:33",
    source: "db-server-01",
    type: "Privilege Escalation",
    severity: "high",
    message: "Unusual privilege escalation attempt",
    count: 2,
  },
];

export default function SIEMDashboardTool() {
  const [dataSource, setDataSource] = useState("");
  const [timeRange, setTimeRange] = useState("1h");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveEvents, setLiveEvents] = useState<SecurityEvent[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 15, 95));
        if (Math.random() > 0.4 && liveEvents.length < 5) {
          setLiveEvents((prev) => [...prev, mockEvents[prev.length]]);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, liveEvents.length]);

  const handleAnalyze = () => {
    if (!dataSource) return;
    setIsAnalyzing(true);
    setLiveEvents([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setScanProgress(100);
      setResult({
        totalEvents: 15678,
        criticalAlerts: 12,
        eventsPerHour: 2345,
        events: mockEvents,
        categories: [
          { name: "Authentication", count: 4567 },
          { name: "Network", count: 3456 },
          { name: "Malware", count: 234 },
          { name: "Policy", count: 1890 },
          { name: "System", count: 5531 },
        ],
        threatLevel: "high",
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-red-600",
      high: "bg-orange-600",
      medium: "bg-yellow-600",
      low: "bg-blue-600",
      info: "bg-gray-600",
    };
    return colors[severity as keyof typeof colors] || "bg-gray-600";
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "critical")
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (severity === "high")
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    if (severity === "medium")
      return <Bell className="w-4 h-4 text-yellow-400" />;
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  const getThreatLevelColor = (level: string) => {
    if (level === "critical") return "text-red-400";
    if (level === "high") return "text-orange-400";
    if (level === "medium") return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 mb-4 animate-eventStream">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SIEMDashboard</h1>
          <p className="text-slate-300">Security Event Management</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-400" />
              Query Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data Source
                </label>
                <input
                  type="text"
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value)}
                  placeholder="production-logs"
                  className="siem-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Time Range
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="siem-input w-full"
                >
                  <option value="15m">Last 15 minutes</option>
                  <option value="1h">Last hour</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Auth", "Network", "Malware", "System"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 cursor-pointer hover:border-slate-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-slate-500"
                    />
                    <span className="text-xs text-slate-200">{type}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !dataSource}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-500 hover:to-gray-500 text-white disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Events...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Query Events
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Live Event Stream
              {isAnalyzing && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-slate-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-slate-500"></span>
                </span>
              )}
            </h2>

            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Processing</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-slate-500 to-gray-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveEvents.length === 0 && !isAnalyzing && (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter data source to query</p>
                </div>
              )}
              {liveEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="event-card animate-alertBlink"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(event.severity)}
                      <span className="text-sm text-slate-100 font-medium">
                        {event.type}
                      </span>
                    </div>
                    <span className={`event-severity ${event.severity}`}>
                      {event.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">
                    {event.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>{event.source}</span>
                    <span>{event.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-slate-400" />
              Security Overview
            </h2>

            {!result ? (
              <div className="text-center py-12 text-slate-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Query events to view overview</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Threat Level */}
                <div className="text-center p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
                  <p className="text-sm text-slate-400 mb-1">Threat Level</p>
                  <p
                    className={`text-3xl font-bold uppercase ${getThreatLevelColor(
                      result.threatLevel
                    )}`}
                  >
                    {result.threatLevel}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-slate-900/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {(result.totalEvents / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-slate-400">Events</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/50 text-center">
                    <p className="text-lg font-bold text-red-400">
                      {result.criticalAlerts}
                    </p>
                    <p className="text-xs text-slate-400">Critical</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {(result.eventsPerHour / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-slate-400">/hour</p>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-2">
                    Event Categories
                  </p>
                  <div className="space-y-2">
                    {result.categories.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-24">
                          {cat.name}
                        </span>
                        <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-500"
                            style={{
                              width: `${
                                (cat.count / result.totalEvents) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-300">
                          {(cat.count / 1000).toFixed(1)}k
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
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
