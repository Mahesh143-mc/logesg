import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, ChevronDown, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ShopSidebarProps {
  language: string;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  availability: string;
  setAvailability: (status: string) => void;
  organicFilter: boolean;
  setOrganicFilter: (val: boolean) => void;
  products: any[];
  t: (key: string) => string;
}

export function ShopSidebar({
  language,
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  availability,
  setAvailability,
  organicFilter,
  setOrganicFilter,
  products,
  t
}: ShopSidebarProps) {
  // Accordion Sidebar Collapses
  const [collapseCat, setCollapseCat] = useState(true);
  const [collapsePrice, setCollapsePrice] = useState(true);
  const [collapseStock, setCollapseStock] = useState(true);
  const [collapseType, setCollapseType] = useState(true);

  const hasActiveFilters = selectedCategory !== t('all') || priceRange !== 'all' || availability !== 'all' || organicFilter;

  const handleClearAll = () => {
    setSelectedCategory(t('all'));
    setPriceRange('all');
    setAvailability('all');
    setOrganicFilter(false);
  };

  return (
    <aside className="hidden lg:block lg:col-span-3 space-y-6">
      <div className="sticky top-24 space-y-6">
        {/* Sidebar Header Title */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
              {language === 'ta' ? 'வடிகட்டிகள்' : 'Filters'}
            </h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 tracking-widest uppercase"
            >
              {t('clear_all')}
            </button>
          )}
        </div>

        {/* Accordion 1: Categories */}
        <div className="bg-[#ecf3ee] rounded-2xl border border-emerald-900/10 hover:border-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.06)] overflow-hidden transition-all duration-300">
          <button
            onClick={() => setCollapseCat(!collapseCat)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-slate-900 text-sm hover:bg-emerald-500/5 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
              <span className="uppercase tracking-wider font-black text-[13px] md:text-sm text-slate-800">
                {t('category')}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", collapseCat && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {collapseCat && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-1 space-y-1.5 border-t border-emerald-900/10">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-xl text-left text-[13px] md:text-sm font-bold transition-all duration-300 hover:translate-x-1",
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg shadow-emerald-800/15"
                          : "text-slate-700 hover:text-emerald-700 hover:bg-emerald-500/5"
                      )}
                    >
                      <span className="truncate pr-4">{cat}</span>
                      <span className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full font-black",
                        selectedCategory === cat ? "bg-white/20 text-white" : "bg-emerald-950/10 text-slate-500"
                      )}>
                        {cat === t('all')
                          ? products.length
                          : products.filter(p => p.category === cat).length}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2: Availability */}
        <div className="bg-[#ecf3ee] rounded-2xl border border-emerald-900/10 hover:border-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.06)] overflow-hidden transition-all duration-300">
          <button
            onClick={() => setCollapseStock(!collapseStock)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-slate-900 text-sm hover:bg-emerald-50/5 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
              <span className="uppercase tracking-wider font-black text-[13px] md:text-sm text-slate-800">
                {language === 'ta' ? 'இருப்பு நிலை' : 'Availability'}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", collapseStock && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {collapseStock && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-4 space-y-3 border-t border-emerald-900/10">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === 'all'}
                      onChange={() => setAvailability('all')}
                      className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                    />
                    <span className="text-[13px] md:text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                      {language === 'ta' ? 'அனைத்தும்' : 'All Products'}
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === 'instock'}
                      onChange={() => setAvailability('instock')}
                      className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                    />
                    <span className="text-[13px] md:text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                      {language === 'ta' ? 'இருப்பில் உள்ளது' : 'In stock only'}
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 3: Price Ranges */}
        <div className="bg-[#ecf3ee] rounded-2xl border border-emerald-900/10 hover:border-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.06)] overflow-hidden transition-all duration-300">
          <button
            onClick={() => setCollapsePrice(!collapsePrice)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-slate-900 text-sm hover:bg-emerald-50/5 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
              <span className="uppercase tracking-wider font-black text-[13px] md:text-sm text-slate-800">
                {language === 'ta' ? 'விலை வரம்பு' : 'Price range'}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", collapsePrice && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {collapsePrice && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-4 space-y-3 border-t border-emerald-900/10">
                  {[
                    { id: 'all', label: language === 'ta' ? 'அனைத்து விலைகளும்' : 'All Prices' },
                    { id: 'under50', label: language === 'ta' ? '₹50-க்கு கீழ்' : 'Under ₹50' },
                    { id: '50-150', label: language === 'ta' ? '₹50 - ₹150' : '₹50 to ₹150' },
                    { id: 'over150', label: language === 'ta' ? '₹150-க்கு மேல்' : 'Over ₹150' }
                  ].map((range) => (
                    <label key={range.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={priceRange === range.id}
                        onChange={() => setPriceRange(range.id)}
                        className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                      />
                      <span className="text-[13px] md:text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 4: Product Options */}
        <div className="bg-[#ecf3ee] rounded-2xl border border-emerald-900/10 hover:border-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.06)] overflow-hidden transition-all duration-300">
          <button
            onClick={() => setCollapseType(!collapseType)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-slate-900 text-sm hover:bg-emerald-50/5 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
              <span className="uppercase tracking-wider font-black text-[13px] md:text-sm text-slate-800">
                {language === 'ta' ? 'பொருளின் தரம்' : 'Product Quality'}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", collapseType && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {collapseType && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-4 space-y-3 border-t border-emerald-900/10">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={organicFilter}
                      onChange={(e) => setOrganicFilter(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                    />
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[13px] md:text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                        {language === 'ta' ? 'ஆர்கானிக் மட்டும்' : 'Organic / Fresh only'}
                      </span>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Trust Badges */}
        <div className="bg-gradient-to-br from-emerald-950 to-zinc-950 rounded-2xl p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider">
              {language === 'ta' ? '100% தூய்மையானது' : '100% Pure Organic'}
            </span>
          </div>
          <p className="text-[10px] text-emerald-100/60 leading-relaxed font-medium">
            {language === 'ta'
              ? 'நேரடியாக உள்ளூர் விவசாயிகளிடம் இருந்து பெறப்பட்டு பாதுகாப்பான முறையில் பேக் செய்யப்பட்டது.'
              : 'Directly harvested from local biofarms with premium organic certifications.'}
          </p>
          <div className="flex items-center space-x-2 text-[10px] text-emerald-400 font-bold">
            <Truck className="w-4 h-4" />
            <span>{language === 'ta' ? 'அடுத்த நாள் டெலிவரி' : 'Next-Day Fast Delivery'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
