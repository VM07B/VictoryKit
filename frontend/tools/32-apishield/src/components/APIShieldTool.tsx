import { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
  Eye,
  RefreshCw,
  Activity,
  Code,
  Server,
} from "lucide-react";

interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  vulnerabilities: number;
  auth: boolean;
}

interface Vulnerability {
  id: string;
  endpoint: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  cwe: string;
}

interface ScanResult {
  score: number;
  totalEndpoints: number;
  vulnerabilities: Vulnerability[];
  categories: { name: string; count: number }[];
  scanTime: string;
}

const mockVulns: Vulnerability[] = [
  {
    id: "1",
    endpoint: "POST /api/auth/login",
    type: "SQL Injection",
    severity: "critical",
    description: "User input not sanitized in login query",
    cwe: "CWE-89",
  },
  {
    id: "2",
    endpoint: "GET /api/users/:id",
    type: "BOLA",
    severity: "high",
    description: "Missing authorization check for user data",
    cwe: "CWE-639",
  },
  {
    id: "3",
    endpoint: "PUT /api/profile",
    type: "Mass Assignment",
    severity: "high",
    description: "Unprotected object properties can be modified",
    cwe: "CWE-915",
  },
  {
    id: "4",
    endpoint: "GET /api/search",
    type: "Rate Limiting",
    severity: "medium",
    description: "No rate limiting on search endpoint",
    cwe: "CWE-770",
  },
  {
    id: "5",
    endpoint: "POST /api/upload",
    type: "File Upload",
    severity: "high",
    description: "Insufficient file type validation",
    cwe: "CWE-434",
  },
];

