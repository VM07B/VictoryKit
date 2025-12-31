import React, { useState } from "react";
import {
  Shield,
  Database,
  Cloud,
  FileText,
  Globe,
  Server,
  Lock,
  Eye,
  Search,
  Folder,
  HardDrive,
  Network,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface DataSource {
  id: string;
  type: "database" | "cloud" | "file" | "api";
  name: string;
  connection?: string;
}

interface DataGuardianFormProps {
  onSubmit: (config: DataGuardianConfig) => void;
  isScanning: boolean;
}

export interface DataGuardianConfig {
  scanName: string;
  dataSources: DataSource[];
  dataCategories: string[];
  scanTypes: string[];
  classificationLevel: string;
  privacyRegulations: string[];
  sensitivePatterns: string[];
  encryptionCheck: boolean;
  accessAudit: boolean;
  retentionAnalysis: boolean;
  crossBorderCheck: boolean;
}

const dataCategories = [
  {
    id: "pii",
    label: "PII",
    description: "Personal Identifiable Information",
    color: "red",
  },
  {
    id: "phi",
    label: "PHI",
    description: "Protected Health Information",
    color: "purple",
  },
  {
    id: "pci",
    label: "PCI",
    description: "Payment Card Information",
    color: "amber",
  },
  {
    id: "confidential",
    label: "Confidential",
    description: "Business Confidential Data",
    color: "blue",
  },
  {
    id: "ip",
    label: "IP",
    description: "Intellectual Property",
    color: "cyan",
  },
  {
    id: "credentials",
    label: "Credentials",
    description: "Passwords & Secrets",
    color: "rose",
  },
];

const scanTypes = [
  {
    id: "discovery",
    label: "Data Discovery",
    icon: Search,
    description: "Find and catalog all data assets",
  },
  {
    id: "classification",
    label: "Classification",
    icon: Layers,
    description: "Classify data by sensitivity",
  },
  {
    id: "privacy",
    label: "Privacy Scan",
    icon: Eye,
    description: "Detect privacy violations",
  },
  {
    id: "encryption",
    label: "Encryption Audit",
    icon: Lock,
    description: "Verify encryption status",
  },
  {
    id: "access",
    label: "Access Review",
    icon: Shield,
    description: "Analyze access permissions",
  },
  {
    id: "retention",
    label: "Retention Check",
    icon: HardDrive,
    description: "Review data retention policies",
  },
];

const privacyRegulations = [
  { id: "gdpr", label: "GDPR", region: "EU" },
  { id: "ccpa", label: "CCPA", region: "California" },
  { id: "hipaa", label: "HIPAA", region: "US Healthcare" },
  { id: "lgpd", label: "LGPD", region: "Brazil" },
  { id: "pdpa", label: "PDPA", region: "Singapore" },
  { id: "pipeda", label: "PIPEDA", region: "Canada" },
  { id: "appi", label: "APPI", region: "Japan" },
  { id: "dpa", label: "DPA", region: "UK" },
];

const classificationLevels = [
  {
    id: "all",
    label: "All Levels",
    description: "Scan for all classification levels",
  },
  {
    id: "restricted",
    label: "Restricted Only",
    description: "Focus on highly restricted data",
  },
  {
    id: "confidential",
    label: "Confidential+",
    description: "Confidential and above",
  },
  { id: "internal", label: "Internal+", description: "Internal and above" },
];

const DataGuardianForm: React.FC<DataGuardianFormProps> = ({
  onSubmit,
  isScanning,
}) => {
  const [config, setConfig] = useState<DataGuardianConfig>({
    scanName: "",
    dataSources: [],
    dataCategories: ["pii"],
    scanTypes: ["discovery", "classification"],
    classificationLevel: "all",
    privacyRegulations: ["gdpr"],
    sensitivePatterns: [],
    encryptionCheck: true,
    accessAudit: true,
    retentionAnalysis: false,
    crossBorderCheck: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newPattern, setNewPattern] = useState("");
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [newSource, setNewSource] = useState<Partial<DataSource>>({
    type: "database",
    name: "",
  });

  const toggleCategory = (categoryId: string) => {
    setConfig((prev) => ({
      ...prev,
      dataCategories: prev.dataCategories.includes(categoryId)
        ? prev.dataCategories.filter((c) => c !== categoryId)
        : [...prev.dataCategories, categoryId],
    }));
  };

  const toggleScanType = (typeId: string) => {
    setConfig((prev) => ({
      ...prev,
      scanTypes: prev.scanTypes.includes(typeId)
        ? prev.scanTypes.filter((t) => t !== typeId)
        : [...prev.scanTypes, typeId],
    }));
  };

  const toggleRegulation = (regId: string) => {
    setConfig((prev) => ({
      ...prev,
      privacyRegulations: prev.privacyRegulations.includes(regId)
        ? prev.privacyRegulations.filter((r) => r !== regId)
        : [...prev.privacyRegulations, regId],
    }));
  };

  const addPattern = () => {
    if (newPattern.trim()) {
      setConfig((prev) => ({
        ...prev,
        sensitivePatterns: [...prev.sensitivePatterns, newPattern.trim()],
      }));
      setNewPattern("");
    }
  };

  const removePattern = (pattern: string) => {
    setConfig((prev) => ({
      ...prev,
      sensitivePatterns: prev.sensitivePatterns.filter((p) => p !== pattern),
    }));
  };

  const addDataSource = () => {
    if (newSource.name) {
      const source: DataSource = {
        id: `source-${Date.now()}`,
        type: newSource.type as DataSource["type"],
        name: newSource.name,
        connection: newSource.connection,
      };
      setConfig((prev) => ({
        ...prev,
        dataSources: [...prev.dataSources, source],
      }));
      setNewSource({ type: "database", name: "" });
      setShowSourceModal(false);
    }
  };

  const removeDataSource = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      dataSources: prev.dataSources.filter((s) => s.id !== id),
    }));
  };

  const getSourceIcon = (type: DataSource["type"]) => {
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
        return Server;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="shield-container">
          <Shield className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-green-100">DataGuardian</h2>
          <p className="text-sm text-green-400/70">
            Data Privacy & Protection Scanner
          </p>
        </div>
      </div>

      {/* Scan Name */}
      <div>
        <label className="block text-sm font-medium text-green-300 mb-2">
          Scan Name
        </label>
        <input
          type="text"
          value={config.scanName}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, scanName: e.target.value }))
          }
          placeholder="e.g., Q4 Privacy Audit, Production DB Scan..."
          className="guardian-input w-full"
        />
      </div>

      {/* Data Sources */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-green-300">
            Data Sources
          </label>
          <button
            type="button"
            onClick={() => setShowSourceModal(true)}
            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Source
          </button>
        </div>

        {config.dataSources.length === 0 ? (
          <div
            onClick={() => setShowSourceModal(true)}
            className="border-2 border-dashed border-green-800/50 rounded-lg p-6 text-center cursor-pointer
                       hover:border-green-600/50 transition-colors"
          >
            <Database className="w-8 h-8 text-green-600/50 mx-auto mb-2" />
            <p className="text-sm text-green-500/70">
              Click to add data sources
            </p>
            <p className="text-xs text-green-600/50 mt-1">
              Databases, Cloud Storage, Files, APIs
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {config.dataSources.map((source) => {
              const Icon = getSourceIcon(source.type);
              return (
                <div
                  key={source.id}
                  className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-800/30"
                >
                  <div className={`source-icon ${source.type}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-200 truncate">
                      {source.name}
                    </p>
                    {source.connection && (
                      <p className="text-xs text-green-500/70 truncate">
                        {source.connection}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-green-500 capitalize">
                    {source.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDataSource(source.id)}
                    className="p-1 text-green-600 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Categories */}
      <div>
        <label className="block text-sm font-medium text-green-300 mb-3">
          Data Categories to Detect
        </label>
        <div className="flex flex-wrap gap-2">
          {dataCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`privacy-badge ${category.id} ${
                config.dataCategories.includes(category.id) ? "active" : ""
              }`}
              title={category.description}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scan Types */}
      <div>
        <label className="block text-sm font-medium text-green-300 mb-3">
          Scan Types
        </label>
        <div className="grid grid-cols-2 gap-2">
          {scanTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = config.scanTypes.includes(type.id);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleScanType(type.id)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "bg-green-900/40 border-green-500/50 text-green-200"
                    : "bg-green-950/30 border-green-800/30 text-green-400/70 hover:border-green-700/50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? "text-green-400" : "text-green-600"
                  }`}
                />
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy Regulations */}
      <div>
        <label className="block text-sm font-medium text-green-300 mb-3">
          Privacy Regulations
        </label>
        <div className="flex flex-wrap gap-2">
          {privacyRegulations.map((reg) => (
            <button
              key={reg.id}
              type="button"
              onClick={() => toggleRegulation(reg.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                config.privacyRegulations.includes(reg.id)
                  ? "bg-green-600 text-white border-green-500"
                  : "bg-green-950/30 text-green-400/70 border-green-800/30 hover:border-green-700/50"
              }`}
            >
              {reg.label}
              <span className="ml-1 opacity-60">({reg.region})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Classification Level */}
      <div>
        <label className="block text-sm font-medium text-green-300 mb-2">
          Classification Focus
        </label>
        <select
          value={config.classificationLevel}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              classificationLevel: e.target.value,
            }))
          }
          className="guardian-input w-full"
        >
          {classificationLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Options */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg border border-green-800/30 cursor-pointer hover:border-green-700/50 transition-all">
          <input
            type="checkbox"
            checked={config.encryptionCheck}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                encryptionCheck: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-green-500"
          />
          <Lock className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-300">Encryption Audit</span>
        </label>
        <label className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg border border-green-800/30 cursor-pointer hover:border-green-700/50 transition-all">
          <input
            type="checkbox"
            checked={config.accessAudit}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, accessAudit: e.target.checked }))
            }
            className="w-4 h-4 accent-green-500"
          />
          <Eye className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-300">Access Audit</span>
        </label>
        <label className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg border border-green-800/30 cursor-pointer hover:border-green-700/50 transition-all">
          <input
            type="checkbox"
            checked={config.retentionAnalysis}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                retentionAnalysis: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-green-500"
          />
          <HardDrive className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-300">Retention Analysis</span>
        </label>
        <label className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg border border-green-800/30 cursor-pointer hover:border-green-700/50 transition-all">
          <input
            type="checkbox"
            checked={config.crossBorderCheck}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                crossBorderCheck: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-green-500"
          />
          <Network className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-300">Cross-Border Check</span>
        </label>
      </div>

      {/* Advanced Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
        >
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-green-950/30 rounded-lg border border-green-800/30 space-y-4">
            {/* Custom Patterns */}
            <div>
              <label className="block text-sm font-medium text-green-300 mb-2">
                Custom Sensitive Patterns (Regex)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  placeholder="e.g., ACME-\d{6}, PROJECT-[A-Z]{3}..."
                  className="guardian-input flex-1 text-sm"
                />
                <button
                  type="button"
                  onClick={addPattern}
                  className="px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {config.sensitivePatterns.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {config.sensitivePatterns.map((pattern, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/50 rounded text-xs text-green-300"
                    >
                      <code>{pattern}</code>
                      <button
                        type="button"
                        onClick={() => removePattern(pattern)}
                        className="text-green-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isScanning || config.dataSources.length === 0}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 
                    flex items-center justify-center gap-3 ${
                      isScanning || config.dataSources.length === 0
                        ? "bg-green-800/30 text-green-500/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/50 hover:shadow-green-800/50"
                    }`}
      >
        {isScanning ? (
          <>
            <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
            Scanning Data Sources...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Start Privacy Scan
          </>
        )}
      </button>

      {config.dataSources.length === 0 && (
        <p className="text-center text-xs text-yellow-500/70 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Add at least one data source to start scanning
        </p>
      )}

      {/* Add Source Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-green-950 border border-green-800/50 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-100">
                Add Data Source
              </h3>
              <button
                onClick={() => setShowSourceModal(false)}
                className="text-green-500 hover:text-green-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  Source Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: "database", icon: Database, label: "Database" },
                    { type: "cloud", icon: Cloud, label: "Cloud" },
                    { type: "file", icon: Folder, label: "Files" },
                    { type: "api", icon: Globe, label: "API" },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setNewSource((prev) => ({
                          ...prev,
                          type: type as DataSource["type"],
                        }))
                      }
                      className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                        newSource.type === type
                          ? "bg-green-700 border-green-500 text-white"
                          : "bg-green-900/30 border-green-800/50 text-green-400 hover:border-green-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  Source Name
                </label>
                <input
                  type="text"
                  value={newSource.name || ""}
                  onChange={(e) =>
                    setNewSource((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Production MySQL, AWS S3 Bucket..."
                  className="guardian-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  Connection String (Optional)
                </label>
                <input
                  type="text"
                  value={newSource.connection || ""}
                  onChange={(e) =>
                    setNewSource((prev) => ({
                      ...prev,
                      connection: e.target.value,
                    }))
                  }
                  placeholder="e.g., mysql://host:3306/db, s3://bucket-name..."
                  className="guardian-input w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSourceModal(false)}
                  className="flex-1 py-2 border border-green-700 text-green-300 rounded-lg hover:bg-green-900/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addDataSource}
                  disabled={!newSource.name}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Add Source
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default DataGuardianForm;
