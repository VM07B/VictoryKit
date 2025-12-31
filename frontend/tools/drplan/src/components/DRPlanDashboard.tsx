import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TOOL_NAME, TOOL_DESCRIPTION, FEATURES } from "../constants";
import { DRPlan, CriticalSystem, DRDrill } from "../types";

export default function DRPlanDashboard() {
  const [plans, setPlans] = useState<DRPlan[]>([]);
  const [systems, setSystems] = useState<CriticalSystem[]>([]);
  const [drills, setDrills] = useState<DRDrill[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setPlans([
      {
        id: "plan-001",
        name: "Primary Data Center Recovery",
        description: "Complete recovery plan for primary DC",
        version: "2.1",
        status: "active",
        lastUpdated: new Date().toISOString(),
        lastTested: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        rto: 240, // 4 hours
        rpo: 60, // 1 hour
        owner: "IT Operations",
        criticalSystems: ["sys-001", "sys-002", "sys-003"],
      },
      {
        id: "plan-002",
        name: "Cloud Infrastructure Failover",
        description: "AWS to GCP failover procedures",
        version: "1.3",
        status: "active",
        lastUpdated: new Date().toISOString(),
        rto: 120,
        rpo: 15,
        owner: "Cloud Team",
        criticalSystems: ["sys-004", "sys-005"],
      },
    ]);

    setSystems([
      {
        id: "sys-001",
        name: "Core Database Cluster",
        tier: 1,
        rto: 60,
        rpo: 5,
        dependencies: ["sys-003"],
        recoveryProcedure: "runbook-db-001",
        primaryLocation: "US-East",
        failoverLocation: "US-West",
        status: "operational",
      },
      {
        id: "sys-002",
        name: "Authentication Service",
        tier: 1,
        rto: 30,
        rpo: 0,
        dependencies: ["sys-001"],
        recoveryProcedure: "runbook-auth-001",
        primaryLocation: "US-East",
        failoverLocation: "EU-West",
        status: "operational",
      },
      {
        id: "sys-003",
        name: "Storage Backend",
        tier: 2,
        rto: 120,
        rpo: 15,
        dependencies: [],
        recoveryProcedure: "runbook-storage-001",
        primaryLocation: "US-East",
        failoverLocation: "US-West",
        status: "degraded",
      },
    ]);

    setDrills([
      {
        id: "drill-001",
        planId: "plan-001",
        name: "Q1 Full DR Test",
        type: "full",
        scheduledDate: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "scheduled",
        participants: ["ops-team", "dev-team", "security-team"],
      },
      {
        id: "drill-002",
        planId: "plan-002",
        name: "Cloud Failover Simulation",
        type: "simulation",
        scheduledDate: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        executedDate: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "completed",
        participants: ["cloud-team"],
        results: {
          rtoAchieved: 95,
          rpoAchieved: 12,
          successRate: 92,
          issues: ["DNS propagation delay"],
          recommendations: ["Pre-warm failover instances"],
        },
      },
    ]);
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
      case "operational":
        return "bg-green-500";
      case "scheduled":
      case "draft":
        return "bg-blue-500";
      case "in-progress":
        return "bg-yellow-500";
      case "degraded":
        return "bg-orange-500";
      case "failed":
      case "down":
      case "archived":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return "bg-red-600";
      case 2:
        return "bg-orange-600";
      case 3:
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-rose-400">{TOOL_NAME}</h1>
            <p className="text-gray-400 text-sm">{TOOL_DESCRIPTION}</p>
          </div>
          <Link
            to="/maula-ai"
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 rounded-lg hover:from-rose-500 hover:to-red-500 transition-all flex items-center gap-2"
          >
            <span>🤖</span> Live Assistant
          </Link>
        </div>
      </header>

      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto flex gap-4 p-2">
          {["overview", "plans", "systems", "drills", "runbooks"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeTab === tab
                  ? "bg-rose-600 text-white"
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
                <div className="text-3xl font-bold text-rose-400">
                  {plans.length}
                </div>
                <div className="text-gray-400">DR Plans</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-blue-400">
                  {systems.length}
                </div>
                <div className="text-gray-400">Critical Systems</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-green-400">
                  {systems.filter((s) => s.status === "operational").length}
                </div>
                <div className="text-gray-400">Operational</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-yellow-400">
                  {drills.filter((d) => d.status === "scheduled").length}
                </div>
                <div className="text-gray-400">Scheduled Drills</div>
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
                <h2 className="text-xl font-semibold mb-4">Active DR Plans</h2>
                {plans
                  .filter((p) => p.status === "active")
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className="mb-4 p-4 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{plan.name}</h3>
                          <p className="text-sm text-gray-400">
                            v{plan.version}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            plan.status
                          )}`}
                        >
                          {plan.status}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span>
                          RTO:{" "}
                          <strong className="text-rose-400">
                            {formatTime(plan.rto)}
                          </strong>
                        </span>
                        <span>
                          RPO:{" "}
                          <strong className="text-blue-400">
                            {formatTime(plan.rpo)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Upcoming Drills</h2>
                {drills
                  .filter((d) => d.status === "scheduled")
                  .map((drill) => (
                    <div
                      key={drill.id}
                      className="mb-4 p-4 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{drill.name}</h3>
                          <p className="text-sm text-gray-400 capitalize">
                            {drill.type} drill
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            drill.status
                          )}`}
                        >
                          {drill.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        {new Date(drill.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "systems" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Critical Systems</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3">System</th>
                    <th className="text-left p-3">Tier</th>
                    <th className="text-left p-3">RTO</th>
                    <th className="text-left p-3">RPO</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Failover</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {systems.map((system) => (
                    <tr key={system.id} className="border-t border-gray-700">
                      <td className="p-3">
                        <div className="font-medium">{system.name}</div>
                        <div className="text-sm text-gray-400">
                          {system.primaryLocation}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getTierColor(
                            system.tier
                          )}`}
                        >
                          Tier {system.tier}
                        </span>
                      </td>
                      <td className="p-3">{formatTime(system.rto)}</td>
                      <td className="p-3">{formatTime(system.rpo)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            system.status
                          )}`}
                        >
                          {system.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-400">
                        {system.failoverLocation}
                      </td>
                      <td className="p-3">
                        <button className="px-3 py-1 bg-rose-600 rounded text-sm hover:bg-rose-500">
                          Test Failover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "plans" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-rose-600 rounded-lg hover:bg-rose-500">
                + Create Plan
              </button>
            </div>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      plan.status
                    )}`}
                  >
                    {plan.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Version</div>
                    <div className="font-medium">v{plan.version}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">RTO</div>
                    <div className="font-medium text-rose-400">
                      {formatTime(plan.rto)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">RPO</div>
                    <div className="font-medium text-blue-400">
                      {formatTime(plan.rpo)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Systems</div>
                    <div className="font-medium">
                      {plan.criticalSystems.length}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === "drills" || activeTab === "runbooks") && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-4">📋</div>
            <p>This section is available in the full application.</p>
            <Link
              to="/maula-ai"
              className="inline-block mt-4 px-4 py-2 bg-rose-600 rounded-lg hover:bg-rose-500"
            >
              Ask AI Assistant
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
