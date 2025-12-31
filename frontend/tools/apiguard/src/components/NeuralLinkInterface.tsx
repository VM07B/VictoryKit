import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Mic,
  Paperclip,
  Trash2,
  Plus,
  Settings,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { ChatSession, Message, SettingsState } from "../types";
import { DEFAULT_SETTINGS, NEURAL_PRESETS, NAV_ITEMS } from "../constants";
import { callGemini } from "../services/geminiService";

const NeuralLinkInterface: React.FC = () => {
  const [isOverlayActive, setIsOverlayActive] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("apiguard_sessions");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "1",
        name: "API_SECURITY_SESSION",
        active: true,
        messages: [
          {
            id: "init-1",
            sender: "AGENT",
            text: "APIGuard AI initialized. Ready to assist with API security, rate limiting, and authentication monitoring.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
        settings: { ...DEFAULT_SETTINGS },
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("apiguard_sessions", JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions]);

  const activeSession = sessions.find((s) => s.active) || sessions[0];

  const handleSend = async () => {
    if (!inputText.trim() || isThinking) return;
    const text = inputText;
    setInputText("");
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "YOU",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, messages: [...s.messages, userMsg] } : s
      )
    );
    setIsThinking(true);
    const result = await callGemini(text, activeSession.settings);
    setIsThinking(false);
    const agentMsg: Message = {
      id: (Date.now() + 1).toString(),
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

  const createNewSession = () => {
    const id = Date.now().toString();
    setSessions((prev) =>
      prev
        .map((s) => ({ ...s, active: false }))
        .concat({
          id,
          name: `API_SESSION_${id.slice(-4)}`,
          active: true,
          messages: [
            {
              id: `init-${id}`,
              sender: "AGENT",
              text: "New API security session started.",
              timestamp: new Date().toLocaleTimeString(),
            },
          ],
          settings: { ...DEFAULT_SETTINGS },
        })
    );
  };

  const selectSession = (id: string) =>
    setSessions((prev) => prev.map((s) => ({ ...s, active: s.id === id })));
  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0)
        return [
          {
            id: Date.now().toString(),
            name: "NEW_SESSION",
            active: true,
            messages: [],
            settings: { ...DEFAULT_SETTINGS },
          },
        ];
      if (prev.find((s) => s.id === id)?.active) filtered[0].active = true;
      return filtered;
    });
  };

  return (
    <div className="min-h-screen matrix-bg text-gray-300 flex flex-col">
      {isOverlayActive && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">APIGuard AI</h1>
            <p className="text-gray-400 mb-8">Neural Link Security Interface</p>
            <button
              onClick={() => setIsOverlayActive(false)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
            >
              Initialize Connection
            </button>
          </div>
        </div>
      )}

      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-white">APIGuard AI</h1>
            <p className="text-xs text-gray-400">Neural Link Interface</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              setSessions((prev) =>
                prev.map((s) => (s.active ? { ...s, messages: [] } : s))
              )
            }
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {isLeftPanelOpen && (
          <div className="w-72 bg-gray-900/50 border-r border-gray-700/50 flex flex-col">
            <div className="p-4 border-b border-gray-700/50">
              <button
                onClick={createNewSession}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                New Session
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => selectSession(session.id)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    session.active
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {session.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.messages.length} messages
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "YOU" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.sender === "YOU"
                      ? "bg-blue-600/20 border border-blue-500/30"
                      : "bg-gray-800/50 border border-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-medium ${
                        msg.sender === "YOU" ? "text-blue-400" : "text-cyan-400"
                      }`}
                    >
                      {msg.sender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-700 rounded-lg">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about API security, rate limiting, authentication..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button className="p-2 hover:bg-gray-700 rounded-lg">
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={isThinking || !inputText.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {isRightPanelOpen && (
          <div className="w-80 bg-gray-900/50 border-l border-gray-700/50 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Agent Preset
                </label>
                <div className="space-y-2">
                  {Object.entries(NEURAL_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setSessions((prev) =>
                          prev.map((s) =>
                            s.active
                              ? {
                                  ...s,
                                  settings: {
                                    ...s.settings,
                                    customPrompt: preset.prompt,
                                    temperature: preset.temp,
                                  },
                                }
                              : s
                          )
                        )
                      }
                      className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                    >
                      {key.replace("_", " ").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Tools
                </label>
                <div className="space-y-2">
                  {NAV_ITEMS.map((item) => (
                    <div
                      key={item.tool}
                      className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg"
                    >
                      <span>{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralLinkInterface;
