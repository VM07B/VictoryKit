import React from "react";
import { Shield, Bell, User, Settings } from "lucide-react";

interface HeaderProps {
  title: string;
  onSettingsClick: () => void;
  onNotificationsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onSettingsClick,
  onNotificationsClick,
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-Powered Log Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onNotificationsClick}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bell className="h-5 w-5" />
          </button>

          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
