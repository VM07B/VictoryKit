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
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-2">
      {/* Progress indicator */}
      <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="w-full bg-gradient-to-b from-purple-500 to-pink-500 transition-all duration-300"
          style={{ height: `${(scrollProgress * 100)}%` }}
        />
      </div>

      {/* Navigation dots */}
      <div className="flex flex-col gap-2 py-4">
        {/* Show "..." if there are sections before */}
        {startIndex > 0 && (
          <button
            onClick={() => scrollToSection(0)}
            className="text-white/30 text-xs hover:text-white/60 transition-colors pr-4"
          >
            ↑ {startIndex} more
          </button>
        )}

        {visibleTools.map((tool, i) => {
          const actualIndex = startIndex + i;
          const isActive = actualIndex === currentSection;
          
          return (
            <button
              key={tool.id}
              onClick={() => scrollToSection(actualIndex)}
              className="group flex items-center gap-3 transition-all duration-300"
            >
              {/* Tool name (appears on hover) */}
              <span 
                className={`text-sm text-right transition-all duration-300 ${
                  isActive 
                    ? 'opacity-100 text-white translate-x-0' 
                    : 'opacity-0 text-white/50 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              >
                {tool.name}
              </span>
              
              {/* Dot */}
              <div 
                className={`relative transition-all duration-300 ${
                  isActive ? 'w-4 h-4' : 'w-2 h-2 group-hover:w-3 group-hover:h-3'
                }`}
              >
                <div 
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'scale-100' 
                      : 'scale-0 group-hover:scale-100'
                  }`}
                  style={{ background: tool.gradient }}
                />
                <div 
                  className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? 'border-white' 
                      : 'border-white/30 group-hover:border-white/60'
                  }`}
                />
              </div>
            </button>
          );
        })}

        {/* Show "..." if there are sections after */}
        {endIndex < totalSections - 1 && (
          <button
            onClick={() => scrollToSection(totalSections - 1)}
            className="text-white/30 text-xs hover:text-white/60 transition-colors pr-4"
          >
            ↓ {totalSections - 1 - endIndex} more
          </button>
        )}
      </div>

      {/* Current section indicator */}
      <div className="mt-4 text-right">
        <div className="text-white/30 text-xs">Section</div>
        <div className="text-white font-mono text-lg">
          {String(currentSection + 1).padStart(2, '0')}/{String(totalSections).padStart(2, '0')}
        </div>
      </div>
    </nav>
  );
}
