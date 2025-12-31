import React, { useState } from "react";
import { Menu, X, MessageSquare, Sparkles } from "lucide-react";

// Components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LogEntriesPanel from "./components/LogEntriesPanel";
import AnalysisDashboard from "./components/AnalysisDashboard";
import SettingsPanel from "./components/SettingsPanel";
import ChatBox from "./components/ChatBox";
import NavigationDrawer from "./components/NavigationDrawer";
import Overlay from "./components/Overlay";
import Footer from "./components/Footer";

// Types and constants
import { Tab, SettingsState, Message, WorkspaceMode } from "./types";
import { NAV_ITEMS, DEFAULT_SETTINGS, WORKSPACE_MODES } from "./constants";

const App: React.FC = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab["id"]>("logs");
  const [workspaceMode, setWorkspaceMode] =
    useState<WorkspaceMode["id"]>("log-analysis");
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to LogAnalyzer! I'm your AI-powered log analysis assistant. I can help you analyze log files, detect security threats, create alerts, and provide insights into your system's behavior. How can I assist you today?",
      timestamp: new Date(),
      provider: settings.selectedProvider,
    },
  ]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const handleSettingsClick = () => {
    setActiveTab("settings");
  };

  const handleNotificationsClick = () => {
    // Handle notifications
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "logs":
        return <LogEntriesPanel />;
      case "analysis":
        return <AnalysisDashboard />;
      case "alerts":
        return <AlertsPanel />;
      case "settings":
        return (
          <SettingsPanel settings={settings} onSettingsChange={setSettings} />
        );
      case "chat":
        return (
          <ChatBox messages={messages} onSendMessage={handleSendMessage} />
        );
      default:
        return <LogEntriesPanel />;
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      provider: settings.selectedProvider,
    };

    setMessages((prev) => [...prev, userMessage]);

    // AI response logic would go here
    // For now, just add a placeholder response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm analyzing your request. This is a placeholder response.",
        timestamp: new Date(),
        provider: settings.selectedProvider,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        title="LogAnalyzer"
        onSettingsClick={handleSettingsClick}
        onNotificationsClick={handleNotificationsClick}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          tabs={NAV_ITEMS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpen={sidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-20 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="pt-16 lg:pt-0">{renderActiveTab()}</div>
        </main>

        {/* Chat Toggle Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed bottom-6 right-6 z-40 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          {chatOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </button>

        {/* Live Assistant Button */}
        <button
          onClick={() => window.open("/maula-ai", "_blank")}
          className="fixed bottom-24 right-6 z-40 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">Maula AI</span>
        </button>
      </div>

      {/* Chat Overlay */}
      {chatOpen && (
        <Overlay onClose={() => setChatOpen(false)}>
          <ChatBox messages={messages} onSendMessage={handleSendMessage} />
        </Overlay>
      )}

      {/* Navigation Drawer for Mobile */}
      {sidebarOpen && (
        <NavigationDrawer
          tabs={NAV_ITEMS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
