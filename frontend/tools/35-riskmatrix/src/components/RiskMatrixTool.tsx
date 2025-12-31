import { useState, useEffect } from "react";
import {
  Grid3X3,
  Shield,
  AlertTriangle,
  TrendingUp,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Target,
  BarChart3,
} from "lucide-react";

interface Risk {
  id: string;
  name: string;
  category: string;
  likelihood: number;
  impact: number;
  score: number;
  status: "mitigated" | "accepted" | "open";
}

interface ScanResult {
  overallScore: number;
  totalRisks: number;
  criticalRisks: number;
  risks: Risk[];
  categories: { name: string; count: number; avgScore: number }[];
  scanTime: string;
}

const mockRisks: Risk[] = [
  {
    id: "1",
    name: "Data Breach via SQL Injection",
    category: "Technical",
    likelihood: 4,
    impact: 5,
    score: 20,
    status: "open",
  },
  {
    id: "2",
    name: "Insider Threat - Data Exfiltration",
    category: "Human",
    likelihood: 3,
    impact: 4,
    score: 12,
    status: "open",
  },
  {
    id: "3",
    name: "DDoS Attack on Public APIs",
    category: "Technical",
    likelihood: 4,
    impact: 3,
    score: 12,
    status: "mitigated",
  },
  {
    id: "4",
    name: "Third-party Vendor Compromise",
    category: "External",
    likelihood: 2,
    impact: 5,
    score: 10,
    status: "accepted",
  },
  {
    id: "5",
    name: "Phishing Attack on Employees",
    category: "Human",
    likelihood: 5,
    impact: 3,
    score: 15,
    status: "open",
  },
];

export default function RiskMatrixTool() {
  const [projectName, setProjectName] = useState("");
  const [framework, setFramework] = useState("nist");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveRisks, setLiveRisks] = useState<Risk[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 12, 95));
        if (Math.random() > 0.5 && liveRisks.length < 5) {
          setLiveRisks((prev) => [...prev, mockRisks[prev.length]]);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, liveRisks.length]);

  const handleAnalyze = () => {
    if (!projectName) return;
    setIsAnalyzing(true);
    setLiveRisks([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setScanProgress(100);
      setResult({
        overallScore: 68,
        totalRisks: 24,
        criticalRisks: 3,
        risks: mockRisks,
        categories: [
          { name: "Technical", count: 12, avgScore: 14 },
          { name: "Human", count: 8, avgScore: 11 },
          { name: "External", count: 4, avgScore: 8 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5500);
  };

  const getRiskColor = (score: number) => {
    if (score >= 15) return "text-red-400";
    if (score >= 10) return "text-orange-400";
    if (score >= 5) return "text-yellow-400";
    return "text-green-400";
  };

  const getCellColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return "bg-red-600";
    if (score >= 10) return "bg-orange-600";
    if (score >= 5) return "bg-yellow-600";
    return "bg-green-600";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 animate-riskPulse">
            <Grid3X3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">RiskMatrix</h1>
          <p className="text-orange-300">Risk Assessment Platform</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-orange-900/30 backdrop-blur-sm rounded-2xl border border-orange-700/50 p-6">
            <h2 className="text-lg font-semibold text-orange-100 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Assessment Config
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Production System"
                  className="risk-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-300 mb-2">
                  Framework
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="risk-input w-full"
                >
                  <option value="nist">NIST RMF</option>
                  <option value="iso">ISO 27005</option>
                  <option value="fair">FAIR</option>
                  <option value="octave">OCTAVE</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Technical", "Human", "External", "Process"].map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 p-3 rounded-lg bg-orange-950/50 border border-orange-700/30 cursor-pointer hover:border-orange-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-orange-500"
                    />
                    <span className="text-xs text-orange-200">{cat}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !projectName}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Risks...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Assess Risks
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-orange-900/30 backdrop-blur-sm rounded-2xl border border-orange-700/50 p-6">
            <h2 className="text-lg font-semibold text-orange-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              Risk Discovery
              {isAnalyzing && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
              )}
            </h2>

            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-orange-300 mb-2">
                  <span>Analyzing</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-orange-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveRisks.length === 0 && !isAnalyzing && (
                <div className="text-center py-8 text-orange-500">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter project to assess</p>
                </div>
              )}
              {liveRisks.map((risk, idx) => (
                <div
                  key={risk.id}
                  className="risk-card bg-orange-950/50 border border-orange-700/30 animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-100 font-medium">
                      {risk.name}
                    </span>
                    <span
                      className={`text-sm font-bold ${getRiskColor(
                        risk.score
                      )}`}
                    >
                      {risk.score}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-400">{risk.category}</span>
                    <span className="text-orange-300">
                      L:{risk.likelihood} × I:{risk.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-orange-900/30 backdrop-blur-sm rounded-2xl border border-orange-700/50 p-6">
            <h2 className="text-lg font-semibold text-orange-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-400" />
              Risk Matrix
            </h2>

            {!result ? (
              <div className="text-center py-12 text-orange-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Complete assessment to view matrix</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Mini Risk Matrix */}
                <div className="grid grid-cols-6 gap-1 text-xs">
                  <div className="col-span-1"></div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="text-center text-orange-400">
                      {i}
                    </div>
                  ))}
                  {[5, 4, 3, 2, 1].map((likelihood) => (
                    <>
                      <div
                        key={`l-${likelihood}`}
                        className="text-orange-400 text-center"
                      >
                        {likelihood}
                      </div>
                      {[1, 2, 3, 4, 5].map((impact) => (
                        <div
                          key={`${likelihood}-${impact}`}
                          className={`risk-cell ${getCellColor(
                            likelihood,
                            impact
                          )} text-white text-xs rounded`}
                        >
                          {likelihood * impact}
                        </div>
                      ))}
                    </>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-orange-950/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {result.totalRisks}
                    </p>
                    <p className="text-xs text-orange-400">Total</p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-950/50 text-center">
                    <p className="text-lg font-bold text-red-400">
                      {result.criticalRisks}
                    </p>
                    <p className="text-xs text-orange-400">Critical</p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-950/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {result.overallScore}
                    </p>
                    <p className="text-xs text-orange-400">Score</p>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-sm font-medium text-orange-300 mb-2">
                    By Category
                  </p>
                  <div className="space-y-2">
                    {result.categories.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <span className="text-xs text-orange-400 w-16">
                          {cat.name}
                        </span>
                        <div className="flex-1 h-2 bg-orange-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500"
                            style={{
                              width: `${
                                (cat.count / result.totalRisks) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-orange-300">
                          {cat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-orange-500 text-center">
                  Assessed at {result.scanTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
