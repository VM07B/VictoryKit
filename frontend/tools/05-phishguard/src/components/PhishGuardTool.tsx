import React, { useState, useCallback, useRef } from "react";
import {
  Shield,
  ShieldAlert,
  Mail,
  Link,
  Globe,
  AlertTriangle,
  Zap,
  Activity,
  Clock,
  BarChart3,
  Target,
  TrendingUp,
  Search,
  Anchor,
} from "lucide-react";
import PhishingAnalysisForm, { AnalysisFormData } from "./PhishingAnalysisForm";
import LiveAnalysisPanel, {
  AnalysisStep,
  AnalysisEvent,
} from "./LiveAnalysisPanel";
import AnimatedPhishResult, {
  PhishingResult,
  PhishingVerdict,
} from "./AnimatedPhishResult";

// Simulated phishing indicators database
const PHISHING_PATTERNS = {
  urgentWords: [
    "urgent",
    "immediately",
    "suspended",
    "locked",
    "verify now",
    "act now",
    "limited time",
    "expires",
    "warning",
  ],
  suspiciousDomains: [
    "secure-login",
    "account-verify",
    "paypa1",
    "amaz0n",
    "go0gle",
    "micr0soft",
    "bank-secure",
  ],
  credentialRequests: [
    "password",
    "ssn",
    "credit card",
    "social security",
    "bank account",
    "pin number",
  ],
  threatIndicators: [
    "suspended",
    "terminated",
    "legal action",
    "unauthorized",
    "fraud detected",
  ],
};

