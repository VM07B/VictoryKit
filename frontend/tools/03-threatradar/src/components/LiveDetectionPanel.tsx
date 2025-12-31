import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Radar,
  Globe,
  Server,
  Database,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Activity,
  Eye,
  Network,
  Timer,
  Target,
  Scan,
  Radio,
  Search,
  FileSearch,
  Link2,
  AlertOctagon,
  Bug,
  Lock,
  Wifi,
} from "lucide-react";

interface DetectionStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "running" | "complete" | "warning" | "error";
  result?: string;
  duration?: number;
  details?: string[];
  threatCount?: number;
}

interface LiveDetectionPanelProps {
  isScanning: boolean;
  scanData?: any;
  onComplete?: (result: any) => void;
}

const DETECTION_STEPS: Omit<DetectionStep, "status">[] = [
  {
    id: "init",
    name: "System Initialization",
    description: "Preparing detection engines...",
    icon: <Radar className="w-5 h-5" />,
  },
  {
    id: "network",
    name: "Network Scan",
    description: "Analyzing network traffic patterns...",
    icon: <Network className="w-5 h-5" />,
  },
  {
    id: "endpoint",
    name: "Endpoint Analysis",
    description: "Scanning endpoint processes...",
    icon: <Server className="w-5 h-5" />,
  },
  {
    id: "signature",
    name: "Signature Matching",
    description: "Matching against threat signatures...",
    icon: <FileSearch className="w-5 h-5" />,
  },
  {
    id: "behavior",
    name: "Behavioral Analysis",
    description: "Analyzing behavioral patterns...",
    icon: <Activity className="w-5 h-5" />,
  },
  {
    id: "anomaly",
    name: "Anomaly Detection",
    description: "Detecting statistical anomalies...",
    icon: <AlertOctagon className="w-5 h-5" />,
  },
  {
    id: "malware",
    name: "Malware Scan",
    description: "Checking for malicious code...",
    icon: <Bug className="w-5 h-5" />,
  },
  {
    id: "lateral",
    name: "Lateral Movement",
    description: "Detecting lateral movement...",
    icon: <Wifi className="w-5 h-5" />,
  },
  {
    id: "correlation",
    name: "Threat Correlation",
    description: "Correlating detection events...",
    icon: <Link2 className="w-5 h-5" />,
  },
  {
    id: "ai",
    name: "AI Risk Assessment",
    description: "Calculating threat risk scores...",
    icon: <Brain className="w-5 h-5" />,
  },
];

