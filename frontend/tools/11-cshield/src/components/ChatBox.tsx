import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  Mic,
  Check,
  ExternalLink,
  Globe,
  MessageSquare,
  Edit3,
  Monitor,
  FileCode,
  FileText,
  Layout,
  Image as ImageIcon,
  Video,
  Radio,
  MicOff,
  Paperclip,
} from "lucide-react";
import { Message, SettingsState, WorkspaceMode } from "../types";

interface ChatBoxProps {
  messages: Message[];
  isThinking: boolean;
  isRecordingSTT: boolean;
  isLiveActive: boolean;
  onSend: (text: string) => void;
  onFileUpload: (file: File) => void;
  onToggleSTT: () => void;
  onToggleLive: () => void;
  agentSettings: SettingsState;
  onUpdateSettings: (settings: SettingsState) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  isThinking,
  isRecordingSTT,
  isLiveActive,
  onSend,
  onFileUpload,
  onToggleSTT,
  onToggleLive,
  agentSettings,
  onUpdateSettings,
}) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current && agentSettings.workspaceMode === "CHAT") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, agentSettings.workspaceMode]);

  const handleSend = () => {
    if (!inputText.trim() || isThinking) return;
    onSend(inputText.trim());
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]/50 backdrop-blur-sm">
      {/* Workspace Mode Tabs */}
      <div className="flex border-b border-gray-800/50 bg-black/20">
        <button
          onClick={() =>
            onUpdateSettings({ ...agentSettings, workspaceMode: "CHAT" })
          }
          className={`flex items-center gap-2 px-4 py-3 text-sm font-mono border-b-2 transition-colors ${
            agentSettings.workspaceMode === "CHAT"
              ? "border-green-500 text-green-400 bg-green-500/5"
              : "border-transparent text-gray-500 hover:text-gray-400"
          }`}
        >
          <MessageSquare size={16} />
          CHAT
        </button>
        <button
          onClick={() =>
            onUpdateSettings({ ...agentSettings, workspaceMode: "CANVAS" })
          }
          className={`flex items-center gap-2 px-4 py-3 text-sm font-mono border-b-2 transition-colors ${
            agentSettings.workspaceMode === "CANVAS"
              ? "border-cyan-500 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-gray-500 hover:text-gray-400"
          }`}
        >
          <Edit3 size={16} />
          CANVAS
        </button>
        <button
          onClick={() =>
            onUpdateSettings({ ...agentSettings, workspaceMode: "PORTAL" })
          }
          className={`flex items-center gap-2 px-4 py-3 text-sm font-mono border-b-2 transition-colors ${
            agentSettings.workspaceMode === "PORTAL"
              ? "border-purple-500 text-purple-400 bg-purple-500/5"
              : "border-transparent text-gray-500 hover:text-gray-400"
          }`}
        >
          <Globe size={16} />
          PORTAL
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-0">
        {agentSettings.workspaceMode === "CHAT" && (
          <>
            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "YOU" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === "YOU"
                        ? "bg-green-500/10 border border-green-500/30 text-green-100"
                        : "bg-gray-800/50 border border-gray-700 text-gray-300"
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1 font-mono">
                      {msg.sender} • {msg.timestamp}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {msg.text}
                    </div>
                    {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.groundingUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                          >
                            [{i + 1}]
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 max-w-[80%]">
                    <div className="text-xs text-gray-500 mb-1 font-mono">
                      AGENT • {new Date().toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400">
                        Processing neural pathways...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-800/50 p-4 bg-black/20">
              <div className="flex items-end gap-3">
                <div className="flex-grow relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your command..."
                    className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-green-500/50 resize-none font-mono text-sm"
                    rows={1}
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-400 transition-colors"
                    title="Upload file"
                  >
                    <Paperclip size={18} />
                  </button>

                  <button
                    onClick={onToggleSTT}
                    className={`p-2 transition-colors ${
                      isRecordingSTT
                        ? "text-red-400 hover:text-red-300"
                        : "text-gray-500 hover:text-gray-400"
                    }`}
                    title={
                      isRecordingSTT ? "Stop recording" : "Start voice input"
                    }
                  >
                    {isRecordingSTT ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <button
                    onClick={onToggleLive}
                    className={`p-2 transition-colors ${
                      isLiveActive
                        ? "text-green-400 hover:text-green-300"
                        : "text-gray-500 hover:text-gray-400"
                    }`}
                    title={
                      isLiveActive ? "Stop live session" : "Start live session"
                    }
                  >
                    <Radio size={18} />
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isThinking}
                    className="bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-800/50 disabled:text-gray-600 text-green-400 disabled:text-gray-500 p-2 rounded-lg transition-colors"
                    title="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                onChange={onFileChange}
                className="hidden"
                accept="image/*,video/*,text/*,.pdf,.doc,.docx"
              />
            </div>
          </>
        )}

        {agentSettings.workspaceMode === "CANVAS" && (
          <div className="flex-grow p-4">
            <div className="w-full h-full bg-gray-900/50 border border-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Edit3 size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-mono">CANVAS MODE</p>
                <p className="text-sm">Content editing workspace</p>
              </div>
            </div>
          </div>
        )}

        {agentSettings.workspaceMode === "PORTAL" && (
          <div className="flex-grow p-4">
            <div className="w-full h-full bg-gray-900/50 border border-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Globe size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-mono">PORTAL MODE</p>
                <p className="text-sm">External resource integration</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
