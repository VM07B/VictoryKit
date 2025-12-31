import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TOOL_NAME, TOOL_DESCRIPTION, FEATURES } from "../constants";
import { MobileApp, DeviceInfo } from "../types";

export default function MobileDefendDashboard() {
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setApps([
      {
        id: "app-001",
        name: "Banking App",
        packageName: "com.bank.mobile",
        platform: "android",
        version: "4.2.1",
        riskScore: 15,
        status: "safe",
        permissions: ["INTERNET", "CAMERA", "BIOMETRIC"],
        lastAnalyzed: new Date().toISOString(),
      },
      {
        id: "app-002",
        name: "Social Media",
        packageName: "com.social.app",
        platform: "ios",
        version: "12.0.3",
        riskScore: 45,
        status: "suspicious",
        permissions: [
          "CONTACTS",
          "LOCATION",
          "CAMERA",
          "MICROPHONE",
          "STORAGE",
        ],
        lastAnalyzed: new Date().toISOString(),
      },
      {
        id: "app-003",
        name: "Productivity Suite",
        packageName: "com.productivity.app",
        platform: "android",
        version: "2.1.0",
        riskScore: 25,
        status: "safe",
        permissions: ["INTERNET", "STORAGE"],
        lastAnalyzed: new Date().toISOString(),
      },
    ]);

    setDevices([
      {
        id: "dev-001",
        name: "iPhone 15 Pro",
        platform: "ios",
        osVersion: "17.2",
        model: "iPhone 15 Pro",
        isRooted: false,
        encryptionEnabled: true,
        passcodeSet: true,
        complianceStatus: "compliant",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "dev-002",
        name: "Pixel 8",
        platform: "android",
        osVersion: "14",
        model: "Pixel 8",
        isRooted: true,
        encryptionEnabled: true,
        passcodeSet: true,
        complianceStatus: "non-compliant",
        lastChecked: new Date().toISOString(),
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
      case "compliant":
        return "bg-green-500";
      case "suspicious":
      case "partial":
        return "bg-yellow-500";
      case "malicious":
      case "non-compliant":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-green-400";
    if (score <= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-purple-400">{TOOL_NAME}</h1>
            <p className="text-gray-400 text-sm">{TOOL_DESCRIPTION}</p>
          </div>
          <Link
            to="/maula-ai"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2"
          >
            <span>🤖</span> Live Assistant
          </Link>
        </div>
      </header>

      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto flex gap-4 p-2">
          {["overview", "apps", "devices", "analysis"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-purple-400">
                  {apps.length}
                </div>
                <div className="text-gray-400">Apps Monitored</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-blue-400">
                  {devices.length}
                </div>
                <div className="text-gray-400">Devices</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-green-400">
                  {apps.filter((a) => a.status === "safe").length}
                </div>
                <div className="text-gray-400">Safe Apps</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-yellow-400">
                  {apps.filter((a) => a.status === "suspicious").length}
                </div>
                <div className="text-gray-400">Suspicious</div>
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

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Quick Scan</h2>
              <div className="flex gap-4">
                <button className="flex-1 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors">
                  📱 Scan Apps
                </button>
                <button className="flex-1 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
                  📲 Check Devices
                </button>
                <button className="flex-1 px-6 py-3 bg-green-600 rounded-lg hover:bg-green-500 transition-colors">
                  📤 Upload APK/IPA
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "apps" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Mobile Applications</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3">App</th>
                    <th className="text-left p-3">Platform</th>
                    <th className="text-left p-3">Version</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Risk</th>
                    <th className="text-left p-3">Permissions</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => (
                    <tr key={app.id} className="border-t border-gray-700">
                      <td className="p-3">
                        <div className="font-medium">{app.name}</div>
                        <div className="text-sm text-gray-400">
                          {app.packageName}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            app.platform === "ios"
                              ? "bg-blue-600"
                              : "bg-green-600"
                          }`}
                        >
                          {app.platform.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">{app.version}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td
                        className={`p-3 font-bold ${getRiskColor(
                          app.riskScore
                        )}`}
                      >
                        {app.riskScore}
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-400">
                          {app.permissions.length} permissions
                        </div>
                      </td>
                      <td className="p-3">
                        <button className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-500">
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="grid gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{device.name}</h3>
                    <p className="text-gray-400">
                      {device.model} - {device.platform.toUpperCase()}{" "}
                      {device.osVersion}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      device.complianceStatus
                    )}`}
                  >
                    {device.complianceStatus}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div
                    className={`p-2 rounded ${
                      device.isRooted ? "bg-red-900/50" : "bg-green-900/50"
                    }`}
                  >
                    <div className="text-xs text-gray-400">Root/Jailbreak</div>
                    <div className="font-medium">
                      {device.isRooted ? "Detected" : "Clean"}
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded ${
                      device.encryptionEnabled
                        ? "bg-green-900/50"
                        : "bg-red-900/50"
                    }`}
                  >
                    <div className="text-xs text-gray-400">Encryption</div>
                    <div className="font-medium">
                      {device.encryptionEnabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded ${
                      device.passcodeSet ? "bg-green-900/50" : "bg-red-900/50"
                    }`}
                  >
                    <div className="text-xs text-gray-400">Passcode</div>
                    <div className="font-medium">
                      {device.passcodeSet ? "Set" : "Not Set"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-4">📊</div>
            <p>Analysis history and detailed reports available.</p>
            <Link
              to="/maula-ai"
              className="inline-block mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500"
            >
              Ask AI Assistant
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
