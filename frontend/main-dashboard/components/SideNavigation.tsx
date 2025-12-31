'use client';

import { useEffect, useState } from 'react';
import { useScrollContext } from './scroll/ScrollContext';
import { tools } from '@/data/tools';

export default function SideNavigation() {
  const { currentSection, totalSections, scrollProgress } = useScrollContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show navigation after scrolling past hero
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    // Each section is pinned with 150% scroll distance
    // Account for hero section (1 screen) + section index
    const heroHeight = window.innerHeight;
    const sectionScrollHeight = window.innerHeight * 2; // 200% for sticky sections
    const targetScroll = heroHeight + (index * sectionScrollHeight);
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  // Show dots for visible range around current section
  const visibleRange = 5;
  const startIndex = Math.max(0, currentSection - visibleRange);
  const endIndex = Math.min(totalSections - 1, currentSection + visibleRange);
  const visibleTools = tools.slice(startIndex, endIndex + 1);

  return (
    <nav className="fixed right-8 top-0 bottom-0 z-50 flex flex-col justify-center items-end pointer-events-none">
      <div className="relative flex items-center h-[60vh] pointer-events-auto">
        {/* Track Line (The "Pipe") */}
        <div className="absolute right-[11px] top-0 bottom-0 w-[2px] bg-white/10 rounded-full overflow-hidden">
          {/* Active Track Fill */}
          <div 
            className="w-full bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 transition-all duration-300 ease-out"
            style={{ height: `${(scrollProgress * 100)}%` }}
          />
        </div>

        {/* The "Train" Indicator */}
        <div 
          className="absolute right-[7px] w-[10px] h-[40px] bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] z-10 transition-all duration-100 ease-linear"
          style={{ 
            top: `${(scrollProgress * 100)}%`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-300 rounded-full" />
        </div>

        {/* Navigation Items Container */}
        <div className="flex flex-col gap-1 py-4 pr-8 relative">
          {visibleTools.map((tool, i) => {
            const actualIndex = startIndex + i;
            const isActive = actualIndex === currentSection;
            
            return (
              <button
                key={tool.id}
                onClick={() => scrollToSection(actualIndex)}
                className="group flex items-center justify-end gap-4 h-8 transition-all duration-300"
              >
                {/* Tool name */}
                <span 
                  className={`text-sm font-medium tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'opacity-100 text-white translate-x-0' 
                      : 'opacity-0 text-white/40 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
                  }`}
                >
                  {tool.name}
                </span>
                
                {/* Tick Mark on Track */}
                <div 
                  className={`relative w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-white scale-150 shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                      : 'bg-white/20 group-hover:bg-white/60'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Current section indicator */}
      <div className="absolute bottom-8 right-0 text-right pointer-events-auto">
        <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Section</div>
        <div className="text-white font-mono text-xl font-bold tracking-tighter">
          {String(currentSection + 1).padStart(2, '0')}
          <span className="text-white/20 text-base font-normal mx-1">/</span>
          <span className="text-white/40 text-base font-normal">{String(totalSections).padStart(2, '0')}</span>
        </div>
      </div>
    </nav>
  );
}
