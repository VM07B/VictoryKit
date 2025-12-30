import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

interface Tool {
  id: number;
  name: string;
  description: string;
  category: string;
  subdomain: string;
  color: string;
}

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`https://${tool.subdomain}`} target="_blank">
      <div className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-slate-800/50 backdrop-blur p-6 transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 cursor-pointer h-full">
        {/* Background gradient effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`}
        ></div>

        {/* Tool number badge */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-900/50 backdrop-blur flex items-center justify-center text-xs text-purple-300 font-bold">
          {tool.id}
        </div>

        <div className="flex items-start justify-between mb-4 relative">
          <div
            className={`w-14 h-14 rounded-lg bg-gradient-to-br ${tool.color} p-3 shadow-lg`}
          >
            <Shield className="w-full h-full text-white" />
          </div>
          <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div className="relative">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-purple-200 mb-4 line-clamp-2">
            {tool.description}
          </p>

          <div className="flex items-center justify-between text-xs">
            <span className="px-3 py-1 rounded-full bg-purple-900/50 backdrop-blur text-purple-300 border border-purple-500/30">
              {tool.category}
            </span>
            <span className="text-purple-400 font-mono text-[10px]">
              {tool.subdomain}
            </span>
          </div>
        </div>

        {/* Hover effect indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
      </div>
    </Link>
  );
}
