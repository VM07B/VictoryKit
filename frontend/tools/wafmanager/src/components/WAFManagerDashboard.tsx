import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Plus,
  Settings,
  Search,
  RefreshCw,
  Zap,
  Globe,
  Lock,
  Eye,
  Filter,
  Download,
} from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { wafManagerAPI } from "../services/wafmanagerAPI";
import { DashboardStats, WAFRule, AttackLog } from "../types";
import { ATTACK_CATEGORIES, SEVERITY_LEVELS } from "../constants";

const WAFManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rules, setRules] = useState<WAFRule[]>([]);
  const [recentAttacks, setRecentAttacks] = useState<AttackLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "rules" | "logs" | "analytics"
  >("overview");
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardStats, wafRules, attackLogs] = await Promise.all([
        wafManagerAPI.getDashboardStats().catch(() => null),
        wafManagerAPI.getRules().catch(() => []),
        wafManagerAPI
          .getAttackLogs({ limit: "10" })
          .catch(() => ({ logs: [] })),
      ]);

      if (dashboardStats) setStats(dashboardStats);
      setRules(wafRules);
      setRecentAttacks(attackLogs.logs || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      await wafManagerAPI.toggleRule(ruleId);
      loadData();
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    const level = SEVERITY_LEVELS.find((l) => l.id === severity);
    return level?.color || "bg-gray-500";
  };

  return (
    <div className="min-h-screen matrix-bg text-gray-100">
      <Header />

      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-500" />
                WAF Manager
              </h1>
              <p className="text-gray-400 mt-1">
                Web Application Firewall Control Center
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <Link
                to="/maula-ai"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg transition-all duration-200 font-medium"
              >
                <Zap className="w-4 h-4" />
                Live Assistant
              </Link>
              <button
                onClick={() => setShowNewRuleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                New Rule
              </button>
              <button
                onClick={loadData}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Rules"
              value={stats?.totalRules || 0}
              subtitle={`${stats?.enabledRules || 0} active`}
              icon={<Shield className="w-6 h-6" />}
              color="emerald"
            />
            <StatsCard
              title="Attacks Blocked (24h)"
              value={stats?.attacks24h || 0}
              subtitle={`${stats?.attacksHour || 0} this hour`}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
            />
            <StatsCard
              title="Block Rate"
              value={`${stats?.blockRate || 0}%`}
              subtitle="Threat prevention rate"
              icon={<Activity className="w-6 h-6" />}
              color="blue"
            />
            <StatsCard
              title="Top Threats"
              value={
                stats?.topCategories?.[0]?.category?.toUpperCase() || "N/A"
              }
              subtitle={`${stats?.topCategories?.[0]?.count || 0} attempts`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="yellow"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rules List */}
            <div className="lg:col-span-2 cyber-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-500" />
                  Active Rules
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rules..."
                      className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {rules.length > 0 ? (
                  rules
                    .slice(0, 10)
                    .map((rule) => (
                      <RuleCard
                        key={rule._id}
                        rule={rule}
                        onToggle={() => handleToggleRule(rule._id)}
                      />
                    ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rules configured yet</p>
                    <button
                      onClick={() => setShowNewRuleModal(true)}
                      className="mt-4 text-emerald-500 hover:text-emerald-400"
                    >
                      Create your first rule
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Attack Logs */}
            <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Recent Attacks
                </h2>
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {recentAttacks.length > 0 ? (
                  recentAttacks.map((attack) => (
                    <AttackLogCard key={attack._id} attack={attack} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No attacks detected</p>
                    <p className="text-sm mt-2">
                      Your firewall is protecting your applications
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attack Categories Chart */}
          <div className="mt-6 cyber-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Attack Distribution by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {ATTACK_CATEGORIES.map((cat) => {
                const count =
                  stats?.topCategories?.find((c) => c.category === cat.id)
                    ?.count || 0;
                return (
                  <div
                    key={cat.id}
                    className="bg-gray-800/50 rounded-lg p-4 text-center"
                  >
                    <div className={`text-2xl font-bold ${cat.color}`}>
                      {count}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{cat.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* New Rule Modal */}
      {showNewRuleModal && (
        <NewRuleModal
          onClose={() => setShowNewRuleModal(false)}
          onCreated={() => {
            setShowNewRuleModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: "emerald" | "red" | "blue" | "yellow";
}> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    red: "text-red-500 bg-red-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    yellow: "text-yellow-500 bg-yellow-500/10",
  };

  return (
    <div className="cyber-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

// Rule Card Component
const RuleCard: React.FC<{ rule: WAFRule; onToggle: () => void }> = ({
  rule,
  onToggle,
}) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-2 h-2 rounded-full ${
            rule.enabled ? "bg-emerald-500" : "bg-gray-500"
          }`}
        />
        <div>
          <p className="font-medium">{rule.name}</p>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
              {rule.category}
            </span>
            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
              {rule.target}
            </span>
            <span>{rule.matchCount} matches</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-1 rounded text-xs ${
            rule.severity === "critical"
              ? "bg-red-500/20 text-red-400"
              : rule.severity === "high"
              ? "bg-orange-500/20 text-orange-400"
              : rule.severity === "medium"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {rule.severity}
        </span>
        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            rule.enabled
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-gray-600 text-gray-400 hover:bg-gray-500"
          }`}
        >
          {rule.enabled ? "Enabled" : "Disabled"}
        </button>
      </div>
    </div>
  );
};

// Attack Log Card Component
const AttackLogCard: React.FC<{ attack: AttackLog }> = ({ attack }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-red-400">
            {attack.category?.toUpperCase()}
          </p>
          <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
            {attack.targetUri}
          </p>
          <p className="text-xs text-gray-500 mt-1">{attack.sourceIp}</p>
        </div>
        <div className="text-right">
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              attack.action === "blocked"
                ? "bg-red-500/20 text-red-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {attack.action}
          </span>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(attack.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// New Rule Modal Component
const NewRuleModal: React.FC<{
  onClose: () => void;
  onCreated: () => void;
}> = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    pattern: "",
    patternType: "regex",
    target: "uri",
    ruleType: "block",
    category: "custom",
    severity: "medium",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await wafManagerAPI.createRule(formData);
      onCreated();
    } catch (error) {
      console.error("Failed to create rule:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="cyber-card w-full max-w-lg mx-4 p-6">
        <h2 className="text-xl font-semibold mb-6">Create New WAF Rule</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Rule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="cyber-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Pattern</label>
            <input
              type="text"
              value={formData.pattern}
              onChange={(e) =>
                setFormData({ ...formData, pattern: e.target.value })
              }
              className="cyber-input"
              placeholder="e.g., (union|select|insert)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Pattern Type
              </label>
              <select
                value={formData.patternType}
                onChange={(e) =>
                  setFormData({ ...formData, patternType: e.target.value })
                }
                className="cyber-input"
              >
                <option value="regex">Regex</option>
                <option value="exact">Exact</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target</label>
              <select
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                className="cyber-input"
              >
                <option value="uri">URI</option>
                <option value="headers">Headers</option>
                <option value="body">Body</option>
                <option value="query">Query</option>
                <option value="ip">IP</option>
                <option value="user_agent">User Agent</option>
                <option value="cookie">Cookie</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Action</label>
              <select
                value={formData.ruleType}
                onChange={(e) =>
                  setFormData({ ...formData, ruleType: e.target.value })
                }
                className="cyber-input"
              >
                <option value="block">Block</option>
                <option value="allow">Allow</option>
                <option value="challenge">Challenge</option>
                <option value="rate_limit">Rate Limit</option>
                <option value="log">Log Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="cyber-input"
              >
                <option value="sqli">SQL Injection</option>
                <option value="xss">XSS</option>
                <option value="rce">RCE</option>
                <option value="lfi">LFI</option>
                <option value="rfi">RFI</option>
                <option value="csrf">CSRF</option>
                <option value="bot">Bot</option>
                <option value="scanner">Scanner</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
                className="cyber-input"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="cyber-input h-20"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WAFManagerDashboard;
