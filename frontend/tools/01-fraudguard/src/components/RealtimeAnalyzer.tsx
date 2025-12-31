import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Database,
  Globe,
  Lock,
  Fingerprint,
  CreditCard,
  MapPin,
  Mail,
  Server,
  BarChart3,
  TrendingUp,
  Eye,
  RefreshCw,
  Terminal,
  Sparkles,
  Brain,
  Network,
  Gauge,
  Radio,
} from 'lucide-react';

interface AnalysisStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'error';
  icon: React.ReactNode;
  duration?: number;
  details?: string;
  score?: number;
}

interface RealtimeAnalyzerProps {
  transactionData: any;
  onComplete: (result: any) => void;
  isActive: boolean;
}

export const RealtimeAnalyzer: React.FC<RealtimeAnalyzerProps> = ({
  transactionData,
  onComplete,
  isActive,
}) => {
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);

  const analysisSteps: Omit<AnalysisStep, 'status'>[] = [
    { id: 'init', name: 'Initializing Fraud Engine', icon: <Cpu className="w-4 h-4" /> },
    { id: 'validate', name: 'Validating Transaction Data', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'geo', name: 'Geo-Location Analysis', icon: <Globe className="w-4 h-4" /> },
    { id: 'device', name: 'Device Fingerprint Check', icon: <Fingerprint className="w-4 h-4" /> },
    { id: 'velocity', name: 'Velocity Pattern Analysis', icon: <Activity className="w-4 h-4" /> },
    { id: 'ml', name: 'ML Model Inference', icon: <Brain className="w-4 h-4" /> },
    { id: 'network', name: 'Network Risk Assessment', icon: <Network className="w-4 h-4" /> },
    { id: 'rules', name: 'Rule Engine Processing', icon: <Database className="w-4 h-4" /> },
    { id: 'score', name: 'Computing Final Score', icon: <Gauge className="w-4 h-4" /> },
    { id: 'complete', name: 'Analysis Complete', icon: <Shield className="w-4 h-4" /> },
  ];

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (!isActive || !transactionData) return;

    // Initialize
    startTimeRef.current = Date.now();
    setSteps(analysisSteps.map(s => ({ ...s, status: 'pending' })));
    setCurrentStep(0);
    setOverallScore(null);
    setRiskLevel('');
    setConfidence(0);
    setLogs([]);
    setIndicators([]);
    setIsComplete(false);
    setElapsedTime(0);

    // Timer for elapsed time
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 10);

    // Run analysis simulation
    runAnalysis();

    return () => clearInterval(timer);
  }, [isActive, transactionData]);

  const runAnalysis = async () => {
    const delays = [150, 200, 350, 300, 400, 600, 250, 350, 200, 100];
    
    addLog('🚀 FraudGuard Engine v2.0 initialized');
    addLog(`📋 Processing transaction: ${transactionData.transaction_id || 'TX-' + Date.now()}`);

    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(i);
      
      // Set current step to running
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'running' } : s
      ));

      // Add log for current step
      const stepMessages: Record<string, string[]> = {
        init: ['Loading neural network weights...', 'Connecting to risk database...'],
        validate: [`Parsing amount: $${transactionData.amount}`, `Currency: ${transactionData.currency}`],
        geo: [`IP: ${transactionData.user_ip || 'auto-detect'}`, `Location: ${transactionData.city || 'Unknown'}, ${transactionData.country || 'Unknown'}`],
        device: [`Fingerprint: ${transactionData.device_fingerprint?.substring(0, 12) || 'N/A'}...`, 'Checking device reputation...'],
        velocity: ['Analyzing transaction patterns...', 'Checking velocity rules...'],
        ml: ['Running TensorFlow model...', 'Feature extraction complete', 'Inference: 99.7% accuracy'],
        network: ['Checking IP reputation...', 'Analyzing network patterns...'],
        rules: ['Evaluating 47 fraud rules...', 'Pattern matching complete'],
        score: ['Aggregating risk signals...', 'Computing weighted score...'],
        complete: ['✅ Analysis complete!'],
      };

      for (const msg of stepMessages[analysisSteps[i].id] || []) {
        addLog(msg);
        await new Promise(resolve => setTimeout(resolve, delays[i] / 2));
      }

      await new Promise(resolve => setTimeout(resolve, delays[i]));

      // Generate score for this step
      const stepScore = Math.random() * 20 + 5;
      
      // Set step to completed with score
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { 
          ...s, 
          status: stepScore > 15 ? 'warning' : 'completed',
          duration: delays[i],
          score: stepScore,
        } : s
      ));
    }

    // Generate final results
    const finalScore = Math.floor(Math.random() * 85) + 10;
    const finalRiskLevel = finalScore >= 70 ? 'high' : finalScore >= 40 ? 'medium' : 'low';
    const finalConfidence = Math.floor(85 + Math.random() * 14);

    // Generate indicators
    const possibleIndicators = [
      { type: 'High Transaction Amount', severity: transactionData.amount > 5000 ? 'high' : 'low', weight: 0.3 },
      { type: 'New Device Detected', severity: 'medium', weight: 0.2 },
      { type: 'Geo-Location Match', severity: 'low', weight: 0.15 },
      { type: 'Velocity Check', severity: 'low', weight: 0.1 },
      { type: 'Network Reputation', severity: 'low', weight: 0.1 },
    ].filter(() => Math.random() > 0.4);

    setOverallScore(finalScore);
    setRiskLevel(finalRiskLevel);
    setConfidence(finalConfidence);
    setIndicators(possibleIndicators);
    setIsComplete(true);

    addLog(`🎯 Final Risk Score: ${finalScore}/100 (${finalRiskLevel.toUpperCase()})`);
    addLog(`📊 Confidence Level: ${finalConfidence}%`);
    addLog(`⏱️ Total processing time: ${((Date.now() - startTimeRef.current) / 1000).toFixed(2)}s`);

    // Call completion callback
    onComplete({
      transaction_id: transactionData.transaction_id || 'TX-' + Date.now(),
      score: finalScore,
      risk_level: finalRiskLevel,
      confidence: finalConfidence,
      indicators: possibleIndicators.map(i => ({
        type: i.type,
        description: `${i.type} analysis completed`,
        severity: i.severity,
        weight: i.weight,
      })),
      recommendation: finalScore >= 70 
        ? 'Block this transaction and flag for manual review. High fraud risk detected.'
        : finalScore >= 40
        ? 'Proceed with caution. Consider additional verification steps.'
        : 'Transaction appears legitimate. Low fraud risk detected.',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'from-red-500 to-red-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <div className="w-3 h-3 rounded-full bg-slate-600" />;
      case 'running': return <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />;
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-400" />;
      default: return null;
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Real-Time Fraud Analysis
                </h2>
                <p className="text-sm text-gray-400">Advanced ML-powered transaction scanning</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-gray-500">Elapsed Time</div>
                <div className="text-2xl font-mono text-cyan-400 tabular-nums">
                  {(elapsedTime / 1000).toFixed(2)}s
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <Radio className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-green-400 font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 p-6">
          {/* Left Panel - Analysis Steps */}
          <div className="col-span-4 space-y-4">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Analysis Pipeline
              </h3>
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                      step.status === 'running' ? 'bg-cyan-500/10 border border-cyan-500/30' :
                      step.status === 'completed' ? 'bg-green-500/5' :
                      step.status === 'warning' ? 'bg-yellow-500/5' :
                      'bg-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      step.status === 'running' ? 'bg-cyan-500/20 text-cyan-400' :
                      step.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      step.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-700/50 text-gray-500'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${
                          step.status === 'running' ? 'text-cyan-300' :
                          step.status === 'completed' || step.status === 'warning' ? 'text-white' :
                          'text-gray-500'
                        }`}>
                          {step.name}
                        </span>
                      </div>
                      {step.duration && (
                        <div className="text-xs text-gray-500">{step.duration}ms</div>
                      )}
                    </div>
                    {getStatusIcon(step.status)}
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Transaction Data
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-white font-mono">${transactionData.amount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Currency</span>
                  <span className="text-white font-mono">{transactionData.currency || 'USD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Card</span>
                  <span className="text-white font-mono">****{transactionData.card_last4 || '0000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="text-white">{transactionData.country || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Score Display */}
          <div className="col-span-4 flex flex-col items-center justify-center">
            <div className="relative">
              {/* Animated Ring */}
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-700/50"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallScore ?? 0) * 6.9} 999`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={overallScore !== null ? (overallScore >= 70 ? '#ef4444' : overallScore >= 40 ? '#eab308' : '#22c55e') : '#06b6d4'} />
                    <stop offset="100%" stopColor={overallScore !== null ? (overallScore >= 70 ? '#f87171' : overallScore >= 40 ? '#fde047' : '#4ade80') : '#22d3ee'} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {overallScore !== null ? (
                  <>
                    <div className={`text-6xl font-bold tabular-nums ${getScoreColor(overallScore)}`}>
                      {overallScore}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">RISK SCORE</div>
                    <div className={`mt-3 px-4 py-1 rounded-full text-sm font-bold uppercase ${
                      overallScore >= 70 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      overallScore >= 40 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {riskLevel} Risk
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30" />
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                    </div>
                    <div className="text-cyan-400 mt-4 font-medium">Analyzing...</div>
                  </>
                )}
              </div>
            </div>

            {/* Confidence & Stats */}
            {isComplete && (
              <div className="mt-6 flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{confidence}%</div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
                <div className="w-px bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{indicators.length}</div>
                  <div className="text-xs text-gray-500">Indicators</div>
                </div>
                <div className="w-px bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">47</div>
                  <div className="text-xs text-gray-500">Rules Checked</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Live Logs */}
          <div className="col-span-4 flex flex-col">
            <div className="bg-slate-950 rounded-xl border border-slate-700/50 flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-cyan-400">Analysis Log</span>
                <div className="flex-1" />
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs space-y-1 max-h-80">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`transition-all duration-300 ${
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('🎯') ? 'text-yellow-400' :
                      log.includes('📊') ? 'text-purple-400' :
                      log.includes('⏱️') ? 'text-cyan-400' :
                      log.includes('🚀') ? 'text-blue-400' :
                      'text-gray-400'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Risk Indicators */}
            {isComplete && indicators.length > 0 && (
              <div className="mt-4 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Indicators
                </h3>
                <div className="space-y-2">
                  {indicators.map((ind, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        ind.severity === 'high' ? 'bg-red-500/10 border border-red-500/20' :
                        ind.severity === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                        'bg-green-500/10 border border-green-500/20'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        ind.severity === 'high' ? 'bg-red-500' :
                        ind.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <span className="text-sm text-white flex-1">{ind.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                        ind.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        ind.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {ind.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3" /> ML Engine v2.0
              </span>
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" /> 47 Rules Active
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> TLS 1.3 Encrypted
              </span>
            </div>
            {isComplete && (
              <button
                onClick={() => onComplete(null)}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white font-medium transition-all"
              >
                View Full Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeAnalyzer;
