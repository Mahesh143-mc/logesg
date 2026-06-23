import React from 'react';
import { m } from 'motion/react';
import { Heart, Eye, Star } from 'lucide-react';
import { cn, getOptimizedUrl } from '../../../lib/utils';
import { Product } from '../../../pages/customer/CustomerShop';

interface ProductCardProps {
  product: Product;
  idx: number;
  language: string;
  t: (key: string) => string;
  wishlist: string[];
  toggleWishlist: (productId: string, e: React.MouseEvent) => void;
  setSelectedProduct: (product: Product | null) => void;
  setQuickViewProduct: (product: Product | null) => void;
  addToCart: (product: any) => void;
  hasDiscount: boolean;
  retailPrice: number;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  idx,
  language,
  t,
  wishlist,
  toggleWishlist,
  setSelectedProduct,
  setQuickViewProduct,
  addToCart,
  hasDiscount,
  retailPrice
}) => {
  if (product.isOffer) {
    return (
      <div 
        className="group relative w-full h-[220px] md:h-[260px] lg:h-[280px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-500 cursor-pointer flex flex-col"
        onClick={() => setSelectedProduct(product)}
      >
        {/* Background Image */}
        <img 
          src={getOptimizedUrl(product.imageUrl, 600) || `https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop`}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Badges top left */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse border border-red-400">
            {language === 'ta' ? 'சிறப்பு சலுகை' : 'Special Offer'}
          </span>
          <span className="px-2 py-0.5 bg-[#10b981]/90 backdrop-blur-sm text-white rounded text-[10px] font-black uppercase tracking-wider w-fit">
            {language === 'ta' ? '100% தரம்' : '100% Quality'}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/90 backdrop-blur-sm text-white rounded text-[10px] font-black uppercase tracking-wider w-fit">
              {t('low_stock')}
            </span>
          )}
        </div>

        {/* Wishlist Top Right */}
        <button
          onClick={(e) => toggleWishlist(product.id, e)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md shadow-sm flex items-center justify-center border border-white/20 hover:bg-white/40 transition-colors"
          aria-label="Add to Wishlist"
        >
          <Heart className={cn("w-4 h-4 transition-colors", wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-white hover:text-red-500")} />
        </button>

        {/* Quick View Button on Hover (Centered) */}
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="px-4 py-2 bg-white/20 backdrop-blur-md text-white border border-white/50 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center space-x-1.5 hover:bg-white hover:text-slate-900 transition-colors pointer-events-auto"
          >
            <Eye className="w-4 h-4" />
            <span>{language === 'ta' ? 'விரைவுப் பார்வை' : 'Quick View'}</span>
          </button>
        </div>

        {/* Bottom Content overlaid on image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col text-white">
          <div className="flex items-center text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          
          <h3 className="text-lg md:text-xl font-black text-white leading-tight mb-4 drop-shadow-md line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-end justify-between w-full mt-auto">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs font-bold text-slate-300 line-through">₹{Math.round(retailPrice).toLocaleString()}</span>
              )}
              <span className="text-2xl md:text-3xl font-black text-[#10b981] drop-shadow-md">
                ₹{product.price.toLocaleString()}
              </span>
            </div>
            
            {/* Add to Cart Button */}
            {product.hasCustomWeights ? (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                className="bg-[#10b981] hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all transform active:scale-95"
              >
                {language === 'ta' ? 'தேர்வு செய்' : 'Select'}
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); addToCart({ ...product, quantity: 1 }); }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all transform active:scale-95 flex items-center gap-1.5"
              >
                <span>{t('add_to_cart')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex flex-col relative w-full text-center overflow-hidden transition-all duration-300",
        product.isOffer 
          ? "bg-white rounded-2xl border-2 border-red-200 shadow-md hover:shadow-lg hover:shadow-red-500/20 transform hover:-translate-y-1" 
          : "bg-white rounded-2xl border border-slate-100 hover:shadow-md"
      )}
    >
      <div
        className="aspect-square relative cursor-pointer bg-white flex items-center justify-center w-full flex-shrink-0 overflow-hidden"
        onClick={() => setSelectedProduct(product)}
      >
        {/* Top Action Quality Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.isOffer && (
            <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm">
              {language === 'ta' ? 'சிறப்பு சலுகை' : 'Special Offer'}
            </span>
          )}
          <span className="px-2 py-0.5 bg-[#10b981] text-white rounded text-[10px] font-black uppercase tracking-wider">
            {language === 'ta' ? '100% தரம்' : '100% Quality'}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-black uppercase tracking-wider">
              {t('low_stock')}
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon (Top Right) */}
        <button
          onClick={(e) => toggleWishlist(product.id, e)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 hover:bg-slate-50 transition-colors"
          aria-label="Add to Wishlist"
        >
          <Heart className={cn("w-3.5 h-3.5 transition-colors", wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500")} />
        </button>

        <img
          src={getOptimizedUrl(product.imageUrl, 400) || `https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop`}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-110",
            product.isOffer 
              ? "object-cover" 
              : "object-contain mix-blend-multiply p-4"
          )}
          referrerPolicy="no-referrer"
        />

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="px-3.5 py-2 bg-white text-slate-800 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center space-x-1.5 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'விரைவுப் பார்வை' : 'Quick View'}</span>
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1 bg-white text-center items-center">
        <h3
          onClick={() => setSelectedProduct(product)}
          className="text-sm font-black text-slate-900 tracking-tight line-clamp-2 cursor-pointer hover:text-emerald-700 transition-colors min-h-[2.5rem] flex items-center justify-center w-full"
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
        {product.hasCustomWeights ? (
          <button
            onClick={() => setSelectedProduct(product)}
            className="w-full mt-4 py-3 rounded-lg font-black flex items-center justify-center space-x-1.5 text-xs uppercase tracking-widest transition-colors bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <span>{language === 'ta' ? 'தேர்வு செய்' : 'Select Option'}</span>
          </button>
        ) : (
          <button
            onClick={() => addToCart({ ...product, quantity: 1 })}
            className="w-full mt-4 py-3 rounded-lg font-black flex items-center justify-center space-x-1.5 text-xs uppercase tracking-widest transition-colors bg-emerald-800 text-white hover:bg-emerald-900"
          >
            <span>{t('add_to_cart')}</span>
          </button>
        )}
      </div>
    </div>
  );
});
