import React, { useState } from "react";
import {
  Code,
  Play,
  Square,
  FileCode,
  FolderGit2,
  Globe,
  ChevronDown,
  ChevronUp,
  Upload,
  Link,
  GitBranch,
  Package,
  Shield,
  Bug,
  AlertTriangle,
  Lock,
  Zap,
} from "lucide-react";

export interface CodeAnalysisFormData {
  sourceType: "paste" | "url" | "repo";
  code: string;
  url: string;
  repoUrl: string;
  branch: string;
  language: string;
  analysisType: "sast" | "dast" | "sca" | "full";
  options: {
    checkInjection: boolean;
    checkXss: boolean;
    checkCrypto: boolean;
    checkSecrets: boolean;
    checkDependencies: boolean;
    checkHardcodedCreds: boolean;
    checkInsecureDeserialization: boolean;
    checkPathTraversal: boolean;
    checkAuthentication: boolean;
    checkAuthorization: boolean;
  };
  severity: "all" | "critical" | "high" | "medium";
}

interface CodeAnalysisFormProps {
  onAnalyze: (data: CodeAnalysisFormData) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
}

const CodeAnalysisForm: React.FC<CodeAnalysisFormProps> = ({
  onAnalyze,
  onCancel,
  isAnalyzing,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<CodeAnalysisFormData>({
    sourceType: "paste",
    code: "",
    url: "",
    repoUrl: "",
    branch: "main",
    language: "auto",
    analysisType: "full",
    options: {
      checkInjection: true,
      checkXss: true,
      checkCrypto: true,
      checkSecrets: true,
      checkDependencies: true,
      checkHardcodedCreds: true,
      checkInsecureDeserialization: true,
      checkPathTraversal: true,
      checkAuthentication: true,
      checkAuthorization: true,
    },
    severity: "all",
  });

  const sourceTypes = [
    { value: "paste", label: "Paste Code", icon: FileCode },
    { value: "url", label: "File URL", icon: Globe },
    { value: "repo", label: "Repository", icon: FolderGit2 },
  ];

  const languages = [
    { value: "auto", label: "Auto-detect" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "sql", label: "SQL" },
  ];

  const analysisTypes = [
    { value: "sast", label: "SAST", desc: "Static Analysis" },
    { value: "sca", label: "SCA", desc: "Dependency Scan" },
    { value: "dast", label: "DAST", desc: "Dynamic Analysis" },
    { value: "full", label: "Full", desc: "Complete Scan" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasInput =
      (formData.sourceType === "paste" && formData.code.trim()) ||
      (formData.sourceType === "url" && formData.url.trim()) ||
      (formData.sourceType === "repo" && formData.repoUrl.trim());
    if (!hasInput) return;
    onAnalyze(formData);
  };

  const updateOptions = (
    key: keyof typeof formData.options,
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      options: { ...prev.options, [key]: value },
    }));
  };

  const sampleCode = `// Example: SQL Injection vulnerability
const userId = req.query.id;
const query = "SELECT * FROM users WHERE id = " + userId;
db.query(query);

// Example: Hardcoded credentials
const API_KEY = "sk-1234567890abcdef";
const password = "admin123";

// Example: XSS vulnerability
res.send("<h1>Hello " + req.params.name + "</h1>");`;

  return (
    <form onSubmit={handleSubmit} className="code-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Code className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Code Analysis</h2>
          <p className="text-sm text-gray-500">
            Scan for security vulnerabilities
          </p>
        </div>
      </div>

      {/* Source Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Source Type</label>
        <div className="grid grid-cols-3 gap-2">
          {sourceTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                setFormData((p) => ({ ...p, sourceType: type.value as any }))
              }
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                formData.sourceType === type.value
                  ? "bg-green-500/20 border-green-500/50 text-white"
                  : "bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600"
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Input */}
      {formData.sourceType === "paste" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Code</label>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, code: sampleCode }))}
              className="text-xs text-green-400 hover:text-green-300"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={formData.code}
            onChange={(e) =>
              setFormData((p) => ({ ...p, code: e.target.value }))
            }
            placeholder="Paste your code here..."
            rows={10}
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 font-mono text-xs resize-none"
          />
        </div>
      )}

      {formData.sourceType === "url" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">File URL</label>
          <div className="relative">
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((p) => ({ ...p, url: e.target.value }))
              }
              placeholder="https://example.com/path/to/file.js"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 font-mono text-sm"
            />
            <Link className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          </div>
        </div>
      )}

      {formData.sourceType === "repo" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Repository URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.repoUrl}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, repoUrl: e.target.value }))
                }
                placeholder="https://github.com/owner/repo"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 font-mono text-sm"
              />
              <FolderGit2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Branch</label>
            <div className="relative">
              <input
                type="text"
                value={formData.branch}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, branch: e.target.value }))
                }
                placeholder="main"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 font-mono text-sm"
              />
              <GitBranch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Language */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Language</label>
        <select
          value={formData.language}
          onChange={(e) =>
            setFormData((p) => ({ ...p, language: e.target.value }))
          }
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500/50"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Analysis Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">
          Analysis Type
        </label>
        <div className="grid grid-cols-4 gap-2">
          {analysisTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                setFormData((p) => ({ ...p, analysisType: type.value as any }))
              }
              className={`p-3 rounded-lg border text-center transition-all ${
                formData.analysisType === type.value
                  ? "bg-green-500/20 border-green-500/50"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  formData.analysisType === type.value
                    ? "text-green-400"
                    : "text-gray-300"
                }`}
              >
                {type.label}
              </span>
              <p className="text-[10px] text-gray-500 mt-1">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-300 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Security Checks</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-2 p-4 bg-slate-800/30 rounded-lg">
            {[
              { key: "checkInjection", label: "SQL Injection", icon: Bug },
              { key: "checkXss", label: "XSS", icon: AlertTriangle },
              { key: "checkCrypto", label: "Weak Crypto", icon: Lock },
              { key: "checkSecrets", label: "Secrets/Keys", icon: Zap },
              {
                key: "checkDependencies",
                label: "Dependencies",
                icon: Package,
              },
              {
                key: "checkHardcodedCreds",
                label: "Hardcoded Creds",
                icon: Lock,
              },
              {
                key: "checkInsecureDeserialization",
                label: "Deserialization",
                icon: Bug,
              },
              {
                key: "checkPathTraversal",
                label: "Path Traversal",
                icon: AlertTriangle,
              },
              {
                key: "checkAuthentication",
                label: "Auth Issues",
                icon: Shield,
              },
              {
                key: "checkAuthorization",
                label: "Authz Issues",
                icon: Shield,
              },
            ].map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  formData.options[opt.key as keyof typeof formData.options]
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-slate-800/30 border border-transparent hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    formData.options[opt.key as keyof typeof formData.options]
                  }
                  onChange={(e) =>
                    updateOptions(
                      opt.key as keyof typeof formData.options,
                      e.target.checked
                    )
                  }
                  className="sr-only"
                />
                <opt.icon
                  className={`w-3 h-3 ${
                    formData.options[opt.key as keyof typeof formData.options]
                      ? "text-green-400"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs ${
                    formData.options[opt.key as keyof typeof formData.options]
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Severity Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Minimum Severity
        </label>
        <div className="flex gap-2">
          {[
            { value: "all", label: "All", color: "bg-gray-500" },
            { value: "medium", label: "Medium+", color: "bg-yellow-500" },
            { value: "high", label: "High+", color: "bg-orange-500" },
            { value: "critical", label: "Critical", color: "bg-red-500" },
          ].map((sev) => (
            <button
              key={sev.value}
              type="button"
              onClick={() =>
                setFormData((p) => ({ ...p, severity: sev.value as any }))
              }
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-all ${
                formData.severity === sev.value
                  ? "bg-slate-800 border-green-500/50"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${sev.color}`} />
              <span
                className={`text-xs ${
                  formData.severity === sev.value
                    ? "text-white"
                    : "text-gray-400"
                }`}
              >
                {sev.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isAnalyzing}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${
            isAnalyzing
              ? "bg-green-500/50 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25"
          } text-white`}
        >
          {isAnalyzing ? (
            <>
              <Code className="w-5 h-5 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Analyze Code
            </>
          )}
        </button>
        {isAnalyzing && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700 transition-all"
          >
            <Square className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
};

export default CodeAnalysisForm;
