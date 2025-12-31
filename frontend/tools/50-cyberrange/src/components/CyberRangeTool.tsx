import { useState, useEffect } from 'react';
import { Crosshair, Target, Eye, Zap, RefreshCw, Activity, Trophy, Users, Flag } from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points: number;
  completions: number;
  status: 'available' | 'in-progress' | 'completed';
}

interface ScanResult {
  totalChallenges: number;
  completedCount: number;
  totalPoints: number;
  userRank: number;
  challenges: Challenge[];
  categoryBreakdown: { category: string; completed: number; total: number }[];
  scanTime: string;
}

const mockChallenges: Challenge[] = [
  { id: '1', name: 'SQL Injection 101', category: 'Web', difficulty: 'easy', points: 100, completions: 234, status: 'completed' },
  { id: '2', name: 'Buffer Overflow Basics', category: 'Binary', difficulty: 'medium', points: 250, completions: 89, status: 'completed' },
  { id: '3', name: 'XSS Master', category: 'Web', difficulty: 'hard', points: 500, completions: 45, status: 'in-progress' },
  { id: '4', name: 'Crypto Challenge', category: 'Crypto', difficulty: 'expert', points: 1000, completions: 12, status: 'available' },
  { id: '5', name: 'Network Recon', category: 'Network', difficulty: 'medium', points: 300, completions: 156, status: 'available' },
];

export default function CyberRangeTool() {
  const [rangeName, setRangeName] = useState('');
  const [category, setCategory] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveChallenges, setLiveChallenges] = useState<Challenge[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setScanProgress(p => Math.min(p + Math.random() * 15, 95));
        if (Math.random() > 0.4 && liveChallenges.length < 5) {
          setLiveChallenges(prev => [...prev, mockChallenges[prev.length]]);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, liveChallenges.length]);

  const handleAnalyze = () => {
    if (!rangeName) return;
    setIsAnalyzing(true);
    setLiveChallenges([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setScanProgress(100);
      setResult({
        totalChallenges: 50,
        completedCount: 23,
        totalPoints: 4750,
        userRank: 42,
        challenges: mockChallenges,
        categoryBreakdown: [
          { category: 'Web', completed: 8, total: 15 },
          { category: 'Binary', completed: 5, total: 12 },
          { category: 'Crypto', completed: 4, total: 10 },
          { category: 'Network', completed: 6, total: 13 },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (status === 'in-progress') return <Target className="w-4 h-4 text-cyan-400 animate-pulse" />;
    return <Flag className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 mb-4 animate-cyberPulse">
            <Crosshair className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CyberRange</h1>
          <p className="text-cyan-300">Cyber Training Range</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-cyan-900/30 backdrop-blur-sm rounded-2xl border border-cyan-700/50 p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Range Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">Range Name</label>
                <input
                  type="text"
                  value={rangeName}
                  onChange={(e) => setRangeName(e.target.value)}
                  placeholder="Enter range name"
                  className="cyber-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="cyber-input"
                >
                  <option value="all">All Categories</option>
                  <option value="web">Web Security</option>
                  <option value="binary">Binary Exploitation</option>
                  <option value="crypto">Cryptography</option>
                  <option value="network">Network</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Easy', 'Medium', 'Hard', 'Expert'].map((type) => (
                  <label key={type} className="flex items-center gap-2 p-3 rounded-lg bg-cyan-950/50 border border-cyan-700/30 cursor-pointer hover:border-cyan-500/50 transition-all">
                    <input type="checkbox" defaultChecked className="rounded text-cyan-500" />
                    <span className="text-xs text-cyan-200">{type}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !rangeName}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Loading Range...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Enter Range
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-cyan-900/30 backdrop-blur-sm rounded-2xl border border-cyan-700/50 p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Challenges
              {isAnalyzing && <span className="ml-auto flex h-3 w-3"><span className="animate-ping absolute h-3 w-3 rounded-full bg-cyan-400 opacity-75"></span><span className="relative rounded-full h-3 w-3 bg-cyan-500"></span></span>}
            </h2>

            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-cyan-300 mb-2">
                  <span>Loading</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-cyan-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all" style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveChallenges.length === 0 && !isAnalyzing && (
                <div className="text-center py-8 text-cyan-500">
                  <Crosshair className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter range to view challenges</p>
                </div>
              )}
              {liveChallenges.map((challenge, idx) => (
                <div key={challenge.id} className="cyber-card animate-targetLock" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(challenge.status)}
                      <span className="text-cyan-100 font-medium text-sm">{challenge.name}</span>
                    </div>
                    <span className={`difficulty-badge ${challenge.difficulty}`}>{challenge.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-cyan-400 mt-1">
                    <span>{challenge.category}</span>
                    <span className="text-yellow-400 font-bold">{challenge.points} pts</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-cyan-500 mt-1">
                    <Users className="w-3 h-3" />
                    <span>{challenge.completions} completions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-cyan-900/30 backdrop-blur-sm rounded-2xl border border-cyan-700/50 p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Your Progress
            </h2>

            {!result ? (
              <div className="text-center py-12 text-cyan-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Enter range to view progress</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Rank Display */}
                <div className="text-center p-4 rounded-xl bg-cyan-950/50 border border-cyan-700/30">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                  <p className="text-3xl font-bold text-white">#{result.userRank}</p>
                  <p className="text-cyan-400 text-sm">Global Rank</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-cyan-950/50 text-center">
                    <p className="text-lg font-bold text-green-400">{result.completedCount}/{result.totalChallenges}</p>
                    <p className="text-xs text-cyan-400">Completed</p>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-950/50 text-center">
                    <p className="text-lg font-bold text-yellow-400">{result.totalPoints}</p>
                    <p className="text-xs text-cyan-400">Points</p>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-950/50 text-center">
                    <p className="text-lg font-bold text-cyan-400">{Math.round((result.completedCount / result.totalChallenges) * 100)}%</p>
                    <p className="text-xs text-cyan-400">Progress</p>
                  </div>
                </div>

                {/* Category Progress */}
                <div>
                  <p className="text-sm font-medium text-cyan-300 mb-2">Category Progress</p>
                  <div className="space-y-2">
                    {result.categoryBreakdown.map((cat) => (
                      <div key={cat.category} className="flex items-center gap-2">
                        <span className="text-xs text-cyan-400 w-16">{cat.category}</span>
                        <div className="flex-1 h-2 bg-cyan-950 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${(cat.completed / cat.total) * 100}%` }} />
                        </div>
                        <span className="text-xs text-cyan-300">{cat.completed}/{cat.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-cyan-500 text-center">Updated at {result.scanTime}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
