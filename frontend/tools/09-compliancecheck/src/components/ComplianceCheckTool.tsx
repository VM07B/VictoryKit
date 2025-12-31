import React, { useState, useCallback, useRef } from "react";
import {
  ClipboardCheck,
  Shield,
  FileText,
  RefreshCcw,
  Download,
  Building2,
  Lock,
  Users,
  Database,
  Server,
  Globe,
} from "lucide-react";
import ComplianceForm, { ComplianceFormData } from "./ComplianceForm";
import LiveCompliancePanel, {
  ControlCategory,
  ControlRequirement,
  AssessmentStage,
  LiveAssessmentEvent,
} from "./LiveCompliancePanel";
import AnimatedComplianceResult, {
  ComplianceMetrics,
} from "./AnimatedComplianceResult";

const ComplianceCheckTool: React.FC = () => {
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [stages, setStages] = useState<AssessmentStage[]>([]);
  const [categories, setCategories] = useState<ControlCategory[]>([]);
  const [events, setEvents] = useState<LiveAssessmentEvent[]>([]);
  const [currentControl, setCurrentControl] = useState<string | undefined>();
  const [totalControls, setTotalControls] = useState(0);
  const [checkedControls, setCheckedControls] = useState(0);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const abortRef = useRef(false);

  const controlTemplates: Record<
    string,
    {
      id: string;
      name: string;
      icon: React.ElementType;
      requirements: Omit<ControlRequirement, "status">[];
    }[]
  > = {
    gdpr: [
      {
        id: "data-protection",
        name: "Data Protection",
        icon: Shield,
        requirements: [
          {
            id: "gdpr-1",
            code: "Art. 5",
            name: "Lawfulness of Processing",
            description: "",
            evidence: "",
          },
          {
            id: "gdpr-2",
            code: "Art. 6",
            name: "Consent Management",
            description: "",
            evidence: "",
          },
          {
            id: "gdpr-3",
            code: "Art. 7",
            name: "Right to Erasure",
            description: "",
            evidence: "",
          },
          {
            id: "gdpr-4",
            code: "Art. 17",
            name: "Data Portability",
            description: "",
            evidence: "",
          },
        ],
      },
      {
        id: "security",
        name: "Security Measures",
        icon: Lock,
        requirements: [
          {
            id: "gdpr-5",
            code: "Art. 32",
            name: "Encryption at Rest",
            description: "",
            evidence: "",
          },
          {
            id: "gdpr-6",
            code: "Art. 32",
            name: "Encryption in Transit",
            description: "",
            evidence: "",
          },
          {
            id: "gdpr-7",
            code: "Art. 33",
            name: "Breach Notification",
            description: "",
            evidence: "",
          },
        ],
      },
      {
        id: "access",
        name: "Access Controls",
        icon: Users,
        requirements: [
          {
            id: "gdpr-8",
            code: "Art. 25",
            name: "Privacy by Design",
            description: "",
            evidence: "",
          },
          {
            id: "gdpr-9",
            code: "Art. 30",
            name: "Processing Records",
            description: "",
            evidence: "",
          },
        ],
      },
    ],
    hipaa: [
      {
        id: "privacy",
        name: "Privacy Rule",
        icon: Lock,
        requirements: [
          {
            id: "hipaa-1",
            code: "164.502",
            name: "Use and Disclosure",
            description: "",
            evidence: "",
          },
          {
            id: "hipaa-2",
            code: "164.508",
            name: "Authorization Requirements",
            description: "",
            evidence: "",
          },
          {
            id: "hipaa-3",
            code: "164.520",
            name: "Notice of Privacy",
            description: "",
            evidence: "",
          },
        ],
      },
      {
        id: "security-rule",
        name: "Security Rule",
        icon: Shield,
        requirements: [
          {
            id: "hipaa-4",
            code: "164.308",
            name: "Administrative Safeguards",
            description: "",
            evidence: "",
          },
          {
            id: "hipaa-5",
            code: "164.310",
            name: "Physical Safeguards",
            description: "",
            evidence: "",
          },
          {
            id: "hipaa-6",
            code: "164.312",
            name: "Technical Safeguards",
            description: "",
            evidence: "",
          },
        ],
      },
    ],
    pci: [
      {
        id: "network",
        name: "Network Security",
        icon: Globe,
        requirements: [
          {
            id: "pci-1",
            code: "Req 1",
            name: "Firewall Configuration",
            description: "",
            evidence: "",
          },
          {
            id: "pci-2",
            code: "Req 2",
            name: "Vendor Defaults",
            description: "",
            evidence: "",
          },
        ],
      },
      {
        id: "data",
        name: "Data Protection",
        icon: Database,
        requirements: [
          {
            id: "pci-3",
            code: "Req 3",
            name: "Stored Data Protection",
            description: "",
            evidence: "",
          },
          {
            id: "pci-4",
            code: "Req 4",
            name: "Transmission Encryption",
            description: "",
            evidence: "",
          },
        ],
      },
      {
        id: "access-control",
        name: "Access Control",
        icon: Users,
        requirements: [
          {
            id: "pci-5",
            code: "Req 7",
            name: "Restrict Access",
            description: "",
            evidence: "",
          },
          {
            id: "pci-6",
            code: "Req 8",
            name: "Unique IDs",
            description: "",
            evidence: "",
          },
        ],
      },
    ],
    iso27001: [
      {
        id: "policies",
        name: "Security Policies",
        icon: FileText,
        requirements: [
          {
            id: "iso-1",
            code: "A.5.1",
            name: "Information Security Policy",
            description: "",
            evidence: "",
          },
          {
            id: "iso-2",
            code: "A.5.2",
            name: "Policy Review",
            description: "",
            evidence: "",
          },
        ],
      },
      {
        id: "asset",
        name: "Asset Management",
        icon: Server,
        requirements: [
          {
            id: "iso-3",
            code: "A.8.1",
            name: "Asset Inventory",
            description: "",
            evidence: "",
          },
          {
            id: "iso-4",
            code: "A.8.2",
            name: "Asset Classification",
            description: "",
            evidence: "",
          },
        ],
      },
    ],
  };

  const simulateAssessment = useCallback(async (data: ComplianceFormData) => {
    abortRef.current = false;
    setIsAssessing(true);
    setAssessmentComplete(false);
    setFrameworks(data.frameworks);
    setEvents([]);
    setCheckedControls(0);
    setMetrics(null);

    const assessmentStages: AssessmentStage[] = [
      { name: "Initialize", status: "pending" },
      { name: "Collect Evidence", status: "pending" },
      { name: "Assess Controls", status: "pending" },
      { name: "Calculate Score", status: "pending" },
      { name: "Generate Report", status: "pending" },
    ];
    setStages(assessmentStages);

    // Build categories from selected frameworks
    const allCategories: ControlCategory[] = [];
    data.frameworks.forEach((fw) => {
      const templates = controlTemplates[fw] || controlTemplates.gdpr;
      templates.forEach((cat) => {
        allCategories.push({
          ...cat,
          requirements: cat.requirements.map((r) => ({
            ...r,
            status: "pending" as const,
          })),
          progress: 0,
        });
      });
    });
    setCategories(allCategories);

    const allReqs = allCategories.flatMap((c) => c.requirements);
    setTotalControls(allReqs.length);

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const updateStage = (idx: number, status: AssessmentStage["status"]) => {
      setStages((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, status } : s))
      );
      setEvents((prev) => [
        ...prev,
        {
          type: "stage",
          stage: { ...assessmentStages[idx], status },
          timestamp: Date.now(),
        },
      ]);
    };

    // Stage 1: Initialize
    updateStage(0, "running");
    await delay(600);
    if (abortRef.current) return;
    updateStage(0, "complete");

    // Stage 2: Collect Evidence
    updateStage(1, "running");
    await delay(800);
    if (abortRef.current) return;
    updateStage(1, "complete");

    // Stage 3: Assess Controls
    updateStage(2, "running");

    let checked = 0;
    const statusOptions: ControlRequirement["status"][] = [
      "compliant",
      "compliant",
      "compliant",
      "partial",
      "non-compliant",
      "compliant",
    ];

    for (const category of allCategories) {
      if (abortRef.current) return;

      for (const req of category.requirements) {
        if (abortRef.current) return;

        setCurrentControl(`${req.code} - ${req.name}`);

        // Set to checking
        setCategories((prev) =>
          prev.map((c) =>
            c.id === category.id
              ? {
                  ...c,
                  requirements: c.requirements.map((r) =>
                    r.id === req.id ? { ...r, status: "checking" as const } : r
                  ),
                }
              : c
          )
        );

        await delay(150 + Math.random() * 200);
        if (abortRef.current) return;

        // Determine status
        const newStatus =
          statusOptions[Math.floor(Math.random() * statusOptions.length)];

        // Update requirement status
        setCategories((prev) =>
          prev.map((c) => {
            if (c.id === category.id) {
              const updatedReqs = c.requirements.map((r) =>
                r.id === req.id ? { ...r, status: newStatus } : r
              );
              const completed = updatedReqs.filter(
                (r) => r.status !== "pending" && r.status !== "checking"
              ).length;
              return {
                ...c,
                requirements: updatedReqs,
                progress: Math.round((completed / updatedReqs.length) * 100),
              };
            }
            return c;
          })
        );

        checked++;
        setCheckedControls(checked);

        const updatedReq = { ...req, status: newStatus };
        setEvents((prev) => [
          ...prev,
          { type: "control", control: updatedReq, timestamp: Date.now() },
        ]);

        if (newStatus === "non-compliant") {
          setEvents((prev) => [
            ...prev,
            {
              type: "finding",
              finding: { severity: "high", message: `Gap found: ${req.name}` },
              timestamp: Date.now(),
            },
          ]);
        }
      }
    }

    setCurrentControl(undefined);
    updateStage(2, "complete");
    if (abortRef.current) return;

    // Stage 4: Calculate Score
    updateStage(3, "running");
    await delay(500);
    if (abortRef.current) return;

    // Calculate metrics
    const finalCategories = allCategories;
    let compliantCount = 0;
    let partialCount = 0;
    let nonCompliantCount = 0;

    finalCategories.forEach((c) => {
      c.requirements.forEach((r) => {
        if (r.status === "compliant") compliantCount++;
        else if (r.status === "partial") partialCount++;
        else if (r.status === "non-compliant") nonCompliantCount++;
      });
    });

    const total = allReqs.length;
    const score = Math.round(
      ((compliantCount + partialCount * 0.5) / total) * 100
    );

    updateStage(3, "complete");

    // Stage 5: Generate Report
    updateStage(4, "running");
    await delay(400);
    if (abortRef.current) return;

    const calculatedMetrics: ComplianceMetrics = {
      overallScore: score,
      status:
        score >= 90 ? "compliant" : score >= 70 ? "partial" : "non-compliant",
      frameworks: data.frameworks.map((fw) => ({
        id: fw,
        name: fw.toUpperCase(),
        score: Math.round(score + (Math.random() * 10 - 5)),
        status:
          score >= 85 ? "compliant" : score >= 60 ? "partial" : "non-compliant",
        controlsPassed: Math.round(compliantCount / data.frameworks.length),
        controlsFailed: Math.round(nonCompliantCount / data.frameworks.length),
        controlsPartial: Math.round(partialCount / data.frameworks.length),
        controlsNA: 0,
      })),
      summary: {
        totalControls: total,
        compliant: compliantCount,
        partial: partialCount,
        nonCompliant: nonCompliantCount,
        notApplicable: 0,
      },
      riskAreas: [
        {
          category: "Access Control",
          severity: "high",
          count: Math.floor(Math.random() * 3),
        },
        {
          category: "Data Protection",
          severity: "medium",
          count: Math.floor(Math.random() * 4),
        },
        {
          category: "Encryption",
          severity: "low",
          count: Math.floor(Math.random() * 2),
        },
        {
          category: "Audit Logging",
          severity: "medium",
          count: Math.floor(Math.random() * 3),
        },
      ].filter((r) => r.count > 0),
      remediationItems:
        nonCompliantCount > 0
          ? [
              {
                id: "rem-1",
                control: "Art. 32",
                issue: "Encryption not implemented for data at rest",
                recommendation:
                  "Implement AES-256 encryption for all stored PII",
                priority: "high" as const,
                effort: "medium" as const,
              },
              {
                id: "rem-2",
                control: "164.312",
                issue: "Missing access logging",
                recommendation:
                  "Enable comprehensive audit logging for all PHI access",
                priority: "medium" as const,
                effort: "low" as const,
              },
            ]
          : [],
      assessmentDate: new Date().toLocaleDateString(),
      nextAssessmentDue: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
    };

    setMetrics(calculatedMetrics);
    updateStage(4, "complete");
    setEvents((prev) => [...prev, { type: "complete", timestamp: Date.now() }]);
    setIsAssessing(false);
    setAssessmentComplete(true);
  }, []);

  const handleCancel = () => {
    abortRef.current = true;
    setIsAssessing(false);
  };

  const handleReset = () => {
    setIsAssessing(false);
    setAssessmentComplete(false);
    setFrameworks([]);
    setStages([]);
    setCategories([]);
    setEvents([]);
    setCurrentControl(undefined);
    setTotalControls(0);
    setCheckedControls(0);
    setMetrics(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950">
      {/* Header */}
      <header className="border-b border-indigo-900/30 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  ComplianceCheck
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-400 rounded-full">
                    GRC
                  </span>
                </h1>
                <p className="text-sm text-gray-500">
                  Regulatory Compliance Assessment
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {assessmentComplete && (
                <>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-700 transition-all"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    New Assessment
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
                    isAssessing ? "bg-indigo-500 animate-pulse" : "bg-gray-600"
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {isAssessing
                    ? "Assessing..."
                    : assessmentComplete
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
            <ComplianceForm
              onAssess={simulateAssessment}
              onCancel={handleCancel}
              isAssessing={isAssessing}
            />
          </div>

          {/* Middle Column - Live Panel */}
          <div className="col-span-5">
            <LiveCompliancePanel
              frameworks={frameworks}
              isAssessing={isAssessing}
              stages={stages}
              categories={categories}
              events={events}
              currentControl={currentControl}
              totalControls={totalControls}
              checkedControls={checkedControls}
            />
          </div>

          {/* Right Column - Results */}
          <div className="col-span-4 overflow-auto">
            {metrics ? (
              <AnimatedComplianceResult
                metrics={metrics}
                categories={categories}
                isVisible={assessmentComplete}
              />
            ) : (
              <div className="compliance-card h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-indigo-500/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    Compliance Report
                  </h3>
                  <p className="text-sm text-gray-600 max-w-xs">
                    Start an assessment to view compliance scores, gap analysis,
                    and remediation recommendations.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {["GDPR", "HIPAA", "PCI", "ISO 27001"].map((fw) => (
                      <span
                        key={fw}
                        className="px-2.5 py-1 bg-slate-800/50 rounded-full text-xs text-gray-500"
                      >
                        {fw}
                      </span>
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

export default ComplianceCheckTool;
