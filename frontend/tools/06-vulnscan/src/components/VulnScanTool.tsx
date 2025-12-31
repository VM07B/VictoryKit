import React, { useState, useCallback, useRef } from "react";
import {
  Shield,
  Search,
  Server,
  Bug,
  Activity,
  Clock,
  Target,
  Wifi,
  Globe,
} from "lucide-react";
import VulnScanForm, { ScanFormData } from "./VulnScanForm";
import LiveScanPanel, {
  ScanStep,
  ScanEvent,
  DiscoveredPort,
} from "./LiveScanPanel";
import AnimatedVulnResult, {
  ScanResult,
  RiskLevel,
  Vulnerability,
} from "./AnimatedVulnResult";

// Simulated vulnerability database
const VULN_DATABASE: Vulnerability[] = [
  {
    id: "CVE-2021-44228",
    severity: "critical",
    title: "Log4j Remote Code Execution",
    description:
      "Apache Log4j2 JNDI features allow remote code execution via crafted log messages.",
    cve: "CVE-2021-44228",
    cvss: 10.0,
    service: "Java",
    remediation: "Update Log4j to version 2.17.1 or later",
  },
  {
    id: "CVE-2023-22515",
    severity: "critical",
    title: "Confluence Authentication Bypass",
    description:
      "Broken access control vulnerability allowing unauthorized admin account creation.",
    cve: "CVE-2023-22515",
    cvss: 9.8,
    service: "Confluence",
    remediation:
      "Update Confluence to patched version or restrict network access",
  },
  {
    id: "CVE-2021-34473",
    severity: "high",
    title: "Microsoft Exchange ProxyShell",
    description: "Pre-authentication path confusion leads to ACL bypass.",
    cve: "CVE-2021-34473",
    cvss: 9.1,
    service: "Exchange",
    remediation: "Apply Microsoft security updates",
  },
  {
    id: "SSL-WEAK",
    severity: "medium",
    title: "Weak SSL/TLS Configuration",
    description:
      "Server supports deprecated TLS versions or weak cipher suites.",
    remediation: "Disable TLS 1.0/1.1 and weak ciphers, enable TLS 1.3",
  },
  {
    id: "HEADER-MISSING",
    severity: "low",
    title: "Missing Security Headers",
    description:
      "Security headers like X-Frame-Options, CSP, or HSTS are not configured.",
    remediation: "Configure proper security headers on web server",
  },
];

const COMMON_PORTS: Record<number, { service: string; version?: string }> = {
  21: { service: "FTP", version: "vsftpd 3.0.3" },
  22: { service: "SSH", version: "OpenSSH 8.4" },
  25: { service: "SMTP", version: "Postfix" },
  53: { service: "DNS", version: "BIND 9.16" },
  80: { service: "HTTP", version: "nginx 1.21" },
  110: { service: "POP3" },
  143: { service: "IMAP" },
  443: { service: "HTTPS", version: "nginx 1.21" },
  445: { service: "SMB", version: "Samba 4.14" },
  993: { service: "IMAPS" },
  995: { service: "POP3S" },
  1433: { service: "MSSQL", version: "2019" },
  3306: { service: "MySQL", version: "8.0.28" },
  3389: { service: "RDP" },
  5432: { service: "PostgreSQL", version: "14.2" },
  5900: { service: "VNC" },
  6379: { service: "Redis", version: "6.2.6" },
  8080: { service: "HTTP-Proxy", version: "Apache Tomcat 9.0" },
  8443: { service: "HTTPS-Alt", version: "Jetty 11.0" },
  27017: { service: "MongoDB", version: "5.0.6" },
};

const VulnScanTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [steps, setSteps] = useState<ScanStep[]>([]);
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [portsScanned, setPortsScanned] = useState(0);
  const [portsOpen, setPortsOpen] = useState(0);
  const [vulnsFound, setVulnsFound] = useState(0);
  const [discoveredPorts, setDiscoveredPorts] = useState<DiscoveredPort[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string | undefined>();
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    scansToday: 1284,
    vulnsDetected: 3847,
    avgScanTime: 12.4,
    hostsScanned: 847,
  });

  const abortRef = useRef(false);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const addEvent = useCallback((event: Omit<ScanEvent, "timestamp">) => {
    setEvents((prev) =>
      [{ ...event, timestamp: Date.now() }, ...prev].slice(0, 50)
    );
  }, []);

  const updateStep = useCallback((id: string, updates: Partial<ScanStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const parsePortRange = (range: string): number[] => {
    const ports: number[] = [];
    const parts = range.split(",");
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = start; i <= Math.min(end, start + 100); i++) {
          ports.push(i);
        }
      } else {
        ports.push(Number(part));
      }
    }
    return ports.slice(0, 100); // Limit for demo
  };

  const runScan = async (data: ScanFormData): Promise<ScanResult> => {
    const startTime = Date.now();
    const foundVulns: Vulnerability[] = [];
    const openPorts: DiscoveredPort[] = [];

    // Initialize steps
    const scanSteps: ScanStep[] = [
      { id: "init", label: "Initialize Scanner", status: "pending" },
      { id: "discovery", label: "Host Discovery", status: "pending" },
      { id: "ports", label: "Port Scanning", status: "pending" },
      { id: "services", label: "Service Detection", status: "pending" },
      { id: "os", label: "OS Fingerprinting", status: "pending" },
      { id: "vulns", label: "Vulnerability Detection", status: "pending" },
      { id: "ssl", label: "SSL/TLS Analysis", status: "pending" },
      { id: "cve", label: "CVE Matching", status: "pending" },
      { id: "report", label: "Generate Report", status: "pending" },
    ];
    setSteps(scanSteps);

    // Step 1: Initialize
    updateStep("init", {
      status: "running",
      detail: "Loading vulnerability database...",
    });
    setProgress(5);
    await delay(500);
    addEvent({
      type: "info",
      severity: "info",
      message: "VulnScan engine initialized",
    });
    addEvent({
      type: "info",
      severity: "info",
      message: `Loaded ${VULN_DATABASE.length} vulnerability signatures`,
    });
    updateStep("init", { status: "complete" });
    setProgress(10);

    if (abortRef.current) return null as any;

    // Step 2: Host Discovery
    updateStep("discovery", {
      status: "running",
      detail: "Checking host availability...",
    });
    setCurrentTarget(data.target);
    await delay(600);
    addEvent({
      type: "discovery",
      severity: "info",
      message: `Target ${data.target} is reachable`,
    });
    updateStep("discovery", { status: "complete", detail: "Host is up" });
    setProgress(20);

    if (abortRef.current) return null as any;

    // Step 3: Port Scanning
    updateStep("ports", { status: "running", detail: "Scanning ports..." });
    const ports = parsePortRange(data.portRange);
    const totalPorts = ports.length;

    for (let i = 0; i < totalPorts; i++) {
      if (abortRef.current) return null as any;
      const port = ports[i];
      setPortsScanned(i + 1);
      setProgress(20 + Math.floor((i / totalPorts) * 25));

      // Simulate random open ports
      if (COMMON_PORTS[port] || Math.random() < 0.05) {
        const portInfo = COMMON_PORTS[port] || { service: "unknown" };
        const discoveredPort: DiscoveredPort = {
          port,
          state: "open",
          service: portInfo.service,
          version: portInfo.version,
        };
        openPorts.push(discoveredPort);
        setDiscoveredPorts((prev) => [...prev, discoveredPort]);
        setPortsOpen((p) => p + 1);
        addEvent({
          type: "discovery",
          severity: "info",
          message: `Port ${port} open - ${portInfo.service}`,
          port,
          service: portInfo.service,
        });
      }

      if (i % 10 === 0) {
        await delay(50);
      }
    }

    updateStep("ports", {
      status: "complete",
      detail: `Found ${openPorts.length} open ports`,
    });
    setProgress(45);

    if (abortRef.current) return null as any;

    // Step 4: Service Detection
    updateStep("services", {
      status: "running",
      detail: "Identifying services...",
    });
    await delay(800);
    for (const port of openPorts) {
      addEvent({
        type: "info",
        severity: "info",
        message: `Detected ${port.service}${
          port.version ? ` ${port.version}` : ""
        } on port ${port.port}`,
        port: port.port,
        service: port.service,
      });
    }
    updateStep("services", {
      status: "complete",
      detail: `${openPorts.length} services identified`,
    });
    setProgress(55);

    if (abortRef.current) return null as any;

    // Step 5: OS Detection
    updateStep("os", { status: "running", detail: "Fingerprinting OS..." });
    await delay(600);
    const detectedOS =
      Math.random() > 0.5 ? "Linux 5.x (Ubuntu)" : "Windows Server 2019";
    addEvent({
      type: "info",
      severity: "info",
      message: `OS detected: ${detectedOS}`,
    });
    updateStep("os", { status: "complete", detail: detectedOS });
    setProgress(65);

    if (abortRef.current) return null as any;

    // Step 6: Vulnerability Detection
    updateStep("vulns", {
      status: "running",
      detail: "Scanning for vulnerabilities...",
    });
    await delay(1000);

    // Randomly assign vulnerabilities to open ports
    for (const port of openPorts) {
      if (abortRef.current) return null as any;

      // Check for service-specific vulnerabilities
      for (const vuln of VULN_DATABASE) {
        if (Math.random() < 0.15) {
          // 15% chance per vuln
          const assignedVuln = {
            ...vuln,
            port: port.port,
            service: port.service,
          };
          foundVulns.push(assignedVuln);
          setVulnsFound((p) => p + 1);

          // Update port with vuln count
          setDiscoveredPorts((prev) =>
            prev.map((p) =>
              p.port === port.port ? { ...p, vulns: (p.vulns || 0) + 1 } : p
            )
          );

          addEvent({
            type: "vuln",
            severity: vuln.severity,
            message: `${vuln.title}`,
            port: port.port,
            service: port.service,
          });
        }
      }
      await delay(100);
    }

    updateStep("vulns", {
      status: foundVulns.length > 0 ? "warning" : "complete",
      detail: `Found ${foundVulns.length} vulnerabilities`,
    });
    setProgress(80);

    if (abortRef.current) return null as any;

    // Step 7: SSL Analysis
    updateStep("ssl", { status: "running", detail: "Analyzing SSL/TLS..." });
    await delay(500);
    const hasHttps = openPorts.some((p) => p.port === 443 || p.port === 8443);
    let sslGrade = undefined;
    if (hasHttps) {
      sslGrade = Math.random() > 0.7 ? "A" : Math.random() > 0.4 ? "B" : "C";
      addEvent({
        type: "info",
        severity: sslGrade === "A" ? "info" : "medium",
        message: `SSL/TLS Grade: ${sslGrade}`,
      });
    }
    updateStep("ssl", {
      status: "complete",
      detail: hasHttps ? `Grade: ${sslGrade}` : "No SSL detected",
    });
    setProgress(90);

    if (abortRef.current) return null as any;

    // Step 8: CVE Matching
    updateStep("cve", {
      status: "running",
      detail: "Matching CVE database...",
    });
    await delay(700);
    const cveCount = foundVulns.filter((v) => v.cve).length;
    addEvent({
      type: "info",
      severity: "info",
      message: `Matched ${cveCount} CVEs from NVD`,
    });
    updateStep("cve", {
      status: "complete",
      detail: `${cveCount} CVEs matched`,
    });
    setProgress(95);

    if (abortRef.current) return null as any;

    // Step 9: Generate Report
    updateStep("report", { status: "running", detail: "Generating report..." });
    await delay(500);
    updateStep("report", { status: "complete" });
    setProgress(100);

    // Calculate risk level
    const criticalCount = foundVulns.filter(
      (v) => v.severity === "critical"
    ).length;
    const highCount = foundVulns.filter((v) => v.severity === "high").length;
    const mediumCount = foundVulns.filter(
      (v) => v.severity === "medium"
    ).length;

    let riskLevel: RiskLevel;
    let riskScore: number;

    if (criticalCount > 0) {
      riskLevel = "CRITICAL";
      riskScore = Math.min(100, 80 + criticalCount * 5);
    } else if (highCount >= 2) {
      riskLevel = "HIGH";
      riskScore = Math.min(79, 60 + highCount * 5);
    } else if (highCount >= 1 || mediumCount >= 3) {
      riskLevel = "MEDIUM";
      riskScore = Math.min(59, 40 + mediumCount * 5);
    } else if (foundVulns.length > 0) {
      riskLevel = "LOW";
      riskScore = Math.min(39, 20 + foundVulns.length * 3);
    } else {
      riskLevel = "SECURE";
      riskScore = Math.max(5, openPorts.length);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (criticalCount > 0) {
      recommendations.push("Immediately patch critical vulnerabilities");
    }
    if (highCount > 0) {
      recommendations.push(
        "Schedule patching for high-severity issues within 7 days"
      );
    }
    if (sslGrade && sslGrade !== "A") {
      recommendations.push("Upgrade SSL/TLS configuration for better security");
    }
    if (openPorts.length > 5) {
      recommendations.push("Review open ports and close unnecessary services");
    }
    recommendations.push("Implement regular vulnerability scanning schedule");
    recommendations.push("Enable intrusion detection/prevention systems");

    const scanDuration = Date.now() - startTime;

    return {
      riskLevel,
      riskScore,
      target: data.target,
      scanType: data.scanType,
      summary:
        riskLevel === "CRITICAL"
          ? `Critical security issues detected on ${data.target}. ${criticalCount} critical and ${highCount} high severity vulnerabilities require immediate attention.`
          : riskLevel === "HIGH"
          ? `Significant vulnerabilities found on ${data.target}. ${foundVulns.length} total issues discovered across ${openPorts.length} open ports.`
          : riskLevel === "MEDIUM"
          ? `Moderate security concerns on ${data.target}. ${foundVulns.length} vulnerabilities identified that should be addressed.`
          : riskLevel === "LOW"
          ? `Minor issues found on ${data.target}. Overall security posture is acceptable with ${foundVulns.length} low-risk findings.`
          : `No significant vulnerabilities detected on ${data.target}. ${openPorts.length} open ports found with good security configuration.`,
      portsScanned: totalPorts,
      portsOpen: openPorts.length,
      servicesDetected: openPorts.length,
      vulnerabilities: foundVulns,
      osDetected: detectedOS,
      sslGrade,
      headerScore: Math.floor(Math.random() * 40) + 60,
      recommendations,
      scanDuration,
    };
  };

  const handleScan = async (data: ScanFormData) => {
    setIsScanning(true);
    setResult(null);
    setEvents([]);
    setPortsScanned(0);
    setPortsOpen(0);
    setVulnsFound(0);
    setDiscoveredPorts([]);
    setProgress(0);
    setCurrentTarget(undefined);
    abortRef.current = false;

    try {
      const scanResult = await runScan(data);
      if (!abortRef.current) {
        setResult(scanResult);
        setStats((prev) => ({
          ...prev,
          scansToday: prev.scansToday + 1,
          vulnsDetected: prev.vulnsDetected + scanResult.vulnerabilities.length,
          hostsScanned: prev.hostsScanned + 1,
        }));
      }
    } catch (error) {
      console.error("Scan failed:", error);
      addEvent({
        type: "warning",
        severity: "high",
        message: "Scan failed. Please try again.",
      });
    } finally {
      setIsScanning(false);
      setCurrentTarget(undefined);
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
    setIsScanning(false);
    setCurrentTarget(undefined);
    addEvent({
      type: "info",
      severity: "info",
      message: "Scan cancelled by user",
    });
  };

  const handleNewScan = () => {
    setResult(null);
    setEvents([]);
    setSteps([]);
    setPortsScanned(0);
    setPortsOpen(0);
    setVulnsFound(0);
    setDiscoveredPorts([]);
    setProgress(0);
  };

  const handleExport = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vulnscan-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
                  VulnScan
                </h1>
                <p className="text-sm text-gray-500">Vulnerability Scanner</p>
              </div>
            </div>

            {/* Live Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">Scans Today:</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {stats.scansToday.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <Bug className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">Vulns Found:</span>
                <span className="text-sm font-bold text-red-400 tabular-nums">
                  {stats.vulnsDetected.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Avg Scan:</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {stats.avgScanTime}s
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/30">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Hosts:</span>
                <span className="text-sm font-bold text-purple-400 tabular-nums">
                  {stats.hostsScanned.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="lg:col-span-1">
            <VulnScanForm
              onScan={handleScan}
              onCancel={handleCancel}
              isScanning={isScanning}
            />
          </div>

          {/* Column 2: Live Scan */}
          <div className="lg:col-span-1">
            <LiveScanPanel
              steps={steps}
              events={events}
              isScanning={isScanning}
              portsScanned={portsScanned}
              portsOpen={portsOpen}
              vulnsFound={vulnsFound}
              discoveredPorts={discoveredPorts}
              currentTarget={currentTarget}
              progress={progress}
            />
          </div>

          {/* Column 3: Results */}
          <div className="lg:col-span-1">
            {result ? (
              <AnimatedVulnResult
                result={result}
                onNewScan={handleNewScan}
                onExport={handleExport}
              />
            ) : (
              <div className="vuln-card p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-purple-400/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Scan Results
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Configure and start a vulnerability scan to see detailed
                  security analysis
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <Wifi className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Port Scanning</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <Server className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Service Detection</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <Bug className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">CVE Matching</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <Globe className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">SSL Analysis</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-12">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>VulnScan v6.0 • VictoryKit Security Suite</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>CVE Database Synced</span>
              <span>•</span>
              <span>Real-time Scanning</span>
              <span>•</span>
              <span className="text-green-400 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VulnScanTool;
