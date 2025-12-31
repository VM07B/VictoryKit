import { useState, useEffect } from "react";
import {
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Book,
} from "lucide-react";

interface Policy {
  id: string;
  name: string;
  category: string;
  status: "compliant" | "non-compliant" | "warning";
  lastChecked: string;
  violations: number;
}

interface ScanResult {
  complianceScore: number;
  totalPolicies: number;
  violations: number;
  policies: Policy[];
  categories: { name: string; compliant: number; total: number }[];
  scanTime: string;
}

const mockPolicies: Policy[] = [
  {
    id: "1",
    name: "Password Complexity",
    category: "Authentication",
    status: "compliant",
    lastChecked: "2024-12-30",
    violations: 0,
  },
  {
    id: "2",
    name: "MFA Enforcement",
    category: "Authentication",
    status: "non-compliant",
    lastChecked: "2024-12-30",
    violations: 12,
  },
  {
    id: "3",
    name: "Data Encryption at Rest",
    category: "Data Protection",
    status: "compliant",
    lastChecked: "2024-12-30",
    violations: 0,
  },
  {
    id: "4",
    name: "Network Segmentation",
    category: "Network",
    status: "warning",
    lastChecked: "2024-12-30",
    violations: 3,
  },
  {
    id: "5",
    name: "Access Logging",
    category: "Monitoring",
    status: "compliant",
    lastChecked: "2024-12-30",
    violations: 0,
  },
];

export default function PolicyEnforcerTool() {
  const [policySet, setPolicySet] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [isEnforcing, setIsEnforcing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [livePolicies, setLivePolicies] = useState<Policy[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isEnforcing) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 12, 95));
        if (Math.random() > 0.5 && livePolicies.length < 5) {
          setLivePolicies((prev) => [...prev, mockPolicies[prev.length]]);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isEnforcing, livePolicies.length]);

  const handleEnforce = () => {
    if (!policySet) return;
    setIsEnforcing(true);
    setLivePolicies([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsEnforcing(false);
      setScanProgress(100);
      setResult({
        complianceScore: 82,
        totalPolicies: 45,
        violations: 15,
        policies: mockPolicies,
        categories: [
          { name: "Authentication", compliant: 8, total: 10 },
          { name: "Data Protection", compliant: 12, total: 12 },
          { name: "Network", compliant: 6, total: 8 },
          { name: "Monitoring", compliant: 10, total: 15 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getStatusIcon = (status: string) => {
    if (status === "compliant")
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "non-compliant")
      return <XCircle className="w-4 h-4 text-red-400" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 animate-policyCheck">
            <FileCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PolicyEnforcer</h1>
          <p className="text-violet-300">Security Policy Management</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-violet-900/30 backdrop-blur-sm rounded-2xl border border-violet-700/50 p-6">
            <h2 className="text-lg font-semibold text-violet-100 mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-violet-400" />
              Policy Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-violet-300 mb-2">
                  Policy Set
                </label>
                <input
                  type="text"
                  value={policySet}
                  onChange={(e) => setPolicySet(e.target.value)}
                  placeholder="security-baseline-v2"
                  className="policy-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-violet-300 mb-2">
                  Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="policy-input w-full"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                  <option value="all">All Environments</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Auth", "Data", "Network", "Monitor"].map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 p-3 rounded-lg bg-violet-950/50 border border-violet-700/30 cursor-pointer hover:border-violet-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-violet-500"
                    />
                    <span className="text-xs text-violet-200">{cat}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleEnforce}
                disabled={isEnforcing || !policySet}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white disabled:opacity-50"
              >
                {isEnforcing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Enforcing Policies...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Enforce Policies
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-violet-900/30 backdrop-blur-sm rounded-2xl border border-violet-700/50 p-6">
            <h2 className="text-lg font-semibold text-violet-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              Policy Checks
              {isEnforcing && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-violet-500"></span>
                </span>
              )}
            </h2>

            {isEnforcing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-violet-300 mb-2">
                  <span>Checking</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-violet-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {livePolicies.length === 0 && !isEnforcing && (
                <div className="text-center py-8 text-violet-500">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter policy set to check</p>
                </div>
              )}
              {livePolicies.map((policy, idx) => (
                <div
                  key={policy.id}
                  className="policy-card animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-violet-100 font-medium">
                      {policy.name}
                    </span>
                    {getStatusIcon(policy.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-violet-400">{policy.category}</span>
                    {policy.violations > 0 && (
                      <span className="text-red-400">
                        {policy.violations} violations
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-violet-900/30 backdrop-blur-sm rounded-2xl border border-violet-700/50 p-6">
            <h2 className="text-lg font-semibold text-violet-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-violet-400" />
              Compliance Status
            </h2>

            {!result ? (
              <div className="text-center py-12 text-violet-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Enforce policies to view status</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Score Ring */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#2e1065"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={
                          result.complianceScore >= 80
                            ? "#22c55e"
                            : result.complianceScore >= 60
                            ? "#eab308"
                            : "#ef4444"
                        }
                        strokeWidth="8"
                        strokeDasharray={`${result.complianceScore * 2.83} 283`}
                        className="score-ring"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {result.complianceScore}%
                      </span>
                      <span className="text-xs text-violet-400">Compliant</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-violet-950/50 text-center">
                    <p className="text-xl font-bold text-white">
                      {result.totalPolicies}
                    </p>
                    <p className="text-xs text-violet-400">Policies</p>
                  </div>
                  <div className="p-3 rounded-lg bg-violet-950/50 text-center">
                    <p className="text-xl font-bold text-red-400">
                      {result.violations}
                    </p>
                    <p className="text-xs text-violet-400">Violations</p>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-sm font-medium text-violet-300 mb-2">
                    By Category
                  </p>
                  <div className="space-y-2">
                    {result.categories.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <span className="text-xs text-violet-400 w-20">
                          {cat.name}
                        </span>
                        <div className="flex-1 h-2 bg-violet-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              cat.compliant === cat.total
                                ? "bg-green-500"
                                : "bg-violet-500"
                            }`}
                            style={{
                              width: `${(cat.compliant / cat.total) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-violet-300">
                          {cat.compliant}/{cat.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-violet-500 text-center">
                  Checked at {result.scanTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
