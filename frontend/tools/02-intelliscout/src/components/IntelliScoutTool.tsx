import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Search,
  Globe,
  AlertTriangle,
  Activity,
  BarChart3,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Target,
  Layers,
  Database,
  Shield,
  FileText,
  Radio,
  Radar,
  Network,
  Bug,
  Hash,
  Mail,
  Link2,
  Server,
} from "lucide-react";
import { ThreatIntelForm } from "./ThreatIntelForm";
import { LiveThreatPanel } from "./LiveThreatPanel";
import { AnimatedThreatCard, ThreatResult } from "./AnimatedThreatCard";
import { threatIntelAPI } from "../services/intelliscoutAPI";
import { ThreatIntel, IntelStatistics } from "../types";

const IntelliScoutTool: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "gather" | "history" | "correlate" | "search" | "analytics"
  >("gather");
  const [lastIntel, setLastIntel] = useState<ThreatIntel | null>(null);
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [statistics, setStatistics] = useState<IntelStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadThreats();
    loadStatistics();
  }, []);

  const loadThreats = async () => {
    try {
      setLoading(true);
      const response = await threatIntelAPI.getAll({ limit: 50 });
      setThreats(response.data);
    } catch (error) {
      console.error("Failed to load threat intel:", error);
      // Use mock data for demo
      setThreats([
        {
          intelId: "TI-001",
          sourceType: "osint",
          threatType: "malware",
          severity: "HIGH",
          confidenceScore: 85,
          title: "New Ransomware Variant Detected",
          description: "Novel ransomware strain targeting healthcare sector",
          indicators: {
            ips: ["192.168.1.100", "10.0.0.50"],
            domains: ["malicious-domain.com"],
            urls: [],
            hashes: ["a1b2c3d4e5f6g7h8i9j0"],
            emails: [],
            fileNames: ["payload.exe"],
          },
          targetSectors: ["Healthcare"],
          targetCountries: ["US", "UK"],
          attackVectors: ["Phishing"],
          mitreTactics: ["Initial Access", "Execution"],
          mitreTechniques: ["T1566", "T1059"],
          sources: [],
          relatedThreats: [],
          status: "active",
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await threatIntelAPI.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error("Failed to load statistics:", error);
      // Use mock data
      setStatistics({
        totalThreats: 127,
        activeThreats: 43,
        resolvedThreats: 84,
        criticalCount: 12,
        highCount: 31,
        mediumCount: 48,
        lowCount: 36,
        threatsByType: {} as any,
        threatsBySource: {} as any,
        recentActivity: [],
        topIndicators: [],
      });
    }
  };

  const handleIntelSubmit = async (intel: Partial<ThreatIntel>) => {
    try {
      setLoading(true);
      const response = await threatIntelAPI.create(intel);
      setLastIntel(response.data);
      await loadThreats();
    } catch (error) {
      console.error("Failed to submit intel:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderNavButton = (
    view: typeof currentView,
    icon: React.ReactNode,
    label: string
  ) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        currentView === view
          ? "bg-green-500/20 border border-green-500/50 text-green-400"
          : "bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-slate-600/50"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center glow-green">
                <Radar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text-intel">
                  IntelliScout
                </h1>
                <p className="text-xs text-gray-400">
                  Threat Intelligence Gathering
                </p>
              </div>
            </div>

            {/* Neural Link Button */}
            <Link
              to="/maula-ai"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25"
            >
              <Bot className="w-5 h-5" />
              <span className="font-medium">Neural Link</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {renderNavButton(
              "gather",
              <Target className="w-4 h-4" />,
              "Gather Intel"
            )}
            {renderNavButton(
              "history",
              <Database className="w-4 h-4" />,
              "Intel Database"
            )}
            {renderNavButton(
              "correlate",
              <Network className="w-4 h-4" />,
              "Correlate IOCs"
            )}
            {renderNavButton(
              "search",
              <Search className="w-4 h-4" />,
              "OSINT Search"
            )}
            {renderNavButton(
              "analytics",
              <BarChart3 className="w-4 h-4" />,
              "Analytics"
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Bar */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statistics.totalThreats}
                  </div>
                  <div className="text-xs text-gray-400">Total Threats</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {statistics.criticalCount}
                  </div>
                  <div className="text-xs text-gray-400">Critical</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-orange-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">
                    {statistics.activeThreats}
                  </div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-emerald-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {statistics.resolvedThreats}
                  </div>
                  <div className="text-xs text-gray-400">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Content */}
        {currentView === "gather" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ThreatIntelForm onSubmit={handleIntelSubmit} loading={loading} />
            </div>
            <div>
              {lastIntel ? (
                <ThreatIntelCard intel={lastIntel} />
              ) : (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-8 text-center">
                  <Radar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400">
                    No Intel Gathered
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Submit threat intelligence to see analysis results here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "history" && (
          <ThreatIntelHistory
            threats={threats}
            onRefresh={loadThreats}
            loading={loading}
          />
        )}

        {currentView === "correlate" && <CorrelationPanel threats={threats} />}

        {currentView === "search" && <IOCSearch />}

        {currentView === "analytics" && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">
              Analytics Dashboard
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Threat analytics and intelligence reports coming soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default IntelliScoutTool;
