import React from "react";
import {
  Shield,
  Database,
  Cloud,
  FileText,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Search,
  FileSearch,
  Folder,
  User,
  CreditCard,
  Heart,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Loader2,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface DataFinding {
  id: string;
  type: "pii" | "phi" | "pci" | "confidential" | "credentials" | "ip";
  category: string;
  location: string;
  source: string;
  count: number;
  risk: "critical" | "high" | "medium" | "low";
  encrypted: boolean;
  samples?: string[];
}

interface SourceProgress {
  sourceId: string;
  sourceName: string;
  sourceType: "database" | "cloud" | "file" | "api";
  status: "pending" | "scanning" | "completed" | "error";
  progress: number;
  tablesScanned?: number;
  totalTables?: number;
  recordsScanned?: number;
  findingsCount: number;
}

interface ScanEvent {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "finding" | "complete";
  message: string;
  details?: string;
}

interface LiveDataGuardianPanelProps {
  isScanning: boolean;
  currentPhase: string;
  overallProgress: number;
  sourceProgress: SourceProgress[];
  findings: DataFinding[];
  events: ScanEvent[];
  stats: {
    totalRecords: number;
    totalFindings: number;
    piiCount: number;
    phiCount: number;
    pciCount: number;
    encryptedCount: number;
    unencryptedCount: number;
  };
}

const LiveDataGuardianPanel: React.FC<LiveDataGuardianPanelProps> = ({
  isScanning,
  currentPhase,
  overallProgress,
  sourceProgress,
  findings,
  events,
  stats,
}) => {
  const [expandedSources, setExpandedSources] = React.useState<Set<string>>(
    new Set()
  );

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "database":
        return Database;
      case "cloud":
        return Cloud;
      case "file":
        return FileText;
      case "api":
        return Globe;
      default:
        return Database;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pii":
        return User;
      case "phi":
        return Heart;
      case "pci":
        return CreditCard;
      case "credentials":
        return Key;
      case "confidential":
        return Lock;
      case "ip":
        return FileSearch;
      default:
        return FileText;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "email":
        return Mail;
      case "phone":
        return Phone;
      case "ssn":
        return Hash;
      case "address":
        return MapPin;
      case "dob":
        return Calendar;
      case "name":
        return User;
      case "credit_card":
        return CreditCard;
      default:
        return FileText;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pii":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "phi":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "pci":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "confidential":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "credentials":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "ip":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const toggleSource = (sourceId: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  const recentFindings = findings.slice(-5).reverse();
  const recentEvents = events.slice(-8).reverse();

  return (
    <div className="h-full flex flex-col bg-green-950/30 rounded-2xl border border-green-800/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-green-800/30 bg-green-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isScanning ? (
              <div className="relative">
                <Shield className="w-6 h-6 text-green-400 animate-shield-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
              </div>
            ) : (
              <Shield className="w-6 h-6 text-green-500" />
            )}
            <div>
              <h3 className="text-sm font-semibold text-green-100">
                Live Privacy Scan
              </h3>
              <p className="text-xs text-green-500">
                {currentPhase || "Ready to scan"}
              </p>
            </div>
          </div>
          {isScanning && (
            <span className="text-xs text-green-400 animate-pulse flex items-center gap-1">
              <Activity className="w-3 h-3" /> Scanning
            </span>
          )}
        </div>

        {/* Overall Progress */}
        {(isScanning || overallProgress > 0) && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-green-400 mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="scan-progress">
              <div
                className="scan-progress-bar"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-green-900/30 rounded-lg">
            <p className="text-lg font-bold text-green-100">
              {stats.totalRecords.toLocaleString()}
            </p>
            <p className="text-xs text-green-500">Records</p>
          </div>
          <div className="text-center p-2 bg-green-900/30 rounded-lg">
            <p className="text-lg font-bold text-red-400">{stats.piiCount}</p>
            <p className="text-xs text-green-500">PII</p>
          </div>
          <div className="text-center p-2 bg-green-900/30 rounded-lg">
            <p className="text-lg font-bold text-purple-400">
              {stats.phiCount}
            </p>
            <p className="text-xs text-green-500">PHI</p>
          </div>
          <div className="text-center p-2 bg-green-900/30 rounded-lg">
            <p className="text-lg font-bold text-amber-400">{stats.pciCount}</p>
            <p className="text-xs text-green-500">PCI</p>
          </div>
        </div>

        {/* Encryption Status */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 p-2 bg-green-900/30 rounded-lg">
            <Lock className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-300">
              {stats.encryptedCount} Encrypted
            </span>
          </div>
          <div className="flex-1 flex items-center gap-2 p-2 bg-red-900/30 rounded-lg">
            <Unlock className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-300">
              {stats.unencryptedCount} Unencrypted
            </span>
          </div>
        </div>

        {/* Source Progress */}
        {sourceProgress.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">
              Data Sources
            </h4>
            <div className="space-y-2">
              {sourceProgress.map((source) => {
                const Icon = getSourceIcon(source.sourceType);
                const isExpanded = expandedSources.has(source.sourceId);
                const sourceFindings = findings.filter(
                  (f) => f.source === source.sourceName
                );

                return (
                  <div
                    key={source.sourceId}
                    className="bg-green-900/20 rounded-lg border border-green-800/30 overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-green-900/30 transition-colors"
                      onClick={() => toggleSource(source.sourceId)}
                    >
                      <div className={`source-icon ${source.sourceType}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-200 truncate">
                            {source.sourceName}
                          </span>
                          {source.status === "scanning" && (
                            <Loader2 className="w-3 h-3 text-green-400 animate-spin" />
                          )}
                          {source.status === "completed" && (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          )}
                          {source.status === "error" && (
                            <AlertCircle className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-green-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${source.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-green-500">
                            {source.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {source.findingsCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded-full">
                            {source.findingsCount} findings
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-green-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    {isExpanded && sourceFindings.length > 0 && (
                      <div className="px-3 pb-3 space-y-1">
                        {sourceFindings.slice(0, 5).map((finding) => {
                          const TypeIcon = getTypeIcon(finding.type);
                          return (
                            <div
                              key={finding.id}
                              className="flex items-center gap-2 p-2 bg-green-950/50 rounded-lg text-xs"
                            >
                              <TypeIcon
                                className={`w-3 h-3 ${
                                  getTypeColor(finding.type).split(" ")[1]
                                }`}
                              />
                              <span className="text-green-300">
                                {finding.category}
                              </span>
                              <ArrowRight className="w-3 h-3 text-green-600" />
                              <span className="text-green-500 truncate flex-1">
                                {finding.location}
                              </span>
                              <span className={getRiskColor(finding.risk)}>
                                {finding.count}
                              </span>
                            </div>
                          );
                        })}
                        {sourceFindings.length > 5 && (
                          <p className="text-xs text-green-500 text-center pt-1">
                            +{sourceFindings.length - 5} more findings
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Findings */}
        {recentFindings.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">
              Recent Findings
            </h4>
            <div className="space-y-2">
              {recentFindings.map((finding) => {
                const TypeIcon = getTypeIcon(finding.type);
                const CategoryIcon = getCategoryIcon(finding.category);

                return (
                  <div
                    key={finding.id}
                    className={`p-3 rounded-lg border finding-highlight ${
                      finding.risk === "critical"
                        ? "bg-red-900/20 border-red-800/30"
                        : finding.risk === "high"
                        ? "bg-orange-900/20 border-orange-800/30"
                        : "bg-green-900/20 border-green-800/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getTypeColor(
                          finding.type
                        )} border`}
                      >
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`classification-tag ${finding.type}`}
                          >
                            {finding.type.toUpperCase()}
                          </span>
                          <span
                            className={`text-xs ${getRiskColor(finding.risk)}`}
                          >
                            {finding.risk.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-green-200 mt-1 flex items-center gap-1">
                          <CategoryIcon className="w-3 h-3 text-green-500" />
                          {finding.category}
                        </p>
                        <p className="text-xs text-green-500 truncate">
                          {finding.location}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-green-400">
                            {finding.count} occurrences
                          </span>
                          {finding.encrypted ? (
                            <span className="encryption-badge encrypted">
                              <Lock className="w-3 h-3" /> Encrypted
                            </span>
                          ) : (
                            <span className="encryption-badge unencrypted">
                              <Unlock className="w-3 h-3" /> Unencrypted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Event Feed */}
        {recentEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">
              Scan Events
            </h4>
            <div className="space-y-1 text-xs">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 p-2 bg-green-900/20 rounded-lg"
                >
                  {event.type === "info" && (
                    <Search className="w-3 h-3 text-blue-400 mt-0.5" />
                  )}
                  {event.type === "warning" && (
                    <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5" />
                  )}
                  {event.type === "finding" && (
                    <Eye className="w-3 h-3 text-red-400 mt-0.5" />
                  )}
                  {event.type === "complete" && (
                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="text-green-300">{event.message}</span>
                    {event.details && (
                      <p className="text-green-500/70 mt-0.5">
                        {event.details}
                      </p>
                    )}
                  </div>
                  <span className="text-green-600 text-xs">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isScanning && findings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="shield-container mb-4">
              <Shield className="w-16 h-16 text-green-700" />
            </div>
            <h3 className="text-lg font-medium text-green-300 mb-2">
              Ready to Scan
            </h3>
            <p className="text-sm text-green-500/70 max-w-xs">
              Configure your data sources and privacy settings, then start the
              scan to detect sensitive data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDataGuardianPanel;
