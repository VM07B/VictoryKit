import React, { useState, useEffect, useCallback } from "react";

// Import neural link components and logic
import Header from "../../neural-link-interface/components/Header";
import Sidebar from "../../neural-link-interface/components/Sidebar";
import SettingsPanel from "../../neural-link-interface/components/SettingsPanel";
import ChatBox from "../../neural-link-interface/components/ChatBox";
import NavigationDrawer from "../../neural-link-interface/components/NavigationDrawer";
import Overlay from "../../neural-link-interface/components/Overlay";
import Footer from "../../neural-link-interface/components/Footer";

import {
  ChatSession,
  Message,
  SettingsState,
} from "../../neural-link-interface/types";
import { DEFAULT_SETTINGS } from "../../neural-link-interface/constants";
import { callGemini } from "../../neural-link-interface/services/geminiService";

const NeuralLinkInterface: React.FC = () => {
  // UI State
  const [isOverlayActive, setIsOverlayActive] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecordingSTT, setIsRecordingSTT] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Gemini Live & STT Refs
  // const recognitionRef = useRef<any>(null);
  // const liveSessionRef = useRef<any>(null);
  // const audioContextRef = useRef<AudioContext | null>(null);
  // const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  // const nextStartTimeRef = useRef<number>(0);

  // App Data State - Enhanced with FraudGuard context
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("fraudguard_neural_sessions");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "1",
        name: "FRAUDGUARD_NEURAL_LINK",
        active: true,
        messages: [
          {
            id: "init-1",
            sender: "AGENT",
            text: "🔒 FraudGuard Neural Link established. I have access to your fraud detection data, transaction analysis, and risk assessment tools. How can I help you with fraud detection today?",
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
        settings: {
          ...DEFAULT_SETTINGS,
          customPrompt: `You are an AI assistant integrated with FraudGuard - an AI-powered fraud detection system. You have access to:

- Transaction analysis and fraud scoring
- Risk assessment tools and indicators
- Alert management and rule configuration
- Historical transaction data and patterns
- Real-time fraud detection capabilities

Help users analyze transactions, configure alerts, interpret risk scores, and optimize their fraud detection strategies. Always provide actionable insights and explain technical concepts clearly.`,
          agentName: "FraudGuard AI Assistant",
        },
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(
      "fraudguard_neural_sessions",
      JSON.stringify(sessions)
    );
  }, [sessions]);

  const activeSession = sessions.find((s) => s.active) || sessions[0];

  const handleSend = async (text: string) => {
    if (isThinking) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "YOU",
      text,
      timestamp,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, messages: [...s.messages, userMsg] } : s
      )
    );

    setIsThinking(true);
    const result = await callGemini(text, activeSession.settings);
    setIsThinking(false);

    const settingsUpdate: Partial<SettingsState> = {};
    if (result.navigationUrl) {
      settingsUpdate.portalUrl = result.navigationUrl;
      settingsUpdate.workspaceMode = "PORTAL";
    }
    if (result.canvasUpdate) {
      settingsUpdate.canvas = {
        ...activeSession.settings.canvas,
        ...result.canvasUpdate,
      };
      settingsUpdate.workspaceMode = "CANVAS";
    }
    if (Object.keys(settingsUpdate).length > 0) {
      setSessions((prev) =>
        prev.map((s) =>
          s.active
            ? { ...s, settings: { ...s.settings, ...settingsUpdate } }
            : s
        )
      );
    }

    const agentMsg: Message = {
      id: Date.now().toString(),
      sender: "AGENT",
      text: result.text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, messages: [...s.messages, agentMsg] } : s
      )
    );
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `FraudGuard Session ${sessions.length + 1}`,
      active: true,
      messages: [
        {
          id: "init-" + Date.now(),
          sender: "AGENT",
          text: "New FraudGuard analysis session started. Ready to help with fraud detection.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      settings: {
        ...DEFAULT_SETTINGS,
        customPrompt: activeSession.settings.customPrompt,
        agentName: activeSession.settings.agentName,
      },
    };

    setSessions((prev) =>
      prev.map((s) => ({ ...s, active: false })).concat(newSession)
    );
  };

  const handleSessionSelect = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => ({ ...s, active: s.id === sessionId }))
    );
  };

  const handleSettingsUpdate = (updates: Partial<SettingsState>) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, settings: { ...s.settings, ...updates } } : s
      )
    );
  };

  const handleLiveStart = async () => {
    try {
      setIsLiveActive(true);
      // Live session implementation would go here
    } catch (error) {
      console.error("Failed to start live session:", error);
      setIsLiveActive(false);
    }
  };

  const handleLiveStop = () => {
    setIsLiveActive(false);
    // Cleanup live session
  };

  const handleSTTStart = () => {
    setIsRecordingSTT(true);
    // STT implementation would go here
  };

  const handleSTTStop = () => {
    setIsRecordingSTT(false);
    // STT cleanup
  };

  const handleToggleSTT = () => {
    if (isRecordingSTT) {
      handleSTTStop();
    } else {
      handleSTTStart();
    }
  };

  const handleToggleLive = () => {
    if (isLiveActive) {
      handleLiveStop();
    } else {
      handleLiveStart();
    }
  };

  const handleFileUpload = (file: File) => {
    // File upload implementation would go here
    console.log("File uploaded:", file.name);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Overlay */}
      {isOverlayActive && (
        <Overlay
          active={isOverlayActive}
          onActivate={() => setIsOverlayActive(false)}
        />
      )}

      {/* Header */}
      <Header
        onToggleLeft={() => setIsLeftPanelOpen(true)}
        onToggleRight={() => setIsRightPanelOpen(true)}
        onToggleNav={() => setIsNavDrawerOpen(true)}
        onClear={() => {
          // Clear current session messages
          setSessions((prev) =>
            prev.map((s) => (s.active ? { ...s, messages: [] } : s))
          );
        }}
        onLock={() => {
          // Lock/unlock functionality
          console.log("Lock toggled");
        }}
        leftOpen={isLeftPanelOpen}
        rightOpen={isRightPanelOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          sessions={sessions}
          onSelect={handleSessionSelect}
          onCreate={handleNewSession}
          onDelete={(sessionId) => {
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          }}
          isOpen={isLeftPanelOpen}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatBox
            messages={activeSession.messages}
            onSend={handleSend}
            isThinking={isThinking}
            isRecordingSTT={isRecordingSTT}
            isLiveActive={isLiveActive}
            onFileUpload={handleFileUpload}
            onToggleSTT={handleToggleSTT}
            onToggleLive={handleToggleLive}
            agentSettings={activeSession.settings}
            onUpdateSettings={handleSettingsUpdate}
          />
        </div>

        {/* Right Settings Panel */}
        <SettingsPanel
          settings={activeSession.settings}
          onChange={handleSettingsUpdate}
          onApplyPreset={(type) => {
            // Apply preset functionality
            console.log("Applying preset:", type);
          }}
          onReset={() => {
            // Reset settings
            handleSettingsUpdate(DEFAULT_SETTINGS);
          }}
          isOpen={isRightPanelOpen}
        />

        {/* Navigation Drawer */}
        <NavigationDrawer
          isOpen={isNavDrawerOpen}
          onClose={() => setIsNavDrawerOpen(false)}
          onModuleSelect={(item) => {
            // Handle module selection
            console.log("Module selected:", item);
          }}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NeuralLinkInterface;
