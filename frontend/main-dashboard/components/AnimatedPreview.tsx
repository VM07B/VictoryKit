'use client';

import { useEffect, useRef } from 'react';
import { Tool } from '@/data/tools';
import { gsap } from 'gsap';

interface AnimatedPreviewProps {
  tool: Tool;
}

export default function AnimatedPreview({ tool }: AnimatedPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !particlesRef.current) return;

    const particles = particlesRef.current.children;
    
    // Animate floating particles
    Array.from(particles).forEach((particle, i) => {
      gsap.to(particle, {
        y: `random(-20, 20)`,
        x: `random(-10, 10)`,
        rotation: `random(-15, 15)`,
        duration: `random(3, 5)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.2
      });
    });

    // Cleanup
    return () => {
      gsap.killTweensOf(particles);
    };
  }, []);

  // Different preview layouts based on tool category
  const renderPreviewContent = () => {
    const baseCardClass = "absolute rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl";
    
    return (
      <div ref={containerRef} className="relative w-full h-full p-8">
        {/* Floating particles background */}
        <div ref={particlesRef} className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 100 + 20,
                height: Math.random() * 100 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `${tool.gradient}`,
                opacity: 0.1 + Math.random() * 0.1,
                filter: 'blur(40px)'
              }}
            />
          ))}
        </div>

        {/* Main preview card */}
        <div 
          className={`${baseCardClass} top-8 left-8 right-8 h-32 bg-slate-800/80 p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl"
                style={{ background: tool.gradient }}
              />
              <div>
                <div className="text-white font-semibold">{tool.name}</div>
                <div className="text-white/50 text-sm">Active Monitoring</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm">Online</span>
            </div>
          </div>
          
          {/* Animated progress bar */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full animate-pulse"
              style={{ 
                background: tool.gradient,
                width: '75%',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>

        {/* Stats cards */}
        <div className={`${baseCardClass} top-48 left-8 w-40 h-32 bg-slate-800/80 p-4`}>
          <div className="text-white/50 text-xs uppercase tracking-wider">Threats Blocked</div>
          <div 
            className="text-3xl font-bold mt-2 bg-clip-text text-transparent"
            style={{ backgroundImage: tool.gradient }}
          >
            12.4K
          </div>
          <div className="text-green-400 text-sm mt-1">↑ 23% today</div>
        </div>

        <div className={`${baseCardClass} top-48 left-56 w-40 h-32 bg-slate-800/80 p-4`}>
          <div className="text-white/50 text-xs uppercase tracking-wider">Response Time</div>
          <div 
            className="text-3xl font-bold mt-2 bg-clip-text text-transparent"
            style={{ backgroundImage: tool.gradient }}
          >
            48ms
          </div>
          <div className="text-green-400 text-sm mt-1">Optimal</div>
        </div>

        {/* Activity feed */}
        <div className={`${baseCardClass} top-48 right-8 w-48 h-48 bg-slate-800/80 p-4 overflow-hidden`}>
          <div className="text-white/50 text-xs uppercase tracking-wider mb-3">Live Activity</div>
          <div className="space-y-2">
            {[
              { status: 'blocked', text: 'Threat blocked' },
              { status: 'scanned', text: 'Scan complete' },
              { status: 'alert', text: 'New alert' },
              { status: 'blocked', text: 'Attack prevented' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  item.status === 'blocked' ? 'bg-red-500' :
                  item.status === 'alert' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="text-white/70">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom chart area */}
        <div className={`${baseCardClass} bottom-8 left-8 right-8 h-40 bg-slate-800/80 p-6`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/50 text-sm">Threat Analysis - Last 7 Days</span>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ background: tool.gradient }} />
                <span className="text-white/50">Detected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded bg-green-500" />
                <span className="text-white/50">Blocked</span>
              </div>
            </div>
          </div>
          
          {/* Animated chart bars */}
          <div className="flex items-end gap-2 h-20">
            {[40, 65, 55, 80, 70, 90, 75].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5">
                  <div 
                    className="flex-1 rounded-t transition-all duration-1000"
                    style={{ 
                      height: `${height}%`,
                      background: tool.gradient,
                      opacity: 0.7
                    }}
                  />
                  <div 
                    className="flex-1 bg-green-500 rounded-t transition-all duration-1000"
                    style={{ height: `${height - 5}%`, opacity: 0.7 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating badge */}
        <div 
          className="absolute top-4 right-4 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg"
          style={{ background: tool.gradient }}
        >
          AI-Powered
        </div>
      </div>
    );
  };

  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden"
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, ${tool.gradient.replace('linear-gradient(135deg, ', '').replace(')', '').split(',')[0]}, transparent 50%)`
        }}
      />
      
      {renderPreviewContent()}
    </div>
  );
}
