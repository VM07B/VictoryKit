import { useState, useEffect } from "react";
import {
  Monitor,
  Shield,
  Server,
  Laptop,
  Cloud,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Wifi,
  HardDrive,
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: "server" | "workstation" | "network" | "cloud";
  ip: string;
  status: "online" | "offline" | "warning";
  lastSeen: string;
  vulnerabilities: number;
}

interface ScanResult {
  totalAssets: number;
  onlineAssets: number;
  criticalAssets: number;
  assets: Asset[];
  categories: { name: string; count: number }[];
  scanTime: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    name: "prod-web-01",
    type: "server",
    ip: "10.0.1.10",
    status: "online",
    lastSeen: "2024-12-30 14:30",
    vulnerabilities: 2,
  },
  {
    id: "2",
    name: "dev-laptop-042",
    type: "workstation",
    ip: "10.0.2.42",
    status: "online",
    lastSeen: "2024-12-30 14:28",
    vulnerabilities: 0,
  },
  {
    id: "3",
    name: "core-switch-01",
    type: "network",
    ip: "10.0.0.1",
    status: "online",
    lastSeen: "2024-12-30 14:30",
    vulnerabilities: 1,
  },
  {
    id: "4",
    name: "aws-ec2-prod",
    type: "cloud",
    ip: "52.23.145.67",
    status: "warning",
    lastSeen: "2024-12-30 13:45",
    vulnerabilities: 3,
  },
  {
    id: "5",
    name: "db-server-01",
    type: "server",
    ip: "10.0.1.20",
    status: "offline",
    lastSeen: "2024-12-29 22:15",
    vulnerabilities: 5,
  },
];

export default function AssetTrackerTool() {
  const [networkRange, setNetworkRange] = useState("");
  const [scanDepth, setScanDepth] = useState("standard");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveAssets, setLiveAssets] = useState<Asset[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 12, 95));
        if (Math.random() > 0.5 && liveAssets.length < 5) {
          setLiveAssets((prev) => [...prev, mockAssets[prev.length]]);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isScanning, liveAssets.length]);

  const handleScan = () => {
    if (!networkRange) return;
    setIsScanning(true);
    setLiveAssets([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(100);
      setResult({
        totalAssets: 156,
        onlineAssets: 142,
        criticalAssets: 12,
        assets: mockAssets,
        categories: [
          { name: "Servers", count: 45 },
          { name: "Workstations", count: 78 },
          { name: "Network", count: 18 },
          { name: "Cloud", count: 15 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5500);
  };

  const getTypeIcon = (type: string) => {
    if (type === "server") return <Server className="w-4 h-4 text-blue-400" />;
    if (type === "workstation")
      return <Laptop className="w-4 h-4 text-green-400" />;
    if (type === "network") return <Wifi className="w-4 h-4 text-purple-400" />;
    return <Cloud className="w-4 h-4 text-cyan-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "online") return "bg-green-500";
    if (status === "warning") return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 mb-4 animate-assetPing">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AssetTracker</h1>
          <p className="text-teal-300">IT Asset Management</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-teal-900/30 backdrop-blur-sm rounded-2xl border border-teal-700/50 p-6">
            <h2 className="text-lg font-semibold text-teal-100 mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-teal-400" />
              Discovery Config
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-300 mb-2">
                  Network Range
                </label>
                <input
                  type="text"
                  value={networkRange}
                  onChange={(e) => setNetworkRange(e.target.value)}
                  placeholder="10.0.0.0/16"
                  className="asset-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-teal-300 mb-2">
                  Scan Depth
                </label>
                <select
                  value={scanDepth}
                  onChange={(e) => setScanDepth(e.target.value)}
                  className="asset-input w-full"
                >
                  <option value="quick">Quick Scan</option>
                  <option value="standard">Standard</option>
                  <option value="deep">Deep Scan</option>
                  <option value="full">Full Discovery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Servers", "Workstations", "Network", "Cloud"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 p-3 rounded-lg bg-teal-950/50 border border-teal-700/30 cursor-pointer hover:border-teal-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-teal-500"
                    />
                    <span className="text-xs text-teal-200">{type}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleScan}
                disabled={isScanning || !networkRange}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Discovering Assets...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Discover Assets
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-teal-900/30 backdrop-blur-sm rounded-2xl border border-teal-700/50 p-6">
            <h2 className="text-lg font-semibold text-teal-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Asset Discovery
              {isScanning && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
              )}
            </h2>

            {isScanning && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-teal-300 mb-2">
                  <span>Scanning</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-teal-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveAssets.length === 0 && !isScanning && (
                <div className="text-center py-8 text-teal-500">
                  <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter network range to scan</p>
                </div>
              )}
              {liveAssets.map((asset, idx) => (
                <div
                  key={asset.id}
                  className="asset-card animate-trackMove"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(asset.type)}
                      <span className="text-sm text-teal-100 font-medium">
                        {asset.name}
                      </span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        asset.status
                      )}`}
                    ></span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-400">{asset.ip}</span>
                    {asset.vulnerabilities > 0 && (
                      <span className="text-orange-400">
                        {asset.vulnerabilities} vulns
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-teal-900/30 backdrop-blur-sm rounded-2xl border border-teal-700/50 p-6">
            <h2 className="text-lg font-semibold text-teal-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-400" />
              Asset Inventory
            </h2>

            {!result ? (
              <div className="text-center py-12 text-teal-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Complete scan to view inventory</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-teal-950/50 text-center">
                    <p className="text-2xl font-bold text-white">
                      {result.totalAssets}
                    </p>
                    <p className="text-xs text-teal-400">Total</p>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-950/50 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {result.onlineAssets}
                    </p>
                    <p className="text-xs text-teal-400">Online</p>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-950/50 text-center">
                    <p className="text-2xl font-bold text-orange-400">
                      {result.criticalAssets}
                    </p>
                    <p className="text-xs text-teal-400">Critical</p>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-sm font-medium text-teal-300 mb-2">
                    By Type
                  </p>
                  <div className="space-y-2">
                    {result.categories.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <span className="text-xs text-teal-400 w-24">
                          {cat.name}
                        </span>
                        <div className="flex-1 h-2 bg-teal-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500"
                            style={{
                              width: `${
                                (cat.count / result.totalAssets) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-teal-300">
                          {cat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Assets */}
                <div>
                  <p className="text-sm font-medium text-teal-300 mb-2">
                    Recent Discoveries
                  </p>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {result.assets.slice(0, 3).map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-teal-950/50"
                      >
                        <div className="flex items-center gap-2">
                          {getTypeIcon(asset.type)}
                          <span className="text-xs text-teal-100">
                            {asset.name}
                          </span>
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            asset.status
                          )}`}
                        ></span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-teal-500 text-center">
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
