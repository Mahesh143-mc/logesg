import React from 'react';
import { Grid2X2, Grid3X3, LayoutGrid, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ShopToolbarProps {
  language: string;
  filteredCount: number;
  sortBy: string;
  setSortBy: (val: string) => void;
  gridCols: number;
  setGridCols: (cols: number) => void;
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

export function ShopToolbar({
  language,
  filteredCount,
  sortBy,
  setSortBy,
  gridCols,
  setGridCols,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  availability,
  setAvailability,
  organicFilter,
  setOrganicFilter,
  t
}: ShopToolbarProps) {
  const hasActiveFilters = selectedCategory !== t('all') || priceRange !== 'all' || availability !== 'all' || organicFilter;

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="hidden lg:flex bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm items-center justify-between gap-4">
        {/* Product Count Display */}
        <div className="text-xs md:text-sm text-slate-500 font-medium">
          {language === 'ta' ? (
            <>மொத்தம் <span className="font-bold text-slate-800">{filteredCount}</span> பொருட்கள் கண்டறியப்பட்டன</>
          ) : (
            <>Showing <span className="font-bold text-slate-800">{filteredCount}</span> products found</>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
          {/* Sort Dropdown */}
          <div className="hidden sm:flex items-center space-x-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {language === 'ta' ? 'வரிசைப்படுத்து' : 'Sort By'}:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200/80 py-2 px-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-300 transition-colors"
            >
              <option value="featured">{language === 'ta' ? 'சிறப்பு பொருட்கள்' : 'Featured'}</option>
              <option value="price-asc">{language === 'ta' ? 'விலை: குறைந்ததிலிருந்து' : 'Price: Low to High'}</option>
              <option value="price-desc">{language === 'ta' ? 'விலை: அதிகத்திலிருந்து' : 'Price: High to Low'}</option>
              <option value="name-asc">{language === 'ta' ? 'பெயர்: A-Z' : 'Name: A to Z'}</option>
            </select>
          </div>

          {/* Grid View Toggles */}
          <div className="flex items-center space-x-2 border-l border-slate-200 pl-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">
              {language === 'ta' ? 'காட்சி' : 'View'}:
            </span>
            <div className="flex items-center bg-slate-100 rounded-lg p-1 space-x-0.5">
              <button
                onClick={() => setGridCols(2)}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  gridCols === 2 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-655"
                )}
                aria-label="2 Columns"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  gridCols === 3 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-655"
                )}
                aria-label="3 Columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  gridCols === 4 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-655"
                )}
                aria-label="4 Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider mr-1">
            {language === 'ta' ? 'தேர்வு செய்தவை' : 'Active Filters'}:
          </span>
          {selectedCategory !== t('all') && (
            <span className="px-3 py-1 bg-emerald-550/5 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
              <span>{selectedCategory}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => setSelectedCategory(t('all'))} />
            </span>
          )}
          {priceRange !== 'all' && (
            <span className="px-3 py-1 bg-emerald-550/5 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
              <span>
                {priceRange === 'under50' && (language === 'ta' ? '₹50-க்கு கீழ்' : 'Under ₹50')}
                {priceRange === '50-150' && (language === 'ta' ? '₹50 - ₹150' : '₹50 to ₹150')}
                {priceRange === 'over150' && (language === 'ta' ? '₹150-க்கு மேல்' : 'Over ₹150')}
              </span>
              <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => setPriceRange('all')} />
            </span>
          )}
          {availability !== 'all' && (
            <span className="px-3 py-1 bg-emerald-550/5 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
              <span>{language === 'ta' ? 'இருப்பில் உள்ளது' : 'In stock'}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => setAvailability('all')} />
            </span>
          )}
          {organicFilter && (
            <span className="px-3 py-1 bg-emerald-550/5 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
              <span>{language === 'ta' ? 'ஆர்கானிக்' : 'Organic'}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => setOrganicFilter(false)} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
