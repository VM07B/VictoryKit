import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Eye,
  Settings,
  Download,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Target,
  Layers,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Globe,
  Lock,
  FileText,
  PieChart,
  LineChart,
  Users,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Radio,
} from "lucide-react";
import TransactionForm from "./TransactionForm";
import EnhancedTransactionForm from "./EnhancedTransactionForm";
import FraudScoreCard from "./FraudScoreCard";
import EnhancedFraudScoreCard from "./EnhancedFraudScoreCard";
import RiskVisualization from "./RiskVisualization";
import TransactionHistory from "./TransactionHistory";
import AlertsPanel from "./AlertsPanel";
import RealtimeAnalyzer from "./RealtimeAnalyzer";
import { transactionAPI, alertsAPI } from "../services/fraudguardAPI";
import { Transaction, Alert } from "../types";

// Stats Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, change, icon, color, trend }) => (
  <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-4 hover:border-slate-600/50 transition-all group">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        {icon}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-500/20 text-green-400' :
          trend === 'down' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> :
           trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="mt-3">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  </div>
);

// Live Pulse Indicator
const LivePulse: React.FC = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
    <div className="relative">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
    </div>
    <span className="text-xs font-medium text-green-400">LIVE</span>
  </div>
);

// Quick Action Button
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}> = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      active 
        ? 'bg-red-500/20 border border-red-500/50 text-red-400' 
        : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-slate-600/50'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const EnhancedFraudGuardTool: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "analyze" | "history" | "alerts" | "analytics" | "dashboard"
  >("dashboard");
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRealtimeAnalyzer, setShowRealtimeAnalyzer] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [stats, setStats] = useState({
    totalScans: 1247,
    blockedThreats: 89,
    avgScore: 34,
    accuracy: 99.7,
  });

  // Load initial data
  useEffect(() => {
    loadTransactions();
    loadAlerts();
    // Simulate live stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalScans: prev.totalScans + Math.floor(Math.random() * 3),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll({ limit: 50 });
      setTransactions(response.transactions);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      // Use mock data for demo
      setTransactions([]);
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
      setAlerts([]);
    }
  };

  const handleAnalyze = (data: any) => {
    setPendingTransaction(data);
    setShowRealtimeAnalyzer(true);
  };

  const handleAnalysisComplete = (result: any) => {
    if (result) {
      setLastAnalysis(result);
      setStats(prev => ({
        ...prev,
        totalScans: prev.totalScans + 1,
        blockedThreats: result.score >= 70 ? prev.blockedThreats + 1 : prev.blockedThreats,
      }));
    }
    setShowRealtimeAnalyzer(false);
    setPendingTransaction(null);
    if (result) {
      setCurrentView("analyze");
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    console.log("View transaction:", transaction);
  };

  const handleAnalyzeTransaction = async (transaction: Transaction) => {
    handleAnalyze(transaction);
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

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Layers },
    { id: "analyze", label: "Analyze Transaction", icon: Shield },
    { id: "history", label: "Transaction History", icon: Clock },
    { id: "alerts", label: "Alerts & Rules", icon: Bell },
    { id: "analytics", label: "Risk Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Realtime Analyzer Overlay */}
      <RealtimeAnalyzer
        transactionData={pendingTransaction}
        onComplete={handleAnalysisComplete}
        isActive={showRealtimeAnalyzer}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  FraudGuard
                </h1>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  AI-Powered Fraud Detection System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LivePulse />
              
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-300">ML Engine: <span className="text-green-400">Active</span></span>
              </div>

              <Link
                to="/maula-ai"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/25"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-900/50 border-b border-red-500/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id as any)}
                  className={`flex items-center gap-2 px-5 py-4 border-b-2 font-medium text-sm transition-all ${
                    currentView === id
                      ? "border-red-500 text-white bg-red-500/5"
                      : "border-transparent text-gray-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-800/50 text-gray-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-800/50 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Scans Today"
                value={stats.totalScans.toLocaleString()}
                change={12.5}
                trend="up"
                icon={<Eye className="w-5 h-5 text-white" />}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Threats Blocked"
                value={stats.blockedThreats}
                change={8.3}
                trend="up"
                icon={<Shield className="w-5 h-5 text-white" />}
                color="from-red-500 to-red-600"
              />
              <StatCard
                title="Avg. Risk Score"
                value={stats.avgScore}
                change={-5.2}
                trend="down"
                icon={<Target className="w-5 h-5 text-white" />}
                color="from-yellow-500 to-orange-500"
              />
              <StatCard
                title="Detection Accuracy"
                value={`${stats.accuracy}%`}
                change={0.3}
                trend="up"
                icon={<Zap className="w-5 h-5 text-white" />}
                color="from-green-500 to-emerald-600"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <QuickAction
                icon={<Zap className="w-4 h-4" />}
                label="Quick Scan"
                onClick={() => setCurrentView("analyze")}
                active
              />
              <QuickAction
                icon={<FileText className="w-4 h-4" />}
                label="Generate Report"
                onClick={() => {}}
              />
              <QuickAction
                icon={<Download className="w-4 h-4" />}
                label="Export Data"
                onClick={() => {}}
              />
              <QuickAction
                icon={<RefreshCw className="w-4 h-4" />}
                label="Sync Database"
                onClick={loadTransactions}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-400" />
                    Recent Analysis Activity
                  </h3>
                  <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
                    View All
                  </button>
                </div>
                <div className="p-4">
                  {/* Activity List */}
                  <div className="space-y-3">
                    {[
                      { id: 'TX-001', amount: 2500, risk: 'low', time: '2 min ago' },
                      { id: 'TX-002', amount: 15000, risk: 'high', time: '5 min ago' },
                      { id: 'TX-003', amount: 450, risk: 'low', time: '8 min ago' },
                      { id: 'TX-004', amount: 8900, risk: 'medium', time: '12 min ago' },
                      { id: 'TX-005', amount: 3200, risk: 'low', time: '15 min ago' },
                    ].map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.risk === 'high' ? 'bg-red-500/20' :
                            tx.risk === 'medium' ? 'bg-yellow-500/20' :
                            'bg-green-500/20'
                          }`}>
                            {tx.risk === 'high' ? <XCircle className="w-5 h-5 text-red-400" /> :
                             tx.risk === 'medium' ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
                             <CheckCircle2 className="w-5 h-5 text-green-400" />}
                          </div>
                          <div>
                            <div className="font-medium text-white">{tx.id}</div>
                            <div className="text-sm text-gray-400">${tx.amount.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            tx.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                            tx.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {tx.risk.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{tx.time}</span>
                          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Distribution */}
              <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    Risk Distribution
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#1e293b" strokeWidth="16" />
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#22c55e" strokeWidth="16" 
                        strokeDasharray="352" strokeDashoffset="70" />
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#eab308" strokeWidth="16" 
                        strokeDasharray="352" strokeDashoffset="282" strokeDashoffset="282" />
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#ef4444" strokeWidth="16" 
                        strokeDasharray="352" strokeDashoffset="320" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-white">{stats.totalScans}</div>
                      <div className="text-sm text-gray-400">Total</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-400">Low Risk</span>
                      </div>
                      <span className="text-sm font-medium text-white">72%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm text-gray-400">Medium Risk</span>
                      </div>
                      <span className="text-sm font-medium text-white">21%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-400">High Risk</span>
                      </div>
                      <span className="text-sm font-medium text-white">7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700/50 p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                System Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'ML Engine', status: 'Operational', icon: Cpu, color: 'green' },
                  { name: 'API Gateway', status: 'Operational', icon: Globe, color: 'green' },
                  { name: 'Database', status: 'Operational', icon: Database, color: 'green' },
                  { name: 'Security', status: 'Protected', icon: Lock, color: 'green' },
                ].map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${service.color}-500/20 flex items-center justify-center`}>
                      <service.icon className={`w-5 h-5 text-${service.color}-400`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{service.name}</div>
                      <div className={`text-xs text-${service.color}-400`}>{service.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analyze View */}
        {currentView === "analyze" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <EnhancedTransactionForm onAnalyze={handleAnalyze} loading={showRealtimeAnalyzer} />
            </div>
            <div>
              {lastAnalysis ? (
                <EnhancedFraudScoreCard data={lastAnalysis} />
              ) : (
                <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700/50 p-8 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Ready for Analysis
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-sm">
                    Fill out the transaction form to begin real-time fraud detection analysis
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-4 h-4" /> ML Engine Ready
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="w-4 h-4" /> 47 Rules Active
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History View */}
        {currentView === "history" && (
          <TransactionHistory
            transactions={transactions}
            onViewTransaction={handleViewTransaction}
            onAnalyze={handleAnalyzeTransaction}
            loading={loading}
          />
        )}

        {/* Alerts View */}
        {currentView === "alerts" && (
          <AlertsPanel
            alerts={alerts}
            onCreateAlert={handleCreateAlert}
            onDeleteAlert={handleDeleteAlert}
            onToggleAlert={handleToggleAlert}
          />
        )}

        {/* Analytics View */}
        {currentView === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiskVisualization type="risk_breakdown" data={{}} />
              <RiskVisualization type="timeline" data={{}} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>FraudGuard v2.0</span>
            <span>•</span>
            <span>ML Engine v2.0.0</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> TLS 1.3 Encrypted
            </span>
          </div>
          <div>
            © 2025 VictoryKit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedFraudGuardTool;
