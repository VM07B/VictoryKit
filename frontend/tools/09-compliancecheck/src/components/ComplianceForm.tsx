import React, { useState } from "react";
import {
  ClipboardCheck,
  Play,
  Square,
  Building2,
  Globe,
  Server,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  Lock,
  Users,
  Database,
  Cloud,
  HardDrive,
  Network,
} from "lucide-react";

export interface ComplianceFormData {
  organizationName: string;
  industry: string;
  frameworks: string[];
  scope: {
    dataTypes: string[];
    systems: string[];
    regions: string[];
  };
  assessmentType: "full" | "gap" | "readiness" | "audit";
  options: {
    includeEvidence: boolean;
    generateReport: boolean;
    riskAssessment: boolean;
    remediationPlan: boolean;
  };
}

interface ComplianceFormProps {
  onAssess: (data: ComplianceFormData) => void;
  onCancel: () => void;
  isAssessing: boolean;
}

const ComplianceForm: React.FC<ComplianceFormProps> = ({
  onAssess,
  onCancel,
  isAssessing,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<ComplianceFormData>({
    organizationName: "",
    industry: "technology",
    frameworks: ["gdpr"],
    scope: {
      dataTypes: ["pii", "financial"],
      systems: ["cloud", "onprem"],
      regions: ["eu", "us"],
    },
    assessmentType: "full",
    options: {
      includeEvidence: true,
      generateReport: true,
      riskAssessment: true,
      remediationPlan: true,
    },
  });

  const frameworks = [
    {
      id: "gdpr",
      name: "GDPR",
      desc: "EU Data Protection",
      color: "bg-blue-500",
    },
    {
      id: "hipaa",
      name: "HIPAA",
      desc: "Healthcare Privacy",
      color: "bg-pink-500",
    },
    {
      id: "pci",
      name: "PCI DSS",
      desc: "Payment Card",
      color: "bg-yellow-500",
    },
    {
      id: "sox",
      name: "SOX",
      desc: "Financial Reporting",
      color: "bg-green-500",
    },
    {
      id: "iso27001",
      name: "ISO 27001",
      desc: "Info Security",
      color: "bg-purple-500",
    },
    {
      id: "nist",
      name: "NIST CSF",
      desc: "Cybersecurity",
      color: "bg-orange-500",
    },
    { id: "soc2", name: "SOC 2", desc: "Trust Services", color: "bg-cyan-500" },
    { id: "ccpa", name: "CCPA", desc: "CA Privacy", color: "bg-rose-500" },
  ];

  const industries = [
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Financial Services" },
    { value: "retail", label: "Retail & E-commerce" },
    { value: "government", label: "Government" },
    { value: "education", label: "Education" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "other", label: "Other" },
  ];

  const dataTypes = [
    { id: "pii", label: "PII", icon: Users },
    { id: "financial", label: "Financial", icon: Database },
    { id: "health", label: "Health (PHI)", icon: Shield },
    { id: "payment", label: "Payment Cards", icon: Lock },
  ];

  const systems = [
    { id: "cloud", label: "Cloud Services", icon: Cloud },
    { id: "onprem", label: "On-Premises", icon: Server },
    { id: "hybrid", label: "Hybrid", icon: Network },
    { id: "endpoints", label: "Endpoints", icon: HardDrive },
  ];

  const regions = [
    { id: "eu", label: "EU/EEA" },
    { id: "us", label: "United States" },
    { id: "uk", label: "United Kingdom" },
    { id: "apac", label: "Asia Pacific" },
    { id: "global", label: "Global" },
  ];

  const assessmentTypes = [
    {
      value: "full",
      label: "Full Assessment",
      desc: "Complete compliance check",
    },
    { value: "gap", label: "Gap Analysis", desc: "Identify compliance gaps" },
    {
      value: "readiness",
      label: "Readiness Check",
      desc: "Certification prep",
    },
    { value: "audit", label: "Audit Prep", desc: "Pre-audit assessment" },
  ];

  const toggleFramework = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      frameworks: prev.frameworks.includes(id)
        ? prev.frameworks.filter((f) => f !== id)
        : [...prev.frameworks, id],
    }));
  };

  const toggleScope = (category: keyof typeof formData.scope, id: string) => {
    setFormData((prev) => ({
      ...prev,
      scope: {
        ...prev.scope,
        [category]: prev.scope[category].includes(id)
          ? prev.scope[category].filter((i) => i !== id)
          : [...prev.scope[category], id],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.frameworks.length === 0) return;
    onAssess(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="compliance-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Compliance Assessment
          </h2>
          <p className="text-sm text-gray-500">
            Configure your compliance check
          </p>
        </div>
      </div>

      {/* Organization */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Organization Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.organizationName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, organizationName: e.target.value }))
            }
            placeholder="Enter organization name"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
          />
          <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Industry</label>
        <select
          value={formData.industry}
          onChange={(e) =>
            setFormData((p) => ({ ...p, industry: e.target.value }))
          }
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
        >
          {industries.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </select>
      </div>

      {/* Frameworks */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">
          Compliance Frameworks
        </label>
        <div className="grid grid-cols-2 gap-2">
          {frameworks.map((fw) => (
            <button
              key={fw.id}
              type="button"
              onClick={() => toggleFramework(fw.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                formData.frameworks.includes(fw.id)
                  ? "bg-indigo-500/20 border-indigo-500/50"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${fw.color}`} />
              <div>
                <span
                  className={`text-xs font-bold ${
                    formData.frameworks.includes(fw.id)
                      ? "text-white"
                      : "text-gray-300"
                  }`}
                >
                  {fw.name}
                </span>
                <p className="text-[10px] text-gray-500">{fw.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Assessment Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">
          Assessment Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {assessmentTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                setFormData((p) => ({
                  ...p,
                  assessmentType: type.value as any,
                }))
              }
              className={`p-3 rounded-lg border text-center transition-all ${
                formData.assessmentType === type.value
                  ? "bg-indigo-500/20 border-indigo-500/50"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  formData.assessmentType === type.value
                    ? "text-indigo-400"
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
            <Globe className="w-4 h-4" />
            <span>Scope & Options</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg">
            {/* Data Types */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">
                Data Types in Scope
              </label>
              <div className="flex flex-wrap gap-2">
                {dataTypes.map((dt) => (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => toggleScope("dataTypes", dt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      formData.scope.dataTypes.includes(dt.id)
                        ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                        : "bg-slate-800/50 border-slate-700 text-gray-400"
                    }`}
                  >
                    <dt.icon className="w-3 h-3" />
                    <span className="text-xs">{dt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Systems */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">
                Systems in Scope
              </label>
              <div className="flex flex-wrap gap-2">
                {systems.map((sys) => (
                  <button
                    key={sys.id}
                    type="button"
                    onClick={() => toggleScope("systems", sys.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      formData.scope.systems.includes(sys.id)
                        ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                        : "bg-slate-800/50 border-slate-700 text-gray-400"
                    }`}
                  >
                    <sys.icon className="w-3 h-3" />
                    <span className="text-xs">{sys.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">
                Geographic Regions
              </label>
              <div className="flex flex-wrap gap-2">
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => toggleScope("regions", reg.id)}
                    className={`px-3 py-1.5 rounded-lg border transition-all text-xs ${
                      formData.scope.regions.includes(reg.id)
                        ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                        : "bg-slate-800/50 border-slate-700 text-gray-400"
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Report Options */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">
                Report Options
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    key: "includeEvidence",
                    label: "Include Evidence",
                    icon: FileText,
                  },
                  {
                    key: "generateReport",
                    label: "Generate Report",
                    icon: FileText,
                  },
                  {
                    key: "riskAssessment",
                    label: "Risk Assessment",
                    icon: Shield,
                  },
                  {
                    key: "remediationPlan",
                    label: "Remediation Plan",
                    icon: ClipboardCheck,
                  },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      formData.options[opt.key as keyof typeof formData.options]
                        ? "bg-indigo-500/10 border border-indigo-500/30"
                        : "bg-slate-800/30 border border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.options[
                          opt.key as keyof typeof formData.options
                        ]
                      }
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          options: {
                            ...p.options,
                            [opt.key]: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only"
                    />
                    <opt.icon
                      className={`w-3 h-3 ${
                        formData.options[
                          opt.key as keyof typeof formData.options
                        ]
                          ? "text-indigo-400"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        formData.options[
                          opt.key as keyof typeof formData.options
                        ]
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isAssessing || formData.frameworks.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${
            isAssessing || formData.frameworks.length === 0
              ? "bg-indigo-500/50 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25"
          } text-white`}
        >
          {isAssessing ? (
            <>
              <ClipboardCheck className="w-5 h-5 animate-pulse" />
              Assessing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Assessment
            </>
          )}
        </button>
        {isAssessing && (
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

export default ComplianceForm;
