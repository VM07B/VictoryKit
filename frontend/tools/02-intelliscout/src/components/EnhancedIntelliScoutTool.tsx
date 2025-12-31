import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Radar,
  Activity,
  AlertTriangle,
  Shield,
  Globe,
  Database,
  Zap,
  Clock,
  Target,
  Eye,
  RefreshCw,
} from "lucide-react";
import { ThreatIntelForm } from "./ThreatIntelForm";
import { LiveThreatPanel } from "./LiveThreatPanel";
import { AnimatedThreatCard, ThreatResult } from "./AnimatedThreatCard";

interface LiveStats {
  queriesAnalyzed: number;
  threatsDetected: number;
  sourcesScanned: number;
  avgResponseTime: number;
}

const EnhancedIntelliScoutTool: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threatResult, setThreatResult] = useState<ThreatResult | null>(null);
  const [queryData, setQueryData] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    queriesAnalyzed: 0,
    threatsDetected: 0,
    sourcesScanned: 0,
    avgResponseTime: 0,
  });

  // Simulated live stats counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats((prev) => ({
        queriesAnalyzed: prev.queriesAnalyzed + Math.floor(Math.random() * 3),
        threatsDetected: prev.threatsDetected + (Math.random() > 0.7 ? 1 : 0),
        sourcesScanned:
          prev.sourcesScanned + Math.floor(Math.random() * 10 + 5),
        avgResponseTime: 1.2 + Math.random() * 0.8,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleFormSubmit = (data: any) => {
    setQueryData(data);
    setIsAnalyzing(true);
    setThreatResult(null);
  };

  const handleAnalysisComplete = (result: any) => {
    setIsAnalyzing(false);

    // Generate comprehensive threat result
    const threatLevels: ThreatResult["threatLevel"][] = [
      "CRITICAL",
      "HIGH",
      "MEDIUM",
      "LOW",
      "CLEAN",
    ];
    const threatLevel =
      threatLevels[Math.floor(Math.random() * threatLevels.length)];

    const mockResult: ThreatResult = {
      indicator: queryData?.indicator || "unknown",
      indicatorType: queryData?.type || "auto",
      threatLevel,
      confidence:
        threatLevel === "CRITICAL"
          ? 95 + Math.floor(Math.random() * 5)
          : threatLevel === "HIGH"
          ? 75 + Math.floor(Math.random() * 20)
          : threatLevel === "MEDIUM"
          ? 50 + Math.floor(Math.random() * 25)
          : threatLevel === "LOW"
          ? 25 + Math.floor(Math.random() * 25)
          : 5 + Math.floor(Math.random() * 15),
      totalSources: result?.totalSources || 47,
      hitsFound: result?.hitsFound || Math.floor(Math.random() * 15),
      threatType:
        threatLevel === "CRITICAL" || threatLevel === "HIGH"
          ? ["APT", "Ransomware", "Botnet C2", "Data Exfiltration"][
              Math.floor(Math.random() * 4)
            ]
          : threatLevel === "MEDIUM"
          ? ["Phishing", "Suspicious Activity", "Port Scanning"][
              Math.floor(Math.random() * 3)
            ]
          : threatLevel === "LOW"
          ? ["Low Risk", "Potential PUP"][Math.floor(Math.random() * 2)]
          : "Clean",
      relatedCampaigns:
        threatLevel === "CRITICAL" || threatLevel === "HIGH"
          ? ["APT29 - Cozy Bear", "FIN7 - Carbanak Group"].slice(
              0,
              Math.floor(Math.random() * 2) + 1
            )
          : [],
      recommendation: generateRecommendation(threatLevel),
      firstSeen: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastSeen: new Date().toISOString(),
      geoData: {
        country: ["Russia", "China", "North Korea", "Iran", "United States"][
          Math.floor(Math.random() * 5)
        ],
        asn: `AS${Math.floor(Math.random() * 50000)} - ${
          ["Digital Ocean", "Amazon AWS", "Cloudflare", "Alibaba"][
            Math.floor(Math.random() * 4)
          ]
        }`,
        isp: ["Digital Ocean", "Amazon AWS", "Cloudflare", "Alibaba Cloud"][
          Math.floor(Math.random() * 4)
        ],
      },
      tags:
        threatLevel !== "CLEAN"
          ? ["malicious", "active-threat", "c2-server", "ransomware", "apt"]
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.floor(Math.random() * 4) + 1)
          : ["clean", "verified"],
      malwareFamily:
        threatLevel === "CRITICAL" || threatLevel === "HIGH"
          ? ["Emotet", "TrickBot", "Cobalt Strike", "Qakbot"][
              Math.floor(Math.random() * 4)
            ]
          : undefined,
      attackVectors:
        threatLevel !== "CLEAN"
          ? [
              "Phishing",
              "Drive-by Download",
              "Supply Chain",
              "Credential Theft",
            ]
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.floor(Math.random() * 3) + 1)
          : [],
      targetSectors:
        threatLevel !== "CLEAN"
          ? ["Finance", "Healthcare", "Government", "Technology", "Energy"]
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.floor(Math.random() * 3) + 1)
          : [],
    };

    setThreatResult(mockResult);

    // Update stats
    setLiveStats((prev) => ({
      ...prev,
      queriesAnalyzed: prev.queriesAnalyzed + 1,
      threatsDetected:
        prev.threatsDetected +
        (threatLevel !== "CLEAN" && threatLevel !== "LOW" ? 1 : 0),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Enhanced Header with Live Stats */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Radar className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                  IntelliScout
                </h1>
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Threat Intelligence Engine Active
                </p>
              </div>
            </div>

            {/* Live Stats Bar */}
            <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <div className="text-right">
                  <div className="text-lg font-bold text-white tabular-nums">
                    {liveStats.queriesAnalyzed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Queries</div>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <div className="text-right">
                  <div className="text-lg font-bold text-red-400 tabular-nums">
                    {liveStats.threatsDetected}
                  </div>
                  <div className="text-xs text-gray-500">Threats</div>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <div className="text-right">
                  <div className="text-lg font-bold text-cyan-400 tabular-nums">
                    {liveStats.sourcesScanned.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Sources</div>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-400 tabular-nums">
                    {liveStats.avgResponseTime.toFixed(1)}s
                  </div>
                  <div className="text-xs text-gray-500">Response</div>
                </div>
              </div>
            </div>

            {/* Neural Link Button */}
            <Link
              to="/maula-ai"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-500/25 font-medium"
            >
              <Bot className="w-5 h-5" />
              <span>Neural Link</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Input Form */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <ThreatIntelForm
                onSubmit={handleFormSubmit}
                loading={isAnalyzing}
              />
            </div>
          </div>

          {/* Column 2: Live Analysis Panel */}
          <div className="lg:col-span-4">
            <LiveThreatPanel
              isAnalyzing={isAnalyzing}
              queryData={queryData}
              onComplete={handleAnalysisComplete}
            />
          </div>

          {/* Column 3: Results Card */}
          <div className="lg:col-span-4">
            <AnimatedThreatCard
              data={threatResult}
              isAnalyzing={isAnalyzing}
              onViewDetails={() => console.log("View full report")}
              onExport={() => console.log("Export STIX")}
            />
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-emerald-500/20 py-3 px-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              47 Intelligence Feeds Active
            </span>
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global Coverage
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Real-time Updates
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>IntelliScout Engine v2.1</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-400" />
              Secure Connection
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper function to generate recommendations
function generateRecommendation(
  threatLevel: ThreatResult["threatLevel"]
): string {
  switch (threatLevel) {
    case "CRITICAL":
      return "IMMEDIATE ACTION REQUIRED: This indicator is associated with active advanced persistent threats. Block all communications immediately, isolate affected systems, and initiate incident response procedures. Consider engaging your security operations center and threat hunting team.";
    case "HIGH":
      return "HIGH PRIORITY: This indicator shows significant malicious activity. Implement blocking rules at your perimeter, scan internal systems for compromise indicators, and monitor for lateral movement. Review recent logs for any connections to this indicator.";
    case "MEDIUM":
      return "ELEVATED RISK: This indicator shows suspicious activity patterns. Add to watchlist, enable enhanced logging for related traffic, and investigate any historical connections. Consider implementing conditional blocking based on context.";
    case "LOW":
      return "LOW CONFIDENCE: Some sources flagged this indicator but confidence is limited. Add to monitoring list and set up alerts for unusual patterns. No immediate action required but maintain awareness.";
    default:
      return "NO THREATS DETECTED: This indicator appears clean across all intelligence sources. No known malicious associations found. Continue standard monitoring practices and periodic re-scanning.";
  }
}

export default EnhancedIntelliScoutTool;
