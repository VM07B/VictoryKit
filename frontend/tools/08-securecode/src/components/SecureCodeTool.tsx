import React, { useState, useCallback, useRef } from "react";
import {
  Code,
  Shield,
  Zap,
  FileCode,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCcw,
  Download,
  Share2,
} from "lucide-react";
import CodeAnalysisForm, { CodeAnalysisFormData } from "./CodeAnalysisForm";
import LiveCodePanel, {
  ScanStage,
  CodeIssue,
  LiveScanEvent,
} from "./LiveCodePanel";
import AnimatedSecurityResult, {
  SecurityMetrics,
  Vulnerability,
} from "./AnimatedSecurityResult";

const SecureCodeTool: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [stages, setStages] = useState<ScanStage[]>([]);
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [events, setEvents] = useState<LiveScanEvent[]>([]);
  const [filesScanned, setFilesScanned] = useState(0);
  const [dependenciesChecked, setDependenciesChecked] = useState(0);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const abortRef = useRef(false);

  const simulateAnalysis = useCallback(async (data: CodeAnalysisFormData) => {
    abortRef.current = false;
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setCode(data.code);
    setLanguage(data.language === "auto" ? "javascript" : data.language);
    setIssues([]);
    setEvents([]);
    setFilesScanned(0);
    setDependenciesChecked(0);
    setMetrics(null);

    const analysisStages: ScanStage[] = [
      { name: "Parsing", status: "pending" },
      { name: "SAST", status: "pending" },
      { name: "Secrets", status: "pending" },
      { name: "Dependencies", status: "pending" },
      { name: "Reporting", status: "pending" },
    ];
    setStages(analysisStages);

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Simulated vulnerabilities to detect
    const vulnerabilityPatterns = [
      {
        pattern: /SELECT.*\+.*req\.|query.*\+|sql.*=.*\+/gi,
        type: "SQL Injection",
        severity: "critical" as const,
        message: "User input directly concatenated in SQL query",
        suggestion: "Use parameterized queries or prepared statements",
      },
      {
        pattern: /res\.(send|write)\s*\([^)]*\+.*req\./gi,
        type: "Cross-Site Scripting (XSS)",
        severity: "high" as const,
        message: "Unsanitized user input rendered in response",
        suggestion: "Use template engine with auto-escaping or sanitize input",
      },
      {
        pattern: /(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*["'][^"']+["']/gi,
        type: "Hardcoded Secret",
        severity: "critical" as const,
        message: "Sensitive credentials hardcoded in source code",
        suggestion: "Use environment variables or a secrets manager",
      },
      {
        pattern: /password\s*=\s*["'][^"']+["']/gi,
        type: "Hardcoded Password",
        severity: "high" as const,
        message: "Password stored in plaintext in source code",
        suggestion: "Use environment variables and never commit secrets",
      },
      {
        pattern: /eval\s*\(/gi,
        type: "Code Injection",
        severity: "critical" as const,
        message: "Use of eval() can execute arbitrary code",
        suggestion: "Avoid eval(); use safer alternatives like JSON.parse()",
      },
      {
        pattern: /innerHTML\s*=/gi,
        type: "DOM XSS",
        severity: "high" as const,
        message: "Direct innerHTML assignment can lead to XSS",
        suggestion: "Use textContent or sanitize HTML before insertion",
      },
      {
        pattern: /createHash\s*\(\s*["']md5["']\)/gi,
        type: "Weak Cryptography",
        severity: "medium" as const,
        message: "MD5 is cryptographically broken",
        suggestion: "Use SHA-256 or stronger hashing algorithms",
      },
      {
        pattern: /http:\/\/(?!localhost)/gi,
        type: "Insecure Protocol",
        severity: "medium" as const,
        message: "Using HTTP instead of HTTPS",
        suggestion: "Always use HTTPS for external communications",
      },
    ];

    // Stage 1: Parsing
    const updateStage = (idx: number, status: ScanStage["status"]) => {
      setStages((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, status } : s))
      );
      setEvents((prev) => [
        ...prev,
        {
          type: "stage",
          stage: { ...analysisStages[idx], status },
          timestamp: Date.now(),
        },
      ]);
    };

    updateStage(0, "running");
    await delay(800);
    if (abortRef.current) return;

    // Simulate file scanning
    const files = ["main.js", "utils.js", "config.js", "auth.js", "api.js"];
    for (const file of files) {
      if (abortRef.current) return;
      await delay(150);
      setFilesScanned((prev) => prev + 1);
      setEvents((prev) => [
        ...prev,
        { type: "file", file, timestamp: Date.now() },
      ]);
    }

    updateStage(0, "complete");
    if (abortRef.current) return;

    // Stage 2: SAST
    updateStage(1, "running");
    await delay(600);

    const lines = data.code.split("\n");
    const detectedIssues: CodeIssue[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (abortRef.current) return;
      const line = lines[i];
      for (const vuln of vulnerabilityPatterns) {
        if (vuln.pattern.test(line)) {
          vuln.pattern.lastIndex = 0; // Reset regex
          const issue: CodeIssue = {
            id: `issue-${detectedIssues.length + 1}`,
            line: i + 1,
            column: 1,
            severity: vuln.severity,
            type: vuln.type,
            message: vuln.message,
            code: line.trim(),
            suggestion: vuln.suggestion,
          };
          detectedIssues.push(issue);
          setIssues((prev) => [...prev, issue]);
          setEvents((prev) => [
            ...prev,
            { type: "issue", issue, timestamp: Date.now() },
          ]);
          await delay(200);
        }
      }
    }

    updateStage(1, "complete");
    if (abortRef.current) return;

    // Stage 3: Secrets
    updateStage(2, "running");
    await delay(500);
    updateStage(2, "complete");
    if (abortRef.current) return;

    // Stage 4: Dependencies
    updateStage(3, "running");
    const deps = [
      {
        name: "lodash",
        version: "4.17.15",
        vulnerability: "Prototype Pollution",
      },
      { name: "express", version: "4.18.2" },
      { name: "axios", version: "0.21.1", vulnerability: "SSRF" },
      { name: "moment", version: "2.29.4" },
      { name: "jsonwebtoken", version: "8.5.1" },
    ];

    for (const dep of deps) {
      if (abortRef.current) return;
      await delay(200);
      setDependenciesChecked((prev) => prev + 1);
      setEvents((prev) => [
        ...prev,
        { type: "dependency", dependency: dep, timestamp: Date.now() },
      ]);
    }
    updateStage(3, "complete");
    if (abortRef.current) return;

    // Stage 5: Reporting
    updateStage(4, "running");
    await delay(400);

    // Calculate metrics
    const criticalCount = detectedIssues.filter(
      (i) => i.severity === "critical"
    ).length;
    const highCount = detectedIssues.filter(
      (i) => i.severity === "high"
    ).length;
    const mediumCount = detectedIssues.filter(
      (i) => i.severity === "medium"
    ).length;
    const lowCount = detectedIssues.filter((i) => i.severity === "low").length;

    let score =
      100 -
      criticalCount * 20 -
      highCount * 10 -
      mediumCount * 5 -
      lowCount * 2;
    score = Math.max(0, Math.min(100, score));

    const grade: SecurityMetrics["grade"] =
      score >= 90
        ? "A"
        : score >= 80
        ? "B"
        : score >= 70
        ? "C"
        : score >= 60
        ? "D"
        : "F";

    const vulnerabilities: Vulnerability[] = deps
      .filter((d) => d.vulnerability)
      .map((d, idx) => ({
        id: `vuln-${idx}`,
        package: d.name,
        version: d.version,
        severity: d.name === "lodash" ? ("high" as const) : ("medium" as const),
        cve: d.name === "lodash" ? "CVE-2021-23337" : "CVE-2021-3749",
        title: d.vulnerability!,
        fixVersion: d.name === "lodash" ? "4.17.21" : "0.21.4",
      }));

    const calculatedMetrics: SecurityMetrics = {
      score,
      grade,
      issues: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        info: 0,
      },
      categories: {
        injection: detectedIssues.filter((i) =>
          i.type.toLowerCase().includes("injection")
        ).length,
        xss: detectedIssues.filter((i) => i.type.toLowerCase().includes("xss"))
          .length,
        secrets: detectedIssues.filter(
          (i) =>
            i.type.toLowerCase().includes("secret") ||
            i.type.toLowerCase().includes("password")
        ).length,
        crypto: detectedIssues.filter((i) =>
          i.type.toLowerCase().includes("crypto")
        ).length,
        auth: 0,
        dependencies: vulnerabilities.length,
        other: 0,
      },
      vulnerabilities,
      scannedFiles: files.length,
      scannedLines: lines.length,
      analysisTime: 3.2,
    };

    setMetrics(calculatedMetrics);
    updateStage(4, "complete");
    setEvents((prev) => [...prev, { type: "complete", timestamp: Date.now() }]);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  }, []);

  const handleCancel = () => {
    abortRef.current = true;
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setCode("");
    setStages([]);
    setIssues([]);
    setEvents([]);
    setFilesScanned(0);
    setDependenciesChecked(0);
    setMetrics(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  SecureCode
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-green-500/20 text-green-400 rounded-full">
                    SAST
                  </span>
                </h1>
                <p className="text-sm text-gray-500">
                  Code Security Analysis Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {analysisComplete && (
                <>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 transition-all"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    New Scan
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 transition-all">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isAnalyzing ? "bg-green-500 animate-pulse" : "bg-gray-600"
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {isAnalyzing
                    ? "Analyzing..."
                    : analysisComplete
                    ? "Complete"
                    : "Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Column - Form */}
          <div className="col-span-3 overflow-auto">
            <CodeAnalysisForm
              onAnalyze={simulateAnalysis}
              onCancel={handleCancel}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Middle Column - Live Panel */}
          <div className="col-span-5">
            <LiveCodePanel
              code={
                code ||
                "// Paste code and start analysis to see live scanning..."
              }
              language={language}
              isAnalyzing={isAnalyzing}
              stages={stages}
              issues={issues}
              events={events}
              filesScanned={filesScanned}
              dependenciesChecked={dependenciesChecked}
            />
          </div>

          {/* Right Column - Results */}
          <div className="col-span-4 overflow-auto">
            {metrics ? (
              <AnimatedSecurityResult
                metrics={metrics}
                issues={issues}
                isVisible={analysisComplete}
              />
            ) : (
              <div className="code-card h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-green-500/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    Security Analysis
                  </h3>
                  <p className="text-sm text-gray-600 max-w-xs">
                    Start a code analysis to view security findings,
                    vulnerability reports, and recommendations.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {[
                      { icon: Shield, label: "SAST" },
                      { icon: Lock, label: "Secrets" },
                      { icon: AlertTriangle, label: "CVEs" },
                      { icon: FileCode, label: "Dependencies" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 rounded-full text-xs text-gray-500"
                      >
                        <item.icon className="w-3 h-3" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecureCodeTool;
