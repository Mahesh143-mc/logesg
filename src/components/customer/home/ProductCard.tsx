import React from 'react';
import { m } from 'motion/react';
import { Heart, Check } from 'lucide-react';
import { cn, getOptimizedUrl } from '../../../lib/utils';

export interface FirebaseProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit?: string;
  imageUrl?: string;
  description?: string;
  visible?: boolean;
  rating?: number;
  isOrganic?: boolean;
  isBestSeller?: boolean;
}

interface ProductCardProps {
  product: FirebaseProduct;
  index: number;
  isFav: boolean;
  isAdded: boolean;
  language: 'ta' | 'en';
  toggleFavorite: (productId: string) => void;
  handleAddToCart: (product: FirebaseProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  isFav,
  isAdded,
  language,
  toggleFavorite,
  handleAddToCart
}) => {
  const cardThemes = [
    {
      bg: "bg-gradient-to-br from-emerald-100 via-emerald-100/90 to-emerald-200/70",
      border: "border-emerald-300/80 hover:border-emerald-500/50",
      hoverShadow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.09)]",
      glow: "from-emerald-500/0 to-emerald-500/10"
    },
    {
      bg: "bg-gradient-to-br from-amber-100 via-amber-100/90 to-amber-200/70",
      border: "border-amber-300/80 hover:border-amber-500/50",
      hoverShadow: "hover:shadow-[0_20px_40px_rgba(245,158,11,0.09)]",
      glow: "from-amber-500/0 to-amber-500/10"
    },
    {
      bg: "bg-gradient-to-br from-lime-100 via-lime-100/90 to-lime-200/70",
      border: "border-lime-300/80 hover:border-lime-500/50",
      hoverShadow: "hover:shadow-[0_20px_40px_rgba(132,204,22,0.09)]",
      glow: "from-lime-500/0 to-lime-500/10"
    },
    {
      bg: "bg-gradient-to-br from-sky-100 via-sky-100/90 to-sky-200/70",
      border: "border-sky-300/80 hover:border-sky-500/50",
      hoverShadow: "hover:shadow-[0_20px_40px_rgba(14,165,233,0.09)]",
      glow: "from-sky-500/0 to-sky-500/10"
    },
    {
      bg: "bg-gradient-to-br from-rose-100 via-rose-100/90 to-rose-200/70",
      border: "border-rose-300/80 hover:border-rose-500/50",
      hoverShadow: "hover:shadow-[0_20px_40px_rgba(244,63,94,0.09)]",
      glow: "from-rose-500/0 to-rose-500/10"
    }
  ];
  const theme = cardThemes[index % cardThemes.length];

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      onClick={() => handleAddToCart(product)}
      className={cn(
        "relative cursor-pointer flex flex-col items-center p-5 rounded-2xl text-slate-900 border shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-500 overflow-hidden w-[240px] md:w-[260px] h-[340px] shrink-0 group select-none snap-start text-center",
        theme.bg,
        theme.border,
        theme.hoverShadow
      )}
    >
      {/* Ambient Card Glow */}
      <div className={cn("absolute -inset-px bg-gradient-to-tr opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none -z-10", theme.glow)} />

      {/* Top corner Favorite Icon */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/60 shadow-sm"
        >
          <Heart className={cn("w-3 h-3 transition-all duration-300", isFav ? "fill-rose-500 text-rose-500 scale-110" : "")} />
        </button>
      </div>

      {/* Compact image container with smooth hover zoom and transparent background */}
      <div className="w-full h-36 flex items-center justify-center relative overflow-hidden mb-2 bg-transparent">
        <img 
          src={getOptimizedUrl(product.imageUrl)} 
          alt={product.name} 
          loading="lazy"
          className="h-32 w-32 object-contain group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Center Aligned Product Content */}
      <div className="flex flex-col items-center text-center space-y-1.5 w-full mt-auto">
        
        {/* Name */}
        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight uppercase font-poppins line-clamp-1">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-[10px] text-slate-500 font-semibold line-clamp-2 leading-relaxed h-7">
          {product.description || (language === "ta" ? "உயர்தர புதிய இயற்கை தயாரிப்பு." : "Fresh and premium quality, tested for organic standards.")}
        </p>
        
        {/* Price */}
        <div className="pt-2 flex items-baseline justify-center space-x-1 border-t border-slate-100 w-full mt-1">
          <span className="text-base font-black text-emerald-600">₹{product.price}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ {product.unit || '1kg'}</span>
        </div>

        {/* Added micro-notification bubble inside card to give perfect visual feedback */}
        {isAdded && (
          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-full flex items-center space-x-1 mt-1 animate-fade-in uppercase tracking-wider">
            <Check className="w-2.5 h-2.5 stroke-[3.5]" />
            <span>ADDED TO CART</span>
          </span>
        )}

      </div>
    </m.div>
  );
};
