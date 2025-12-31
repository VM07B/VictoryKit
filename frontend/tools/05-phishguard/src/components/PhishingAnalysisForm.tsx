import React, { useState } from "react";
import {
  Mail,
  Link,
  Globe,
  Shield,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Square,
  CheckCircle2,
  Anchor,
  Search,
  Eye,
} from "lucide-react";

export interface AnalysisFormData {
  type: "email" | "url" | "website";
  content: string;
  headers: string;
  url: string;
  checkLinks: boolean;
  checkAttachments: boolean;
  checkSender: boolean;
  checkDomain: boolean;
  deepAnalysis: boolean;
  checkReputation: boolean;
}

interface PhishingAnalysisFormProps {
  onAnalyze: (data: AnalysisFormData) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
}

const PhishingAnalysisForm: React.FC<PhishingAnalysisFormProps> = ({
  onAnalyze,
  onCancel,
  isAnalyzing,
}) => {
  const [analysisType, setAnalysisType] =
    useState<AnalysisFormData["type"]>("email");
  const [emailContent, setEmailContent] = useState("");
  const [emailHeaders, setEmailHeaders] = useState("");
  const [urlToCheck, setUrlToCheck] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [checkLinks, setCheckLinks] = useState(true);
  const [checkAttachments, setCheckAttachments] = useState(true);
  const [checkSender, setCheckSender] = useState(true);
  const [checkDomain, setCheckDomain] = useState(true);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [checkReputation, setCheckReputation] = useState(true);

  const handleSubmit = () => {
    onAnalyze({
      type: analysisType,
      content: emailContent,
      headers: emailHeaders,
      url: urlToCheck,
      checkLinks,
      checkAttachments,
      checkSender,
      checkDomain,
      deepAnalysis,
      checkReputation,
    });
  };

  const canSubmit =
    analysisType === "email"
      ? emailContent.trim().length > 0
      : urlToCheck.trim().length > 0;

  const sampleEmail = `From: support@paypa1-secure.com
To: user@example.com
Subject: Urgent: Your account has been compromised!

Dear Valued Customer,

We have detected suspicious activity on your account. 
Click here immediately to verify your identity: 
http://paypa1-secure.com/verify?user=12345

If you don't verify within 24 hours, your account will be suspended.

Best regards,
PayPal Security Team`;

  return (
    <div className="phish-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Anchor className="w-5 h-5 text-orange-400 hook-icon" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Phishing Analyzer</h3>
          <p className="text-xs text-gray-500">AI-Powered Detection Engine</p>
        </div>
      </div>

      {/* Analysis Type Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { id: "email", icon: Mail, label: "Email" },
          { id: "url", icon: Link, label: "URL" },
          { id: "website", icon: Globe, label: "Website" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setAnalysisType(tab.id as PhishConfig["analysisType"])
            }
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
              analysisType === tab.id
                ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                : "bg-slate-800/50 border-slate-700 text-gray-400 hover:border-orange-500/30"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Email Analysis */}
      {analysisType === "email" && (
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">
                Email Content
              </label>
              <button
                onClick={() => setEmailContent(sampleEmail)}
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste the suspicious email content here..."
              className="email-input h-48 p-4 resize-none font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Email Headers (Optional)
            </label>
            <textarea
              value={emailHeaders}
              onChange={(e) => setEmailHeaders(e.target.value)}
              placeholder="Paste email headers for deeper analysis..."
              className="email-input h-24 p-4 resize-none font-mono text-xs"
            />
          </div>
        </div>
      )}

      {/* URL Analysis */}
      {(analysisType === "url" || analysisType === "website") && (
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-400 mb-2 block">
            {analysisType === "url" ? "Suspicious URL" : "Website URL"}
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={urlToCheck}
              onChange={(e) => setUrlToCheck(e.target.value)}
              placeholder={
                analysisType === "url"
                  ? "https://suspicious-link.com/verify"
                  : "https://example.com"
              }
              className="email-input pl-12 pr-4 py-4 font-mono text-sm"
            />
          </div>
          {analysisType === "website" && (
            <p className="mt-2 text-xs text-gray-500">
              Full website scanning includes all pages, forms, and resources
            </p>
          )}
        </div>
      )}

      {/* Quick Options */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          {
            id: "links",
            label: "Check Links",
            value: checkLinks,
            setter: setCheckLinks,
            icon: Link,
          },
          {
            id: "sender",
            label: "Verify Sender",
            value: checkSender,
            setter: setCheckSender,
            icon: Mail,
          },
          {
            id: "domain",
            label: "Domain Check",
            value: checkDomain,
            setter: setCheckDomain,
            icon: Globe,
          },
          {
            id: "reputation",
            label: "Reputation",
            value: checkReputation,
            setter: setCheckReputation,
            icon: Shield,
          },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => opt.setter(!opt.value)}
            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
              opt.value
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                : "bg-slate-800/50 border-slate-700 text-gray-500"
            }`}
          >
            <opt.icon className="w-4 h-4" />
            <span className="text-sm">{opt.label}</span>
            {opt.value && <CheckCircle2 className="w-4 h-4 ml-auto" />}
          </button>
        ))}
      </div>

      {/* Advanced Options */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 mb-4 transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span>Advanced Options</span>
        {showAdvanced ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {showAdvanced && (
        <div className="space-y-3 mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          {[
            {
              id: "attachments",
              label: "Scan Attachments",
              desc: "Check for malicious files",
              value: checkAttachments,
              setter: setCheckAttachments,
            },
            {
              id: "deep",
              label: "Deep Analysis",
              desc: "Extended behavioral analysis",
              value: deepAnalysis,
              setter: setDeepAnalysis,
            },
          ].map((option) => (
            <label
              key={option.id}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-white">
                  {option.label}
                </span>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </div>
              <div
                onClick={() => option.setter(!option.value)}
                className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                  option.value ? "bg-orange-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                    option.value ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {isAnalyzing ? (
        <button
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 py-4 rounded-xl hover:bg-red-500/30 transition-all font-medium"
        >
          <Square className="w-5 h-5" />
          Stop Analysis
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all ${
            canSubmit
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25"
              : "bg-slate-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Zap className="w-5 h-5" />
          Analyze for Phishing
        </button>
      )}

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
          <Eye className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-gray-400">Visual similarity check</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
          <Search className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-gray-400">98.7% detection rate</span>
        </div>
      </div>
    </div>
  );
};

export default PhishingAnalysisForm;
