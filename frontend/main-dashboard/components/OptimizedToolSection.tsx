'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Tool } from '@/data/tools';
import AnimatedPreview from './AnimatedPreview';
import { useScrollContext } from '@/components/scroll/ScrollContext';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface OptimizedToolSectionProps {
  tool: Tool;
  index: number;
  isAlternate: boolean;
  isVisible: boolean;
}

export default function OptimizedToolSection({ 
  tool, 
  index, 
  isAlternate, 
  isVisible
}: OptimizedToolSectionProps) {
  const { setCurrentSection } = useScrollContext();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  // Mark as visible once it has been in viewport
  useEffect(() => {
    if (isVisible && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [isVisible, hasBeenVisible]);

  useEffect(() => {
    // Only initialize GSAP when section is mounted
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const preview = previewRef.current;
    const headline = headlineRef.current;
    const details = detailsRef.current;
    const stats = statsRef.current;
    const cta = ctaRef.current;
    const number = numberRef.current;

    // Create the main timeline linked to scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onEnter: () => setCurrentSection(index),
        onEnterBack: () => setCurrentSection(index),
      }
    });

    // Animation sequence (unboxing effect) linked to scroll progress
    
    // 0-30%: Deep rising effect (The "Emerging from deep inside" feel)
    // We start with the content pushed down, scaled down, and slightly rotated for depth
    tl.fromTo(contentRef.current,
      { 
        opacity: 0, 
        scale: 0.5, 
        y: '30vh', 
        filter: 'blur(20px)',
        transformPerspective: 1000,
        rotateX: 10
      },
      { 
        opacity: 1, 
        scale: 1, 
        y: '0vh', 
        filter: 'blur(0px)',
        transformPerspective: 1000,
        rotateX: 0,
        duration: 0.8,
        ease: 'power3.out'
      },
      0
    );

    // 0-20%: Fade in number
    tl.fromTo(number, 
      { opacity: 0, scale: 0.8 },
      { opacity: 0.08, scale: 1, duration: 0.2 },
      0
    );

    // 10-50%: Headline slides and fades in
    tl.fromTo(headline,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.4 },
      0.1
    );

    // 20-70%: Preview scales and reveals
    tl.fromTo(preview,
      { 
        opacity: 0, 
        scale: 0.9, 
        x: isAlternate ? -40 : 40,
      },
      { 
        opacity: 1, 
        scale: 1, 
        x: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.5
      },
      0.2
    );

    // 35-65%: Details appear
    tl.fromTo(details,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.3 },
      0.35
    );

    // 45-75%: Stats slide in
    if (stats) {
      tl.fromTo(stats,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.3 },
        0.45
      );
    }

    // 55-75%: CTA button appears
    tl.fromTo(cta,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.2 },
      0.55
    );

    // 70-90%: Hold state (no changes)
    
    // 90-100%: Exit animations (fade out slightly to transition to next)
    tl.to([cta, stats, details, headline, preview, number], {
      opacity: 0,
      scale: 0.95,
      duration: 0.1,
      stagger: 0.01
    }, 0.9);

    return () => {
      tl.kill();
    };
  }, [index, isAlternate, setCurrentSection]);

  // Get the icon component dynamically
  const iconName = tool.icon.split('-').map((word: string) => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  const IconComponent = (Icons as any)[iconName] || Icons.Shield;

  const formattedNumber = String(index + 1).padStart(2, '0');

  return (
    <section 
      ref={sectionRef}
      className="relative h-[200vh] w-full bg-[#050505]"
      style={{ zIndex: 50 - index }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background gradient based on tool color */}
        <div 
          className="absolute inset-0 opacity-10 will-change-transform"
          style={{ background: tool.gradient }}
        />
        
        {/* Large ghost number */}
        <span 
          ref={numberRef}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-[35vw] font-black text-white opacity-0 select-none pointer-events-none will-change-transform"
          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)', color: 'transparent' }}
        >
          {formattedNumber}
        </span>

        {/* Content container */}
        <div 
          ref={contentRef}
          className={`relative z-10 w-full max-w-7xl mx-auto px-8 flex items-center ${
            isAlternate ? 'flex-row-reverse' : 'flex-row'
          } gap-12`}
        >
          {/* Text content side */}
          <div className="flex-1 space-y-6">
            {/* Headline */}
            <div ref={headlineRef} className="space-y-4 will-change-transform opacity-0">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ background: tool.gradient }}
                >
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-white/80">
                  {tool.category}
                </span>
                <span className="text-sm text-white/40 font-mono">
                  {formattedNumber}/50
                </span>
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                {tool.name}
              </h2>
              
              <p className="text-xl lg:text-2xl font-light text-white/80">
                {tool.tagline}
              </p>
            </div>

            {/* Details */}
            <div ref={detailsRef} className="space-y-5 will-change-transform opacity-0">
              <p className="text-base text-white/60 max-w-xl leading-relaxed">
                {tool.description}
              </p>
              
              <ul className="grid grid-cols-2 gap-2">
                {tool.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/70">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: tool.gradient }}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats */}
            {tool.stats && (
              <div ref={statsRef} className="flex gap-8 will-change-transform opacity-0">
                {tool.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div 
                      className="text-2xl font-bold bg-clip-text text-transparent"
                      style={{ backgroundImage: tool.gradient }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Button */}
            <div ref={ctaRef} className="will-change-transform opacity-0">
              <Link 
                href={`https://${tool.subdomain}`}
                className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:scale-105 hover:shadow-2xl"
                style={{ background: tool.gradient }}
              >
                Launch {tool.name}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Preview side */}
          <div 
            ref={previewRef}
            className="flex-1 h-[65vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur will-change-transform opacity-0"
          >
            {/* Only render preview content when visible for performance */}
            {hasBeenVisible && <AnimatedPreview tool={tool} />}
          </div>
        </div>

        {/* Bottom scroll indicator (only on first visible section) */}
        {index === 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
            <span className="text-sm">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 rounded-full bg-white/50 animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
