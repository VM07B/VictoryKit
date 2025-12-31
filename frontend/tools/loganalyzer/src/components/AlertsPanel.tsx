import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, TestTube } from "lucide-react";
import { LogAlert } from "../types";
import { loganalyzerAPI } from "../services/loganalyzerAPI";

const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<LogAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<LogAlert | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await loganalyzerAPI.getAlerts();
      setAlerts(response.data.data);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    }
  };

  const handleCreateAlert = async (alertData: Partial<LogAlert>) => {
    try {
      await loganalyzerAPI.createAlert(alertData);
      await loadAlerts();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create alert:", error);
    }
  };

  const handleUpdateAlert = async (id: string, updates: Partial<LogAlert>) => {
    try {
      await loganalyzerAPI.updateAlert(id, updates);
      await loadAlerts();
      setEditingAlert(null);
    } catch (error) {
      console.error("Failed to update alert:", error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      try {
        await loganalyzerAPI.deleteAlert(id);
        await loadAlerts();
      } catch (error) {
        console.error("Failed to delete alert:", error);
      }
    }
  };

  const handleTestAlert = async (id: string) => {
    try {
      const response = await loganalyzerAPI.testAlert(id);
      alert(
        `Alert test result: ${
          response.data.data.triggered ? "Triggered" : "Not triggered"
        }`
      );
    } catch (error) {
      console.error("Failed to test alert:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Alert Rules
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Alert</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {alert.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alert.description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.enabled
                      ? "text-green-800 bg-green-100"
                      : "text-gray-800 bg-gray-100"
                  }`}
                >
                  {alert.enabled ? "Enabled" : "Disabled"}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.severity === "critical"
                      ? "text-red-800 bg-red-100"
                      : alert.severity === "high"
                      ? "text-orange-800 bg-orange-100"
                      : alert.severity === "medium"
                      ? "text-yellow-800 bg-yellow-100"
                      : "text-blue-800 bg-blue-100"
                  }`}
                >
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conditions
              </h4>
              <div className="space-y-1">
                {alert.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {condition.field} {condition.operator} "{condition.value}"
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last triggered:{" "}
                {alert.lastTriggered
                  ? new Date(alert.lastTriggered).toLocaleString()
                  : "Never"}
                {alert.triggerCount > 0 && ` (${alert.triggerCount} times)`}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestAlert(alert._id)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title="Test Alert"
                >
                  <TestTube className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingAlert(alert)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title="Edit Alert"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert._id)}
                  className="p-2 text-red-600 hover:text-red-700"
                  title="Delete Alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingAlert) && (
        <AlertForm
          alert={editingAlert}
          onSave={
            editingAlert
              ? (data) => handleUpdateAlert(editingAlert._id, data)
              : handleCreateAlert
          }
          onCancel={() => {
            setShowCreateForm(false);
            setEditingAlert(null);
          }}
        />
      )}
    </div>
  );
};

// Alert Form Component
interface AlertFormProps {
  alert?: LogAlert | null;
  onSave: (data: Partial<LogAlert>) => void;
  onCancel: () => void;
}

const AlertForm: React.FC<AlertFormProps> = ({ alert, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<LogAlert>>({
    name: "",
    description: "",
    enabled: true,
    conditions: [
      {
        field: "level",
        operator: "equals",
        value: "error",
        caseSensitive: false,
      },
    ],
    actions: [{ type: "internal", target: "", template: "", enabled: true }],
    severity: "medium",
    cooldown: 60,
    ...alert,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {alert ? "Edit Alert" : "Create Alert"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cooldown (minutes)
              </label>
              <input
                type="number"
                value={formData.cooldown}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cooldown: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min="1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {alert ? "Update" : "Create"} Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertsPanel;
