import React from "react";
import { Activity, Cpu, Wifi } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/50 border-t border-gray-800/50 px-4 py-2 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-4 text-gray-600">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-green-500" />
          <span>SYSTEM_ACTIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu size={12} className="text-cyan-500" />
          <span>NEURAL_LOAD_23%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi size={12} className="text-purple-500" />
          <span>SECURE_LINK</span>
        </div>
      </div>

      <div className="text-gray-700">
        <span>INCIDENT_RESPONSE_AI_v1.0</span>
      </div>
    </footer>
  );
};

export default Footer;
