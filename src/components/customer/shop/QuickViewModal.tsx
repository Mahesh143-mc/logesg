import React from 'react';
import { m, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingCart } from 'lucide-react';
import { getOptimizedUrl } from '../../../lib/utils';
import { Product } from '../../../pages/customer/CustomerShop';

interface QuickViewModalProps {
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  language: string;
  t: (key: string) => string;
  addToCart: (product: any) => void;
  setCartOpen: (open: boolean) => void;
}

export function QuickViewModal({
  quickViewProduct,
  setQuickViewProduct,
  language,
  t,
  addToCart,
  setCartOpen
}: QuickViewModalProps) {
  return (
    <AnimatePresence>
      {quickViewProduct && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewProduct(null)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 z-10"
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-1/2 h-52 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100">
                <img loading="lazy" src={getOptimizedUrl(quickViewProduct.imageUrl)} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {quickViewProduct.category}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{quickViewProduct.name}</h3>
                </div>

                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-emerald-600">₹{quickViewProduct.price.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400">/ {quickViewProduct.unit || '1kg'}</span>
                </div>

                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  {quickViewProduct.description || t('quality_desc')}
                </p>

                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-slate-400 text-[10px] pl-1 font-bold">(15 reviews)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{language === 'ta' ? 'இருப்பு நிலை' : 'Status'}</span>
                <span className="text-xs font-black text-emerald-700">{quickViewProduct.stock > 0 ? t('in_stock') : t('out_of_stock')}</span>
              </div>
              <button
                disabled={quickViewProduct.stock <= 0}
                onClick={() => {
                  addToCart({ ...quickViewProduct, quantity: 1 });
                  setQuickViewProduct(null);
                  setCartOpen(true);
                }}
                className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('add_to_cart')}</span>
              </button>
            </div>

          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
