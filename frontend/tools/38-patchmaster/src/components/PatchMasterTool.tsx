import { useState, useEffect } from "react";
import {
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Package,
} from "lucide-react";

interface Patch {
  id: string;
  name: string;
  vendor: string;
  severity: "critical" | "important" | "moderate" | "low";
  kb: string;
  affectedSystems: number;
  status: "pending" | "installing" | "installed" | "failed";
}

interface ScanResult {
  totalPatches: number;
  criticalPatches: number;
  installedToday: number;
  patches: Patch[];
  vendors: { name: string; count: number }[];
  scanTime: string;
}

const mockPatches: Patch[] = [
  {
    id: "1",
    name: "Windows Security Update",
    vendor: "Microsoft",
    severity: "critical",
    kb: "KB5034441",
    affectedSystems: 45,
    status: "pending",
  },
  {
    id: "2",
    name: "Chrome Browser Update",
    vendor: "Google",
    severity: "important",
    kb: "v120.0.6099",
    affectedSystems: 78,
    status: "pending",
  },
  {
    id: "3",
    name: "OpenSSL Patch",
    vendor: "OpenSSL",
    severity: "critical",
    kb: "3.2.1",
    affectedSystems: 23,
    status: "installing",
  },
  {
    id: "4",
    name: "Adobe Reader Update",
    vendor: "Adobe",
    severity: "moderate",
    kb: "2024.001",
    affectedSystems: 56,
    status: "installed",
  },
  {
    id: "5",
    name: "Java Runtime Update",
    vendor: "Oracle",
    severity: "important",
    kb: "JRE 21.0.2",
    affectedSystems: 34,
    status: "pending",
  },
];

export default function PatchMasterTool() {
  const [targetGroup, setTargetGroup] = useState("");
  const [patchType, setPatchType] = useState("all");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [livePatches, setLivePatches] = useState<Patch[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 12, 95));
        if (Math.random() > 0.5 && livePatches.length < 5) {
          setLivePatches((prev) => [...prev, mockPatches[prev.length]]);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isScanning, livePatches.length]);

  const handleScan = () => {
    if (!targetGroup) return;
    setIsScanning(true);
    setLivePatches([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(100);
      setResult({
        totalPatches: 67,
        criticalPatches: 8,
        installedToday: 12,
        patches: mockPatches,
        vendors: [
          { name: "Microsoft", count: 28 },
          { name: "Google", count: 15 },
          { name: "Adobe", count: 12 },
          { name: "Oracle", count: 8 },
          { name: "Others", count: 4 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "text-red-400",
      important: "text-orange-400",
      moderate: "text-yellow-400",
      low: "text-green-400",
    };
    return colors[severity as keyof typeof colors] || "text-gray-400";
  };

  const getStatusIcon = (status: string) => {
    if (status === "installed")
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "installing")
      return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
    if (status === "failed")
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mb-4 animate-patchApply">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PatchMaster</h1>
          <p className="text-pink-300">Patch Management System</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-pink-900/30 backdrop-blur-sm rounded-2xl border border-pink-700/50 p-6">
            <h2 className="text-lg font-semibold text-pink-100 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-400" />
              Patch Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pink-300 mb-2">
                  Target Group
                </label>
                <input
                  type="text"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  placeholder="production-servers"
                  className="patch-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pink-300 mb-2">
                  Patch Type
                </label>
                <select
                  value={patchType}
                  onChange={(e) => setPatchType(e.target.value)}
                  className="patch-input w-full"
                >
                  <option value="all">All Patches</option>
                  <option value="critical">Critical Only</option>
                  <option value="security">Security Updates</option>
                  <option value="feature">Feature Updates</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Windows", "Linux", "macOS", "Apps"].map((os) => (
                  <label
                    key={os}
                    className="flex items-center gap-2 p-3 rounded-lg bg-pink-950/50 border border-pink-700/30 cursor-pointer hover:border-pink-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-pink-500"
                    />
                    <span className="text-xs text-pink-200">{os}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleScan}
                disabled={isScanning || !targetGroup}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Scanning Patches...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Scan for Patches
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-pink-900/30 backdrop-blur-sm rounded-2xl border border-pink-700/50 p-6">
            <h2 className="text-lg font-semibold text-pink-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-400" />
              Patch Discovery
              {isScanning && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-pink-500"></span>
                </span>
              )}
            </h2>

            {isScanning && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-pink-300 mb-2">
                  <span>Scanning</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-pink-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {livePatches.length === 0 && !isScanning && (
                <div className="text-center py-8 text-pink-500">
                  <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter target group to scan</p>
                </div>
              )}
              {livePatches.map((patch, idx) => (
                <div
                  key={patch.id}
                  className="patch-card animate-updateFlow"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-pink-100 font-medium truncate flex-1">
                      {patch.name}
                    </span>
                    {getStatusIcon(patch.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-pink-400">
                      {patch.vendor} • {patch.kb}
                    </span>
                    <span className={`patch-status ${patch.severity}`}>
                      {patch.severity}
                    </span>
                  </div>
                  <p className="text-xs text-pink-500 mt-1">
                    {patch.affectedSystems} systems affected
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-pink-900/30 backdrop-blur-sm rounded-2xl border border-pink-700/50 p-6">
            <h2 className="text-lg font-semibold text-pink-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-pink-400" />
              Patch Status
            </h2>

            {!result ? (
              <div className="text-center py-12 text-pink-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Scan to view patch status</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-pink-950/50 text-center">
                    <p className="text-2xl font-bold text-white">
                      {result.totalPatches}
                    </p>
                    <p className="text-xs text-pink-400">Available</p>
                  </div>
                  <div className="p-3 rounded-lg bg-pink-950/50 text-center">
                    <p className="text-2xl font-bold text-red-400">
                      {result.criticalPatches}
                    </p>
                    <p className="text-xs text-pink-400">Critical</p>
                  </div>
                  <div className="p-3 rounded-lg bg-pink-950/50 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {result.installedToday}
                    </p>
                    <p className="text-xs text-pink-400">Installed</p>
                  </div>
                </div>

                {/* Vendors */}
                <div>
                  <p className="text-sm font-medium text-pink-300 mb-2">
                    By Vendor
                  </p>
                  <div className="space-y-2">
                    {result.vendors.map((vendor) => (
                      <div
                        key={vendor.name}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-pink-400 w-20">
                          {vendor.name}
                        </span>
                        <div className="flex-1 h-2 bg-pink-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-500"
                            style={{
                              width: `${
                                (vendor.count / result.totalPatches) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-pink-300">
                          {vendor.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium text-sm hover:from-pink-500 hover:to-rose-500 transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Deploy All Critical Patches
                </button>

                <p className="text-xs text-pink-500 text-center">
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
