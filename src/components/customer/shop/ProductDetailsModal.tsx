import React from 'react';
import { m, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { getOptimizedUrl } from '../../../lib/utils';
import { Product } from '../../../pages/customer/CustomerShop';

interface ProductDetailsModalProps {
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedWeight: number;
  setSelectedWeight: (weight: number) => void;
  isDecimalAllowed: (unitName?: string) => boolean;
  language: string;
  t: (key: string) => string;
  addToCart: (product: any) => void;
  setCartOpen: (open: boolean) => void;
}

export function ProductDetailsModal({
  selectedProduct,
  setSelectedProduct,
  selectedWeight,
  setSelectedWeight,
  isDecimalAllowed,
  language,
  t,
  addToCart,
  setCartOpen
}: ProductDetailsModalProps) {
  return (
    <AnimatePresence>
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-10">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedProduct(null);
              setSelectedWeight(1);
            }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-4xl h-auto md:h-[65vh] max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedProduct(null);
                setSelectedWeight(1);
              }}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-20 p-3 bg-white border border-slate-200 rounded-2xl text-slate-900 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="md:w-1/2 h-56 md:h-auto bg-slate-50 relative border-b md:border-b-0 md:border-r border-slate-100 p-6 md:p-10 flex items-center justify-center">
              <m.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                src={getOptimizedUrl(selectedProduct.imageUrl)}
                loading="lazy"
                className="w-full h-full object-contain mix-blend-multiply drop-shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-6 left-6 md:top-8 md:left-8">
                <span className="px-4 py-1.5 bg-white rounded-xl text-[10px] font-black text-emerald-700 uppercase tracking-widest shadow-sm border border-slate-100">
                  {selectedProduct.category || (language === 'ta' ? 'பொதுவானவை' : 'General')}
                </span>
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="flex justify-between items-start mb-4 md:mb-5">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight pr-4">{selectedProduct.name}</h2>
                </div>

                <div className="flex items-center space-x-4 mb-5 md:mb-6">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl md:text-4xl font-black text-emerald-600 tracking-tighter">₹{selectedProduct.price.toLocaleString()}</span>
                    <span className="text-sm md:text-base font-bold text-slate-400">/ {selectedProduct.unit || '1kg'}</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 px-3.5 py-1.5 bg-emerald-50 rounded-xl uppercase tracking-widest border border-emerald-100">
                    {selectedProduct.stock > 0 ? t('in_stock') : t('out_of_stock')}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('description')}</h4>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">
                      {selectedProduct.description || t('quality_desc')}
                    </p>
                  </div>

                  {isDecimalAllowed(selectedProduct.unit) ? (
                    <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3.5">{language === 'ta' ? 'எடையை தேர்வு செய்யவும்' : 'Select Weight (kg)'}</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 bg-white rounded-xl p-1 shadow-sm border border-emerald-200/50">
                          <button
                            onClick={() => setSelectedWeight(Math.max(0.1, selectedWeight - 0.1))}
                            className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            step="0.1"
                            value={selectedWeight}
                            onChange={(e) => setSelectedWeight(parseFloat(e.target.value) || 0.1)}
                            className="w-14 text-center font-black text-emerald-900 bg-transparent border-none outline-none text-base"
                          />
                          <button
                            onClick={() => setSelectedWeight(selectedWeight + 0.1)}
                            className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-base font-black text-emerald-900">{selectedProduct.unit || 'kg'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3.5">{language === 'ta' ? 'எண்ணிக்கையை தேர்வு செய்யவும்' : 'Select Quantity'}</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 bg-white rounded-xl p-1 shadow-sm border border-emerald-200/50">
                          <button
                            onClick={() => setSelectedWeight(Math.max(1, selectedWeight - 1))}
                            className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            step="1"
                            value={Math.round(selectedWeight)}
                            onChange={(e) => setSelectedWeight(parseInt(e.target.value) || 1)}
                            className="w-14 text-center font-black text-emerald-900 bg-transparent border-none outline-none text-base"
                          />
                          <button
                            onClick={() => setSelectedWeight(selectedWeight + 1)}
                            className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-base font-black text-emerald-900">{selectedProduct.unit}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.01)]">
                <m.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={selectedProduct.stock <= 0}
                  onClick={() => {
                    addToCart({ ...selectedProduct, quantity: selectedWeight });
                    setSelectedProduct(null);
                    setSelectedWeight(1);
                    setCartOpen(true);
                  }}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black flex items-center justify-center space-x-3 shadow-xl shadow-emerald-600/25 hover:bg-emerald-700 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{selectedProduct.stock > 0 ? t('add_to_cart') : t('out_of_stock')}</span>
                </m.button>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
