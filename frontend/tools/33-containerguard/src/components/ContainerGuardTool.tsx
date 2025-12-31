import { useState, useEffect } from "react";
import {
  Box,
  Shield,
  AlertTriangle,
  CheckCircle,
  Layers,
  Lock,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Package,
} from "lucide-react";

interface Layer {
  id: string;
  name: string;
  size: string;
  vulnerabilities: number;
}

interface Vulnerability {
  id: string;
  package: string;
  version: string;
  severity: "critical" | "high" | "medium" | "low";
  cve: string;
  fixVersion: string;
}

interface ScanResult {
  score: number;
  totalLayers: number;
  totalPackages: number;
  vulnerabilities: Vulnerability[];
  imageSize: string;
  scanTime: string;
}

const mockVulns: Vulnerability[] = [
  {
    id: "1",
    package: "openssl",
    version: "1.1.1k",
    severity: "critical",
    cve: "CVE-2024-1234",
    fixVersion: "1.1.1l",
  },
  {
    id: "2",
    package: "curl",
    version: "7.79.0",
    severity: "high",
    cve: "CVE-2024-2345",
    fixVersion: "7.80.0",
  },
  {
    id: "3",
    package: "libc",
    version: "2.31",
    severity: "medium",
    cve: "CVE-2024-3456",
    fixVersion: "2.32",
  },
  {
    id: "4",
    package: "zlib",
    version: "1.2.11",
    severity: "high",
    cve: "CVE-2024-4567",
    fixVersion: "1.2.12",
  },
  {
    id: "5",
    package: "python",
    version: "3.9.0",
    severity: "low",
    cve: "CVE-2024-5678",
    fixVersion: "3.9.1",
  },
];

export default function ContainerGuardTool() {
  const [imageName, setImageName] = useState("");
  const [registry, setRegistry] = useState("docker");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveLayers, setLiveLayers] = useState<Layer[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentLayer, setCurrentLayer] = useState("");

  const layerNames = [
    "base-os",
    "dependencies",
    "runtime",
    "app-code",
    "config",
  ];

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 15, 95));
        setCurrentLayer(
          layerNames[Math.floor(Math.random() * layerNames.length)]
        );
        if (Math.random() > 0.5 && liveLayers.length < 5) {
          setLiveLayers((prev) => [
            ...prev,
            {
              id: String(prev.length + 1),
              name: layerNames[prev.length],
              size: `${Math.floor(Math.random() * 200 + 50)}MB`,
              vulnerabilities: Math.floor(Math.random() * 5),
            },
          ]);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isScanning, liveLayers.length]);

  const handleScan = () => {
    if (!imageName) return;
    setIsScanning(true);
    setLiveLayers([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(100);
      setResult({
        score: 74,
        totalLayers: 12,
        totalPackages: 156,
        vulnerabilities: mockVulns,
        imageSize: "456MB",
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 mb-4 animate-containerSpin">
            <Box className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ContainerGuard</h1>
          <p className="text-cyan-300">Container Security Scanner</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-cyan-900/30 backdrop-blur-sm rounded-2xl border border-cyan-700/50 p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              Container Image
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Image Name
                </label>
                <input
                  type="text"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  placeholder="nginx:latest"
                  className="container-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Registry
                </label>
                <select
                  value={registry}
                  onChange={(e) => setRegistry(e.target.value)}
                  className="container-input w-full"
                >
                  <option value="docker">Docker Hub</option>
                  <option value="gcr">Google Container Registry</option>
                  <option value="ecr">AWS ECR</option>
                  <option value="acr">Azure ACR</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["CVE Scan", "Secrets", "Config", "SBOM"].map((check) => (
                  <label
                    key={check}
                    className="flex items-center gap-2 p-3 rounded-lg bg-cyan-950/50 border border-cyan-700/30 cursor-pointer hover:border-cyan-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-cyan-500"
                    />
                    <span className="text-xs text-cyan-200">{check}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleScan}
                disabled={isScanning || !imageName}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Scanning Image...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Scan Container
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-cyan-900/30 backdrop-blur-sm rounded-2xl border border-cyan-700/50 p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Layer Analysis
              {isScanning && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              )}
            </h2>

            {isScanning && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-cyan-300 mb-2">
                  <span>Analyzing</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-cyan-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-cyan-400 mt-2 animate-pulse">
                  Layer: {currentLayer}
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveLayers.length === 0 && !isScanning && (
                <div className="text-center py-8 text-cyan-500">
                  <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter image name to scan</p>
                </div>
              )}
              {liveLayers.map((layer, idx) => (
                <div
                  key={layer.id}
                  className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-700/30 animate-layerStack"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-cyan-100">
                        {layer.name}
                      </span>
                    </div>
                    <span className="text-xs text-cyan-400">{layer.size}</span>
                  </div>
                  {layer.vulnerabilities > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-orange-400">
                        {layer.vulnerabilities} vulnerabilities
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-cyan-900/30 backdrop-blur-sm rounded-2xl border border-cyan-700/50 p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Scan Results
            </h2>

            {!result ? (
              <div className="text-center py-12 text-cyan-500">
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
                        stroke="#083344"
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
                      <span className="text-xs text-cyan-400">Score</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-cyan-950/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {result.totalLayers}
                    </p>
                    <p className="text-xs text-cyan-400">Layers</p>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-950/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {result.totalPackages}
                    </p>
                    <p className="text-xs text-cyan-400">Packages</p>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-950/50 text-center">
                    <p className="text-lg font-bold text-orange-400">
                      {result.vulnerabilities.length}
                    </p>
                    <p className="text-xs text-cyan-400">CVEs</p>
                  </div>
                </div>

                {/* Top Vulnerabilities */}
                <div>
                  <p className="text-sm font-medium text-cyan-300 mb-2">
                    Top CVEs
                  </p>
                  <div className="space-y-2 max-h-28 overflow-y-auto">
                    {result.vulnerabilities.slice(0, 3).map((v) => (
                      <div key={v.id} className="p-2 rounded-lg bg-cyan-950/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-cyan-100">
                            {v.package}
                          </span>
                          <span className={`vuln-severity ${v.severity}`}>
                            {v.severity}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-400">{v.cve}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-cyan-500 text-center">
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
