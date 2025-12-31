'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">F</span>
          </div>
          FYZO
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#tools" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Tools
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="#about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
            Log in
          </Link>
          <Link 
            href="/get-started" 
            className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            Get Started <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 md:hidden flex flex-col gap-4">
          <Link href="#features" className="text-lg font-medium text-gray-300 hover:text-white">Features</Link>
          <Link href="#tools" className="text-lg font-medium text-gray-300 hover:text-white">Tools</Link>
          <Link href="#pricing" className="text-lg font-medium text-gray-300 hover:text-white">Pricing</Link>
          <Link href="#about" className="text-lg font-medium text-gray-300 hover:text-white">About</Link>
          <hr className="border-white/10 my-2" />
          <Link href="/login" className="text-lg font-medium text-white">Log in</Link>
          <Link href="/get-started" className="px-5 py-3 bg-white text-black text-center font-bold rounded-lg">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