export const LiveDetectionPanel: React.FC<LiveDetectionPanelProps> = ({
  isScanning,
  scanData,
  onComplete,
}) => {
  const [steps, setSteps] = useState<DetectionStep[]>(
    DETECTION_STEPS.map((step) => ({ ...step, status: "pending" }))
  );
  const [currentStep, setCurrentStep] = useState(-1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalThreats, setTotalThreats] = useState(0);
  const [liveEvents, setLiveEvents] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScanning) {
      setSteps(DETECTION_STEPS.map((step) => ({ ...step, status: "pending" })));
      setCurrentStep(-1);
      setElapsedTime(0);
      setTotalThreats(0);
      setLiveEvents([]);
      startDetection();

      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isScanning]);

  useEffect(() => {
    if (eventsRef.current) {
      eventsRef.current.scrollTop = eventsRef.current.scrollHeight;
    }
  }, [liveEvents]);

  const addEvent = (event: string) => {
    setLiveEvents((prev) => [...prev.slice(-15), event]);
  };

  const startDetection = async () => {
    let threats = 0;

    for (let i = 0; i < DETECTION_STEPS.length; i++) {
      setCurrentStep(i);
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === i ? { ...step, status: "running" } : step
        )
      );

      addEvent(
        `[${new Date().toLocaleTimeString()}] Starting ${
          DETECTION_STEPS[i].name
        }...`
      );

      // Simulate detection time
      const duration = 800 + Math.random() * 1200;
      await new Promise((resolve) => setTimeout(resolve, duration));

      // Generate results
      const hasThreats = Math.random() > 0.6;
      const threatCount = hasThreats ? Math.floor(Math.random() * 5) + 1 : 0;
      threats += threatCount;
      setTotalThreats(threats);

      const status = threatCount > 2 ? "warning" : "complete";
      const results = generateStepResults(DETECTION_STEPS[i].id, threatCount);

      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === i
            ? {
                ...step,
                status,
                duration: duration / 1000,
                result: results.result,
                details: results.details,
                threatCount,
              }
            : step
        )
      );

      if (threatCount > 0) {
        addEvent(
          `[${new Date().toLocaleTimeString()}] ⚠️ ${threatCount} threat(s) detected in ${
            DETECTION_STEPS[i].name
          }`
        );
      } else {
        addEvent(
          `[${new Date().toLocaleTimeString()}] ✓ ${
            DETECTION_STEPS[i].name
          } - Clean`
        );
      }
    }

    // Completion
    addEvent(
      `[${new Date().toLocaleTimeString()}] Detection complete. Total threats: ${threats}`
    );

    if (onComplete) {
      onComplete({
        totalThreats: threats,
        scanDuration: elapsedTime,
        steps: steps,
      });
    }
  };

  const generateStepResults = (
    stepId: string,
    threatCount: number
  ): { result: string; details: string[] } => {
    const results: Record<string, { result: string; details: string[] }> = {
      init: {
        result: "Engines initialized",
        details: [
          "10 detection engines active",
          "Rule database: 15,234 signatures",
        ],
      },
      network: {
        result:
          threatCount > 0
            ? `${threatCount} suspicious connections`
            : "Traffic normal",
        details:
          threatCount > 0
            ? ["Suspicious outbound: 185.234.72.15:443", "C2 pattern detected"]
            : ["1,234 connections analyzed", "No anomalies detected"],
      },
      endpoint: {
        result:
          threatCount > 0
            ? `${threatCount} process anomalies`
            : "Processes verified",
        details:
          threatCount > 0
            ? [
                "Suspicious process: svchost_x.exe",
                "Hidden file access detected",
              ]
            : ["847 processes scanned", "All signatures valid"],
      },
      signature: {
        result:
          threatCount > 0 ? `${threatCount} signature matches` : "No matches",
        details:
          threatCount > 0
            ? ["Match: Emotet.Gen.2", "Match: CobaltStrike beacon"]
            : ["15,234 signatures checked", "0 positive matches"],
      },
      behavior: {
        result:
          threatCount > 0
            ? `${threatCount} behavioral flags`
            : "Behavior normal",
        details:
          threatCount > 0
            ? ["Unusual data access pattern", "Privilege escalation attempt"]
            : ["Baseline comparison complete", "Within normal parameters"],
      },
      anomaly: {
        result: threatCount > 0 ? `${threatCount} anomalies` : "No anomalies",
        details:
          threatCount > 0
            ? ["Statistical deviation: 3.2σ", "Unusual login time detected"]
            : ["Statistical analysis complete", "All metrics within bounds"],
      },
      malware: {
        result:
          threatCount > 0 ? `${threatCount} malware detected` : "No malware",
        details:
          threatCount > 0
            ? ["Ransomware signature detected", "Trojan dropper identified"]
            : ["Full system scan complete", "No malicious code found"],
      },
      lateral: {
        result:
          threatCount > 0
            ? `${threatCount} lateral attempts`
            : "No lateral movement",
        details:
          threatCount > 0
            ? ["RDP brute force detected", "Pass-the-hash attempt"]
            : ["Internal traffic analyzed", "No suspicious movement"],
      },
      correlation: {
        result: "Events correlated",
        details: ["12 events linked", "Attack chain identified"],
      },
      ai: {
        result: `Risk score: ${
          threatCount > 0
            ? 65 + Math.floor(Math.random() * 30)
            : 15 + Math.floor(Math.random() * 20)
        }`,
        details: ["ML model confidence: 94%", "Threat classification complete"],
      },
    };

    return results[stepId] || { result: "Complete", details: [] };
  };

  const getStepIcon = (step: DetectionStep) => {
    switch (step.status) {
      case "running":
        return <Loader2 className="w-5 h-5 text-red-400 animate-spin" />;
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 text-gray-600">{step.icon}</div>;
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/10 p-4 border-b border-red-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Radar className="w-5 h-5 text-white" />
              </div>
              {isScanning && (
                <div className="absolute inset-0 rounded-lg border-2 border-red-500/50 animate-ping" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Detection</h2>
              <p className="text-xs text-gray-400">
                {isScanning ? "Scanning in progress..." : "Awaiting scan"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-bold text-white tabular-nums">
                {elapsedTime.toFixed(1)}s
              </div>
              <div className="text-xs text-gray-500">Elapsed</div>
            </div>
            <div className="text-right">
              <div
                className={`text-xl font-bold tabular-nums ${
                  totalThreats > 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {totalThreats}
              </div>
              <div className="text-xs text-gray-500">Threats</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detection Steps */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all ${
                step.status === "running"
                  ? "bg-red-500/10 border-red-500/30"
                  : step.status === "warning"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : step.status === "complete"
                  ? "bg-slate-900/50 border-slate-700/30"
                  : "bg-slate-900/30 border-slate-800/30 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {getStepIcon(step)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-white">
                      {step.name}
                    </span>
                    {step.duration && (
                      <span className="text-xs text-gray-500">
                        {step.duration.toFixed(1)}s
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {step.result || step.description}
                  </p>
                </div>
                {step.threatCount !== undefined && step.threatCount > 0 && (
                  <div className="px-2 py-1 bg-red-500/20 rounded text-xs text-red-400 font-medium">
                    {step.threatCount} threat{step.threatCount > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Events Log */}
      <div className="border-t border-red-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-gray-300">Live Events</span>
        </div>
        <div
          ref={eventsRef}
          className="bg-slate-900/50 rounded-lg p-3 h-24 overflow-y-auto font-mono text-xs"
        >
          {liveEvents.length === 0 ? (
            <span className="text-gray-600">Waiting for scan to start...</span>
          ) : (
            liveEvents.map((event, i) => (
              <div
                key={i}
                className={`${
                  event.includes("⚠️") ? "text-orange-400" : "text-gray-400"
                }`}
              >
                {event}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDetectionPanel;
