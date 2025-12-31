import { useState, useEffect } from "react";
import {
  Key,
  Shield,
  Lock,
  Eye,
  Zap,
  RefreshCw,
  Activity,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface Secret {
  id: string;
  name: string;
  type: "api-key" | "password" | "token" | "certificate";
  lastRotated: string;
  expiresIn: number;
  strength: "strong" | "medium" | "weak";
}

interface AuditLog {
  id: string;
  action: string;
  secret: string;
  user: string;
  timestamp: string;
}

interface ScanResult {
  score: number;
  totalSecrets: number;
  expiringSoon: number;
  weakSecrets: number;
  secrets: Secret[];
  auditLogs: AuditLog[];
  scanTime: string;
}

const mockSecrets: Secret[] = [
  {
    id: "1",
    name: "AWS_ACCESS_KEY",
    type: "api-key",
    lastRotated: "2024-12-01",
    expiresIn: 15,
    strength: "strong",
  },
  {
    id: "2",
    name: "DB_PASSWORD",
    type: "password",
    lastRotated: "2024-10-15",
    expiresIn: -5,
    strength: "weak",
  },
  {
    id: "3",
    name: "JWT_SECRET",
    type: "token",
    lastRotated: "2024-11-20",
    expiresIn: 45,
    strength: "strong",
  },
  {
    id: "4",
    name: "SSL_CERTIFICATE",
    type: "certificate",
    lastRotated: "2024-06-01",
    expiresIn: 30,
    strength: "medium",
  },
  {
    id: "5",
    name: "STRIPE_API_KEY",
    type: "api-key",
    lastRotated: "2024-12-15",
    expiresIn: 60,
    strength: "strong",
  },
];

export default function SecretVaultTool() {
  const [vaultName, setVaultName] = useState("");
  const [provider, setProvider] = useState("aws");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveSecrets, setLiveSecrets] = useState<Secret[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((p) => Math.min(p + Math.random() * 15, 95));
        if (Math.random() > 0.5 && liveSecrets.length < 5) {
          setLiveSecrets((prev) => [...prev, mockSecrets[prev.length]]);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isScanning, liveSecrets.length]);

  const handleScan = () => {
    if (!vaultName) return;
    setIsScanning(true);
    setLiveSecrets([]);
    setScanProgress(0);
    setResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(100);
      setResult({
        score: 78,
        totalSecrets: 42,
        expiringSoon: 5,
        weakSecrets: 3,
        secrets: mockSecrets,
        auditLogs: [
          {
            id: "1",
            action: "ACCESS",
            secret: "AWS_ACCESS_KEY",
            user: "admin@company.com",
            timestamp: "2024-12-30 14:32",
          },
          {
            id: "2",
            action: "ROTATE",
            secret: "DB_PASSWORD",
            user: "system",
            timestamp: "2024-12-30 12:00",
          },
        ],
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 5000);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      "api-key": "bg-purple-600/30 text-purple-300",
      password: "bg-red-600/30 text-red-300",
      token: "bg-blue-600/30 text-blue-300",
      certificate: "bg-green-600/30 text-green-300",
    };
    return (
      colors[type as keyof typeof colors] || "bg-gray-600/30 text-gray-300"
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 mb-4 animate-lockSecure">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SecretVault</h1>
          <p className="text-yellow-300">Secrets Management Platform</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="bg-yellow-900/30 backdrop-blur-sm rounded-2xl border border-yellow-700/50 p-6">
            <h2 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-yellow-400" />
              Vault Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-300 mb-2">
                  Vault Name
                </label>
                <input
                  type="text"
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  placeholder="production-vault"
                  className="vault-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-300 mb-2">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="vault-input w-full"
                >
                  <option value="aws">AWS Secrets Manager</option>
                  <option value="azure">Azure Key Vault</option>
                  <option value="gcp">GCP Secret Manager</option>
                  <option value="hashicorp">HashiCorp Vault</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Rotation", "Expiry", "Access", "Strength"].map((check) => (
                  <label
                    key={check}
                    className="flex items-center gap-2 p-3 rounded-lg bg-yellow-950/50 border border-yellow-700/30 cursor-pointer hover:border-yellow-500/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-yellow-500"
                    />
                    <span className="text-xs text-yellow-200">{check}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleScan}
                disabled={isScanning || !vaultName}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Auditing Vault...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Audit Secrets
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Panel */}
          <div className="bg-yellow-900/30 backdrop-blur-sm rounded-2xl border border-yellow-700/50 p-6">
            <h2 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Secret Discovery
              {isScanning && (
                <span className="ml-auto flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              )}
            </h2>

            {isScanning && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-yellow-300 mb-2">
                  <span>Scanning</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-yellow-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveSecrets.length === 0 && !isScanning && (
                <div className="text-center py-8 text-yellow-500">
                  <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter vault name to audit</p>
                </div>
              )}
              {liveSecrets.map((secret, idx) => (
                <div
                  key={secret.id}
                  className="vault-card animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-100 font-medium">
                        {secret.name}
                      </span>
                    </div>
                    <span
                      className={`secret-badge px-2 py-1 rounded text-xs ${getTypeColor(
                        secret.type
                      )}`}
                    >
                      {secret.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-yellow-400">
                      Last rotated: {secret.lastRotated}
                    </span>
                    {secret.expiresIn <= 0 ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Expired
                      </span>
                    ) : secret.expiresIn <= 30 ? (
                      <span className="text-orange-400">
                        {secret.expiresIn}d left
                      </span>
                    ) : (
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Valid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Result Card */}
          <div className="bg-yellow-900/30 backdrop-blur-sm rounded-2xl border border-yellow-700/50 p-6">
            <h2 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-yellow-400" />
              Vault Health
            </h2>

            {!result ? (
              <div className="text-center py-12 text-yellow-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Complete audit to view results</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Score Ring */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#422006"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={
                          result.score >= 80
                            ? "#22c55e"
                            : result.score >= 60
                            ? "#eab308"
                            : "#ef4444"
                        }
                        strokeWidth="8"
                        strokeDasharray={`${result.score * 2.83} 283`}
                        className="score-ring"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {result.score}
                      </span>
                      <span className="text-xs text-yellow-400">Health</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-yellow-950/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {result.totalSecrets}
                    </p>
                    <p className="text-xs text-yellow-400">Secrets</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-950/50 text-center">
                    <p className="text-lg font-bold text-orange-400">
                      {result.expiringSoon}
                    </p>
                    <p className="text-xs text-yellow-400">Expiring</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-950/50 text-center">
                    <p className="text-lg font-bold text-red-400">
                      {result.weakSecrets}
                    </p>
                    <p className="text-xs text-yellow-400">Weak</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <p className="text-sm font-medium text-yellow-300 mb-2">
                    Recent Activity
                  </p>
                  <div className="space-y-2">
                    {result.auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2 rounded-lg bg-yellow-950/50 text-xs"
                      >
                        <div className="flex justify-between">
                          <span className="text-yellow-100">
                            {log.action}: {log.secret}
                          </span>
                        </div>
                        <p className="text-yellow-500">
                          {log.user} • {log.timestamp}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-yellow-500 text-center">
                  Audited at {result.scanTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
