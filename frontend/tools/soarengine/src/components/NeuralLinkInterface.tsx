import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Plus,
  Settings,
  Trash2,
  Workflow,
  MessageSquare,
} from "lucide-react";
import { callGemini } from "../services/geminiService";
import { DEFAULT_SETTINGS, NAV_ITEMS } from "../constants";
import type { Message, ChatSession, SettingsState } from "../types";

const NeuralLinkInterface: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "1",
      name: "SOAR Session",
      active: true,
      messages: [
        {
          id: "1",
          sender: "SYSTEM",
          text: "SOAREngine AI initialized. I can help you create playbooks, manage integrations, and automate security responses.",
          timestamp: new Date().toISOString(),
        },
      ],
      settings: DEFAULT_SETTINGS,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.active) || sessions[0];
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "YOU",
      text: input,
      timestamp: new Date().toISOString(),
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, messages: [...s.messages, userMsg] } : s
      )
    );
    setInput("");
    setIsLoading(true);
    try {
      const response = await callGemini(input, activeSession.settings);
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "AGENT",
        text: response.text,
        timestamp: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.active ? { ...s, messages: [...s.messages, agentMsg] } : s
        )
      );
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "SYSTEM",
        text: "Error processing request.",
        timestamp: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.active ? { ...s, messages: [...s.messages, errMsg] } : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      active: true,
      messages: [
        {
          id: "1",
          sender: "SYSTEM",
          text: "New SOAR session started.",
          timestamp: new Date().toISOString(),
        },
      ],
      settings: DEFAULT_SETTINGS,
    };
    setSessions((prev) => [
      ...prev.map((s) => ({ ...s, active: false })),
      newSession,
    ]);
  };
  const switchSession = (id: string) =>
    setSessions((prev) => prev.map((s) => ({ ...s, active: s.id === id })));
  const deleteSession = (id: string) => {
    if (sessions.length > 1)
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (!remaining.some((s) => s.active)) remaining[0].active = true;
        return remaining;
      });
  };
  const updateSettings = (updates: Partial<SettingsState>) =>
    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, settings: { ...s.settings, ...updates } } : s
      )
    );

  return (
    <div className="min-h-screen matrix-bg flex">
      <aside className="w-64 bg-gray-900/80 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
        <div className="p-4">
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => switchSession(session.id)}
              className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group ${
                session.active
                  ? "bg-cyan-500/20 border border-cyan-500/50"
                  : "hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-sm truncate">{session.name}</span>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-700 space-y-2">
          {NAV_ITEMS.slice(0, 3).map((item) => (
            <button
              key={item.tool}
              onClick={() => updateSettings({ activeTool: item.tool })}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                activeSession.settings.activeTool === item.tool
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Workflow className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-semibold text-white">
                {activeSession.settings.agentName}
              </h1>
              <p className="text-xs text-gray-400">SOAR AI Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </header>

        {showSettings && (
          <div className="bg-gray-800/50 border-b border-gray-700 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400">Temperature</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={activeSession.settings.temperature}
                onChange={(e) =>
                  updateSettings({ temperature: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Model</label>
              <select
                value={activeSession.settings.model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="cyber-input text-sm mt-1"
              >
                <option value="gemini-2.5-flash-preview-05-20">
                  Gemini 2.5 Flash
                </option>
                <option value="gemini-2.5-pro-preview-05-06">
                  Gemini 2.5 Pro
                </option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400">Custom Prompt</label>
              <textarea
                value={activeSession.settings.customPrompt}
                onChange={(e) =>
                  updateSettings({ customPrompt: e.target.value })
                }
                className="cyber-input text-sm mt-1 h-16 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeSession.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "YOU" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  msg.sender === "YOU"
                    ? "bg-cyan-500 text-white"
                    : msg.sender === "AGENT"
                    ? "bg-gray-800 text-gray-100"
                    : "bg-gray-700/50 text-gray-400 text-sm"
                }`}
              >
                {msg.sender !== "YOU" && (
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.sender === "AGENT"
                      ? activeSession.settings.agentName
                      : "SYSTEM"}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div className="text-xs opacity-60 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="Ask about playbooks, integrations, automation..."
              className="flex-1 cyber-input"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NeuralLinkInterface;
