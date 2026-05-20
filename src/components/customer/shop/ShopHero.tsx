import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, X } from 'lucide-react';

interface ShopHeroProps {
  language: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  t: (key: string) => string;
}

export function ShopHero({ language, searchTerm, setSearchTerm, t }: ShopHeroProps) {
  return (
    <section className="relative w-full h-[360px] md:h-[420px] pt-24 md:pt-28 flex items-center overflow-hidden">
      {/* Background Image with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop"
          alt="Farm Products Banner"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.8]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-zinc-950/90 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/30 via-transparent to-transparent z-10" />
      </div>

      {/* Hero Grid Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="text-white space-y-3">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-xs md:text-sm font-semibold tracking-wide text-emerald-300/80">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => window.location.reload()}>
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'அனைத்து தொகுப்புகள்' : 'All collections'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-100 font-bold">{language === 'ta' ? 'பொருட்கள்' : 'Products'}</span>
          </nav>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
          >
            {language === 'ta' ? 'பண்ணை பொருட்கள்' : 'Farm Products'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-emerald-200/80 text-sm md:text-base max-w-xl font-medium tracking-wide"
          >
            {language === 'ta' ? 'விவசாயப் பண்ணைகளிலிருந்து நேரடியாக புதிய பொருட்கள்' : 'Fresh products directly from farms'}
          </motion.p>
        </div>

        {/* Search Bar inside Hero aligned right */}
        <div className="w-full md:w-[360px] lg:w-[420px] flex-shrink-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border border-transparent rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-emerald-550/30 focus:border-emerald-500 transition-all font-medium shadow-xl"
            />
            <AnimatePresence>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
