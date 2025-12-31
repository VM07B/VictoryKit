import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TOOL_NAME, TOOL_DESCRIPTION, FEATURES } from "../constants";
import { DataAsset, DSAR, ComplianceStatus, DataBreach } from "../types";

export default function PrivacyShieldDashboard() {
  const [assets, setAssets] = useState<DataAsset[]>([]);
  const [dsars, setDsars] = useState<DSAR[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus[]>([]);
  const [breaches, setBreaches] = useState<DataBreach[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setAssets([
      {
        id: "asset-001",
        name: "Customer Database",
        type: "PostgreSQL",
        classification: "confidential",
        piiCategories: ["name", "email", "phone", "address"],
        location: "US-East",
        owner: "Sales Team",
        retentionPeriod: 730,
        legalBasis: "Contract",
        lastScanned: new Date().toISOString(),
      },
      {
        id: "asset-002",
        name: "HR Records",
        type: "MongoDB",
        classification: "restricted",
        piiCategories: ["name", "ssn", "salary", "health"],
        location: "EU-West",
        owner: "HR Department",
        retentionPeriod: 2555,
        legalBasis: "Legal Obligation",
        lastScanned: new Date().toISOString(),
      },
      {
        id: "asset-003",
        name: "Marketing Lists",
        type: "CSV Files",
        classification: "internal",
        piiCategories: ["email", "name"],
        location: "Cloud Storage",
        owner: "Marketing",
        retentionPeriod: 365,
        legalBasis: "Consent",
        lastScanned: new Date().toISOString(),
      },
    ]);

    setDsars([
      {
        id: "dsar-001",
        requestType: "access",
        subject: "John Doe",
        email: "john.doe@example.com",
        status: "in-progress",
        submittedDate: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Requested all personal data",
      },
      {
        id: "dsar-002",
        requestType: "deletion",
        subject: "Jane Smith",
        email: "jane.smith@example.com",
        status: "pending",
        submittedDate: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Right to be forgotten request",
      },
    ]);

    setCompliance([
      {
        regulation: "GDPR",
        status: "compliant",
        score: 92,
        lastAssessment: new Date().toISOString(),
        gaps: ["Cookie consent banner needs update"],
      },
      {
        regulation: "CCPA",
        status: "partial",
        score: 78,
        lastAssessment: new Date().toISOString(),
        gaps: ["Data sale opt-out missing", "Privacy notice incomplete"],
      },
    ]);

    setBreaches([]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "completed":
      case "granted":
        return "bg-green-500";
      case "partial":
      case "in-progress":
      case "pending":
        return "bg-yellow-500";
      case "non-compliant":
      case "rejected":
      case "withdrawn":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "public":
        return "bg-green-600";
      case "internal":
        return "bg-blue-600";
      case "confidential":
        return "bg-orange-600";
      case "restricted":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">{TOOL_NAME}</h1>
            <p className="text-gray-400 text-sm">{TOOL_DESCRIPTION}</p>
          </div>
          <Link
            to="/maula-ai"
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-500 hover:to-violet-500 transition-all flex items-center gap-2"
          >
            <span>🤖</span> Live Assistant
          </Link>
        </div>
      </header>

      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto flex gap-4 p-2">
          {["overview", "data-assets", "dsars", "compliance", "consent"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-700"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            )
          )}
        </div>
      </nav>

      <main className="container mx-auto p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-indigo-400">
                  {assets.length}
                </div>
                <div className="text-gray-400">Data Assets</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-yellow-400">
                  {dsars.filter((d) => d.status !== "completed").length}
                </div>
                <div className="text-gray-400">Open DSARs</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-green-400">
                  {compliance.filter((c) => c.status === "compliant").length}/
                  {compliance.length}
                </div>
                <div className="text-gray-400">Compliant</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-red-400">
                  {breaches.length}
                </div>
                <div className="text-gray-400">Active Breaches</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Platform Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FEATURES.map((feature) => (
                  <div
                    key={feature}
                    className="bg-gray-700/50 rounded-lg p-3 text-center text-sm"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">
                  Compliance Status
                </h2>
                {compliance.map((c) => (
                  <div key={c.regulation} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{c.regulation}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 ${
                          c.score >= 90
                            ? "bg-green-500"
                            : c.score >= 70
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {c.score}% compliant
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Recent DSARs</h2>
                {dsars.slice(0, 3).map((dsar) => (
                  <div
                    key={dsar.id}
                    className="flex items-center gap-3 mb-3 last:mb-0 p-3 bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{dsar.subject}</div>
                      <div className="text-sm text-gray-400 capitalize">
                        {dsar.requestType} request
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(
                        dsar.status
                      )}`}
                    >
                      {dsar.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "data-assets" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Data Assets</h2>
              <button className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500">
                + Scan for PII
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3">Asset</th>
                    <th className="text-left p-3">Classification</th>
                    <th className="text-left p-3">PII Categories</th>
                    <th className="text-left p-3">Legal Basis</th>
                    <th className="text-left p-3">Retention</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-t border-gray-700">
                      <td className="p-3">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-gray-400">
                          {asset.type}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getClassificationColor(
                            asset.classification
                          )}`}
                        >
                          {asset.classification}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {asset.piiCategories.slice(0, 3).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 bg-gray-700 rounded text-xs"
                            >
                              {cat}
                            </span>
                          ))}
                          {asset.piiCategories.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                              +{asset.piiCategories.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{asset.legalBasis}</td>
                      <td className="p-3 text-sm">
                        {asset.retentionPeriod} days
                      </td>
                      <td className="p-3">
                        <button className="px-3 py-1 bg-indigo-600 rounded text-sm hover:bg-indigo-500">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "dsars" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500">
                + New DSAR
              </button>
            </div>
            {dsars.map((dsar) => (
              <div
                key={dsar.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(
                        dsar.status
                      )}`}
                    >
                      {dsar.status}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-gray-700 rounded text-xs capitalize">
                      {dsar.requestType}
                    </span>
                    <h3 className="text-lg font-medium mt-2">{dsar.subject}</h3>
                    <p className="text-gray-400 text-sm">{dsar.email}</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div>
                      Due: {new Date(dsar.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-1 bg-indigo-600 rounded text-sm hover:bg-indigo-500">
                    Process
                  </button>
                  <button className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === "compliance" || activeTab === "consent") && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-4">🔒</div>
            <p>This section is available in the full application.</p>
            <Link
              to="/maula-ai"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500"
            >
              Ask AI Assistant
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
