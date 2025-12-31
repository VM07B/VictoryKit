import React, { useState } from "react";
import {
  Search,
  Globe,
  Server,
  Network,
  Shield,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Square,
  Target,
  Wifi,
  Database,
  Cloud,
  Lock,
} from "lucide-react";

export interface ScanFormData {
  scanType: "host" | "network" | "webapp" | "api";
  target: string;
  portRange: string;
  scanDepth: "quick" | "standard" | "deep";
  checkCVE: boolean;
  checkMisconfig: boolean;
  checkSSL: boolean;
  checkHeaders: boolean;
  bruteforce: boolean;
  osDetection: boolean;
  serviceDetection: boolean;
  scriptScan: boolean;
}

interface VulnScanFormProps {
  onScan: (data: ScanFormData) => void;
  onCancel: () => void;
  isScanning: boolean;
}

const VulnScanForm: React.FC<VulnScanFormProps> = ({
  onScan,
  onCancel,
  isScanning,
}) => {
  const [scanType, setScanType] = useState<ScanFormData["scanType"]>("host");
  const [target, setTarget] = useState("");
  const [portRange, setPortRange] = useState("1-1000");
  const [scanDepth, setScanDepth] =
    useState<ScanFormData["scanDepth"]>("standard");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [checkCVE, setCheckCVE] = useState(true);
  const [checkMisconfig, setCheckMisconfig] = useState(true);
  const [checkSSL, setCheckSSL] = useState(true);
  const [checkHeaders, setCheckHeaders] = useState(true);
  const [bruteforce, setBruteforce] = useState(false);
  const [osDetection, setOsDetection] = useState(true);
  const [serviceDetection, setServiceDetection] = useState(true);
  const [scriptScan, setScriptScan] = useState(false);

  const handleSubmit = () => {
    onScan({
      scanType,
      target,
      portRange,
      scanDepth,
      checkCVE,
      checkMisconfig,
      checkSSL,
      checkHeaders,
      bruteforce,
      osDetection,
      serviceDetection,
      scriptScan,
    });
  };

  const canSubmit = target.trim().length > 0;

  const scanTypes = [
    {
      id: "host",
      label: "Single Host",
      icon: Server,
      desc: "Scan one IP or hostname",
    },
    {
      id: "network",
      label: "Network Range",
      icon: Network,
      desc: "Scan IP range or CIDR",
    },
    {
      id: "webapp",
      label: "Web Application",
      icon: Globe,
      desc: "Full web app assessment",
    },
    {
      id: "api",
      label: "API Endpoint",
      icon: Cloud,
      desc: "REST/GraphQL API scan",
    },
  ];

  const depthOptions = [
    { id: "quick", label: "Quick", desc: "Top 100 ports, fast scan" },
    {
      id: "standard",
      label: "Standard",
      desc: "Top 1000 ports, service detection",
    },
    { id: "deep", label: "Deep", desc: "All ports, aggressive scan" },
  ];

  const quickOptions = [
    {
      id: "checkCVE",
      label: "CVE Detection",
      checked: checkCVE,
      onChange: setCheckCVE,
    },
    {
      id: "checkMisconfig",
      label: "Misconfiguration",
      checked: checkMisconfig,
      onChange: setCheckMisconfig,
    },
    {
      id: "checkSSL",
      label: "SSL/TLS Analysis",
      checked: checkSSL,
      onChange: setCheckSSL,
    },
    {
      id: "osDetection",
      label: "OS Detection",
      checked: osDetection,
      onChange: setOsDetection,
    },
  ];

  const advancedOptions = [
    {
      id: "checkHeaders",
      label: "Security Headers",
      checked: checkHeaders,
      onChange: setCheckHeaders,
    },
    {
      id: "serviceDetection",
      label: "Service Version Detection",
      checked: serviceDetection,
      onChange: setServiceDetection,
    },
    {
      id: "scriptScan",
      label: "NSE Script Scan",
      checked: scriptScan,
      onChange: setScriptScan,
    },
    {
      id: "bruteforce",
      label: "Brute Force (Careful!)",
      checked: bruteforce,
      onChange: setBruteforce,
      danger: true,
    },
  ];

  const sampleTargets: Record<string, string> = {
    host: "192.168.1.1",
    network: "192.168.1.0/24",
    webapp: "https://example.com",
    api: "https://api.example.com/v1",
  };

  return (
    <div className="vuln-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-purple-400 target-icon" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Scan Configuration</h2>
          <p className="text-xs text-gray-500">
            Configure your vulnerability scan
          </p>
        </div>
      </div>

      {/* Scan Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Scan Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {scanTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setScanType(type.id as ScanFormData["scanType"])}
              className={`p-3 rounded-xl border transition-all text-left ${
                scanType === type.id
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                  : "bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <type.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </div>
              <p className="text-xs text-gray-500">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Target Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Target
        </label>
        <div className="relative">
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={sampleTargets[scanType]}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 font-mono"
          />
          <button
            onClick={() => setTarget(sampleTargets[scanType])}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            Sample
          </button>
        </div>
      </div>

      {/* Port Range (for host/network scans) */}
      {(scanType === "host" || scanType === "network") && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Port Range
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["1-100", "1-1000", "1-65535"].map((range) => (
              <button
                key={range}
                onClick={() => setPortRange(range)}
                className={`py-2 px-3 rounded-lg text-sm transition-all ${
                  portRange === range
                    ? "bg-purple-500/20 border border-purple-500/50 text-purple-400"
                    : "bg-slate-800/50 border border-slate-700 text-gray-400 hover:border-slate-600"
                }`}
              >
                {range === "1-100"
                  ? "Quick"
                  : range === "1-1000"
                  ? "Standard"
                  : "Full"}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={portRange}
            onChange={(e) => setPortRange(e.target.value)}
            placeholder="Custom: e.g., 22,80,443,8080"
            className="mt-2 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 font-mono"
          />
        </div>
      )}

      {/* Scan Depth */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Scan Depth
        </label>
        <div className="grid grid-cols-3 gap-2">
          {depthOptions.map((depth) => (
            <button
              key={depth.id}
              onClick={() =>
                setScanDepth(depth.id as ScanFormData["scanDepth"])
              }
              className={`p-3 rounded-xl border transition-all text-center ${
                scanDepth === depth.id
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                  : "bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600"
              }`}
            >
              <span className="text-sm font-medium block">{depth.label}</span>
              <span className="text-xs text-gray-500">{depth.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Scan Options
        </label>
        <div className="grid grid-cols-2 gap-2">
          {quickOptions.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                opt.checked
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.onChange(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  opt.checked
                    ? "bg-purple-500 border-purple-500"
                    : "border-gray-600"
                }`}
              >
                {opt.checked && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm ${
                  opt.checked ? "text-white" : "text-gray-400"
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between p-3 mb-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-400">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Advanced Options</span>
        </div>
        {showAdvanced ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {showAdvanced && (
        <div className="mb-6 space-y-2">
          {advancedOptions.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                opt.checked
                  ? opt.danger
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-purple-500/10 border-purple-500/30"
                  : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.onChange(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  opt.checked
                    ? opt.danger
                      ? "bg-red-500 border-red-500"
                      : "bg-purple-500 border-purple-500"
                    : "border-gray-600"
                }`}
              >
                {opt.checked && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm ${
                  opt.checked
                    ? opt.danger
                      ? "text-red-400"
                      : "text-white"
                    : "text-gray-400"
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {isScanning ? (
        <button
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 py-4 rounded-xl hover:bg-red-500/30 transition-all font-medium"
        >
          <Square className="w-5 h-5" />
          Stop Scan
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all ${
            canSubmit
              ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/25"
              : "bg-slate-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Search className="w-5 h-5" />
          Start Vulnerability Scan
        </button>
      )}

      {/* Scan Info */}
      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-purple-400 mt-0.5" />
          <div className="text-xs text-gray-500">
            <p className="mb-1">
              <span className="text-purple-400">VulnScan</span> performs
              comprehensive security assessments including port scanning,
              service detection, and CVE matching.
            </p>
            <p className="text-gray-600">
              Only scan targets you own or have permission to test.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VulnScanForm;
