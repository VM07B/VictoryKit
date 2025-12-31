import React from "react";
import { Shield } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-700/50 py-6 px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-gray-400">
            WAFManager © {new Date().getFullYear()} VictoryKit Security Suite
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-300 transition-colors">
            Documentation
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            API Reference
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
