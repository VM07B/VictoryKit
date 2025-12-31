'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollProvider } from '@/components/scroll/ScrollContext';
import HeroSection from '@/components/HeroSection';
import SideNavigation from '@/components/SideNavigation';
import OptimizedToolSection from '@/components/OptimizedToolSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { tools } from '@/data/tools';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollHomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0, 1, 2]));

  // Track which sections are near viewport for lazy loading content
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Calculate which sections should be visible (buffer of 2 sections)
      const heroHeight = viewportHeight;
      const sectionHeight = viewportHeight * 2; // Approximate height with pinning
      
      const currentSectionIndex = Math.floor((scrollY - heroHeight) / sectionHeight);
      const buffer = 2;
      
      const newVisible = new Set<number>();
      for (let i = Math.max(0, currentSectionIndex - buffer); i <= Math.min(tools.length - 1, currentSectionIndex + buffer); i++) {
        newVisible.add(i);
      }
      
      setVisibleSections(newVisible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // GSAP defaults for smoother animations
    gsap.defaults({
      ease: 'power2.out',
      duration: 0.5
    });

    // Configure ScrollTrigger for performance
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    // Refresh ScrollTrigger after everything loads
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <ScrollProvider totalSections={tools.length}>
      <div 
        ref={containerRef} 
        className="bg-[#050505] text-white"
      >
        <Header />
        
        {/* Hero Section */}
        <HeroSection />

        {/* Tool Sections - Each pinned and animated */}
        <main className="relative">
          {tools.map((tool, index) => (
            <OptimizedToolSection
              key={tool.id}
              tool={tool}
              index={index}
              isAlternate={index % 2 === 1}
              isVisible={visibleSections.has(index)}
            />
          ))}
        </main>

        <Footer />

        {/* Side Navigation */}
        <SideNavigation />
      </div>
    </ScrollProvider>
  );
}
