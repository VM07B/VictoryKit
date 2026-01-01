import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Zap,
  Activity,
  Radio,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle2,
  Globe,
  FileSearch,
  Settings,
  Bell,
  User,
  LogOut,
  Search,
  Moon,
  Sun,
  Command,
} from "lucide-react";
import TransactionForm from "./TransactionForm";
import { AnimatedFraudScoreCard } from "./AnimatedFraudScoreCard";
import { LiveAnalysisPanel } from "./LiveAnalysisPanel";
import RiskVisualization from "./RiskVisualization";
import TransactionHistory from "./TransactionHistory";
import AlertsPanel from "./AlertsPanel";
import RealTimeDashboard from "./RealTimeDashboard";
import ThreatIntelPanel from "./ThreatIntelPanel";
import InvestigationCenter from "./InvestigationCenter";
import { transactionAPI, alertsAPI, healthAPI } from "../services/fraudguardAPI";
import { Transaction, Alert, FraudScore, SystemHealth } from "../types";

type ViewType = "analyze" | "history" | "alerts" | "analytics" | "dashboard" | "threat-intel" | "investigations";

const FraudGuardTool: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [lastAnalysis, setLastAnalysis] = useState<FraudScore | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [darkMode, setDarkMode] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalScans: 12847,
    fraudsDetected: 234,
    accuracy: 99.7,
    avgResponseTime: 0.8,
  });

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats((prev) => ({
        totalScans: prev.totalScans + Math.floor(Math.random() * 3),
        fraudsDetected: prev.fraudsDetected + (Math.random() > 0.9 ? 1 : 0),
        accuracy: 99.5 + Math.random() * 0.4,
        avgResponseTime: 0.6 + Math.random() * 0.4,
      }));
    }, 3000);

    // Load system health
    const loadHealth = async () => {
      try {
        const health = await healthAPI.check();
        setSystemHealth(health);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };
    loadHealth();
    const healthInterval = setInterval(loadHealth, 30000);
    return () => {
      clearInterval(interval);
      clearInterval(healthInterval);
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadTransactions();
    loadAlerts();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll({ limit: 50 });
      setTransactions(response.transactions);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const alertsData = await alertsAPI.getAll();
      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    }
  };

  const handleViewTransaction = useCallback((transaction: Transaction) => {
    setLastAnalysis({
      score: transaction.fraud_score || 0,
      risk_level: transaction.risk_level || "low",
      recommendation: `Review transaction ${transaction.id}`,
      indicators: [],
    });
    setCurrentView("analyze");
  }, []);

  const handleAnalyzeTransaction = async (transaction: Transaction) => {
    try {
      const result = await transactionAPI.analyze(transaction);
      setLastAnalysis(result);
      setCurrentView("analyze");
    } catch (error) {
      console.error("Failed to analyze transaction:", error);
    }
  };

  const handleCreateAlert = async (
    alertData: Omit<Alert, "id" | "created_at" | "triggered_count">
  ) => {
    try {
      const newAlert = await alertsAPI.create(alertData);
      setAlerts((prev) => [...prev, newAlert]);
    } catch (error) {
      console.error("Failed to create alert:", error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await alertsAPI.delete(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  const handleToggleAlert = async (id: string, active: boolean) => {
    try {
      const updatedAlert = await alertsAPI.toggle(id, active);
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? updatedAlert : alert))
      );
    } catch (error) {
      console.error("Failed to toggle alert:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header with live stats */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-red-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                FraudGuard
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <Radio className="w-3 h-3 text-green-400 animate-pulse" />
                <span className="text-green-400">LIVE</span>
                <span className="text-gray-400">
                  • AI-Powered Fraud Detection
                </span>
              </div>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Scans</span>
              <span className="text-sm font-mono text-white">
                {systemStats.totalScans.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Frauds</span>
              <span className="text-sm font-mono text-red-400">
                {systemStats.fraudsDetected}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Accuracy</span>
              <span className="text-sm font-mono text-green-400">
                {systemStats.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Avg</span>
              <span className="text-sm font-mono text-yellow-400">
                {systemStats.avgResponseTime.toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Live Assistant Button */}
          <Link
            to="/maula-ai"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI Assistant</span>
          </Link>
        </div>
      </header>

      {/* Navigation with glow effect */}
      <nav className="relative bg-slate-900/50 backdrop-blur border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "analyze", label: "Live Analysis", icon: Zap },
              { id: "history", label: "Transactions", icon: Activity },
              { id: "threat-intel", label: "Threat Intel", icon: Globe },
              { id: "investigations", label: "Investigations", icon: FileSearch },
              { id: "alerts", label: "Alerts", icon: AlertTriangle },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as ViewType)}
                className={`relative flex items-center gap-2 px-4 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                  currentView === id
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {currentView === id && (
                  <>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500" />
                    <div className="absolute inset-x-2 bottom-0 h-4 bg-gradient-to-t from-red-500/20 to-transparent blur-sm" />
                  </>
                )}
                <Icon
                  className={`w-4 h-4 ${
                    currentView === id ? "text-red-400" : ""
                  }`}
                />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto p-6">
        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <RealTimeDashboard
            onTransactionSelect={(txId) => {
              // Navigate to transaction details
              setCurrentView("history");
            }}
          />
        )}

        {currentView === "analyze" && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent mb-2">
                Real-Time Fraud Detection
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Advanced AI-powered analysis with live streaming results. Watch
                as our neural network processes each transaction in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Transaction Form */}
              <div className="xl:col-span-1">
                <TransactionForm
                  onAnalyze={(result) => {
                    setIsAnalyzing(true);
                    setPendingTransaction(result);
                  }}
                />
              </div>

              {/* Live Analysis Panel */}
              <div className="xl:col-span-1">
                <LiveAnalysisPanel
                  isAnalyzing={isAnalyzing}
                  transactionData={pendingTransaction}
                  onComplete={(result) => {
                    setIsAnalyzing(false);
                    setLastAnalysis(result);
                    loadTransactions();
                  }}
                />
              </div>

              {/* Animated Score Card */}
              <div className="xl:col-span-1">
                <AnimatedFraudScoreCard
                  data={lastAnalysis}
                  isAnalyzing={isAnalyzing}
                  onViewDetails={() => console.log("View details")}
                  onExport={() => console.log("Export report")}
                />
              </div>
            </div>
          </div>
        )}

        {currentView === "history" && (
          <TransactionHistory
            transactions={transactions}
            onViewTransaction={handleViewTransaction}
            onAnalyze={handleAnalyzeTransaction}
            loading={loading}
          />
        )}

        {currentView === "threat-intel" && (
          <ThreatIntelPanel
            onBlockEntity={(type, value) => {
              console.log(`Blocked ${type}: ${value}`);
            }}
          />
        )}

        {currentView === "investigations" && (
          <InvestigationCenter
            onViewTransaction={(txId) => {
              setCurrentView("history");
            }}
          />
        )}

        {currentView === "alerts" && (
          <AlertsPanel
            alerts={alerts}
            onCreateAlert={handleCreateAlert}
            onDeleteAlert={handleDeleteAlert}
            onToggleAlert={handleToggleAlert}
          />
        )}

        {currentView === "analytics" && (
          <RiskVisualization type="risk_breakdown" data={{}} />
        )}
      </main>
    </div>
  );
};

export default FraudGuardTool;
