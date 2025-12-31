import React from "react";
import { X, Code, FileText, Database, Settings, Zap } from "lucide-react";
import { NavItem } from "../types";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleSelect: (item: NavItem) => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onModuleSelect,
}) => {
  const navItems: NavItem[] = [
    {
      tool: "incident_triage",
      label: "Incident Triage",
      icon: "alert-triangle",
      description: "Initial assessment",
    },
    {
      tool: "timeline",
      label: "Timeline Analysis",
      icon: "clock",
      description: "Event chronology",
    },
    {
      tool: "forensics",
      label: "Digital Forensics",
      icon: "search",
      description: "Evidence analysis",
    },
    {
      tool: "threat_intel",
      label: "Threat Intelligence",
      icon: "shield",
      description: "IOC analysis",
    },
    {
      tool: "response",
      label: "Response Coordination",
      icon: "users",
      description: "Team coordination",
    },
    {
      tool: "reporting",
      label: "Incident Reporting",
      icon: "file-text",
      description: "Report generation",
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-80 bg-[#0a0a0a]/98 backdrop-blur-xl border-l border-gray-800/50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-green-400 font-bold text-lg font-mono uppercase tracking-wider">
              Neural Modules
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {navItems.map((item) => (
              <button
                key={item.tool}
                onClick={() => {
                  onModuleSelect(item);
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-4 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-800/50 hover:border-gray-600/50 rounded-lg transition-all group"
              >
                <div className="text-green-400 group-hover:text-green-300">
                  {item.tool === "incident_triage" && <Zap size={20} />}
                  {item.tool === "timeline" && <Database size={20} />}
                  {item.tool === "forensics" && <Code size={20} />}
                  {item.tool === "threat_intel" && <Settings size={20} />}
                  {item.tool === "response" && <FileText size={20} />}
                  {item.tool === "reporting" && <FileText size={20} />}
                </div>
                <div className="text-left">
                  <div className="text-white font-medium text-sm">
                    {item.label}
                  </div>
                  <div className="text-gray-500 text-xs font-mono">
                    {item.tool.replace("_", " ").toUpperCase()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawer;
