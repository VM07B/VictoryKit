import React, { useState, useCallback, useRef } from "react";
import {
  Target,
  Shield,
  Activity,
  Globe,
  Server,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Radio,
  Satellite,
  Network,
  Radar,
} from "lucide-react";
import ThreatScanForm, { ScanConfig } from "./ThreatScanForm";
import LiveDetectionPanel, {
  DetectionStep,
  DetectionEvent,
} from "./LiveDetectionPanel";
import AnimatedThreatResult, {
  ThreatDetectionResult,
} from "./AnimatedThreatResult";

const DETECTION_STEPS: DetectionStep[] = [
  { id: "init", label: "Initializing Radar", status: "pending" },
  { id: "network", label: "Network Scan", status: "pending" },
  { id: "endpoint", label: "Endpoint Probe", status: "pending" },
  { id: "signature", label: "Signature Match", status: "pending" },
  { id: "behavior", label: "Behavior Analysis", status: "pending" },
  { id: "anomaly", label: "Anomaly Detection", status: "pending" },
  { id: "malware", label: "Malware Scan", status: "pending" },
  { id: "lateral", label: "Lateral Movement", status: "pending" },
  { id: "correlation", label: "Threat Correlation", status: "pending" },
  { id: "ai", label: "AI Assessment", status: "pending" },
];

const THREAT_NAMES = [
  "APT-29 Cozy Bear Pattern",
  "Ransomware C2 Communication",
  "Cryptominer Network Activity",
  "SQL Injection Attempt",
  "Brute Force Attack",
  "Data Exfiltration Pattern",
  "Suspicious DNS Tunneling",
  "Remote Code Execution",
  "Privilege Escalation",
  "Zero-Day Exploit Pattern",
];

const THREAT_TYPES = [
  "APT Campaign",
  "Malware",
  "Network Intrusion",
  "Web Attack",
  "Credential Theft",
  "Data Leak",
  "Command & Control",
  "Lateral Movement",
  "Ransomware",
  "Cryptojacking",
];

const SOURCES = ["External", "Internal", "Cloud", "Endpoint", "Gateway", "DNS"];
const ASSETS = [
  "web-server-01",
  "db-primary",
  "app-cluster",
  "gateway-edge",
  "vpn-gateway",
  "workstation-admin",
];

const ThreatRadarTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [steps, setSteps] = useState<DetectionStep[]>(DETECTION_STEPS);
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [result, setResult] = useState<ThreatDetectionResult | null>(null);
  const [threatCount, setThreatCount] = useState(0);
  const [liveStats, setLiveStats] = useState({
    activeScans: 0,
    threatsBlocked: 127,
    assetsMonitored: 2847,
    lastUpdate: new Date().toLocaleTimeString(),
  });

  const abortRef = useRef(false);

  const addEvent = useCallback((event: DetectionEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 50));
  }, []);

  const updateStep = useCallback(
    (stepId: string, status: DetectionStep["status"], detail?: string) => {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status, detail } : s))
      );
    },
    []
  );

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const generateResult = (config: ScanConfig): ThreatDetectionResult => {
    const criticalThreats =
      Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0;
    const highThreats = Math.floor(Math.random() * 5) + 1;
    const mediumThreats = Math.floor(Math.random() * 8) + 2;
    const lowThreats = Math.floor(Math.random() * 12) + 3;
    const total = criticalThreats + highThreats + mediumThreats + lowThreats;

    const riskScore = Math.min(
      100,
      Math.round(
        criticalThreats * 25 +
          highThreats * 12 +
          mediumThreats * 5 +
          lowThreats * 2
      )
    );

    const threatLevel =
      criticalThreats > 0
        ? "CRITICAL"
        : highThreats > 2
        ? "HIGH"
        : mediumThreats > 5
        ? "MEDIUM"
        : total > 10
        ? "LOW"
        : "CLEAN";

    const topThreats = Array.from({ length: Math.min(5, total) }, (_, i) => ({
      name: THREAT_NAMES[Math.floor(Math.random() * THREAT_NAMES.length)],
      type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
      severity:
        i === 0 && criticalThreats > 0
          ? "CRITICAL"
          : i < highThreats + 1
          ? "HIGH"
          : "MEDIUM",
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      asset: ASSETS[Math.floor(Math.random() * ASSETS.length)],
    }));

    const recommendations = [
      criticalThreats > 0
        ? "CRITICAL: Immediate action required. Isolate affected systems and initiate incident response protocol. Multiple critical threats detected require immediate containment."
        : highThreats > 3
        ? "HIGH PRIORITY: Elevated threat activity detected. Review firewall rules, update threat signatures, and enable enhanced monitoring on affected assets."
        : mediumThreats > 5
        ? "MODERATE RISK: Several medium-severity threats identified. Schedule security review, patch vulnerable systems, and monitor for escalation."
        : "Environment is relatively secure. Continue routine monitoring and ensure all security patches are up to date.",
    ];

    return {
      threatLevel,
      riskScore,
      totalThreats: total,
      totalAssets:
        config.scanTarget === "all"
          ? 2847
          : config.scanTarget === "network"
          ? 856
          : config.scanTarget === "cloud"
          ? 342
          : 1649,
      scanDuration:
        config.scanDepth === "deep"
          ? 45.2
          : config.scanDepth === "standard"
          ? 18.7
          : 8.3,
      criticalThreats,
      highThreats,
      mediumThreats,
      lowThreats,
      topThreats,
      recommendations,
      mitigationActions: [
        "Block malicious IPs at firewall",
        "Update endpoint detection signatures",
        "Enable network segmentation",
        "Deploy additional monitoring",
      ],
    };
  };

  const runDetection = async (config: ScanConfig) => {
    abortRef.current = false;
    setIsScanning(true);
    setResult(null);
    setThreatCount(0);
    setEvents([]);
    setSteps(
      DETECTION_STEPS.map((s) => ({
        ...s,
        status: "pending",
        detail: undefined,
      }))
    );
    setLiveStats((prev) => ({
      ...prev,
      activeScans: 1,
      lastUpdate: new Date().toLocaleTimeString(),
    }));

    const stepDurations = {
      quick: [400, 500, 500, 600, 700, 600, 500, 400, 500, 600],
      standard: [600, 800, 800, 900, 1000, 900, 800, 700, 800, 900],
      deep: [1000, 1200, 1200, 1500, 1800, 1500, 1200, 1000, 1200, 1500],
    };
    const durations = stepDurations[config.scanDepth];

    addEvent({
      timestamp: Date.now(),
      type: "scan",
      severity: "info",
      message: `Detection scan initiated - Target: ${config.scanTarget}, Depth: ${config.scanDepth}`,
    });

    for (let i = 0; i < DETECTION_STEPS.length; i++) {
      if (abortRef.current) break;

      const step = DETECTION_STEPS[i];
      updateStep(step.id, "running");

      addEvent({
        timestamp: Date.now(),
        type: "detection",
        severity: "info",
        message: `${step.label} in progress...`,
      });

      await delay(durations[i] * 0.4);

      // Simulate threat detection events
      if (Math.random() > 0.5 && i > 1) {
        const threatSeverity =
          Math.random() > 0.8
            ? "critical"
            : Math.random() > 0.5
            ? "high"
            : "medium";
        addEvent({
          timestamp: Date.now(),
          type: "threat",
          severity: threatSeverity as DetectionEvent["severity"],
          message: `${
            THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)]
          } detected on ${ASSETS[Math.floor(Math.random() * ASSETS.length)]}`,
        });
        setThreatCount((prev) => prev + 1);
      }

      await delay(durations[i] * 0.6);

      updateStep(step.id, "complete", "✓ Complete");

      addEvent({
        timestamp: Date.now(),
        type: "analysis",
        severity: "low",
        message: `${step.label} completed successfully`,
      });
    }

    if (!abortRef.current) {
      const finalResult = generateResult(config);
      setResult(finalResult);
      setLiveStats((prev) => ({
        ...prev,
        activeScans: 0,
        threatsBlocked: prev.threatsBlocked + finalResult.totalThreats,
        lastUpdate: new Date().toLocaleTimeString(),
      }));

      addEvent({
        timestamp: Date.now(),
        type: "scan",
        severity:
          finalResult.threatLevel === "CRITICAL" ||
          finalResult.threatLevel === "HIGH"
            ? "critical"
            : "info",
        message: `Scan complete: ${finalResult.totalThreats} threats detected (${finalResult.threatLevel})`,
      });
    }

    setIsScanning(false);
  };

  const handleScan = (config: ScanConfig) => {
    runDetection(config);
  };

  const handleStopScan = () => {
    abortRef.current = true;
    setIsScanning(false);
    addEvent({
      timestamp: Date.now(),
      type: "scan",
      severity: "medium",
      message: "Scan aborted by user",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-red-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-10">
          <div className="absolute inset-0 border-4 border-red-500/30 rounded-full" />
          <div className="absolute inset-10 border-2 border-red-500/20 rounded-full" />
          <div className="absolute inset-20 border border-red-500/10 rounded-full" />
          <div className="absolute inset-0 animate-radar-sweep">
            <div className="absolute top-1/2 left-1/2 w-1/2 h-1 bg-gradient-to-r from-red-500/50 to-transparent origin-left" />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Target className="w-8 h-8 text-white" />
              </div>
              {isScanning && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-slate-900" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent">
                ThreatRadar
              </h1>
              <p className="text-gray-400">
                Real-Time Threat Detection & Monitoring
              </p>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-xl border border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Radio
                  className={`w-5 h-5 text-red-400 ${
                    isScanning ? "animate-pulse" : ""
                  }`}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Active Scans</div>
                <div className="text-lg font-bold text-white">
                  {liveStats.activeScans}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Threats Blocked</div>
                <div className="text-lg font-bold text-green-400">
                  {liveStats.threatsBlocked.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Assets Monitored</div>
                <div className="text-lg font-bold text-cyan-400">
                  {liveStats.assetsMonitored.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Last Update</div>
                <div className="text-lg font-bold text-purple-400">
                  {liveStats.lastUpdate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Scan Form */}
          <div className="lg:col-span-1">
            <ThreatScanForm
              onSubmit={handleScan}
              isLoading={isScanning}
              onStop={handleStopScan}
            />
          </div>

          {/* Middle Column - Live Detection Panel */}
          <div className="lg:col-span-1">
            <LiveDetectionPanel
              steps={steps}
              events={events}
              isScanning={isScanning}
              threatCount={threatCount}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1">
            <AnimatedThreatResult
              data={result}
              isScanning={isScanning}
              onViewDetails={() => console.log("View details")}
              onTakeAction={() => console.log("Take action")}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            ThreatRadar Detection Engine • Powered by AI Threat Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThreatRadarTool;
