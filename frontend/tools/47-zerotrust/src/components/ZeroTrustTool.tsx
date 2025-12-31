import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Key,
  Fingerprint,
} from "lucide-react";

interface AccessRequest {
  id: string;
  user: string;
  resource: string;
  action: string;
  device: string;
  location: string;
  riskScore: number;
  status: "granted" | "denied" | "pending";
}

interface ScanResult {
  totalRequests: number;
  grantedRate: number;
  deniedCount: number;
  requests: AccessRequest[];
  riskDistribution: { level: string; count: number }[];
  trustScore: number;
  scanTime: string;
}

const mockRequests: AccessRequest[] = [
  {
    id: "1",
    user: "john.doe@corp.com",
    resource: "prod-database",
    action: "read",
    device: "MacBook Pro",
    location: "New York, US",
    riskScore: 15,
    status: "granted",
  },
  {
    id: "2",
    user: "unknown@external.com",
    resource: "admin-panel",
    action: "write",
    device: "Unknown",
    location: "Moscow, RU",
    riskScore: 95,
    status: "denied",
  },
  {
    id: "3",
    user: "jane.smith@corp.com",
    resource: "api-gateway",
    action: "execute",
    device: "iPhone 15",
    location: "London, UK",
    riskScore: 25,
    status: "granted",
  },
  {
    id: "4",
    user: "dev@corp.com",
    resource: "secrets-vault",
    action: "read",
    device: "Linux Server",
    location: "Singapore",
    riskScore: 45,
    status: "pending",
  },
  {
    id: "5",
    user: "admin@corp.com",
    resource: "iam-roles",
    action: "modify",
    device: "Windows PC",
    location: "San Francisco, US",
    riskScore: 65,
    status: "denied",
  },
];

export default function ZeroTrustTool() {
  const [policyType, setPolicyType] = useState("strict");
  const [verifyMethod, setVerifyMethod] = useState("mfa");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveRequests, setLiveRequests] = useState<AccessRequest[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 15, 95));
        if (Math.random() > 0.4 && liveRequests.length < 5) {
          setLiveRequests((prev) => [...prev, mockRequests[prev.length]]);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, liveRequests.length]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setLiveRequests([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setScanProgress(100);
      setResult({
        totalRequests: 8945,
        grantedRate: 78.5,
        deniedCount: 1924,
        requests: mockRequests,
        riskDistribution: [
          { level: "Low (0-25)", count: 5678 },
          { level: "Medium (26-50)", count: 2134 },
          { level: "High (51-75)", count: 892 },
          { level: "Critical (76-100)", count: 241 },
        ],
        trustScore: 87,
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getRiskColor = (score: number) => {
    if (score <= 25) return "text-green-400";
    if (score <= 50) return "text-yellow-400";
    if (score <= 75) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 animate-trustVerify">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ZeroTrust</h1>
          <p className="text-green-300">Zero Trust Security Framework</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-green-900/30 backdrop-blur-sm rounded-2xl border border-green-700/50 p-6">
            <h2 className="text-lg font-semibold text-green-100 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-400" />
              Policy Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  Policy Mode
                </label>
                <select
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                  className="trust-input"
                >
                  <option value="strict">Strict - Deny by Default</option>
                  <option value="moderate">Moderate - Risk-Based</option>
                  <option value="permissive">Permissive - Allow Known</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  Verification Method
                </label>
                <select
                  value={verifyMethod}
                  onChange={(e) => setVerifyMethod(e.target.value)}
                  className="trust-input"
                >
                  <option value="mfa">Multi-Factor Auth</option>
                  <option value="biometric">Biometric</option>
                  <option value="certificate">Certificate-Based</option>
                  <option value="continuous">Continuous Auth</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Device Trust", "Location", "Time-Based", "Behavior"].map(
                  (type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 p-3 rounded-lg bg-green-950/50 border border-green-700/30 cursor-pointer hover:border-green-500/50 transition-all"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded text-green-500"
                      />
                      <span className="text-xs text-green-200">{type}</span>
                    </label>
                  )
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Access...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze Trust
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-green-900/30 backdrop-blur-sm rounded-2xl border border-green-700/50 p-6">
            <h2 className="text-lg font-semibold text-green-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Access Requests
              {isAnalyzing && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </h2>

            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-green-300 mb-2">
                  <span>Verifying</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-green-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveRequests.length === 0 && !isAnalyzing && (
                <div className="text-center py-8 text-green-500">
                  <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start analysis to view requests</p>
                </div>
              )}
              {liveRequests.map((req, idx) => (
                <div
                  key={req.id}
                  className="trust-card animate-shieldLock"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-green-100 font-medium text-sm truncate">
                      {req.user}
                    </span>
                    <span className={`access-badge ${req.status}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <Key className="w-3 h-3" />
                    <span>
                      {req.action} → {req.resource}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-green-500">{req.location}</span>
                    <span className={getRiskColor(req.riskScore)}>
                      Risk: {req.riskScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-green-900/30 backdrop-blur-sm rounded-2xl border border-green-700/50 p-6">
            <h2 className="text-lg font-semibold text-green-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Trust Analysis
            </h2>

            {!result ? (
              <div className="text-center py-12 text-green-500">
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Analyze to view trust status</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Trust Score Ring */}
                <div className="text-center p-4 rounded-xl bg-green-950/50 border border-green-700/30">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#064e3b"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#22c55e"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${result.trustScore * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                      {result.trustScore}
                    </span>
                  </div>
                  <p className="text-green-400 text-sm">Trust Score</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-green-950/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {(result.totalRequests / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-green-400">Requests</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-950/50 text-center">
                    <p className="text-lg font-bold text-green-400">
                      {result.grantedRate}%
                    </p>
                    <p className="text-xs text-green-400">Granted</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-950/50 text-center">
                    <p className="text-lg font-bold text-red-400">
                      {result.deniedCount}
                    </p>
                    <p className="text-xs text-green-400">Denied</p>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div>
                  <p className="text-sm font-medium text-green-300 mb-2">
                    Risk Distribution
                  </p>
                  <div className="space-y-2">
                    {result.riskDistribution.map((item) => (
                      <div key={item.level} className="flex items-center gap-2">
                        <span className="text-xs text-green-400 w-28 truncate">
                          {item.level}
                        </span>
                        <div className="flex-1 h-2 bg-green-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${
                                (item.count / result.totalRequests) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-green-500 text-center">
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
