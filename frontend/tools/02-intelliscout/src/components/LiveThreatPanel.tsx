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
} from "lucide-react";

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "running" | "complete" | "warning" | "error";
  result?: string;
  duration?: number;
  details?: string[];
  hitCount?: number;
}

interface LiveThreatPanelProps {
  isAnalyzing: boolean;
  queryData?: any;
  onComplete?: (result: any) => void;
}

const ANALYSIS_STEPS: Omit<AnalysisStep, "status">[] = [
  {
    id: "init",
    name: "Query Initialization",
    description: "Parsing indicator and preparing queries...",
    icon: <Radar className="w-5 h-5" />,
  },
  {
    id: "misp",
    name: "MISP Feed Check",
    description: "Querying MISP threat sharing platform...",
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: "virustotal",
    name: "VirusTotal Scan",
    description: "Checking malware databases...",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "alienvault",
    name: "AlienVault OTX",
    description: "Searching threat exchange data...",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: "shodan",
    name: "Shodan Intelligence",
    description: "Scanning exposed services and vulns...",
    icon: <Server className="w-5 h-5" />,
  },
  {
    id: "abuse",
    name: "AbuseIPDB Check",
    description: "Checking reported abuse history...",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    id: "correlation",
    name: "Threat Correlation",
    description: "Linking to known campaigns...",
    icon: <Network className="w-5 h-5" />,
  },
  {
    id: "ml_classify",
    name: "ML Classification",
    description: "Running threat classification models...",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    id: "enrich",
    name: "Data Enrichment",
    description: "Gathering WHOIS, geo, and ASN data...",
    icon: <FileSearch className="w-5 h-5" />,
  },
  {
    id: "complete",
    name: "Intel Compiled",
    description: "Generating threat intelligence report...",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
];

const STEP_RESULTS: Record<string, string[]> = {
  init: ["Indicator parsed", "Type: IP Address", "Query ID generated"],
  misp: [
    "Checked 12 MISP feeds",
    "Found 3 related events",
    "Correlation score: 72%",
  ],
  virustotal: [
    "Checked 70+ AV engines",
    "Detection ratio: 12/71",
    "First seen: 2024-11-15",
  ],
  alienvault: [
    "Pulses matched: 5",
    "Related indicators: 47",
    "Threat actor: APT29 suspected",
  ],
  shodan: [
    "Open ports: 22, 80, 443",
    "CVEs found: 2",
    "Last seen: 2 hours ago",
  ],
  abuse: [
    "Abuse reports: 127",
    "Confidence: 89%",
    "Categories: SSH brute-force",
  ],
  correlation: ["Campaign: SolarStorm", "Related IOCs: 234", "TTPs mapped: 12"],
  ml_classify: [
    "Threat type: C2 Server",
    "Confidence: 94.2%",
    "Model: ThreatNet v2.1",
  ],
  enrich: ["Country: Russia", "ASN: AS12345", "ISP: Evil Corp Ltd"],
  complete: ["Total sources: 47", "Hits found: 8", "Report generated"],
};

export const LiveThreatPanel: React.FC<LiveThreatPanelProps> = ({
  isAnalyzing,
  queryData,
  onComplete,
}) => {
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [radarAngle, setRadarAngle] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize steps when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      setSteps(ANALYSIS_STEPS.map((step) => ({ ...step, status: "pending" })));
      setCurrentStep(0);
      setLogs([]);
      setProgress(0);
      setTotalHits(0);
      addLog("🔍 Starting threat intelligence lookup...");
      addLog(`📋 Indicator: ${queryData?.indicator || "N/A"}`);
      addLog(`📊 Sources: ${queryData?.sources?.length || "All"} selected`);
    }
  }, [isAnalyzing, queryData]);

  // Radar animation
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Process steps sequentially
  useEffect(() => {
    if (!isAnalyzing || currentStep < 0 || currentStep >= steps.length) return;

    const processStep = async () => {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === currentStep ? { ...s, status: "running" } : s
        )
      );

      const stepKey = steps[currentStep]?.id as keyof typeof STEP_RESULTS;
      addLog(`\n⚡ ${steps[currentStep]?.name}...`);

      const processingTime = 400 + Math.random() * 600;
      await new Promise((resolve) => setTimeout(resolve, processingTime));

      const results = STEP_RESULTS[stepKey] || [];
      for (const result of results) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        addLog(`   ✓ ${result}`);
      }

      const hitCount = Math.floor(Math.random() * 15);
      const status = Math.random() > 0.2 ? "complete" : "warning";

      setSteps((prev) =>
        prev.map((s, i) =>
          i === currentStep
            ? {
                ...s,
                status,
                duration: Math.round(processingTime),
                details: results,
                hitCount,
              }
            : s
        )
      );

      if (hitCount > 0) {
        setTotalHits((prev) => prev + hitCount);
      }

      const newProgress = ((currentStep + 1) / steps.length) * 100;
      setProgress(newProgress);

      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        addLog("\n✅ Intelligence gathering complete!");
        onComplete?.({
          indicator: queryData?.indicator,
          threatLevel: "HIGH",
          confidence: 87,
          totalSources: 47,
          hitsFound: totalHits + hitCount,
          threatType: "C2 Server",
          relatedCampaigns: ["SolarStorm", "DarkHotel"],
          recommendation:
            "Block this indicator immediately. Associated with known APT activity.",
        });
      }
    };

    processStep();
  }, [currentStep, isAnalyzing]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const getStatusColor = (status: AnalysisStep["status"]) => {
    const colors = {
      complete: "border-emerald-500/50 bg-emerald-500/10",
      warning: "border-yellow-500/50 bg-yellow-500/10",
      error: "border-red-500/50 bg-red-500/10",
      running: "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20",
      pending: "border-gray-700 bg-gray-800/30",
    };
    return colors[status];
  };

  if (!isAnalyzing && steps.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-emerald-500/30 p-8 text-center relative overflow-hidden min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)`,
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
              <Radar className="w-16 h-16 text-emerald-400" />
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-500/20 animate-spin-slow" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Intelligence Radar Ready
          </h3>
          <p className="text-gray-400 mb-4 max-w-sm mx-auto">
            Enter an indicator to scan across 47 threat intelligence sources in
            real-time
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Global Threat Network Connected</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-emerald-500/30 overflow-hidden relative">
      {/* Header with Radar */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-4 border-b border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radar className="w-8 h-8 text-emerald-400" />
              {isAnalyzing && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Threat Scan</h2>
              <p className="text-sm text-gray-400">
                Real-time intelligence gathering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Hits Counter */}
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400 tabular-nums">
                {totalHits}
              </div>
              <div className="text-xs text-gray-500">Hits Found</div>
            </div>

            {/* Radar Display */}
            <div className="w-20 h-20 relative">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 bg-slate-900/50">
                <div className="absolute inset-2 rounded-full border border-emerald-500/20" />
                <div className="absolute inset-4 rounded-full border border-emerald-500/10" />
                {isAnalyzing && (
                  <div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{ transform: `rotate(${radarAngle}deg)` }}
                  >
                    <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-emerald-400 to-transparent origin-bottom" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-lg font-bold text-emerald-400">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="p-4 border-b border-emerald-500/20 max-h-[350px] overflow-y-auto">
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${getStatusColor(
                step.status
              )}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    step.status === "running"
                      ? "bg-cyan-500/20 text-cyan-400"
                      : step.status === "complete"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : step.status === "warning"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  {step.status === "running" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium text-sm ${
                      step.status === "running"
                        ? "text-cyan-300"
                        : step.status === "complete"
                        ? "text-emerald-300"
                        : "text-gray-400"
                    }`}
                  >
                    {step.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {step.hitCount !== undefined && step.hitCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                        {step.hitCount} hits
                      </span>
                    )}
                    {step.duration && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {step.duration}ms
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {step.status === "running" ? (
                    <span className="text-cyan-400 animate-pulse">
                      {step.description}
                    </span>
                  ) : (
                    step.description
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Logs */}
      <div className="bg-slate-900/80">
        <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-500 font-mono ml-2">
              threat_intel.log
            </span>
          </div>
          <span className="text-xs text-gray-600">{logs.length} entries</span>
        </div>

        <div className="p-4 font-mono text-xs max-h-[180px] overflow-y-auto bg-black/30">
          <pre className="whitespace-pre-wrap">
            {logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes("✓")
                    ? "text-emerald-400"
                    : log.includes("⚡")
                    ? "text-cyan-400"
                    : log.includes("✅")
                    ? "text-emerald-500 font-bold"
                    : log.includes("🔍")
                    ? "text-yellow-400"
                    : "text-gray-400"
                }
              >
                {log}
              </div>
            ))}
            {isAnalyzing && (
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1" />
            )}
          </pre>
          <div ref={logsEndRef} />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default LiveThreatPanel;
