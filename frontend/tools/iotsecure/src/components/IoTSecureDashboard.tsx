import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TOOL_NAME, TOOL_DESCRIPTION, FEATURES } from "../constants";
import { IoTDevice, DeviceScan, ProtocolAlert } from "../types";

export default function IoTSecureDashboard() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [scans, setScans] = useState<DeviceScan[]>([]);
  const [alerts, setAlerts] = useState<ProtocolAlert[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [networkRange, setNetworkRange] = useState("192.168.1.0/24");

  useEffect(() => {
    // Mock data for demonstration
    setDevices([
      {
        id: "dev-001",
        name: "Smart Thermostat",
        type: "Thermostat",
        manufacturer: "Nest",
        ipAddress: "192.168.1.50",
        macAddress: "AA:BB:CC:DD:EE:01",
        firmwareVersion: "5.1.2",
        status: "secure",
        lastSeen: new Date().toISOString(),
        protocols: ["WiFi", "HTTP"],
        riskScore: 15,
      },
      {
        id: "dev-002",
        name: "Security Camera",
        type: "Camera",
        manufacturer: "Generic",
        ipAddress: "192.168.1.51",
        macAddress: "AA:BB:CC:DD:EE:02",
        firmwareVersion: "2.0.1",
        status: "vulnerable",
        lastSeen: new Date().toISOString(),
        protocols: ["WiFi", "RTSP", "HTTP"],
        riskScore: 75,
      },
      {
        id: "dev-003",
        name: "Smart Lock",
        type: "Lock",
        manufacturer: "August",
        ipAddress: "192.168.1.52",
        macAddress: "AA:BB:CC:DD:EE:03",
        firmwareVersion: "3.4.0",
        status: "secure",
        lastSeen: new Date().toISOString(),
        protocols: ["BLE", "WiFi"],
        riskScore: 25,
      },
    ]);

    setAlerts([
      {
        id: "alert-001",
        deviceId: "dev-002",
        protocol: "RTSP",
        alertType: "Unencrypted Stream",
        severity: "warning",
        message: "Camera streaming without encryption",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "secure":
        return "bg-green-500";
      case "vulnerable":
        return "bg-yellow-500";
      case "compromised":
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
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-teal-400">{TOOL_NAME}</h1>
            <p className="text-gray-400 text-sm">{TOOL_DESCRIPTION}</p>
          </div>
          <Link
            to="/maula-ai"
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg hover:from-teal-500 hover:to-cyan-500 transition-all flex items-center gap-2"
          >
            <span>🤖</span> Live Assistant
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto flex gap-4 p-2">
          {["overview", "devices", "scans", "alerts", "protocols"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  activeTab === tab
                    ? "bg-teal-600 text-white"
                    : "text-gray-400 hover:bg-gray-700"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-teal-400">
                  {devices.length}
                </div>
                <div className="text-gray-400">IoT Devices</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-green-400">
                  {devices.filter((d) => d.status === "secure").length}
                </div>
                <div className="text-gray-400">Secure</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-yellow-400">
                  {devices.filter((d) => d.status === "vulnerable").length}
                </div>
                <div className="text-gray-400">Vulnerable</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-red-400">
                  {alerts.length}
                </div>
                <div className="text-gray-400">Active Alerts</div>
              </div>
            </div>

            {/* Features */}
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

            {/* Quick Scan */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Quick Network Scan</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={networkRange}
                  onChange={(e) => setNetworkRange(e.target.value)}
                  placeholder="Network range (e.g., 192.168.1.0/24)"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                />
                <button className="px-6 py-2 bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors">
                  Start Scan
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">IoT Devices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3">Device</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">IP Address</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Risk Score</th>
                    <th className="text-left p-3">Protocols</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <tr key={device.id} className="border-t border-gray-700">
                      <td className="p-3">
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-gray-400">
                          {device.manufacturer}
                        </div>
                      </td>
                      <td className="p-3">{device.type}</td>
                      <td className="p-3 font-mono text-sm">
                        {device.ipAddress}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            device.status
                          )}`}
                        >
                          {device.status}
                        </span>
                      </td>
                      <td
                        className={`p-3 font-bold ${getRiskColor(
                          device.riskScore
                        )}`}
                      >
                        {device.riskScore}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {device.protocols.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 bg-gray-700 rounded text-xs"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <button className="px-3 py-1 bg-teal-600 rounded text-sm hover:bg-teal-500">
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

        {activeTab === "alerts" && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-gray-800 rounded-lg p-4 border border-yellow-600/50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-1 bg-yellow-600 rounded text-xs uppercase">
                      {alert.severity}
                    </span>
                    <h3 className="font-medium mt-2">{alert.alertType}</h3>
                    <p className="text-gray-400 text-sm">{alert.message}</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div>{alert.protocol}</div>
                    <div>{new Date(alert.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                No active alerts
              </div>
            )}
          </div>
        )}

        {(activeTab === "scans" || activeTab === "protocols") && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p>This section is available in the full application.</p>
            <Link
              to="/maula-ai"
              className="inline-block mt-4 px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-500"
            >
              Ask AI Assistant
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
