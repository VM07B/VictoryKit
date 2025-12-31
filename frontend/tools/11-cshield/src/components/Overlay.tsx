import React from "react";
import { Terminal } from "lucide-react";

interface OverlayProps {
  active: boolean;
  onActivate: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ active, onActivate }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Terminal
            size={64}
            className="text-green-500 mx-auto mb-4 animate-pulse"
          />
          <h1 className="text-4xl font-bold text-green-400 font-mono tracking-wider mb-2">
            NEURAL LINK
          </h1>
          <p className="text-gray-400 text-lg font-mono">
            Incident Response AI Interface
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div
              className="w-3 h-3 bg-green-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-green-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>

          <button
            onClick={onActivate}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 hover:border-green-500 px-8 py-3 rounded-lg font-mono text-lg tracking-wider transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            INITIALIZE SYSTEM
          </button>
        </div>

        <div className="mt-8 text-xs text-gray-600 font-mono">
          <p>SECURE NEURAL INTERFACE v3.0</p>
          <p>INCIDENT RESPONSE PROTOCOL ACTIVE</p>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
