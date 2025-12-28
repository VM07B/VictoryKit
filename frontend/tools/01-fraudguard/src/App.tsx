import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Menu, X, MessageSquare, ChevronLeft, ChevronRight, 
  Search, Settings, Bell, TrendingUp, Activity, FileText,
  AlertTriangle, CheckCircle, Clock, Send, Sparkles, Mic, 
  Paperclip, MoreHorizontal, User, Bot
} from 'lucide-react';

// Components
import TransactionForm from './components/TransactionForm';
import FraudScoreCard from './components/FraudScoreCard';
import RiskVisualization from './components/RiskVisualization';
import TransactionHistory from './components/TransactionHistory';
import AlertsPanel from './components/AlertsPanel';
import ExportReport from './components/ExportReport';

// Types and constants
import { 
  Transaction, FraudScore, Alert, Tab, SettingsState, 
  Message, WorkspaceMode 
} from './types';
import { NAV_ITEMS, DEFAULT_SETTINGS, PROVIDER_CONFIG } from './constants';

// Services
import { fraudguardAPI } from './services/fraudguardAPI';
import { executeTool, getToolDefinitions } from './services/fraudguard-tools';

const App: React.FC = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('analyze');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('fraud-detection');
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  
  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fraudScores, setFraudScores] = useState<Record<string, FraudScore>>({});
  const [currentScore, setCurrentScore] = useState<FraudScore | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to FraudGuard! I'm your AI-powered fraud detection assistant. I can help you analyze transactions, detect suspicious patterns, and manage fraud alerts. How can I assist you today?",
      timestamp: new Date(),
      provider: settings.selectedProvider,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle transaction analysis
  const handleAnalyzeTransaction = async (transaction: Transaction) => {
    setIsLoading(true);
    try {
      const score = await fraudguardAPI.transactions.analyze(transaction);
      setCurrentScore(score);
      setFraudScores((prev) => ({ ...prev, [transaction.transaction_id]: score }));
      setTransactions((prev) => [transaction, ...prev]);
      
      // Add assistant message about analysis
      const riskColor = score.risk_level === 'critical' ? 'red' : 
                       score.risk_level === 'high' ? 'orange' : 
                       score.risk_level === 'medium' ? 'yellow' : 'green';
      
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Transaction analyzed. Risk Score: ${score.score}/100 (${score.risk_level.toUpperCase()}). ${score.indicators.length} risk indicators detected.`,
        timestamp: new Date(),
        provider: settings.selectedProvider,
      }]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (would connect to real AI service)
    setTimeout(async () => {
      // Check for tool-related keywords
      let response = '';
      
      if (inputValue.toLowerCase().includes('analyze') && inputValue.toLowerCase().includes('transaction')) {
        response = "I can help you analyze a transaction. Please use the Transaction Form on the left to enter the transaction details, or provide me with the transaction data and I'll analyze it for you.";
      } else if (inputValue.toLowerCase().includes('alert')) {
        response = "You can manage fraud alerts from the Alerts panel. Would you like me to create a new alert rule? Just tell me the alert type, threshold score, and notification channels you'd like to use.";
      } else if (inputValue.toLowerCase().includes('report') || inputValue.toLowerCase().includes('export')) {
        response = "I can help you export reports. Go to the Export section to generate PDF or CSV reports with your fraud analysis data. You can filter by date range and risk levels.";
      } else if (inputValue.toLowerCase().includes('score') || inputValue.toLowerCase().includes('risk')) {
        response = `Based on my analysis, the current risk assessment shows ${transactions.length} transactions processed with an average risk score. Would you like me to break down the risk factors or show you the visualization?`;
      } else {
        response = "I'm here to help with fraud detection and analysis. I can:\n\n• Analyze transactions for fraud risk\n• Show risk visualizations and patterns\n• Create and manage fraud alerts\n• Export detailed reports\n\nWhat would you like to do?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        provider: settings.selectedProvider,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle alert operations
  const handleCreateAlert = async (alert: Omit<Alert, 'id' | 'created_at' | 'triggered_count'>) => {
    try {
      const newAlert = await fraudguardAPI.alerts.create(alert);
      setAlerts((prev) => [...prev, newAlert]);
    } catch (error) {
      // For demo, create locally
      const localAlert: Alert = {
        ...alert,
        id: `alert_${Date.now()}`,
        created_at: new Date().toISOString(),
        triggered_count: 0,
      };
      setAlerts((prev) => [...prev, localAlert]);
    }
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAlert = (id: string, active: boolean) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active } : a));
  };

  // Handle report export
  const handleExport = async (format: 'pdf' | 'csv', options: any) => {
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Exporting:', format, options);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyze':
        return (
          <div className="space-y-6">
            <TransactionForm onSubmit={handleAnalyzeTransaction} isLoading={isLoading} />
            {currentScore && (
              <FraudScoreCard 
                score={currentScore} 
                onApprove={() => console.log('Approved')}
                onDecline={() => console.log('Declined')}
                onReview={() => console.log('Review')}
              />
            )}
          </div>
        );
      case 'visualize':
        return (
          <RiskVisualization 
            data={[
              { label: 'Card Mismatch', value: 35, color: '#EF4444' },
              { label: 'High Velocity', value: 25, color: '#F97316' },
              { label: 'New Device', value: 20, color: '#EAB308' },
              { label: 'Location Risk', value: 15, color: '#22C55E' },
              { label: 'Amount Flag', value: 5, color: '#3B82F6' },
            ]}
            chartType="risk_breakdown"
          />
        );
      case 'history':
        return (
          <TransactionHistory 
            transactions={transactions}
            fraudScores={fraudScores}
            onSelectTransaction={(t) => {
              const score = fraudScores[t.transaction_id];
              if (score) setCurrentScore(score);
              setActiveTab('analyze');
            }}
          />
        );
      case 'alerts':
        return (
          <AlertsPanel 
            alerts={alerts}
            onCreateAlert={handleCreateAlert}
            onDeleteAlert={handleDeleteAlert}
            onToggleAlert={handleToggleAlert}
          />
        );
      case 'reports':
        return (
          <ExportReport 
            transactions={transactions}
            fraudScores={fraudScores}
            onExport={handleExport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-lg border-b border-red-500/30">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">FraudGuard</h1>
                <p className="text-xs text-red-400">AI Fraud Detection</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Workspace Mode Selector */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setWorkspaceMode('fraud-detection')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  workspaceMode === 'fraud-detection' 
                    ? 'bg-red-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Detection
              </button>
              <button
                onClick={() => setWorkspaceMode('analytics')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  workspaceMode === 'analytics' 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setWorkspaceMode('monitoring')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  workspaceMode === 'monitoring' 
                    ? 'bg-yellow-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monitoring
              </button>
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {alerts.filter(a => a.active).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* Toggle Chat */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                chatOpen ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside 
          className={`fixed left-0 top-16 bottom-0 bg-slate-900/50 backdrop-blur border-r border-red-500/20 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = {
                'search': Search,
                'analyze': Activity,
                'visualize': TrendingUp,
                'history': Clock,
                'alerts': AlertTriangle,
                'reports': FileText,
                'settings': Settings,
              }[item.id] || Activity;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-white'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats */}
          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/30">
                <h4 className="text-sm font-bold text-white mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Analyzed Today</span>
                    <span className="text-white font-bold">{transactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High Risk</span>
                    <span className="text-red-400 font-bold">
                      {Object.values(fraudScores).filter(s => s.risk_level === 'high' || s.risk_level === 'critical').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Alerts</span>
                    <span className="text-yellow-400 font-bold">{alerts.filter(a => a.active).length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main 
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          } ${chatOpen ? 'mr-96' : ''}`}
        >
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'FraudGuard'}
              </h2>
              <p className="text-gray-400 mt-1">
                {activeTab === 'analyze' && 'Analyze transactions for potential fraud'}
                {activeTab === 'visualize' && 'Visualize risk patterns and trends'}
                {activeTab === 'history' && 'View and manage transaction history'}
                {activeTab === 'alerts' && 'Configure and manage fraud alerts'}
                {activeTab === 'reports' && 'Generate and export reports'}
              </p>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </main>

        {/* Chat Panel */}
        {chatOpen && (
          <aside className="fixed right-0 top-16 bottom-0 w-96 bg-slate-900/50 backdrop-blur border-l border-red-500/20 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Assistant</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      Online
                    </p>
                  </div>
                </div>
                <select 
                  value={settings.selectedProvider}
                  onChange={(e) => setSettings({ ...settings, selectedProvider: e.target.value as any })}
                  className="bg-slate-800 border border-red-500/30 rounded-lg px-2 py-1 text-sm"
                >
                  {Object.entries(PROVIDER_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-cyan-500/20' 
                      : 'bg-gradient-to-br from-red-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-slate-800/50 border border-red-500/30'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800/50 border border-red-500/30 p-3 rounded-xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-red-500/20">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-red-500/30 rounded-xl p-2">
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about fraud detection..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Mic className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                Powered by {PROVIDER_CONFIG[settings.selectedProvider]?.name || 'AI'}
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;
