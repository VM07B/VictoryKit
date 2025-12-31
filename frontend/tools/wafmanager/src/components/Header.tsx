import React from "react";
import { Link } from "react-router-dom";
import { Shield, Menu, Bell, User, Zap } from "lucide-react";

interface HeaderProps {
  onToggleMenu?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleMenu }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleMenu}
            className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">WAFManager</h1>
              <p className="text-xs text-gray-400">VictoryKit Security Suite</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/maula-ai"
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm transition-all duration-200"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Live Assistant</span>
          </Link>

          <button className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-500" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
