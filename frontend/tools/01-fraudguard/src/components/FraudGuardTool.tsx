import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bot, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import TransactionForm from "./TransactionForm";
import FraudScoreCard from "./FraudScoreCard";
import RiskVisualization from "./RiskVisualization";
import TransactionHistory from "./TransactionHistory";
import AlertsPanel from "./AlertsPanel";
import { transactionAPI, alertsAPI } from "../services/fraudguardAPI";
import { Transaction, Alert } from "../types";

const FraudGuardTool: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "analyze" | "history" | "alerts" | "analytics"
  >("analyze");
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleAnalysisComplete = (result: any) => {
    setLastAnalysis(result);
    // Refresh transactions after analysis
    loadTransactions();
  };

  const handleViewTransaction = (transaction: Transaction) => {
    // TODO: Implement transaction detail view
    console.log("View transaction:", transaction);
  };

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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-red-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">FraudGuard</h1>
              <p className="text-sm text-gray-400">
                AI-Powered Fraud Detection System
              </p>
            </div>
          </div>

          {/* Live Assistant Button */}
          <Link
            to="/maula-ai"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <Bot className="w-5 h-5" />
            <span className="font-medium">Live Assistant</span>
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: "analyze", label: "Analyze Transaction", icon: Shield },
              { id: "history", label: "Transaction History", icon: TrendingUp },
              { id: "alerts", label: "Alerts & Rules", icon: AlertTriangle },
              { id: "analytics", label: "Risk Analytics", icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  currentView === id
                    ? "border-red-500 text-red-400"
                    : "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {currentView === "analyze" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <TransactionForm onAnalyze={handleAnalysisComplete} />
            </div>
            <div>
              {lastAnalysis ? (
                <FraudScoreCard data={lastAnalysis} />
              ) : (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 p-8 text-center">
                  <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ready for Analysis
                  </h3>
                  <p className="text-gray-400">
                    Fill out the transaction form to get started
                  </p>
                </div>
              )}
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
