import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 VictoryKit - LogAnalyzer Tool
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Powered by AI • Built for Security
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
