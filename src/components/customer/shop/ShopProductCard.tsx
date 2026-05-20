import React from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Eye } from 'lucide-react';
import { cn, getOptimizedUrl } from '../../../lib/utils';

interface ShopProductCardProps {
  product: any;
  language: string;
  wishlist: string[];
  toggleWishlist: (id: string, e: React.MouseEvent) => void;
  setSelectedProduct: (product: any) => void;
  setQuickViewProduct: (product: any) => void;
  addToCart: (item: any) => void;
  t: (key: string) => string;
  index: number;
}

export function ShopProductCard({
  product,
  language,
  wishlist,
  toggleWishlist,
  setSelectedProduct,
  setQuickViewProduct,
  addToCart,
  t,
  index
}: ShopProductCardProps) {
  const hasDiscount = false;
  const retailPrice = product.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="group bg-transparent transition-all duration-500 flex flex-col relative w-full text-center"
    >
      {/* Card Image Area with Zoom Effects */}
      <div
        className="aspect-square relative cursor-pointer overflow-hidden bg-slate-50 rounded-2xl p-4 md:p-6 flex items-center justify-center border border-slate-100 group-hover:border-emerald-500/20 transition-all duration-300 w-full"
        onClick={() => setSelectedProduct(product)}
      >
        {/* Top Action Quality Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          <span className="px-2 py-0.5 bg-[#10b981] text-white rounded text-[10px] font-black uppercase tracking-wider shadow-sm">
            {language === 'ta' ? '100% தரம்' : '100% Quality'}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-black uppercase tracking-wider shadow-sm">
              {t('low_stock')}
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon (Top Right) */}
        <button
          onClick={(e) => toggleWishlist(product.id, e)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-sm flex items-center justify-center border border-slate-100 hover:scale-110 active:scale-95 transition-all"
          aria-label="Add to Wishlist"
        >
          <Heart className={cn("w-3.5 h-3.5 transition-colors", wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500")} />
        </button>

        <img
          src={getOptimizedUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="px-3.5 py-2 bg-white/95 backdrop-blur-md text-slate-800 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center space-x-1.5 hover:scale-105 hover:bg-emerald-850 hover:text-white transition-all duration-300"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'விரைவுப் பார்வை' : 'Quick View'}</span>
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="pt-4 flex flex-col flex-1 bg-transparent text-center items-center">
        <h3
          onClick={() => setSelectedProduct(product)}
          className="text-sm font-black text-slate-900 tracking-tight line-clamp-2 cursor-pointer hover:text-emerald-700 transition-colors duration-300 min-h-[2.5rem] flex items-center justify-center w-full px-1"
        >
          {product.name}
        </h3>

        {/* Dynamic prices */}
        <div className="flex items-center justify-center space-x-2 mt-1 w-full">
          <span className="text-base font-black text-slate-900">₹{product.price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs font-bold text-slate-400 line-through">₹{Math.round(retailPrice).toLocaleString()}</span>
          )}
        </div>

        {/* Rating stars */}
        <div className="flex items-center justify-center text-amber-400 mt-2 w-full">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={product.stock <= 0}
          onClick={() => addToCart({ ...product, quantity: 1 })}
          className={cn(
            "w-full mt-4 py-3 rounded-lg font-black flex items-center justify-center space-x-1.5 transition-all duration-300 text-xs uppercase tracking-widest shadow-sm",
            product.stock <= 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100"
              : "bg-emerald-800 text-white hover:bg-emerald-900 active:scale-98"
          )}
        >
          <span>{product.stock <= 0 ? t('out_of_stock') : t('add_to_cart')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
