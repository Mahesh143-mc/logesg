import React, { useState, useEffect, useMemo } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl } from '../../../lib/utils';

interface HeroSectionProps {
  copy: any;
  setCurrentCustomerPage: (page: string) => void;
  handleGetStartedScroll: () => void;
  siteImages?: Record<string, string>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  copy,
  setCurrentCustomerPage,
  handleGetStartedScroll,
  siteImages = {} as Record<string, string>
}) => {
  const bgImages = useMemo(() => [
    siteImages.hero_1 || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop",
    siteImages.hero_2 || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1600&auto=format&fit=crop",
    siteImages.hero_3 || "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=1600&auto=format&fit=crop",
    siteImages.hero_4 || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1600&auto=format&fit=crop",
    siteImages.hero_5 || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1600&auto=format&fit=crop",
    siteImages.hero_6 || "https://images.unsplash.com/photo-1530906358829-e84b2769270f?q=80&w=1600&auto=format&fit=crop"
  ], [siteImages]);

  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % bgImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  return (
    <section className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden bg-emerald-950">
      
      {/* Background Image Slider (Fade + Scale Transition) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <m.div
            key={currentBg}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1.03 }}
            exit={{ opacity: 0, scale: 1.0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getOptimizedUrl(bgImages[currentBg], 1600)})` }}
          />
        </AnimatePresence>
        
        {/* Multi-layered cinematic gradient overlays for pristine readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/45 to-emerald-950 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,44,34,0.65)_100%)] z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent z-10" />
      </div>



      {/* Center Aligned Text Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center space-y-6 md:space-y-8 select-none">
        
        {/* Welcome Text */}
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-[0.35em] text-emerald-400 font-poppins">
            {copy.welcome}
          </span>
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent mt-3" />
        </m.div>

        {/* Main Title Heading */}
        <div className="overflow-hidden py-2">
          <m.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter leading-none font-poppins relative"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-200">
              Logesh
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 drop-shadow-[0_4px_12px_rgba(16,185,129,0.15)]">
              Vivasayi
            </span>
          </m.h1>
        </div>

        {/* Subheading */}
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-slate-300 font-extrabold text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] max-w-2xl mx-auto leading-relaxed block"
        >
          {copy.subheadingText}
        </m.p>

        {/* Glowing Action Buttons */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6"
        >
          <button
            onClick={() => {
              setCurrentCustomerPage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-10 py-4.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-2xl shadow-emerald-600/30 active:scale-95 flex items-center justify-center space-x-2 border border-emerald-500 hover:shadow-emerald-500/50 cursor-pointer"
          >
            <span>{copy.orderNow}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGetStartedScroll}
            className="w-full sm:w-auto px-10 py-4.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 border border-white/20 backdrop-blur-md active:scale-95 flex items-center justify-center space-x-2 hover:border-white/40 cursor-pointer"
          >
            <span>{copy.exploreMore}</span>
          </button>
        </m.div>

      </div>

      {/* Cinematic Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-2 pointer-events-none opacity-60">
        <m.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 bg-emerald-400 rounded-full" />
        </m.div>
      </div>

    </section>
  );
};
