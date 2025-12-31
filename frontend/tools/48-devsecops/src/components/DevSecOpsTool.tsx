import { useState, useEffect } from 'react';
import { GitBranch, Shield, Eye, Zap, RefreshCw, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: string;
  findings: number;
}

interface ScanResult {
  pipelineId: string;
  totalStages: number;
  passedStages: number;
  securityScore: number;
  stages: PipelineStage[];
  vulnerabilities: { severity: string; count: number }[];
  scanTime: string;
}

const mockStages: PipelineStage[] = [
  { id: '1', name: 'SAST Scan', status: 'passed', duration: '2m 15s', findings: 3 },
  { id: '2', name: 'Dependency Check', status: 'passed', duration: '1m 42s', findings: 12 },
  { id: '3', name: 'Container Scan', status: 'running', duration: '3m 08s', findings: 5 },
  { id: '4', name: 'Secret Detection', status: 'failed', duration: '0m 45s', findings: 2 },
  { id: '5', name: 'DAST Scan', status: 'pending', duration: '-', findings: 0 },
];

export default function DevSecOpsTool() {
  const [repoUrl, setRepoUrl] = useState('');
  const [pipelineType, setPipelineType] = useState('full');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveStages, setLiveStages] = useState<PipelineStage[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setScanProgress(p => Math.min(p + Math.random() * 12, 95));
        if (Math.random() > 0.5 && liveStages.length < 5) {
          setLiveStages(prev => [...prev, mockStages[prev.length]]);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, liveStages.length]);

  const handleAnalyze = () => {
    if (!repoUrl) return;
    setIsAnalyzing(true);
    setLiveStages([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setScanProgress(100);
      setResult({
        pipelineId: 'pipe-' + Math.random().toString(36).substr(2, 9),
        totalStages: 5,
        passedStages: 3,
        securityScore: 72,
        stages: mockStages,
        vulnerabilities: [
          { severity: 'Critical', count: 2 },
          { severity: 'High', count: 8 },
          { severity: 'Medium', count: 15 },
          { severity: 'Low', count: 23 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'passed') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-400" />;
    if (status === 'running') return <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 animate-buildPulse">
            <GitBranch className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DevSecOps</h1>
          <p className="text-orange-300">Security Pipeline Integration</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-orange-900/30 backdrop-blur-sm rounded-2xl border border-orange-700/50 p-6">
            <h2 className="text-lg font-semibold text-orange-100 mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-orange-400" />
              Pipeline Config
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-300 mb-2">Repository URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="pipeline-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-300 mb-2">Pipeline Type</label>
                <select
                  value={pipelineType}
                  onChange={(e) => setPipelineType(e.target.value)}
                  className="pipeline-input"
                >
                  <option value="full">Full Security Scan</option>
                  <option value="quick">Quick Scan</option>
                  <option value="sast">SAST Only</option>
                  <option value="dast">DAST Only</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['SAST', 'DAST', 'SCA', 'Secrets'].map((type) => (
                  <label key={type} className="flex items-center gap-2 p-3 rounded-lg bg-orange-950/50 border border-orange-700/30 cursor-pointer hover:border-orange-500/50 transition-all">
                    <input type="checkbox" defaultChecked className="rounded text-orange-500" />
                    <span className="text-xs text-orange-200">{type}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !repoUrl}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Running Pipeline...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Run Security Pipeline
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-orange-900/30 backdrop-blur-sm rounded-2xl border border-orange-700/50 p-6">
            <h2 className="text-lg font-semibold text-orange-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              Pipeline Stages
              {isAnalyzing && <span className="ml-auto flex h-3 w-3"><span className="animate-ping absolute h-3 w-3 rounded-full bg-orange-400 opacity-75"></span><span className="relative rounded-full h-3 w-3 bg-orange-500"></span></span>}
            </h2>

            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-orange-300 mb-2">
                  <span>Executing</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-orange-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-400 transition-all animate-pipelineFlow" style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveStages.length === 0 && !isAnalyzing && (
                <div className="text-center py-8 text-orange-500">
                  <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter repo to run pipeline</p>
                </div>
              )}
              {liveStages.map((stage, idx) => (
                <div key={stage.id} className="pipeline-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(stage.status)}
                      <span className="text-orange-100 font-medium text-sm">{stage.name}</span>
                    </div>
                    <span className={`stage-badge ${stage.status}`}>{stage.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-orange-400">
                    <span>Duration: {stage.duration}</span>
                    <span className={stage.findings > 0 ? 'text-yellow-400' : 'text-green-400'}>
                      {stage.findings} findings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-orange-900/30 backdrop-blur-sm rounded-2xl border border-orange-700/50 p-6">
            <h2 className="text-lg font-semibold text-orange-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-400" />
              Pipeline Results
            </h2>

            {!result ? (
              <div className="text-center py-12 text-orange-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Run pipeline to view results</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Security Score Ring */}
                <div className="text-center p-4 rounded-xl bg-orange-950/50 border border-orange-700/30">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#431407" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke={result.securityScore >= 70 ? '#22c55e' : result.securityScore >= 50 ? '#f97316' : '#ef4444'} strokeWidth="8" fill="none" strokeDasharray={`${result.securityScore * 2.51} 251`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{result.securityScore}</span>
                  </div>
                  <p className="text-orange-400 text-sm">Security Score</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-orange-950/50 text-center">
                    <p className="text-xl font-bold text-green-400">{result.passedStages}/{result.totalStages}</p>
                    <p className="text-xs text-orange-400">Stages Passed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-950/50 text-center">
                    <p className="text-xl font-bold text-orange-400">{result.vulnerabilities.reduce((a, b) => a + b.count, 0)}</p>
                    <p className="text-xs text-orange-400">Total Findings</p>
                  </div>
                </div>

                {/* Vulnerabilities */}
                <div>
                  <p className="text-sm font-medium text-orange-300 mb-2">Vulnerabilities</p>
                  <div className="grid grid-cols-4 gap-1">
                    {result.vulnerabilities.map((v) => (
                      <div key={v.severity} className="p-2 rounded bg-orange-950/50 text-center">
                        <p className={`text-lg font-bold ${v.severity === 'Critical' ? 'text-red-400' : v.severity === 'High' ? 'text-orange-400' : v.severity === 'Medium' ? 'text-yellow-400' : 'text-blue-400'}`}>{v.count}</p>
                        <p className="text-xs text-orange-500">{v.severity.slice(0, 4)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-orange-500 text-center">Completed at {result.scanTime}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
