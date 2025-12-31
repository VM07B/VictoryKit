import { useState, useEffect } from "react";
import {
  Bug,
  Target,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  DollarSign,
  Award,
  Clock,
} from "lucide-react";

interface BugReport {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  reward: number;
  status: "new" | "triaging" | "accepted" | "paid";
  reporter: string;
  submitted: string;
}

interface ScanResult {
  totalReports: number;
  totalPaid: number;
  avgResolutionTime: string;
  reports: BugReport[];
  severityBreakdown: { severity: string; count: number; totalReward: number }[];
  programScore: number;
  scanTime: string;
}

const mockReports: BugReport[] = [
  {
    id: "1",
    title: "SQL Injection in Login API",
    severity: "critical",
    reward: 5000,
    status: "paid",
    reporter: "h4ck3r_x",
    submitted: "2 days ago",
  },
  {
    id: "2",
    title: "XSS in Comment Section",
    severity: "high",
    reward: 2000,
    status: "accepted",
    reporter: "security_joe",
    submitted: "5 days ago",
  },
  {
    id: "3",
    title: "IDOR in User Profile",
    severity: "high",
    reward: 1500,
    status: "triaging",
    reporter: "bug_hunter99",
    submitted: "1 day ago",
  },
  {
    id: "4",
    title: "Information Disclosure",
    severity: "medium",
    reward: 500,
    status: "new",
    reporter: "white_hat_sam",
    submitted: "3 hours ago",
  },
  {
    id: "5",
    title: "Rate Limiting Bypass",
    severity: "low",
    reward: 250,
    status: "accepted",
    reporter: "pentester_kim",
    submitted: "1 week ago",
  },
];

export default function BugBountyTool() {
  const [programName, setProgramName] = useState("");
  const [scope, setScope] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveReports, setLiveReports] = useState<BugReport[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 15, 95));
        if (Math.random() > 0.4 && liveReports.length < 5) {
          setLiveReports((prev) => [...prev, mockReports[prev.length]]);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, liveReports.length]);

  const handleAnalyze = () => {
    if (!programName) return;
    setIsAnalyzing(true);
    setLiveReports([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setScanProgress(100);
      setResult({
        totalReports: 234,
        totalPaid: 125000,
        avgResolutionTime: "4.2 days",
        reports: mockReports,
        severityBreakdown: [
          { severity: "Critical", count: 12, totalReward: 60000 },
          { severity: "High", count: 45, totalReward: 45000 },
          { severity: "Medium", count: 89, totalReward: 17800 },
          { severity: "Low", count: 88, totalReward: 2200 },
        ],
        programScore: 94,
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "critical") return "bg-red-600";
    if (severity === "high") return "bg-orange-600";
    if (severity === "medium") return "bg-yellow-600";
    return "bg-blue-600";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 mb-4 animate-bugHunt">
            <Bug className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BugBounty</h1>
          <p className="text-yellow-300">Bug Bounty Program Management</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-yellow-900/30 backdrop-blur-sm rounded-2xl border border-yellow-700/50 p-6">
            <h2 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-400" />
              Program Config
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-300 mb-2">
                  Program Name
                </label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="My Bug Bounty Program"
                  className="bounty-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-300 mb-2">
                  Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="bounty-input"
                >
                  <option value="all">All Assets</option>
                  <option value="web">Web Applications</option>
                  <option value="api">APIs</option>
                  <option value="mobile">Mobile Apps</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Web", "API", "Mobile", "Infra"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 p-3 rounded-lg bg-yellow-950/50 border border-yellow-700/30 cursor-pointer hover:border-yellow-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-yellow-500"
                    />
                    <span className="text-xs text-yellow-200">{type}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !programName}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Loading Reports...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze Program
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-yellow-900/30 backdrop-blur-sm rounded-2xl border border-yellow-700/50 p-6">
            <h2 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Bug Reports
              {isAnalyzing && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              )}
            </h2>

            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-yellow-300 mb-2">
                  <span>Loading</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-yellow-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveReports.length === 0 && !isAnalyzing && (
                <div className="text-center py-8 text-yellow-500">
                  <Bug className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter program to view reports</p>
                </div>
              )}
              {liveReports.map((report, idx) => (
                <div
                  key={report.id}
                  className="bounty-card animate-rewardPop"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`severity-badge ${report.severity}`}>
                      {report.severity}
                    </span>
                    <span className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {report.reward.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-yellow-100 text-sm font-medium truncate">
                    {report.title}
                  </p>
                  <div className="flex items-center justify-between text-xs text-yellow-500 mt-1">
                    <span>by {report.reporter}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {report.submitted}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-yellow-900/30 backdrop-blur-sm rounded-2xl border border-yellow-700/50 p-6">
            <h2 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-yellow-400" />
              Program Overview
            </h2>

            {!result ? (
              <div className="text-center py-12 text-yellow-500">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Analyze program to view stats</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Program Score */}
                <div className="text-center p-4 rounded-xl bg-yellow-950/50 border border-yellow-700/30">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#422006"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#eab308"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${result.programScore * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                      {result.programScore}
                    </span>
                  </div>
                  <p className="text-yellow-400 text-sm">Program Score</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-yellow-950/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {result.totalReports}
                    </p>
                    <p className="text-xs text-yellow-400">Reports</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-950/50 text-center">
                    <p className="text-lg font-bold text-green-400">
                      ${(result.totalPaid / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-yellow-400">Paid</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-950/50 text-center">
                    <p className="text-lg font-bold text-yellow-400">
                      {result.avgResolutionTime}
                    </p>
                    <p className="text-xs text-yellow-400">Avg Time</p>
                  </div>
                </div>

                {/* Severity Breakdown */}
                <div>
                  <p className="text-sm font-medium text-yellow-300 mb-2">
                    Severity Breakdown
                  </p>
                  <div className="space-y-2">
                    {result.severityBreakdown.map((item) => (
                      <div
                        key={item.severity}
                        className="flex items-center justify-between text-xs p-2 rounded bg-yellow-950/30"
                      >
                        <span
                          className={`px-2 py-0.5 rounded ${getSeverityColor(
                            item.severity.toLowerCase()
                          )} text-white`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-yellow-200">
                          {item.count} bugs
                        </span>
                        <span className="text-green-400">
                          ${(item.totalReward / 1000).toFixed(1)}k
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-yellow-500 text-center">
                  Updated at {result.scanTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
