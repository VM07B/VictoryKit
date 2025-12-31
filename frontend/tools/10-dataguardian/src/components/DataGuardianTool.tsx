import React, { useState, useCallback } from "react";
import DataGuardianForm, { DataGuardianConfig } from "./DataGuardianForm";
import LiveDataGuardianPanel from "./LiveDataGuardianPanel";
import AnimatedDataGuardianResult from "./AnimatedDataGuardianResult";

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

interface Recommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  regulations: string[];
}

interface ScanResult {
  scanId: string;
  scanName: string;
  completedAt: Date;
  duration: number;
  privacyScore: number;
  protectionLevel: "excellent" | "good" | "moderate" | "poor" | "critical";
  totalRecords: number;
  totalFindings: number;
  findingsByType: { type: string; count: number; risk: string }[];
  findingsBySource: { source: string; sourceType: string; count: number }[];
  topRisks: DataFinding[];
  encryptionStatus: {
    encrypted: number;
    unencrypted: number;
    partial: number;
  };
  regulationCompliance: {
    regulation: string;
    status: "compliant" | "partial" | "non-compliant";
    issues: number;
  }[];
  recommendations: Recommendation[];
  dataMap: {
    category: string;
    locations: string[];
    totalCount: number;
  }[];
}

// Sample data templates
const piiCategories = [
  "Email",
  "Phone",
  "SSN",
  "Name",
  "Address",
  "DOB",
  "Driver License",
  "Passport",
];
const phiCategories = [
  "Medical Record",
  "Diagnosis",
  "Prescription",
  "Lab Result",
  "Insurance ID",
  "Health Plan",
];
const pciCategories = [
  "Credit Card",
  "CVV",
  "Expiration",
  "Cardholder",
  "Bank Account",
  "Routing Number",
];
const confidentialCategories = [
  "Trade Secret",
  "Financial Report",
  "Contract",
  "Strategy Doc",
  "Board Minutes",
];
const credentialCategories = [
  "Password",
  "API Key",
  "Access Token",
  "Private Key",
  "Secret",
  "Connection String",
];

const DataGuardianTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("");
  const [overallProgress, setOverallProgress] = useState(0);
  const [sourceProgress, setSourceProgress] = useState<SourceProgress[]>([]);
  const [findings, setFindings] = useState<DataFinding[]>([]);
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalFindings: 0,
    piiCount: 0,
    phiCount: 0,
    pciCount: 0,
    encryptedCount: 0,
    unencryptedCount: 0,
  });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [config, setConfig] = useState<DataGuardianConfig | null>(null);

  const addEvent = useCallback(
    (type: ScanEvent["type"], message: string, details?: string) => {
      const event: ScanEvent = {
        id: `event-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        type,
        message,
        details,
      };
      setEvents((prev) => [...prev, event]);
    },
    []
  );

  const addFinding = useCallback((finding: Omit<DataFinding, "id">) => {
    const newFinding: DataFinding = {
      ...finding,
      id: `finding-${Date.now()}-${Math.random()}`,
    };
    setFindings((prev) => [...prev, newFinding]);

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalFindings: prev.totalFindings + 1,
      piiCount: finding.type === "pii" ? prev.piiCount + 1 : prev.piiCount,
      phiCount: finding.type === "phi" ? prev.phiCount + 1 : prev.phiCount,
      pciCount: finding.type === "pci" ? prev.pciCount + 1 : prev.pciCount,
      encryptedCount: finding.encrypted
        ? prev.encryptedCount + 1
        : prev.encryptedCount,
      unencryptedCount: !finding.encrypted
        ? prev.unencryptedCount + 1
        : prev.unencryptedCount,
    }));

    return newFinding;
  }, []);

  const generateMaskedSample = (type: string, category: string): string => {
    switch (category.toLowerCase()) {
      case "email":
        return "j***@e***.com";
      case "phone":
        return "(***) ***-1234";
      case "ssn":
        return "***-**-6789";
      case "credit card":
        return "**** **** **** 4321";
      case "name":
        return "J*** D**";
      case "address":
        return "*** M*** St, ***";
      case "password":
        return "********";
      case "api key":
        return "sk-***...***xyz";
      default:
        return "***REDACTED***";
    }
  };

  const runScan = useCallback(
    async (scanConfig: DataGuardianConfig) => {
      setConfig(scanConfig);
      setIsScanning(true);
      setScanComplete(false);
      setFindings([]);
      setEvents([]);
      setOverallProgress(0);
      setStats({
        totalRecords: 0,
        totalFindings: 0,
        piiCount: 0,
        phiCount: 0,
        pciCount: 0,
        encryptedCount: 0,
        unencryptedCount: 0,
      });

      const startTime = Date.now();

      // Initialize source progress
      const initialProgress: SourceProgress[] = scanConfig.dataSources.map(
        (source) => ({
          sourceId: source.id,
          sourceName: source.name,
          sourceType: source.type,
          status: "pending",
          progress: 0,
          findingsCount: 0,
        })
      );
      setSourceProgress(initialProgress);

      addEvent(
        "info",
        "Privacy scan initiated",
        `Scanning ${scanConfig.dataSources.length} data sources`
      );
      setCurrentPhase("Initializing scan...");

      await new Promise((r) => setTimeout(r, 500));

      // Scan each source
      for (let i = 0; i < scanConfig.dataSources.length; i++) {
        const source = scanConfig.dataSources[i];
        setCurrentPhase(`Scanning ${source.name}...`);

        // Update source status to scanning
        setSourceProgress((prev) =>
          prev.map((sp) =>
            sp.sourceId === source.id
              ? { ...sp, status: "scanning" as const }
              : sp
          )
        );

        addEvent(
          "info",
          `Connecting to ${source.name}`,
          `Type: ${source.type}`
        );
        await new Promise((r) => setTimeout(r, 400));

        // Simulate scanning progress
        const totalRecords = Math.floor(Math.random() * 50000) + 10000;
        const tableCount = Math.floor(Math.random() * 20) + 5;

        for (
          let progress = 0;
          progress <= 100;
          progress += Math.floor(Math.random() * 15) + 5
        ) {
          await new Promise((r) => setTimeout(r, 200));

          const currentProgress = Math.min(progress, 100);
          setSourceProgress((prev) =>
            prev.map((sp) =>
              sp.sourceId === source.id
                ? {
                    ...sp,
                    progress: currentProgress,
                    recordsScanned: Math.floor(
                      (currentProgress / 100) * totalRecords
                    ),
                    totalTables: tableCount,
                    tablesScanned: Math.floor(
                      (currentProgress / 100) * tableCount
                    ),
                  }
                : sp
            )
          );

          // Calculate overall progress
          const totalProgress =
            ((i + currentProgress / 100) / scanConfig.dataSources.length) * 100;
          setOverallProgress(totalProgress);

          // Update total records
          setStats((prev) => ({
            ...prev,
            totalRecords: prev.totalRecords + Math.floor(Math.random() * 500),
          }));

          // Random chance to find sensitive data
          if (Math.random() > 0.6) {
            const typeRoll = Math.random();
            let type: DataFinding["type"];
            let categories: string[];

            if (typeRoll < 0.35 && scanConfig.dataCategories.includes("pii")) {
              type = "pii";
              categories = piiCategories;
            } else if (
              typeRoll < 0.5 &&
              scanConfig.dataCategories.includes("phi")
            ) {
              type = "phi";
              categories = phiCategories;
            } else if (
              typeRoll < 0.65 &&
              scanConfig.dataCategories.includes("pci")
            ) {
              type = "pci";
              categories = pciCategories;
            } else if (
              typeRoll < 0.8 &&
              scanConfig.dataCategories.includes("confidential")
            ) {
              type = "confidential";
              categories = confidentialCategories;
            } else if (scanConfig.dataCategories.includes("credentials")) {
              type = "credentials";
              categories = credentialCategories;
            } else {
              continue;
            }

            const category =
              categories[Math.floor(Math.random() * categories.length)];
            const location =
              source.type === "database"
                ? `${source.name}/table_${Math.floor(
                    Math.random() * 20
                  )}/column_${category.toLowerCase().replace(" ", "_")}`
                : source.type === "cloud"
                ? `${source.name}/bucket/path/file_${Math.floor(
                    Math.random() * 100
                  )}.csv`
                : `${source.name}/documents/file_${Math.floor(
                    Math.random() * 50
                  )}.${
                    ["xlsx", "csv", "json", "xml"][
                      Math.floor(Math.random() * 4)
                    ]
                  }`;

            const risks: DataFinding["risk"][] = [
              "critical",
              "high",
              "medium",
              "low",
            ];
            const riskWeights =
              type === "pii" || type === "phi" || type === "pci"
                ? [0.2, 0.4, 0.3, 0.1]
                : [0.1, 0.2, 0.4, 0.3];

            const riskRoll = Math.random();
            let risk: DataFinding["risk"] = "low";
            let cumulative = 0;
            for (let r = 0; r < risks.length; r++) {
              cumulative += riskWeights[r];
              if (riskRoll < cumulative) {
                risk = risks[r];
                break;
              }
            }

            const encrypted = Math.random() > 0.4;
            const count = Math.floor(Math.random() * 500) + 10;

            addFinding({
              type,
              category,
              location,
              source: source.name,
              count,
              risk,
              encrypted,
              samples: [generateMaskedSample(type, category)],
            });

            setSourceProgress((prev) =>
              prev.map((sp) =>
                sp.sourceId === source.id
                  ? { ...sp, findingsCount: sp.findingsCount + 1 }
                  : sp
              )
            );

            addEvent(
              "finding",
              `Found ${category} data`,
              `${count} records in ${location}`
            );
          }
        }

        // Complete this source
        setSourceProgress((prev) =>
          prev.map((sp) =>
            sp.sourceId === source.id
              ? { ...sp, status: "completed" as const, progress: 100 }
              : sp
          )
        );
        addEvent(
          "complete",
          `Completed scanning ${source.name}`,
          `${totalRecords.toLocaleString()} records processed`
        );
      }

      setCurrentPhase("Analyzing results...");
      await new Promise((r) => setTimeout(r, 800));

      setCurrentPhase("Generating recommendations...");
      await new Promise((r) => setTimeout(r, 600));

      // Generate final result
      const endTime = Date.now();
      const allFindings = [...findings];

      const findingsByType = scanConfig.dataCategories
        .map((type) => ({
          type,
          count: allFindings.filter((f) => f.type === type).length,
          risk: "mixed",
        }))
        .filter((f) => f.count > 0);

      const findingsBySource = scanConfig.dataSources.map((source) => ({
        source: source.name,
        sourceType: source.type,
        count: allFindings.filter((f) => f.source === source.name).length,
      }));

      const totalFindings = allFindings.length;
      const criticalCount = allFindings.filter(
        (f) => f.risk === "critical"
      ).length;
      const highCount = allFindings.filter((f) => f.risk === "high").length;
      const unencryptedSensitive = allFindings.filter(
        (f) =>
          !f.encrypted &&
          (f.type === "pii" || f.type === "phi" || f.type === "pci")
      ).length;

      // Calculate privacy score
      let privacyScore = 100;
      privacyScore -= criticalCount * 8;
      privacyScore -= highCount * 4;
      privacyScore -= unencryptedSensitive * 3;
      privacyScore = Math.max(0, Math.min(100, privacyScore));

      const protectionLevel: ScanResult["protectionLevel"] =
        privacyScore >= 90
          ? "excellent"
          : privacyScore >= 75
          ? "good"
          : privacyScore >= 60
          ? "moderate"
          : privacyScore >= 40
          ? "poor"
          : "critical";

      const recommendations: Recommendation[] = [];

      if (unencryptedSensitive > 0) {
        recommendations.push({
          id: "rec-1",
          priority: "critical",
          category: "Encryption",
          title: "Encrypt sensitive data at rest",
          description: `${unencryptedSensitive} sensitive data fields are stored without encryption. Implement AES-256 encryption.`,
          impact: "High security improvement",
          effort: "medium",
          regulations: ["GDPR", "HIPAA", "PCI-DSS"],
        });
      }

      if (allFindings.some((f) => f.type === "pii")) {
        recommendations.push({
          id: "rec-2",
          priority: "high",
          category: "Data Minimization",
          title: "Review PII data collection",
          description:
            "Audit collected PII to ensure only necessary data is retained.",
          impact: "Reduced compliance risk",
          effort: "low",
          regulations: ["GDPR", "CCPA"],
        });
      }

      if (allFindings.some((f) => f.type === "credentials")) {
        recommendations.push({
          id: "rec-3",
          priority: "critical",
          category: "Secrets Management",
          title: "Move credentials to secure vault",
          description:
            "Detected hardcoded credentials. Migrate to HashiCorp Vault or AWS Secrets Manager.",
          impact: "Critical security fix",
          effort: "medium",
          regulations: [],
        });
      }

      recommendations.push({
        id: "rec-4",
        priority: "medium",
        category: "Access Control",
        title: "Implement data access logging",
        description:
          "Enable comprehensive audit logging for all sensitive data access.",
        impact: "Improved visibility",
        effort: "low",
        regulations: ["SOC 2", "HIPAA"],
      });

      const regulationCompliance = scanConfig.privacyRegulations.map((reg) => {
        const regFindings = allFindings.filter(
          (f) =>
            (reg === "gdpr" && f.type === "pii") ||
            (reg === "hipaa" && f.type === "phi") ||
            (reg === "pci-dss" && f.type === "pci")
        );

        const unencryptedCount = regFindings.filter((f) => !f.encrypted).length;

        return {
          regulation: reg.toUpperCase(),
          status:
            unencryptedCount === 0 && regFindings.length < 5
              ? ("compliant" as const)
              : unencryptedCount < 3
              ? ("partial" as const)
              : ("non-compliant" as const),
          issues: unencryptedCount + Math.floor(regFindings.length / 3),
        };
      });

      const dataMap = [...new Set(allFindings.map((f) => f.category))].map(
        (cat) => ({
          category: cat,
          locations: [
            ...new Set(
              allFindings
                .filter((f) => f.category === cat)
                .map((f) => f.location)
            ),
          ],
          totalCount: allFindings
            .filter((f) => f.category === cat)
            .reduce((sum, f) => sum + f.count, 0),
        })
      );

      const finalResult: ScanResult = {
        scanId: `scan-${Date.now()}`,
        scanName: scanConfig.scanName || "Privacy Scan",
        completedAt: new Date(),
        duration: endTime - startTime,
        privacyScore,
        protectionLevel,
        totalRecords: stats.totalRecords,
        totalFindings,
        findingsByType,
        findingsBySource,
        topRisks: allFindings
          .sort((a, b) => {
            const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return riskOrder[a.risk] - riskOrder[b.risk];
          })
          .slice(0, 10),
        encryptionStatus: {
          encrypted: stats.encryptedCount,
          unencrypted: stats.unencryptedCount,
          partial: Math.floor(Math.random() * 5),
        },
        regulationCompliance,
        recommendations,
        dataMap,
      };

      setResult(finalResult);
      setIsScanning(false);
      setScanComplete(true);
      setCurrentPhase("Scan complete");
      addEvent(
        "complete",
        "Privacy scan completed",
        `Found ${totalFindings} sensitive data locations`
      );
    },
    [addEvent, addFinding, findings, stats]
  );

  const handleReset = useCallback(() => {
    setScanComplete(false);
    setResult(null);
    setFindings([]);
    setEvents([]);
    setSourceProgress([]);
    setOverallProgress(0);
    setCurrentPhase("");
    setStats({
      totalRecords: 0,
      totalFindings: 0,
      piiCount: 0,
      phiCount: 0,
      pciCount: 0,
      encryptedCount: 0,
      unencryptedCount: 0,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-100 mb-2">
            🛡️ DataGuardian
          </h1>
          <p className="text-green-400/70">
            AI-Powered Data Privacy & Protection Scanner
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <div className="bg-green-950/50 backdrop-blur-sm rounded-2xl border border-green-800/30 p-6">
              <DataGuardianForm onSubmit={runScan} isScanning={isScanning} />
            </div>
          </div>

          {/* Middle Column - Live Panel */}
          <div className="lg:col-span-1">
            <LiveDataGuardianPanel
              isScanning={isScanning}
              currentPhase={currentPhase}
              overallProgress={overallProgress}
              sourceProgress={sourceProgress}
              findings={findings}
              events={events}
              stats={stats}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1">
            {scanComplete && result ? (
              <AnimatedDataGuardianResult
                result={result}
                onReset={handleReset}
              />
            ) : (
              <div className="bg-green-950/30 rounded-2xl border border-green-800/30 p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="shield-container mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-900/30 flex items-center justify-center">
                    <span className="text-4xl">🛡️</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-green-200 mb-2">
                  Privacy Analysis Results
                </h3>
                <p className="text-green-500/70 max-w-xs">
                  Configure your data sources and start a scan to discover and
                  protect sensitive data across your organization.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                  <div className="p-3 bg-green-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">6</p>
                    <p className="text-xs text-green-500">Data Types</p>
                  </div>
                  <div className="p-3 bg-green-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">8</p>
                    <p className="text-xs text-green-500">Regulations</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-green-600 text-sm">
          Part of VictoryKit Security Suite • DataGuardian v1.0
        </footer>
      </div>
    </div>
  );
};

export default DataGuardianTool;
