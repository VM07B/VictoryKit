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
        { scale: 1, opacity: 1, stagger: 0.1, duration: 1.5, ease: 'power3.out' },
        0
      );
    }

    // Title animation - Crystal clear smooth reveal
    tl.fromTo(title,
      { y: 100, opacity: 0, filter: 'blur(20px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
      0.2
    );

    // Subtitle
    tl.fromTo(subtitle,
      { y: 50, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
      0.4
    );

    // Stats
    if (stats) {
      tl.fromTo(stats.children,
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.8, ease: 'back.out(1.2)' },
        0.6
      );
    }

    // CTA
    tl.fromTo(cta,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      0.8
    );

    // Grid reveal
    if (grid) {
      tl.fromTo(grid,
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' },
        0
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
      className="relative h-screen w-full overflow-hidden bg-[#030014]"
    >
      {/* Animated gradient background - Mixed Colors */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-[#030014] to-[#030014]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent" />
      
      {/* Grid pattern overlay */}
      <div 
        ref={gridRef}
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(120, 119, 198, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 119, 198, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      {/* Floating orbs - Enhanced for mixed colors */}
      <div ref={orbsRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[10%] right-[-5%] w-[35vw] h-[35vw] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30vw] h-[30vw] bg-pink-600/20 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[10%] w-[25vw] h-[25vw] bg-cyan-500/20 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white/80 font-medium">50 AI-Powered Security Tools</span>
        </div>

        {/* Title */}
        <h1 
          ref={titleRef}
          className="text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tight mb-6 drop-shadow-2xl"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
            FYZO
          </span>
          <span className="text-white">.XYZ</span>
        </h1>

        {/* Subtitle */}
        <p 
          ref={subtitleRef}
          className="text-2xl md:text-3xl text-white/70 max-w-3xl mb-12 leading-relaxed font-light"
        >
          The future of cybersecurity. <br />
          <span className="text-white/90 font-normal">50 tools. One mission. Total protection.</span>
        </p>

        {/* Stats */}
        <div ref={statsRef} className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-300">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-white/50">Security Tools</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm text-white/50">Uptime SLA</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors duration-300">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">10M+</div>
              <div className="text-sm text-white/50">Threats Blocked</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors duration-300">
              <Globe className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">Global</div>
              <div className="text-sm text-white/50">Coverage</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-col items-center gap-4">
          <button className="group relative px-8 py-4 rounded-xl bg-white text-black font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <span className="relative z-10">Explore All Tools</span>
          </button>
          <span className="text-white/40 text-sm animate-pulse">Scroll to discover</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">maula.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white transition-colors font-medium">
              Login
            </button>
            <button className="px-6 py-2 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all font-medium backdrop-blur-sm">
              Get Started
            </button>
          </div>
        </div>
      </nav>
    </section>
  );
}