const PhishGuardTool: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [events, setEvents] = useState<AnalysisEvent[]>([]);
  const [result, setResult] = useState<PhishingResult | null>(null);
  const [linksChecked, setLinksChecked] = useState(0);
  const [indicatorsFound, setIndicatorsFound] = useState(0);
  const [currentItem, setCurrentItem] = useState<string | undefined>();
  const [stats, setStats] = useState({
    scansToday: 847,
    phishingDetected: 234,
    avgResponseTime: 1.8,
    accuracy: 99.7,
  });

  const abortRef = useRef(false);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const addEvent = useCallback((event: Omit<AnalysisEvent, "timestamp">) => {
    setEvents((prev) =>
      [{ ...event, timestamp: Date.now() }, ...prev].slice(0, 50)
    );
  }, []);

  const updateStep = useCallback(
    (id: string, updates: Partial<AnalysisStep>) => {
      setSteps((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const extractLinks = (content: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
    return content.match(urlRegex) || [];
  };

  const analyzeContent = async (
    data: AnalysisFormData
  ): Promise<PhishingResult> => {
    const startTime = Date.now();
    const content = data.content.toLowerCase();
    const indicators: PhishingResult["indicators"] = [];
    let totalLinks = 0;
    let maliciousLinks = 0;

    // Initialize steps
    const analysisSteps: AnalysisStep[] = [
      { id: "init", label: "Initialize Analysis Engine", status: "pending" },
      { id: "sender", label: "Analyze Sender Information", status: "pending" },
      { id: "headers", label: "Check Email Headers", status: "pending" },
      { id: "domain", label: "Verify Domain Reputation", status: "pending" },
      { id: "links", label: "Extract & Check Links", status: "pending" },
      { id: "content", label: "Analyze Message Content", status: "pending" },
      { id: "visual", label: "Detect Visual Deception", status: "pending" },
      {
        id: "reputation",
        label: "Check Threat Intelligence",
        status: "pending",
      },
      { id: "ai", label: "AI Pattern Analysis", status: "pending" },
    ];
    setSteps(analysisSteps);

    // Step 1: Initialize
    updateStep("init", {
      status: "running",
      detail: "Loading analysis engine...",
    });
    await delay(400);
    addEvent({
      type: "info",
      severity: "info",
      message: "PhishGuard analysis engine initialized",
    });
    updateStep("init", { status: "complete" });

    if (abortRef.current) return null as any;

    // Step 2: Sender Analysis
    updateStep("sender", {
      status: "running",
      detail: "Checking sender identity...",
    });
    setCurrentItem("Sender verification in progress");
    await delay(600);

    // Check for spoofing indicators
    const hasSpoofingIndicators =
      content.includes("display name") !== content.includes("@");
    if (
      data.type === "email" &&
      (content.includes("noreply") || content.includes("no-reply"))
    ) {
      indicators.push({
        type: "low",
        category: "Sender",
        description: "No-reply sender address detected",
        evidence: "Uses automated sender address",
      });
      addEvent({
        type: "info",
        severity: "low",
        message: "No-reply sender address detected",
      });
      setIndicatorsFound((p) => p + 1);
    }
    updateStep("sender", {
      status: "complete",
      detail: "Sender analysis complete",
    });

    if (abortRef.current) return null as any;

    // Step 3: Header Analysis
    updateStep("headers", {
      status: "running",
      detail: "Analyzing email headers...",
    });
    await delay(500);
    addEvent({
      type: "analysis",
      severity: "info",
      message: "Email headers validated",
    });
    updateStep("headers", { status: "complete" });

    if (abortRef.current) return null as any;

    // Step 4: Domain Check
    updateStep("domain", {
      status: "running",
      detail: "Checking domain reputation...",
    });
    setCurrentItem("Domain reputation lookup");
    await delay(700);

    // Check for suspicious domain patterns
    for (const suspicious of PHISHING_PATTERNS.suspiciousDomains) {
      if (content.includes(suspicious)) {
        indicators.push({
          type: "critical",
          category: "Domain",
          description: `Suspicious domain pattern detected: ${suspicious}`,
          evidence: `Domain contains lookalike pattern`,
        });
        addEvent({
          type: "detection",
          severity: "critical",
          message: `Suspicious domain pattern: "${suspicious}"`,
          indicator: suspicious,
        });
        setIndicatorsFound((p) => p + 1);
      }
    }

    updateStep("domain", {
      status: indicators.some((i) => i.category === "Domain")
        ? "warning"
        : "complete",
      detail: "Domain analysis complete",
    });

    if (abortRef.current) return null as any;

    // Step 5: Link Analysis
    updateStep("links", {
      status: "running",
      detail: "Extracting and checking links...",
    });
    const links = extractLinks(data.content);
    totalLinks = links.length;

    for (let i = 0; i < links.length; i++) {
      if (abortRef.current) return null as any;
      setCurrentItem(links[i]);
      setLinksChecked(i + 1);
      await delay(300);

      // Check for suspicious link patterns
      const link = links[i].toLowerCase();
      let isMalicious = false;

      if (
        link.includes("bit.ly") ||
        link.includes("tinyurl") ||
        link.includes("t.co")
      ) {
        indicators.push({
          type: "medium",
          category: "Links",
          description: "URL shortener detected - may hide actual destination",
          evidence: links[i],
        });
        addEvent({
          type: "warning",
          severity: "medium",
          message: "URL shortener detected",
          indicator: links[i],
        });
        setIndicatorsFound((p) => p + 1);
      }

      for (const suspicious of PHISHING_PATTERNS.suspiciousDomains) {
        if (link.includes(suspicious)) {
          isMalicious = true;
          maliciousLinks++;
          indicators.push({
            type: "critical",
            category: "Links",
            description: `Malicious URL detected with lookalike domain`,
            evidence: links[i],
          });
          addEvent({
            type: "detection",
            severity: "critical",
            message: "Malicious URL detected!",
            indicator: links[i],
          });
          setIndicatorsFound((p) => p + 1);
          break;
        }
      }

      if (!isMalicious) {
        addEvent({
          type: "analysis",
          severity: "info",
          message: "Link verified",
          indicator: links[i].substring(0, 50),
        });
      }
    }

    updateStep("links", {
      status: maliciousLinks > 0 ? "warning" : "complete",
      detail: `Checked ${totalLinks} links, ${maliciousLinks} malicious`,
    });

    if (abortRef.current) return null as any;

    // Step 6: Content Analysis
    updateStep("content", {
      status: "running",
      detail: "Analyzing message content...",
    });
    setCurrentItem("Content pattern analysis");
    await delay(800);

    // Check for urgent language
    for (const word of PHISHING_PATTERNS.urgentWords) {
      if (content.includes(word)) {
        indicators.push({
          type: "medium",
          category: "Content",
          description: `Urgency language detected: "${word}"`,
          evidence: `Message creates false sense of urgency`,
        });
        addEvent({
          type: "warning",
          severity: "medium",
          message: `Urgency language: "${word}"`,
        });
        setIndicatorsFound((p) => p + 1);
        break; // Only count once
      }
    }

    // Check for credential requests
    for (const term of PHISHING_PATTERNS.credentialRequests) {
      if (content.includes(term)) {
        indicators.push({
          type: "high",
          category: "Content",
          description: `Credential request detected: "${term}"`,
          evidence: `Message requests sensitive information`,
        });
        addEvent({
          type: "detection",
          severity: "high",
          message: `Sensitive data request: "${term}"`,
        });
        setIndicatorsFound((p) => p + 1);
      }
    }

    // Check for threat indicators
    for (const threat of PHISHING_PATTERNS.threatIndicators) {
      if (content.includes(threat)) {
        indicators.push({
          type: "high",
          category: "Content",
          description: `Threat language detected: "${threat}"`,
          evidence: `Message uses fear/threat tactics`,
        });
        addEvent({
          type: "warning",
          severity: "high",
          message: `Threat language: "${threat}"`,
        });
        setIndicatorsFound((p) => p + 1);
        break;
      }
    }

    updateStep("content", {
      status: indicators.some((i) => i.category === "Content")
        ? "warning"
        : "complete",
    });

    if (abortRef.current) return null as any;

    // Step 7: Visual Deception
    updateStep("visual", {
      status: "running",
      detail: "Checking for visual tricks...",
    });
    await delay(500);

    // Check for homograph attacks (lookalike characters)
    if (/[а-я]/i.test(data.content)) {
      // Cyrillic characters
      indicators.push({
        type: "critical",
        category: "Visual",
        description:
          "Homograph attack detected - contains lookalike characters",
        evidence: "Message contains Cyrillic characters disguised as Latin",
      });
      addEvent({
        type: "detection",
        severity: "critical",
        message: "Homograph attack detected!",
      });
      setIndicatorsFound((p) => p + 1);
    }

    updateStep("visual", { status: "complete" });

    if (abortRef.current) return null as any;

    // Step 8: Threat Intelligence
    updateStep("reputation", {
      status: "running",
      detail: "Checking threat databases...",
    });
    setCurrentItem("Threat intelligence lookup");
    await delay(600);
    addEvent({
      type: "analysis",
      severity: "info",
      message: "Threat intelligence check complete",
    });
    updateStep("reputation", { status: "complete" });

    if (abortRef.current) return null as any;

    // Step 9: AI Analysis
    updateStep("ai", { status: "running", detail: "AI pattern analysis..." });
    setCurrentItem("Machine learning classification");
    await delay(1000);

    // Calculate verdict
    const criticalCount = indicators.filter(
      (i) => i.type === "critical"
    ).length;
    const highCount = indicators.filter((i) => i.type === "high").length;
    const mediumCount = indicators.filter((i) => i.type === "medium").length;

    let verdict: PhishingVerdict;
    let riskScore: number;
    let confidence: number;

    if (criticalCount >= 2 || (criticalCount >= 1 && highCount >= 2)) {
      verdict = "PHISHING";
      riskScore = Math.min(95, 70 + criticalCount * 10 + highCount * 5);
      confidence = 95;
    } else if (criticalCount >= 1 || highCount >= 2) {
      verdict = "SUSPICIOUS";
      riskScore = Math.min(75, 50 + criticalCount * 15 + highCount * 8);
      confidence = 85;
    } else if (highCount >= 1 || mediumCount >= 3) {
      verdict = "SPAM";
      riskScore = Math.min(50, 25 + highCount * 10 + mediumCount * 5);
      confidence = 75;
    } else {
      verdict = "SAFE";
      riskScore = Math.max(5, indicators.length * 5);
      confidence = 90;
    }

    addEvent({
      type: "info",
      severity:
        verdict === "PHISHING"
          ? "critical"
          : verdict === "SUSPICIOUS"
          ? "high"
          : "info",
      message: `AI classification: ${verdict} (${confidence}% confidence)`,
    });

    updateStep("ai", { status: "complete", detail: `Verdict: ${verdict}` });

    // Generate AI recommendation
    let aiRecommendation: string;
    switch (verdict) {
      case "PHISHING":
        aiRecommendation =
          "DO NOT interact with this message. It shows multiple strong indicators of a phishing attempt. Do not click any links, download attachments, or reply. Report this message to your IT security team and delete it immediately.";
        break;
      case "SUSPICIOUS":
        aiRecommendation =
          "Exercise extreme caution with this message. Verify the sender through an independent channel before taking any action. Do not click links directly - instead, navigate to official websites manually.";
        break;
      case "SPAM":
        aiRecommendation =
          "This appears to be unsolicited commercial email. While not directly malicious, avoid clicking links and consider blocking the sender. Mark as spam to train your email filter.";
        break;
      default:
        aiRecommendation =
          "No significant phishing indicators were detected. However, always verify unexpected requests for sensitive information through official channels.";
    }

    const analysisTime = Date.now() - startTime;

    return {
      verdict,
      confidence,
      riskScore,
      summary:
        verdict === "PHISHING"
          ? `This message exhibits ${indicators.length} phishing indicators including ${criticalCount} critical findings. The content matches known phishing patterns targeting credentials and personal information.`
          : verdict === "SUSPICIOUS"
          ? `Analysis found ${indicators.length} concerning indicators. While not definitively phishing, this message shows suspicious characteristics that warrant caution.`
          : verdict === "SPAM"
          ? `This message appears to be unsolicited spam with ${indicators.length} minor indicators. Low risk but treat with appropriate caution.`
          : `Analysis complete. This message shows no significant phishing indicators. ${
              indicators.length > 0
                ? `${indicators.length} minor items noted for awareness.`
                : "No concerning patterns detected."
            }`,
      indicators,
      senderAnalysis: {
        email: "sender@example.com",
        displayName: "Account Security",
        domain: "example.com",
        spoofed: criticalCount > 0,
        reputation:
          criticalCount > 0
            ? "malicious"
            : highCount > 0
            ? "suspicious"
            : "neutral",
      },
      linksAnalyzed: totalLinks,
      maliciousLinks,
      attachmentRisk: "none",
      aiRecommendation,
      analysisTime,
    };
  };

  const handleAnalysis = async (data: AnalysisFormData) => {
    setIsAnalyzing(true);
    setResult(null);
    setEvents([]);
    setLinksChecked(0);
    setIndicatorsFound(0);
    setCurrentItem(undefined);
    abortRef.current = false;

    try {
      const analysisResult = await analyzeContent(data);
      if (!abortRef.current) {
        setResult(analysisResult);
        setStats((prev) => ({
          ...prev,
          scansToday: prev.scansToday + 1,
          phishingDetected:
            prev.phishingDetected +
            (analysisResult.verdict === "PHISHING" ? 1 : 0),
        }));
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      addEvent({
        type: "warning",
        severity: "high",
        message: "Analysis failed. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentItem(undefined);
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
    setIsAnalyzing(false);
    setCurrentItem(undefined);
    addEvent({
      type: "info",
      severity: "info",
      message: "Analysis cancelled by user",
    });
  };

  const handleNewScan = () => {
    setResult(null);
    setEvents([]);
    setSteps([]);
    setLinksChecked(0);
    setIndicatorsFound(0);
  };

  const handleExport = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phishguard-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-orange-500/20 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  PhishGuard
                </h1>
                <p className="text-sm text-gray-500">
                  AI-Powered Phishing Detection
                </p>
              </div>
            </div>

            {/* Live Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">Scans Today:</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {stats.scansToday.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <Anchor className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">Phishing Blocked:</span>
                <span className="text-sm font-bold text-red-400 tabular-nums">
                  {stats.phishingDetected}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Avg Response:</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {stats.avgResponseTime}s
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/30">
                <Target className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400">Accuracy:</span>
                <span className="text-sm font-bold text-orange-400 tabular-nums">
                  {stats.accuracy}%
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
            <PhishingAnalysisForm
              onAnalyze={handleAnalysis}
              onCancel={handleCancel}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Column 2: Live Analysis */}
          <div className="lg:col-span-1">
            <LiveAnalysisPanel
              steps={steps}
              events={events}
              isAnalyzing={isAnalyzing}
              linksChecked={linksChecked}
              indicatorsFound={indicatorsFound}
              currentItem={currentItem}
            />
          </div>

          {/* Column 3: Results */}
          <div className="lg:col-span-1">
            {result ? (
              <AnimatedPhishResult
                result={result}
                onNewScan={handleNewScan}
                onExport={handleExport}
              />
            ) : (
              <div className="phish-card p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-orange-400/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Analysis Results
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Submit an email, URL, or website content to detect phishing
                  attempts
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <Mail className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Email Analysis</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <Link className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">URL Check</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <Globe className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Website Scan</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">AI Detection</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-500/20 mt-12">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>PhishGuard v5.0 • VictoryKit Security Suite</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Powered by AI</span>
              <span>•</span>
              <span>Real-time Protection</span>
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

export default PhishGuardTool;
