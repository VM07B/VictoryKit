import React from "react";
import { SettingsState } from "../types";

interface SettingsPanelProps {
  settings: SettingsState;
  onSettingsChange: (settings: SettingsState) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const handleChange = (key: keyof SettingsState, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Provider
            </label>
            <select
              value={settings.selectedProvider}
              onChange={(e) => handleChange("selectedProvider", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange("apiKey", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your API key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) =>
                handleChange("theme", e.target.value as "light" | "dark")
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              checked={settings.notifications}
              onChange={(e) => handleChange("notifications", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="notifications"
              className="ml-2 block text-sm text-gray-900 dark:text-white"
            >
              Enable notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoAnalyze"
              checked={settings.autoAnalyze}
              onChange={(e) => handleChange("autoAnalyze", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="autoAnalyze"
              className="ml-2 block text-sm text-gray-900 dark:text-white"
            >
              Auto-analyze new logs
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
