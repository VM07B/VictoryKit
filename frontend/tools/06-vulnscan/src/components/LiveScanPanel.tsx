import React from "react";
import {
  Shield,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  Server,
  Globe,
  Wifi,
  Lock,
  Unlock,
  Eye,
  Zap,
  AlertOctagon,
  Target,
  Network,
  Database,
  Bug,
  FileWarning,
} from "lucide-react";

export interface ScanStep {
  id: string;
  label: string;
  status: "pending" | "running" | "complete" | "warning" | "error";
  detail?: string;
  progress?: number;
}

export interface ScanEvent {
  timestamp: number;
  type: "discovery" | "vuln" | "info" | "warning";
  severity: "info" | "low" | "medium" | "high" | "critical";
  message: string;
  port?: number;
  service?: string;
}

export interface DiscoveredPort {
  port: number;
  state: "open" | "filtered" | "closed";
  service: string;
  version?: string;
  vulns?: number;
}

interface LiveScanPanelProps {
  steps: ScanStep[];
  events: ScanEvent[];
  isScanning: boolean;
  portsScanned: number;
  portsOpen: number;
  vulnsFound: number;
  discoveredPorts: DiscoveredPort[];
  currentTarget?: string;
  progress: number;
}

const LiveScanPanel: React.FC<LiveScanPanelProps> = ({
  steps,
  events,
  isScanning,
  portsScanned,
  portsOpen,
  vulnsFound,
  discoveredPorts,
  currentTarget,
  progress,
}) => {
  const getStepIcon = (stepId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      init: <Shield className="w-4 h-4" />,
      discovery: <Network className="w-4 h-4" />,
      ports: <Wifi className="w-4 h-4" />,
      services: <Server className="w-4 h-4" />,
      os: <Database className="w-4 h-4" />,
      vulns: <Bug className="w-4 h-4" />,
      ssl: <Lock className="w-4 h-4" />,
      headers: <FileWarning className="w-4 h-4" />,
      cve: <AlertOctagon className="w-4 h-4" />,
      report: <Zap className="w-4 h-4" />,
    };
    return iconMap[stepId] || <Shield className="w-4 h-4" />;
  };

  const getStepStatus = (status: ScanStep["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "error":
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: ScanEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-gray-400 bg-slate-800/50 border-slate-700";
    }
  };

  const getPortStateColor = (state: DiscoveredPort["state"]) => {
    switch (state) {
      case "open":
        return "text-green-400";
      case "filtered":
        return "text-yellow-400";
      default:
        return "text-gray-500";
    }
  };

  const completedSteps = steps.filter((s) => s.status === "complete").length;

  return (
    <div className="vuln-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
            {isScanning && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Scan</h3>
            <p className="text-xs text-gray-500">
              {isScanning ? "Scanning for vulnerabilities..." : "Awaiting scan"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400 tabular-nums">
            {completedSteps}/{steps.length}
          </div>
          <div className="text-xs text-gray-500">stages complete</div>
        </div>
      </div>

      {/* Current Target */}
      {isScanning && currentTarget && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20 relative overflow-hidden">
          <div className="absolute inset-0 scan-gradient pointer-events-none" />
          <div className="relative z-10">
            <div className="text-xs text-gray-500 mb-1">Scanning Target</div>
            <div className="text-sm text-white truncate font-mono">
              {currentTarget}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isScanning && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full scan-progress rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-500">Ports</span>
          </div>
          <div className="text-xl font-bold text-white tabular-nums">
            {portsScanned}
          </div>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-500">Open</span>
          </div>
          <div className="text-xl font-bold text-green-400 tabular-nums">
            {portsOpen}
          </div>
        </div>
        <div
          className={`p-3 rounded-lg border ${
            vulnsFound > 0
              ? "bg-red-500/10 border-red-500/30"
              : "bg-slate-800/50 border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Bug
              className={`w-4 h-4 ${
                vulnsFound > 0 ? "text-red-400" : "text-gray-400"
              }`}
            />
            <span className="text-xs text-gray-500">Vulns</span>
          </div>
          <div
            className={`text-xl font-bold tabular-nums ${
              vulnsFound > 0 ? "text-red-400" : "text-white"
            }`}
          >
            {vulnsFound}
          </div>
        </div>
      </div>

      {/* Discovered Ports */}
      {discoveredPorts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            Open Ports ({discoveredPorts.length})
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {discoveredPorts.map((port, i) => (
              <div
                key={i}
                className="port-item flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-mono font-bold ${getPortStateColor(
                      port.state
                    )}`}
                  >
                    {port.port}
                  </span>
                  <span className="service-tag">{port.service}</span>
                  {port.version && (
                    <span className="text-xs text-gray-500">
                      {port.version}
                    </span>
                  )}
                </div>
                {port.vulns && port.vulns > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                    {port.vulns} CVE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan Steps */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Scan Stages</h4>
        <div className="space-y-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                step.status === "running"
                  ? "bg-purple-500/10 border border-purple-500/30"
                  : step.status === "complete"
                  ? "bg-green-500/5"
                  : step.status === "warning"
                  ? "bg-yellow-500/10 border border-yellow-500/30"
                  : "bg-transparent"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.status === "complete"
                    ? "bg-green-500/20 text-green-400"
                    : step.status === "running"
                    ? "bg-purple-500/20 text-purple-400"
                    : step.status === "warning"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-slate-800 text-gray-600"
                }`}
              >
                {getStepIcon(step.id)}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm ${
                    step.status === "running"
                      ? "text-purple-400"
                      : step.status === "complete"
                      ? "text-white"
                      : step.status === "warning"
                      ? "text-yellow-400"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                {step.detail && (
                  <p className="text-xs text-gray-500 truncate">
                    {step.detail}
                  </p>
                )}
              </div>
              {getStepStatus(step.status)}
            </div>
          ))}
        </div>
      </div>

      {/* Event Log */}
      <div className="flex-1 min-h-0">
        <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Discovery Events
        </h4>
        <div className="h-40 overflow-y-auto space-y-2 pr-1">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              {isScanning
                ? "Discovering services..."
                : "Start scan to see events"}
            </div>
          ) : (
            events.map((event, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border text-xs ${getSeverityColor(
                  event.severity
                )}`}
              >
                <div className="flex items-start gap-2">
                  {event.severity === "critical" ? (
                    <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : event.severity === "high" ? (
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : event.type === "vuln" ? (
                    <Bug className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="leading-relaxed">{event.message}</p>
                    {event.port && (
                      <p className="text-gray-500 mt-1 font-mono">
                        Port {event.port}{" "}
                        {event.service && `(${event.service})`}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-600 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isScanning ? "bg-green-500 animate-pulse" : "bg-gray-600"
            }`}
          />
          <span className="text-xs text-gray-500">
            {isScanning ? "Scanner active" : "Scanner idle"}
          </span>
        </div>
        <div className="text-xs text-gray-600">VulnScan v6.0</div>
      </div>
    </div>
  );
};

export default LiveScanPanel;