export default function APIShieldTool() {
  const [apiUrl, setApiUrl] = useState("");
  const [specFile, setSpecFile] = useState("openapi");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveEndpoints, setLiveEndpoints] = useState<Endpoint[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentEndpoint, setCurrentEndpoint] = useState("");

  const endpoints = [
    "/api/auth/login",
    "/api/users",
    "/api/products",
    "/api/orders",
    "/api/payments",
    "/api/admin",
  ];

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 12, 95));
        setCurrentEndpoint(
          endpoints[Math.floor(Math.random() * endpoints.length)]
        );
        if (Math.random() > 0.5 && liveEndpoints.length < 6) {
          const methods: ("GET" | "POST" | "PUT" | "DELETE")[] = [
            "GET",
            "POST",
            "PUT",
            "DELETE",
          ];
          setLiveEndpoints((prev) => [
            ...prev,
            {
              id: String(prev.length + 1),
              method: methods[Math.floor(Math.random() * methods.length)],
              path: endpoints[prev.length % endpoints.length],
              vulnerabilities: Math.floor(Math.random() * 4),
              auth: Math.random() > 0.3,
            },
          ]);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isScanning, liveEndpoints.length]);

  const handleScan = () => {
    if (!apiUrl) return;
    setIsScanning(true);
    setLiveEndpoints([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(100);
      setResult({
        score: 68,
        totalEndpoints: 24,
        vulnerabilities: mockVulns,
        categories: [
          { name: "Injection", count: 2 },
          { name: "Auth Issues", count: 3 },
          { name: "Data Exposure", count: 2 },
          { name: "Rate Limiting", count: 1 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5500);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "text-red-400",
      high: "text-orange-400",
      medium: "text-yellow-400",
      low: "text-green-400",
    };
    return colors[severity as keyof typeof colors] || "text-gray-400";
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "bg-green-600",
      POST: "bg-blue-600",
      PUT: "bg-yellow-600",
      DELETE: "bg-red-600",
    };
    return colors[method as keyof typeof colors] || "bg-gray-600";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 mb-4 animate-apiPulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">APIShield</h1>
          <p className="text-fuchsia-300">API Security Testing Platform</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-fuchsia-900/30 backdrop-blur-sm rounded-2xl border border-fuchsia-700/50 p-6">
            <h2 className="text-lg font-semibold text-fuchsia-100 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-fuchsia-400" />
              API Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-fuchsia-300 mb-2">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="api-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fuchsia-300 mb-2">
                  Specification
                </label>
                <select
                  value={specFile}
                  onChange={(e) => setSpecFile(e.target.value)}
                  className="api-input w-full"
                >
                  <option value="openapi">OpenAPI 3.0</option>
                  <option value="swagger">Swagger 2.0</option>
                  <option value="graphql">GraphQL Schema</option>
                  <option value="auto">Auto-Discover</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["OWASP Top 10", "Auth Tests", "Injection", "Rate Limit"].map(
                  (test) => (
                    <label
                      key={test}
                      className="flex items-center gap-2 p-3 rounded-lg bg-fuchsia-950/50 border border-fuchsia-700/30 cursor-pointer hover:border-fuchsia-500/50 transition-all"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded text-fuchsia-500"
                      />
                      <span className="text-xs text-fuchsia-200">{test}</span>
                    </label>
                  )
                )}
              </div>

              <button
                onClick={handleScan}
                disabled={isScanning || !apiUrl}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-400 hover:to-purple-400 text-white disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Scanning API...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Start API Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-fuchsia-900/30 backdrop-blur-sm rounded-2xl border border-fuchsia-700/50 p-6">
            <h2 className="text-lg font-semibold text-fuchsia-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-fuchsia-400" />
              Endpoint Discovery
              {isScanning && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-fuchsia-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-fuchsia-500"></span>
                </span>
              )}
            </h2>

            {isScanning && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-fuchsia-300 mb-2">
                  <span>Scanning</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-fuchsia-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-fuchsia-400 mt-2 animate-pulse">
                  Testing: {currentEndpoint}
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveEndpoints.length === 0 && !isScanning && (
                <div className="text-center py-8 text-fuchsia-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter API URL to start scanning</p>
                </div>
              )}
              {liveEndpoints.map((ep, idx) => (
                <div
                  key={ep.id}
                  className="p-3 rounded-lg bg-fuchsia-950/50 border border-fuchsia-700/30 animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center gap-2">
                    <span className={`method-badge ${ep.method.toLowerCase()}`}>
                      {ep.method}
                    </span>
                    <span className="text-sm text-fuchsia-100 flex-1 truncate">
                      {ep.path}
                    </span>
                    {ep.auth ? (
                      <Lock className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  {ep.vulnerabilities > 0 && (
                    <p className="text-xs text-orange-400 mt-1">
                      {ep.vulnerabilities} potential issues
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-fuchsia-900/30 backdrop-blur-sm rounded-2xl border border-fuchsia-700/50 p-6">
            <h2 className="text-lg font-semibold text-fuchsia-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-fuchsia-400" />
              Security Analysis
            </h2>

            {!result ? (
              <div className="text-center py-12 text-fuchsia-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Complete a scan to view results</p>
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
                        stroke="#4a044e"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={
                          result.score >= 80
                            ? "#22c55e"
                            : result.score >= 60
                            ? "#eab308"
                            : "#ef4444"
                        }
                        strokeWidth="8"
                        strokeDasharray={`${result.score * 2.83} 283`}
                        className="score-ring"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {result.score}
                      </span>
                      <span className="text-xs text-fuchsia-400">Score</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-fuchsia-950/50 text-center">
                    <Server className="w-5 h-5 mx-auto text-fuchsia-400 mb-1" />
                    <p className="text-xl font-bold text-white">
                      {result.totalEndpoints}
                    </p>
                    <p className="text-xs text-fuchsia-400">Endpoints</p>
                  </div>
                  <div className="p-3 rounded-lg bg-fuchsia-950/50 text-center">
                    <AlertTriangle className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                    <p className="text-xl font-bold text-white">
                      {result.vulnerabilities.length}
                    </p>
                    <p className="text-xs text-fuchsia-400">Vulnerabilities</p>
                  </div>
                </div>

                {/* Top Vulnerabilities */}
                <div>
                  <p className="text-sm font-medium text-fuchsia-300 mb-2">
                    Top Issues
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {result.vulnerabilities.slice(0, 3).map((v) => (
                      <div
                        key={v.id}
                        className="p-2 rounded-lg bg-fuchsia-950/50 border-l-2 border-red-500"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${getSeverityColor(
                              v.severity
                            )}`}
                          >
                            {v.severity}
                          </span>
                          <span className="text-xs text-fuchsia-300">
                            {v.type}
                          </span>
                        </div>
                        <p className="text-xs text-fuchsia-400 truncate">
                          {v.endpoint}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-fuchsia-500 text-center">
                  Scanned at {result.scanTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
