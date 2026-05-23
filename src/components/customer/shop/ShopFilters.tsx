import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, ShieldCheck, Truck, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Product } from '../../../pages/customer/CustomerShop';

interface ShopFiltersProps {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  availability: string;
  setAvailability: (avail: string) => void;
  organicFilter: boolean;
  setOrganicFilter: (val: boolean) => void;
  language: string;
  t: (key: string) => string;
}

export function DesktopFilters({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  availability,
  setAvailability,
  organicFilter,
  setOrganicFilter,
  language,
  t
}: ShopFiltersProps) {
  const [collapseCat, setCollapseCat] = useState(true);
  const [collapsePrice, setCollapsePrice] = useState(true);
  const [collapseStock, setCollapseStock] = useState(true);
  const [collapseType, setCollapseType] = useState(true);

  return (
    <aside className="hidden lg:block lg:col-span-3 space-y-6">
      <div className="sticky top-24 space-y-6">
        {/* Sidebar Header Title */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">{language === 'ta' ? 'வடிகட்டிகள்' : 'Filters'}</h2>
          </div>
          {(selectedCategory !== t('all') || priceRange !== 'all' || availability !== 'all' || organicFilter) && (
            <button
              onClick={() => {
                setSelectedCategory(t('all'));
                setPriceRange('all');
                setAvailability('all');
                setOrganicFilter(false);
              }}
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
              <span className="uppercase tracking-wider font-black text-[13px] md:text-sm text-slate-800">{t('category')}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", collapseCat && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {collapseCat && (
              <m.div
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
              </m.div>
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
              <span className="uppercase tracking-wider font-black text-[13px] md:text-sm text-slate-800">{language === 'ta' ? 'இருப்பு நிலை' : 'Availability'}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", collapseStock && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {collapseStock && (
              <m.div
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
              </m.div>
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
              <span className="uppercase tracking-wider font-black text-[13px] md:text-sm text-slate-800">{language === 'ta' ? 'விலை வரம்பு' : 'Price range'}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", collapsePrice && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {collapsePrice && (
              <m.div
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
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 4: Product Options (Fresh/Organic) */}
        <div className="bg-[#ecf3ee] rounded-2xl border border-emerald-900/10 hover:border-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.06)] overflow-hidden transition-all duration-300">
          <button
            onClick={() => setCollapseType(!collapseType)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-slate-900 text-sm hover:bg-emerald-50/5 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
              <span className="uppercase tracking-wider font-black text-[13px] md:text-sm text-slate-800">{language === 'ta' ? 'பொருளின் தரம்' : 'Product Quality'}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", collapseType && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {collapseType && (
              <m.div
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
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Trust Badges */}
        <div className="bg-gradient-to-br from-emerald-950 to-zinc-950 rounded-2xl p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider">{language === 'ta' ? '100% தூய்மையானது' : '100% Pure Organic'}</span>
          </div>
          <p className="text-[10px] text-emerald-100/60 leading-relaxed font-medium">
            {language === 'ta' ? 'நேரடியாக உள்ளூர் விவசாயிகளிடம் இருந்து பெறப்பட்டு பாதுகாப்பான முறையில் பேக் செய்யப்பட்டது.' : 'Directly harvested from local biofarms with premium organic certifications.'}
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

interface MobileFiltersProps extends ShopFiltersProps {
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (val: boolean) => void;
}

export function MobileFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  availability,
  setAvailability,
  organicFilter,
  setOrganicFilter,
  language,
  t,
  isMobileFilterOpen,
  setIsMobileFilterOpen
}: MobileFiltersProps) {
  return (
    <AnimatePresence>
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-20"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">{language === 'ta' ? 'வடிகட்டிகள்' : 'Filter Options'}</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Inside Drawer */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Category Accordion */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('category')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "p-2.5 rounded-xl border text-center text-xs font-bold transition-all truncate",
                        selectedCategory === cat
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                          : "bg-slate-50 text-slate-600 border-slate-100"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Price range */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ta' ? 'விலை வரம்பு' : 'Price range'}</h4>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: language === 'ta' ? 'அனைத்து விலைகளும்' : 'All Prices' },
                    { id: 'under50', label: language === 'ta' ? '₹50-க்கு கீழ்' : 'Under ₹50' },
                    { id: '50-150', label: language === 'ta' ? '₹50 - ₹150' : '₹50 to ₹150' },
                    { id: 'over150', label: language === 'ta' ? '₹150-க்கு மேல்' : 'Over ₹150' }
                  ].map((range) => (
                    <label key={range.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="mobilePriceRange"
                        checked={priceRange === range.id}
                        onChange={() => setPriceRange(range.id)}
                        className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Availability */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ta' ? 'இருப்பு நிலை' : 'Availability'}</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mobileAvailability"
                      checked={availability === 'all'}
                      onChange={() => setAvailability('all')}
                      className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">{language === 'ta' ? 'அனைத்தும்' : 'All Products'}</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mobileAvailability"
                      checked={availability === 'instock'}
                      onChange={() => setAvailability('instock')}
                      className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">{language === 'ta' ? 'இருப்பில் உள்ளது' : 'In stock only'}</span>
                  </label>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Organic filter */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ta' ? 'பொருளின் தரம்' : 'Quality options'}</h4>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={organicFilter}
                    onChange={(e) => setOrganicFilter(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                  />
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-slate-700">{language === 'ta' ? 'ஆர்கானிக் மட்டும்' : 'Organic / Fresh only'}</span>
                  </div>
                </label>
              </div>

            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
              >
                {language === 'ta' ? 'முடிவுகளைக் காட்டு' : 'Show Results'}
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
