import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { FraudScore, FraudIndicator } from '../types';

interface FraudScoreCardProps {
  data: FraudScore;
  onViewDetails?: () => void;
}

export const FraudScoreCard: React.FC<FraudScoreCardProps> = ({ data, onViewDetails }) => {
  const { score, risk_level, confidence, indicators, recommendation } = data;

  const getScoreColor = () => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreBgColor = () => {
    if (score >= 70) return 'from-red-500/20 to-red-600/10';
    if (score >= 40) return 'from-yellow-500/20 to-yellow-600/10';
    return 'from-green-500/20 to-green-600/10';
  };

  const getRiskIcon = () => {
    if (risk_level === 'high') return <XCircle className="w-16 h-16 text-red-500" />;
    if (risk_level === 'medium') return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
    return <CheckCircle className="w-16 h-16 text-green-500" />;
  };

  const getIndicatorColor = (severity: string) => {
    if (severity === 'high') return 'border-red-500/50 bg-red-500/10 text-red-300';
    if (severity === 'medium') return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300';
    return 'border-green-500/50 bg-green-500/10 text-green-300';
  };

  const getIndicatorIcon = (severity: string) => {
    if (severity === 'high') return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (severity === 'medium') return <TrendingUp className="w-4 h-4 text-yellow-400 rotate-45" />;
    return <TrendingDown className="w-4 h-4 text-green-400" />;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden">
      {/* Header with Score */}
      <div className={`bg-gradient-to-r ${getScoreBgColor()} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Fraud Risk Score</h2>
              <p className="text-sm text-gray-300">Transaction: {data.transaction_id}</p>
            </div>
          </div>
          {getRiskIcon()}
        </div>
      </div>
      
      {/* Score Display */}
      <div className="p-6 border-b border-red-500/20">
        <div className="flex items-center justify-center gap-8">
          {/* Main Score */}
          <div className="text-center">
            <div className={`text-7xl font-bold ${getScoreColor()} tabular-nums`}>
              {score}
            </div>
            <div className="text-sm text-gray-400 mt-1">out of 100</div>
          </div>
          
          {/* Gauge/Progress */}
          <div className="flex-1 max-w-[200px]">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="w-full bg-slate-900/50 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-1000 ${
                  score >= 70 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                  score >= 40 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                  'bg-gradient-to-r from-green-600 to-green-400'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>40</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>
        </div>
        
        {/* Risk Level & Confidence */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <div className={`text-2xl font-bold uppercase ${getScoreColor()}`}>
              {risk_level}
            </div>
            <div className="text-xs text-gray-500">Risk Level</div>
          </div>
          <div className="w-px bg-red-500/20" />
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {confidence}%
            </div>
            <div className="text-xs text-gray-500">Confidence</div>
          </div>
        </div>
      </div>
      
      {/* Fraud Indicators */}
      <div className="p-6 border-b border-red-500/20">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Fraud Indicators ({indicators.length})
        </h3>
        
        {indicators.length > 0 ? (
          <div className="space-y-3">
            {indicators.map((indicator, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${getIndicatorColor(indicator.severity)}`}
              >
                {getIndicatorIcon(indicator.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{indicator.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                      indicator.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      indicator.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {indicator.severity}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-1">{indicator.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Weight:</span>
                    <div className="flex-1 bg-slate-900/50 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500"
                        style={{ width: `${indicator.weight * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{(indicator.weight * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>No significant fraud indicators detected</p>
          </div>
        )}
      </div>
      
      {/* Recommendation */}
      <div className="p-6">
        <h3 className="text-white font-bold mb-3">Recommendation</h3>
        <div className={`p-4 rounded-lg border ${
          score >= 70 ? 'bg-red-500/10 border-red-500/30' :
          score >= 40 ? 'bg-yellow-500/10 border-yellow-500/30' :
          'bg-green-500/10 border-green-500/30'
        }`}>
          <p className="text-gray-200 text-sm leading-relaxed">
            {recommendation}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-red-500/20 border border-red-500/30 text-red-300 py-2 px-4 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
          >
            View Full Report
          </button>
          <button className="flex-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 py-2 px-4 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FraudScoreCard;
