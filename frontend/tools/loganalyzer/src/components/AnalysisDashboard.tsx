import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, AlertTriangle, Activity, Shield } from "lucide-react";
import { LogAnalysis } from "../types";
import { loganalyzerAPI } from "../services/loganalyzerAPI";

const AnalysisDashboard: React.FC = () => {
  const [analyses, setAnalyses] = useState<LogAnalysis[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyses();
    loadSummary();
  }, []);

  const loadAnalyses = async () => {
    try {
      const response = await loganalyzerAPI.getAnalyses();
      setAnalyses(response.data.data);
    } catch (error) {
      console.error("Failed to load analyses:", error);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await loganalyzerAPI.getAnalysisSummary();
      setSummary(response.data.data);
    } catch (error) {
      console.error("Failed to load summary:", error);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      await loganalyzerAPI.createAnalysis({
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          end: new Date(),
        },
      });
      await loadAnalyses();
    } catch (error) {
      console.error("Failed to run analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const levelData = summary
    ? [
        { name: "Debug", value: summary.totalEntries * 0.1, color: "#6B7280" },
        { name: "Info", value: summary.totalEntries * 0.5, color: "#3B82F6" },
        { name: "Warning", value: summary.warningCount, color: "#F59E0B" },
        { name: "Error", value: summary.errorCount, color: "#EF4444" },
        { name: "Critical", value: summary.criticalCount, color: "#DC2626" },
      ]
    : [];

  const sourceData = summary
    ? [
        { name: "System", value: summary.totalEntries * 0.3 },
        { name: "Application", value: summary.totalEntries * 0.4 },
        { name: "Network", value: summary.totalEntries * 0.15 },
        { name: "Security", value: summary.totalEntries * 0.1 },
        { name: "Database", value: summary.totalEntries * 0.05 },
      ]
    : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analysis Dashboard
        </h2>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Activity className="h-4 w-4" />
          <span>{loading ? "Running..." : "Run Analysis"}</span>
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Entries
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalEntries.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Errors
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.errorCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Warnings
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.warningCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sources
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.uniqueSources}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Log Levels Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Log Levels Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={levelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {levelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sources Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Log Sources
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Analyses
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Anomalies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analyses.map((analysis) => (
                <tr key={analysis._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        analysis.status === "completed"
                          ? "text-green-800 bg-green-100"
                          : analysis.status === "processing"
                          ? "text-yellow-800 bg-yellow-100"
                          : "text-red-800 bg-red-100"
                      }`}
                    >
                      {analysis.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {analysis.riskScore}/100
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {analysis.summary?.totalEntries || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {analysis.anomalies?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(analysis.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
