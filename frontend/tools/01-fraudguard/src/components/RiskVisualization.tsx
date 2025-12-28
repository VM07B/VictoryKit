import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend } from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Activity } from 'lucide-react';

interface RiskVisualizationProps {
  type: 'risk_breakdown' | 'timeline' | 'comparison' | 'heatmap' | 'distribution';
  data: any;
  title?: string;
}

const COLORS = {
  low: '#00ff88',
  medium: '#ffaa00',
  high: '#ff0055',
  primary: '#ff0055',
  secondary: '#00d4ff',
  accent: '#a855f7'
};

export const RiskVisualization: React.FC<RiskVisualizationProps> = ({ type, data, title }) => {
  const renderRiskBreakdown = () => {
    const breakdownData = data.breakdown || [
      { name: 'IP Risk', value: 25, color: COLORS.medium },
      { name: 'Device Risk', value: 15, color: COLORS.low },
      { name: 'Velocity Risk', value: 35, color: COLORS.high },
      { name: 'Geo Risk', value: 20, color: COLORS.medium },
      { name: 'Amount Risk', value: 10, color: COLORS.low }
    ];

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={breakdownData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis type="number" domain={[0, 100]} stroke="#666" />
            <YAxis dataKey="name" type="category" stroke="#666" width={100} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #ff0055', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {breakdownData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS.primary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTimeline = () => {
    const timelineData = data.timeline || [
      { date: 'Mon', score: 45, transactions: 120 },
      { date: 'Tue', score: 52, transactions: 145 },
      { date: 'Wed', score: 38, transactions: 98 },
      { date: 'Thu', score: 72, transactions: 167 },
      { date: 'Fri', score: 65, transactions: 189 },
      { date: 'Sat', score: 48, transactions: 134 },
      { date: 'Sun', score: 35, transactions: 89 }
    ];

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #ff0055', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Area type="monotone" dataKey="score" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorScore)" name="Avg Risk Score" />
            <Area type="monotone" dataKey="transactions" stroke={COLORS.secondary} fillOpacity={1} fill="url(#colorTx)" name="Transactions" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDistribution = () => {
    const distributionData = data.distribution || [
      { name: 'Low Risk', value: 650, color: COLORS.low },
      { name: 'Medium Risk', value: 280, color: COLORS.medium },
      { name: 'High Risk', value: 70, color: COLORS.high }
    ];

    return (
      <div className="h-80 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {distributionData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #ff0055', borderRadius: '8px' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderComparison = () => {
    const comparisonData = data.comparison || [
      { category: 'This Transaction', current: 72, average: 45 },
      { category: 'Same Merchant', current: 65, average: 38 },
      { category: 'Same IP Range', current: 78, average: 52 },
      { category: 'Same Device Type', current: 55, average: 42 },
      { category: 'Same Amount Range', current: 48, average: 35 }
    ];

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="category" stroke="#666" angle={-15} textAnchor="end" height={60} />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #ff0055', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="current" name="Current" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="average" name="Average" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderHeatmap = () => {
    // Simple heatmap grid
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const heatmapData = data.heatmap || days.map(day => ({
      day,
      hours: hours.map(hour => ({
        hour,
        value: Math.floor(Math.random() * 100)
      }))
    }));

    const getHeatmapColor = (value: number) => {
      if (value >= 70) return 'bg-red-500';
      if (value >= 40) return 'bg-yellow-500';
      if (value >= 20) return 'bg-green-600';
      return 'bg-green-900';
    };

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex gap-1 mb-2 ml-12">
            {hours.filter((_, i) => i % 3 === 0).map(hour => (
              <div key={hour} className="w-6 text-xs text-gray-500 text-center">
                {hour}:00
              </div>
            ))}
          </div>
          {heatmapData.map((dayData: any, dayIndex: number) => (
            <div key={dayIndex} className="flex items-center gap-1 mb-1">
              <div className="w-10 text-xs text-gray-500">{dayData.day}</div>
              {dayData.hours.map((hourData: any, hourIndex: number) => (
                <div
                  key={hourIndex}
                  className={`w-4 h-4 rounded-sm ${getHeatmapColor(hourData.value)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  title={`${dayData.day} ${hourData.hour}:00 - Risk: ${hourData.value}`}
                />
              ))}
            </div>
          ))}
          <div className="flex items-center gap-4 mt-4 ml-12">
            <span className="text-xs text-gray-500">Low Risk</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-sm bg-green-900" />
              <div className="w-4 h-4 rounded-sm bg-green-600" />
              <div className="w-4 h-4 rounded-sm bg-yellow-500" />
              <div className="w-4 h-4 rounded-sm bg-red-500" />
            </div>
            <span className="text-xs text-gray-500">High Risk</span>
          </div>
        </div>
      </div>
    );
  };

  const getIcon = () => {
    switch (type) {
      case 'risk_breakdown': return <BarChart3 className="w-5 h-5" />;
      case 'timeline': return <TrendingUp className="w-5 h-5" />;
      case 'distribution': return <PieIcon className="w-5 h-5" />;
      case 'comparison': return <BarChart3 className="w-5 h-5" />;
      case 'heatmap': return <Activity className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'risk_breakdown': return 'Risk Factor Breakdown';
      case 'timeline': return 'Risk Score Timeline';
      case 'distribution': return 'Risk Distribution';
      case 'comparison': return 'Risk Comparison';
      case 'heatmap': return 'Activity Heatmap';
      default: return 'Visualization';
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'risk_breakdown': return renderRiskBreakdown();
      case 'timeline': return renderTimeline();
      case 'distribution': return renderDistribution();
      case 'comparison': return renderComparison();
      case 'heatmap': return renderHeatmap();
      default: return renderRiskBreakdown();
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
          {getIcon()}
        </div>
        <h3 className="text-lg font-bold text-white">{title || getDefaultTitle()}</h3>
      </div>
      {renderContent()}
    </div>
  );
};

export default RiskVisualization;
