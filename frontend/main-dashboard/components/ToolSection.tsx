'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Tool } from '@/data/tools';
import { useScrollContext } from './scroll/ScrollContext';
import AnimatedPreview from './AnimatedPreview';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ToolSectionProps {
  tool: Tool;
  index: number;
  isAlternate: boolean;
}

export default function ToolSection({ tool, index, isAlternate }: ToolSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const { setCurrentSection } = useScrollContext();

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const content = contentRef.current;
    const preview = previewRef.current;
    const headline = headlineRef.current;
    const details = detailsRef.current;
    const stats = statsRef.current;
    const cta = ctaRef.current;
    const number = numberRef.current;

    // Create the main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=150%', // Extended scroll distance for pinning
        pin: true,
        scrub: 1, // Smooth scrubbing tied to scroll
        anticipatePin: 1,
        onEnter: () => setCurrentSection(index),
        onEnterBack: () => setCurrentSection(index),
      }
    });

    // Animation sequence (unboxing effect)
    
    // 1. Number fades in first (background element)
    tl.fromTo(number, 
      { opacity: 0, scale: 0.8 },
      { opacity: 0.1, scale: 1, duration: 0.2 },
      0
    );

    // 2. Headline slides and fades in
    tl.fromTo(headline,
      { opacity: 0, y: 80, clipPath: 'inset(100% 0% 0% 0%)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4 },
      0.1
    );

    // 3. Preview scales and reveals (the hero moment)
    tl.fromTo(preview,
      { 
        opacity: 0, 
        scale: 0.8, 
        x: isAlternate ? -100 : 100,
        clipPath: 'inset(10% 10% 10% 10%)'
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

    // 4. Details appear with stagger
    tl.fromTo(details,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.3 },
      0.35
    );

    // 5. Stats slide in
    if (stats) {
      tl.fromTo(stats,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.3 },
        0.45
      );
    }

    // 6. CTA button appears last
    tl.fromTo(cta,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.2 },
      0.55
    );

    // Hold at full visibility
    tl.to({}, { duration: 0.3 }, 0.7);

    // Exit animations (reverse order)
    tl.to([cta, stats, details], {
      opacity: 0,
      y: -30,
      duration: 0.2,
      stagger: 0.05
    }, 0.85);

    tl.to(preview, {
      opacity: 0,
      scale: 0.9,
      y: -50,
      duration: 0.2
    }, 0.9);

    tl.to(headline, {
      opacity: 0,
      y: -80,
      duration: 0.2
    }, 0.95);

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [index, isAlternate, setCurrentSection]);

  // Get the icon component dynamically
  const IconComponent = (Icons as any)[tool.icon.split('-').map((word: string) => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')] || Icons.Shield;

  const formattedNumber = String(index + 1).padStart(2, '0');

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-slate-900"
      style={{ zIndex: 50 - index }}
    >
      {/* Background gradient based on tool color */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ background: tool.gradient }}
      />
      
      {/* Large ghost number */}
      <span 
        ref={numberRef}
        className="absolute right-8 top-1/2 -translate-y-1/2 text-[40vw] font-black text-white opacity-0 select-none pointer-events-none"
        style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)', color: 'transparent' }}
      >
        {formattedNumber}
      </span>

      {/* Content container */}
      <div 
        ref={contentRef}
        className={`relative z-10 h-full max-w-7xl mx-auto px-8 flex items-center ${
          isAlternate ? 'flex-row-reverse' : 'flex-row'
        } gap-12`}
      >
        {/* Text content side */}
        <div className="flex-1 space-y-8">
          {/* Headline */}
          <div ref={headlineRef} className="space-y-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ background: tool.gradient }}
              >
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-white/80">
                {tool.category}
              </span>
            </div>
            
            <h2 className="text-6xl lg:text-7xl font-black text-white leading-tight">
              {tool.name}
            </h2>
            
            <p className="text-2xl lg:text-3xl font-light text-white/80">
              {tool.tagline}
            </p>
          </div>

          {/* Details */}
          <div ref={detailsRef} className="space-y-6">
            <p className="text-lg text-white/60 max-w-xl leading-relaxed">
              {tool.description}
            </p>
            
            <ul className="grid grid-cols-2 gap-3">
              {tool.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          {tool.stats && (
            <div ref={statsRef} className="flex gap-8">
              {tool.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div 
                    className="text-3xl font-bold bg-clip-text text-transparent"
                    style={{ backgroundImage: tool.gradient }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <div ref={ctaRef}>
            <Link 
              href={`https://${tool.subdomain}`}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl"
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
          className="flex-1 h-[70vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur"
        >
          <AnimatedPreview tool={tool} />
        </div>
      </div>

      {/* Bottom scroll indicator (only on first section) */}
      {index === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-white/50 animate-bounce" />
          </div>
        </div>
      )}
    </section>
  );
}
