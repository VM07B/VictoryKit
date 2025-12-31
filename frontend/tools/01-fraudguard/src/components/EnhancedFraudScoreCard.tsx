import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Share2,
  Eye,
  Clock,
  Zap,
  Activity,
  Target,
  BarChart3,
  PieChart,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  CheckCheck,
  Sparkles,
  Brain,
  Lock,
  Printer,
} from 'lucide-react';
import { FraudScore, FraudIndicator } from '../types';

interface EnhancedFraudScoreCardProps {
  data: FraudScore;
  onViewDetails?: () => void;
  onExport?: (format: 'pdf' | 'csv' | 'json') => void;
}

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number; className?: string }> = ({
  value,
  duration = 1000,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
};

// Progress Ring Component
const ProgressRing: React.FC<{
  score: number;
  size?: number;
  strokeWidth?: number;
}> = ({ score, size = 200, strokeWidth = 12 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getGradientColors = () => {
    if (score >= 70) return ['#ef4444', '#f87171'];
    if (score >= 40) return ['#eab308', '#fde047'];
    return ['#22c55e', '#4ade80'];
  };

  const [color1, color2] = getGradientColors();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" style={{ width: size, height: size }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700/50"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-5xl font-bold tabular-nums ${
          score >= 70 ? 'text-red-500' :
          score >= 40 ? 'text-yellow-500' :
          'text-green-500'
        }`}>
          <AnimatedCounter value={score} />
        </div>
        <div className="text-sm text-gray-400 mt-1">Risk Score</div>
      </div>
    </div>
  );
};

// Indicator Card Component
const IndicatorCard: React.FC<{
  indicator: FraudIndicator;
  index: number;
}> = ({ indicator, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getColor = () => {
    switch (indicator.severity) {
      case 'high': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20' };
      case 'medium': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20' };
      default: return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20' };
    }
  };

  const colors = getColor();

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-xl p-4 transition-all duration-300 animate-fadeIn`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${colors.badge} flex items-center justify-center flex-shrink-0`}>
            {indicator.severity === 'high' ? (
              <XCircle className={`w-5 h-5 ${colors.text}`} />
            ) : indicator.severity === 'medium' ? (
              <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
            ) : (
              <CheckCircle className={`w-5 h-5 ${colors.text}`} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">{indicator.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold ${colors.badge} ${colors.text}`}>
                {indicator.severity}
              </span>
            </div>
            <p className="text-sm text-gray-400">{indicator.description}</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/5 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Weight Bar */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-gray-500">Weight</span>
        <div className="flex-1 bg-slate-900/50 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              indicator.severity === 'high' ? 'bg-gradient-to-r from-red-600 to-red-400' :
              indicator.severity === 'medium' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
              'bg-gradient-to-r from-green-600 to-green-400'
            }`}
            style={{ width: `${indicator.weight * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 tabular-nums">{(indicator.weight * 100).toFixed(0)}%</span>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Detection Source</span>
            <span className="text-gray-300">ML Model + Rules</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Confidence</span>
            <span className="text-gray-300">High (92%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Similar Cases</span>
            <span className="text-cyan-400 cursor-pointer hover:underline">View 23 similar</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const EnhancedFraudScoreCard: React.FC<EnhancedFraudScoreCardProps> = ({
  data,
  onViewDetails,
  onExport,
}) => {
  const { score, risk_level, confidence, indicators, recommendation, transaction_id } = data;
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRecommendationIcon = () => {
    if (score >= 70) return <XCircle className="w-6 h-6 text-red-400" />;
    if (score >= 40) return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    return <CheckCircle className="w-6 h-6 text-green-400" />;
  };

  const getHeaderGradient = () => {
    if (score >= 70) return 'from-red-500/20 via-red-500/10 to-transparent';
    if (score >= 40) return 'from-yellow-500/20 via-yellow-500/10 to-transparent';
    return 'from-green-500/20 via-green-500/10 to-transparent';
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-b ${getHeaderGradient()} px-6 py-5 border-b border-slate-700/50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              score >= 70 ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25' :
              score >= 40 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-yellow-500/25' :
              'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25'
            }`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Analysis Complete
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="font-mono">{transaction_id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {copied ? (
                    <CheckCheck className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold uppercase text-sm ${
            score >= 70 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            score >= 40 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            {risk_level} Risk
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-center gap-12">
          <ProgressRing score={score} />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Target className="w-4 h-4 text-cyan-400" />
                Confidence
              </div>
              <div className="text-2xl font-bold text-cyan-400 tabular-nums">
                <AnimatedCounter value={confidence} />%
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Activity className="w-4 h-4 text-purple-400" />
                Indicators
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {indicators.length}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Brain className="w-4 h-4 text-pink-400" />
                ML Model
              </div>
              <div className="text-lg font-bold text-pink-400">
                v2.0
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                Analysis Time
              </div>
              <div className="text-lg font-bold text-blue-400">
                2.4s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Indicators */}
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Risk Indicators
          <span className="text-sm font-normal text-gray-400">({indicators.length} detected)</span>
        </h3>
        
        {indicators.length > 0 ? (
          <div className="space-y-3">
            {indicators.map((indicator, index) => (
              <IndicatorCard key={index} indicator={indicator} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-green-500/5 border border-green-500/20 rounded-xl">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-400 font-medium">No significant fraud indicators detected</p>
            <p className="text-sm text-gray-500 mt-1">Transaction appears legitimate</p>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Recommendation
        </h3>
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${
          score >= 70 ? 'bg-red-500/10 border-red-500/30' :
          score >= 40 ? 'bg-yellow-500/10 border-yellow-500/30' :
          'bg-green-500/10 border-green-500/30'
        }`}>
          {getRecommendationIcon()}
          <p className="text-gray-200 leading-relaxed">
            {recommendation || (
              score >= 70 
                ? 'Block this transaction immediately and flag for manual review. High fraud risk detected.'
                : score >= 40
                ? 'Proceed with caution. Consider additional verification steps before approving.'
                : 'Transaction appears legitimate. Low fraud risk detected. Safe to proceed.'
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-slate-900/30">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onViewDetails}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl transition-all font-medium shadow-lg shadow-red-500/20"
          >
            <Eye className="w-5 h-5" />
            View Full Report
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 text-gray-300 hover:text-white hover:border-slate-600 py-3 px-4 rounded-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Export
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showExportMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10">
                <button
                  onClick={() => { onExport?.('pdf'); setShowExportMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  PDF Report
                </button>
                <button
                  onClick={() => { onExport?.('csv'); setShowExportMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  CSV Data
                </button>
                <button
                  onClick={() => { onExport?.('json'); setShowExportMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  JSON
                </button>
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 text-gray-300 hover:text-white hover:border-slate-600 py-3 px-4 rounded-xl transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          
          <button className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 text-gray-300 hover:text-white hover:border-slate-600 py-3 px-4 rounded-xl transition-all">
            <Printer className="w-5 h-5" />
          </button>
        </div>
        
        {/* Security Footer */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            End-to-end encrypted
          </span>
          <span>•</span>
          <span>Analysis ID: {transaction_id.split('-').pop()}</span>
          <span>•</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFraudScoreCard;
