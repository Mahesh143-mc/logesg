import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ShopMobileDrawerProps {
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (open: boolean) => void;
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
  t: (key: string) => string;
}

export function ShopMobileDrawer({
  isMobileFilterOpen,
  setIsMobileFilterOpen,
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
  t
}: ShopMobileDrawerProps) {
  const handleClearAll = () => {
    setSelectedCategory(t('all'));
    setPriceRange('all');
    setAvailability('all');
    setOrganicFilter(false);
    setIsMobileFilterOpen(false);
  };

  return (
    <AnimatePresence>
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-20"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                  {language === 'ta' ? 'வடிகட்டிகள்' : 'Filter Options'}
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Category Options */}
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
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {language === 'ta' ? 'விலை வரம்பு' : 'Price range'}
                </h4>
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
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {language === 'ta' ? 'இருப்பு நிலை' : 'Availability'}
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mobileAvailability"
                      checked={availability === 'all'}
                      onChange={() => setAvailability('all')}
                      className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {language === 'ta' ? 'அனைத்தும்' : 'All Products'}
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mobileAvailability"
                      checked={availability === 'instock'}
                      onChange={() => setAvailability('instock')}
                      className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {language === 'ta' ? 'இருப்பில் உள்ளது' : 'In stock only'}
                    </span>
                  </label>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Quality Options */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {language === 'ta' ? 'பொருளின் தரம்' : 'Quality options'}
                </h4>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={organicFilter}
                    onChange={(e) => setOrganicFilter(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-emerald-550"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    {language === 'ta' ? 'ஆர்கானிக் மட்டும்' : 'Organic / Fresh only'}
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                onClick={handleClearAll}
                className="py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                {language === 'ta' ? 'அழி' : 'Clear All'}
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-emerald-700"
              >
                {language === 'ta' ? 'பயன்படுத்து' : 'Apply'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
