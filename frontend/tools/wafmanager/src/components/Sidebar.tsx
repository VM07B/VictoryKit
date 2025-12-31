import React from "react";
import {
  LayoutDashboard,
  Shield,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  AlertTriangle,
  Globe,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: "overview" | "rules" | "logs" | "analytics") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "rules", label: "WAF Rules", icon: Shield },
    { id: "logs", label: "Attack Logs", icon: AlertTriangle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const secondaryItems = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help & Docs", icon: HelpCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gray-900/50 border-r border-gray-700/50">
      <nav className="flex-1 py-6 px-4">
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
            System
          </p>
          <ul className="space-y-1">
            {secondaryItems.map((item) => (
              <li key={item.id}>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Status Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg p-4 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              System Status
            </span>
          </div>
          <p className="text-xs text-gray-400">All systems operational</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">WAF Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
