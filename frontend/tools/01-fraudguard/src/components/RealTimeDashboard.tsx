import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Zap,
  Globe,
  CreditCard,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Map,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsAPI, healthAPI } from '../services/fraudguardAPI';
import { RISK_THRESHOLDS, REFRESH_RATES } from '../constants';
import { AnalyticsData, SystemHealth } from '../types';

interface RealTimeDashboardProps {
  onTransactionSelect?: (transactionId: string) => void;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ onTransactionSelect }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [liveTransactions, setLiveTransactions] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  // Simulated real-time data
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    transactionsPerSecond: 0,
    averageScore: 0,
    blockedCount: 0,
    approvedCount: 0,
  });

  useEffect(() => {
    loadAnalytics();
    loadSystemHealth();

    const analyticsInterval = setInterval(loadAnalytics, REFRESH_RATES.ANALYTICS);
    const healthInterval = setInterval(loadSystemHealth, REFRESH_RATES.RISK_METRICS);
    const metricsInterval = setInterval(updateRealtimeMetrics, 1000);

    return () => {
      clearInterval(analyticsInterval);
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
    };
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.getDashboard();
      setAnalytics(data);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setIsConnected(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const health = await healthAPI.check();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  const updateRealtimeMetrics = useCallback(() => {
    setRealtimeMetrics(prev => ({
      transactionsPerSecond: Math.floor(Math.random() * 50) + 100,
      averageScore: Math.floor(Math.random() * 15) + 20,
      blockedCount: prev.blockedCount + (Math.random() > 0.95 ? 1 : 0),
      approvedCount: prev.approvedCount + Math.floor(Math.random() * 3) + 1,
    }));

    // Add simulated live transaction
    if (Math.random() > 0.7) {
      const newTransaction = {
        id: `TX${Date.now()}`,
        amount: Math.floor(Math.random() * 5000) + 50,
        score: Math.floor(Math.random() * 100),
        country: ['US', 'UK', 'DE', 'FR', 'JP', 'BR', 'IN'][Math.floor(Math.random() * 7)],
        timestamp: new Date().toISOString(),
      };
      setLiveTransactions(prev => [newTransaction, ...prev.slice(0, 19)]);
    }
  }, []);

  const getRiskColor = (score: number) => {
    if (score <= RISK_THRESHOLDS.LOW.max) return RISK_THRESHOLDS.LOW.color;
    if (score <= RISK_THRESHOLDS.MEDIUM.max) return RISK_THRESHOLDS.MEDIUM.color;
    if (score <= RISK_THRESHOLDS.HIGH.max) return RISK_THRESHOLDS.HIGH.color;
    return RISK_THRESHOLDS.CRITICAL.color;
  };

  const pieData = analytics?.risk_distribution
    ? [
        { name: 'Low Risk', value: analytics.risk_distribution.low, color: RISK_THRESHOLDS.LOW.color },
        { name: 'Medium Risk', value: analytics.risk_distribution.medium, color: RISK_THRESHOLDS.MEDIUM.color },
        { name: 'High Risk', value: analytics.risk_distribution.high, color: RISK_THRESHOLDS.HIGH.color },
        { name: 'Critical', value: analytics.risk_distribution.critical, color: RISK_THRESHOLDS.CRITICAL.color },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      <div className={`flex items-center justify-between px-4 py-2 rounded-lg ${isConnected ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Live Connection Active</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Connection Lost - Reconnecting...</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>TPS: <span className="text-white font-mono">{realtimeMetrics.transactionsPerSecond}</span></span>
          <span>Avg Score: <span className="text-white font-mono">{realtimeMetrics.averageScore}</span></span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Transactions"
          value={analytics?.total_transactions || 0}
          icon={CreditCard}
          trend={+5.2}
          color="cyan"
        />
        <MetricCard
          title="Fraud Detected"
          value={analytics?.fraudulent_transactions || 0}
          icon={AlertTriangle}
          trend={-2.1}
          color="red"
        />
        <MetricCard
          title="Blocked Today"
          value={analytics?.blocked_transactions || 0}
          icon={Shield}
          trend={+1.5}
          color="orange"
        />
        <MetricCard
          title="Approval Rate"
          value={`${(analytics?.approval_rate || 98.5).toFixed(1)}%`}
          icon={CheckCircle2}
          trend={+0.3}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Transaction Volume & Risk Score
            </h3>
            <div className="flex gap-2">
              {(['hour', 'day', 'week', 'month'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    timeRange === range
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'bg-slate-700/50 text-gray-400 hover:text-white'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics?.timeline || []}>
              <defs>
                <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="transactions"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorTransactions)"
                name="Transactions"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="risk_score"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name="Avg Risk Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution Pie */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-400" />
            Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RePieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              />
            </RePieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-400">{item.name}</span>
                <span className="text-xs text-white font-mono ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Transaction Stream */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
          Live Transaction Stream
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-slate-700">
                <th className="pb-3 font-medium">Transaction ID</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Country</th>
                <th className="pb-3 font-medium">Risk Score</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {liveTransactions.slice(0, 10).map((tx, index) => (
                <tr
                  key={tx.id}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-all ${
                    index === 0 ? 'animate-pulse bg-slate-700/20' : ''
                  }`}
                  onClick={() => onTransactionSelect?.(tx.id)}
                >
                  <td className="py-3 font-mono text-sm text-cyan-400">{tx.id}</td>
                  <td className="py-3 text-sm text-white">${tx.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-white">{tx.country}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getRiskColor(tx.score) }}
                      />
                      <span className="text-sm font-mono" style={{ color: getRiskColor(tx.score) }}>
                        {tx.score}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-gray-400">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <HealthIndicator
          label="API Gateway"
          status={systemHealth?.status || 'unknown'}
          latency={systemHealth?.average_latency_ms || 0}
        />
        <HealthIndicator
          label="ML Engine"
          status={systemHealth?.ml_models_status?.GRADIENT_BOOST || 'unknown'}
          latency={12}
        />
        <HealthIndicator
          label="Neural Net"
          status={systemHealth?.ml_models_status?.NEURAL_NET || 'unknown'}
          latency={18}
        />
        <HealthIndicator
          label="Database"
          status="online"
          latency={3}
        />
        <HealthIndicator
          label="Redis Cache"
          status="online"
          latency={1}
        />
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  color: 'cyan' | 'red' | 'orange' | 'green' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-500 text-cyan-400',
    red: 'from-red-500 to-pink-500 text-red-400',
    orange: 'from-orange-500 to-amber-500 text-orange-400',
    green: 'from-green-500 to-emerald-500 text-green-400',
    purple: 'from-purple-500 to-pink-500 text-purple-400',
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-4 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-xs text-gray-400 mt-1">{title}</p>
      </div>
    </div>
  );
};

// Health Indicator Component
interface HealthIndicatorProps {
  label: string;
  status: string;
  latency: number;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({ label, status, latency }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'healthy':
      case 'online':
        return 'bg-green-500';
      case 'degraded':
      case 'retraining':
        return 'bg-yellow-500';
      case 'down':
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-white">{latency}</span>
        <span className="text-xs text-gray-400">ms</span>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
