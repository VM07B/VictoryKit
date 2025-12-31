'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, ChevronDown, Sparkles, Lock, Zap, Globe } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const hero = heroRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const stats = statsRef.current;
    const cta = ctaRef.current;
    const grid = gridRef.current;
    const orbs = orbsRef.current;

    // Initial animations (on load)
    const tl = gsap.timeline();

    // Animate orbs first (background)
    if (orbs) {
      tl.fromTo(orbs.children,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.1, duration: 1, ease: 'elastic.out(1, 0.5)' },
        0
      );
    }

    // Title animation
    tl.fromTo(title,
      { y: 100, opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' },
      { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power4.out' },
      0.3
    );

    // Subtitle
    tl.fromTo(subtitle,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      0.5
    );

    // Stats
    if (stats) {
      tl.fromTo(stats.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' },
        0.7
      );
    }

    // CTA
    tl.fromTo(cta,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
      0.9
    );

    // Grid reveal
    if (grid) {
      tl.fromTo(grid,
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        0.5
      );
    }

    // Scroll-triggered exit animation
    const exitTl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=50%',
        scrub: 1,
      }
    });

    exitTl.to(title, { y: -100, opacity: 0, scale: 0.9 }, 0);
    exitTl.to(subtitle, { y: -80, opacity: 0 }, 0.1);
    exitTl.to(stats, { y: -60, opacity: 0 }, 0.15);
    exitTl.to(cta, { y: -40, opacity: 0 }, 0.2);
    if (orbs) {
      exitTl.to(orbs.children, { scale: 1.5, opacity: 0, stagger: 0.05 }, 0);
    }

    // Continuous floating animation for orbs
    if (orbs) {
      Array.from(orbs.children).forEach((orb, i) => {
        gsap.to(orb, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          duration: `random(4, 6)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3
        });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === hero) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden bg-slate-900"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
      
      {/* Grid pattern overlay */}
      <div 
        ref={gridRef}
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating orbs */}
      <div ref={orbsRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-blue-600/25 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-600/20 rounded-full blur-[80px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur border border-white/10">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white/70">50 AI-Powered Security Tools</span>
        </div>

        {/* Title */}
        <h1 
          ref={titleRef}
          className="text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tight mb-6"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
            FYZO
          </span>
          <span className="text-white/90">.XYZ</span>
        </h1>

        {/* Subtitle */}
        <p 
          ref={subtitleRef}
          className="text-2xl md:text-3xl text-white/60 max-w-3xl mb-12 leading-relaxed"
        >
          The future of cybersecurity. <br />
          <span className="text-white/80">50 tools. One mission. Total protection.</span>
        </p>

        {/* Stats */}
        <div ref={statsRef} className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-white/50">Security Tools</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm text-white/50">Uptime SLA</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">10M+</div>
              <div className="text-sm text-white/50">Threats Blocked</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">Global</div>
              <div className="text-sm text-white/50">Coverage</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-col items-center gap-4">
          <button className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
            Explore All Tools
          </button>
          <span className="text-white/40 text-sm">Scroll to discover</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-8 h-14 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-2 h-4 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
        </div>
        <ChevronDown className="w-5 h-5 text-white/30" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">FYZO.XYZ</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white transition-colors">
              Login
            </button>
            <button className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>
    </section>
  );
}
