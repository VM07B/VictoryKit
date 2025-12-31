'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ScrollContextType {
  currentSection: number;
  setCurrentSection: (section: number) => void;
  totalSections: number;
  scrollProgress: number;
  isScrolling: boolean;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ 
  children, 
  totalSections 
}: { 
  children: ReactNode;
  totalSections: number;
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Set scrolling to false after scroll ends
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // Calculate overall scroll progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / scrollHeight;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <ScrollContext.Provider value={{
      currentSection,
      setCurrentSection,
      totalSections,
      scrollProgress,
      isScrolling
    }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within ScrollProvider');
  }
  return context;
}
