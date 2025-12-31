import React from "react";
import {
  Settings,
  Sliders,
  Cpu,
  Save,
  RefreshCw,
  Link2,
  Box,
} from "lucide-react";
import { SettingsState } from "../types";
import { NEURAL_PRESETS, PROVIDER_CONFIG } from "../constants";

interface SettingsPanelProps {
  settings: SettingsState;
  onChange: (settings: SettingsState) => void;
  onApplyPreset: (type: string) => void;
  onReset: () => void;
  isOpen: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  onApplyPreset,
  onReset,
  isOpen,
}) => {
  const currentProvider =
    PROVIDER_CONFIG.find((p) => p.id === settings.provider) ||
    PROVIDER_CONFIG[0];

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = e.target.value;
    const provider =
      PROVIDER_CONFIG.find((p) => p.id === newProviderId) || PROVIDER_CONFIG[0];
    onChange({
      ...settings,
      provider: newProviderId,
      model: provider.models[0], // Reset to default model of new provider
    });
  };

  return (
    <aside
      className={`absolute top-0 right-0 h-full w-[85%] sm:w-72 md:w-80 bg-[#0a0a0a]/98 backdrop-blur-xl border-l border-gray-800/50 p-5 transition-transform duration-500 ease-out z-[60] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center gap-3 mb-6 border-b border-gray-900 pb-4">
        <Settings size={18} className="text-cyan-400" />
        <h2 className="text-cyan-400 font-bold glow-cyan uppercase tracking-tighter text-sm font-mono">
          NEURAL_CONFIG
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto space-y-6 custom-scrollbar pr-2">
        {/* Provider Selection */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            AI Provider
          </label>
          <select
            value={settings.provider}
            onChange={handleProviderChange}
            className="w-full bg-black/60 text-gray-300 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 font-mono transition-all"
          >
            {PROVIDER_CONFIG.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            Model Variant
          </label>
          <select
            value={settings.model}
            onChange={(e) => onChange({ ...settings, model: e.target.value })}
            className="w-full bg-black/60 text-gray-300 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 font-mono transition-all"
          >
            {currentProvider.models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            Response Temperature
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) =>
              onChange({ ...settings, temperature: parseFloat(e.target.value) })
            }
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-[8px] text-gray-600 font-mono">
            <span>0.0</span>
            <span className="text-cyan-400">{settings.temperature}</span>
            <span>2.0</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            Max Response Length
          </label>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={settings.maxTokens}
            onChange={(e) =>
              onChange({ ...settings, maxTokens: parseInt(e.target.value) })
            }
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-[8px] text-gray-600 font-mono">
            <span>256</span>
            <span className="text-cyan-400">{settings.maxTokens}</span>
            <span>8192</span>
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            System Prompt
          </label>
          <textarea
            value={settings.customPrompt}
            onChange={(e) =>
              onChange({ ...settings, customPrompt: e.target.value })
            }
            className="w-full bg-black/60 text-gray-300 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 font-mono transition-all resize-none"
            rows={6}
            placeholder="Enter custom system prompt..."
          />
        </div>

        {/* Neural Presets */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            Neural Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(NEURAL_PRESETS).map((preset) => (
              <button
                key={preset}
                onClick={() => onApplyPreset(preset)}
                className="bg-gray-800/50 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 border border-gray-800 hover:border-cyan-500/30 rounded px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-all"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-900 space-y-2">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all"
        >
          <RefreshCw size={14} />
          Reset Config
        </button>
      </div>
    </aside>
  );
};

export default SettingsPanel;
