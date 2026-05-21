import React, { useState, useMemo, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard, FirebaseProduct } from './ProductCard';

interface FeaturedProductsProps {
  products: FirebaseProduct[];
  loadingProducts: boolean;
  language: 'ta' | 'en';
  favorites: string[];
  cart: any[];
  toggleFavorite: (productId: string) => void;
  handleAddToCart: (product: FirebaseProduct) => void;
  setCurrentCustomerPage: (page: string) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  loadingProducts,
  language,
  favorites,
  cart,
  toggleFavorite,
  handleAddToCart,
  setCurrentCustomerPage
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 292, behavior: 'smooth' });
    }
  };

  // Marketplace Category Filtering
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category || 'Uncategorized')));
    return ["All", ...cats.filter(c => c !== "")];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const isVisible = p.visible !== false;
      return matchesCategory && isVisible;
    }).slice(0, 8); // Display first 8 products as a preview
  }, [products, selectedCategory]);

  // Autoplay slider scrolling one-by-one
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let autoplayActive = true;

    const handleMouseEnter = () => { autoplayActive = false; };
    const handleMouseLeave = () => { autoplayActive = true; };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    const interval = setInterval(() => {
      if (!autoplayActive) return;
      
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (slider.scrollLeft >= maxScroll - 10) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll by one compact card width + gap (260px card + 32px gap = 292px)
        slider.scrollBy({ left: 292, behavior: 'smooth' });
      }
    }, 3500);

    return () => {
      clearInterval(interval);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [filteredProducts]);

  return (
    <section id="marketplace-preview" className="py-12 md:py-16 relative bg-white transition-colors duration-500 overflow-hidden border-y border-slate-100">
      
      {/* Soft green gradient blur orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-lime-500/[0.02] rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Centered Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 px-4 relative z-10">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex px-3 py-1 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[0.35em] mb-3 font-poppins mx-auto"
          >
            {language === "ta" ? "சிறந்த தயாரிப்புகள்" : "FEATURED SHOWCASE"}
          </m.div>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-[0.1em] uppercase leading-tight font-poppins"
          >
            {language === "ta" ? (
              <>
                சிறப்பு <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">தயாரிப்புகள்</span>
              </>
            ) : (
              <>
                FEATURED <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">PRODUCTS</span>
              </>
            )}
          </m.h2>
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mx-auto mt-4" />
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-[10px] sm:text-xs font-semibold tracking-wider leading-relaxed mt-3 max-w-2xl mx-auto uppercase"
          >
            {language === "ta" ? "லோகேஷ் விவசாயி தளத்தின் புதிய தூய்மையான தயாரிப்புகள்" : "Curated high-yield organic crops harvested at peak freshness"}
          </m.p>
        </div>

        {/* Dynamic Category Filtering Pills */}
        <div className="flex justify-center items-center gap-2 mb-8 overflow-x-auto px-4 pb-2 scrollbar-none relative z-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Interactive Products Horizontal Slider */}
        {loadingProducts ? (
          <div className="h-52 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : (
          <div className="relative w-full px-4 md:px-12 z-10">
            
            {/* Left Arrow Button */}
            <button 
              onClick={scrollLeft}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white hover:bg-emerald-600 text-slate-950 hover:text-white flex items-center justify-center border border-slate-200 shadow-2xl transition-all duration-300 active:scale-90 hover:scale-110 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
            </button>

            {/* Slider Container */}
            <div 
              ref={sliderRef}
              className="flex overflow-x-auto gap-8 py-4 px-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p, index) => {
                  const isFav = favorites.includes(p.id);
                  const isAdded = cart.some(item => item.id === p.id);
                  
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      index={index}
                      isFav={isFav}
                      isAdded={isAdded}
                      language={language}
                      toggleFavorite={toggleFavorite}
                      handleAddToCart={handleAddToCart}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right Arrow Button */}
            <button 
              onClick={scrollRight}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white hover:bg-emerald-600 text-slate-950 hover:text-white flex items-center justify-center border border-slate-200 shadow-2xl transition-all duration-300 active:scale-90 hover:scale-110 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
            </button>

          </div>
        )}

        {/* Centered GO TO SHOP button below products */}
        <div className="flex justify-center mt-10 relative z-10">
          <button
            onClick={() => {
              setCurrentCustomerPage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 py-3 bg-slate-950 hover:bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-[0.25em] transition-all duration-300 border border-transparent active:scale-95 cursor-pointer shadow-lg shadow-slate-950/15 flex items-center space-x-2 group"
          >
            <span>{language === "ta" ? "கடைக்குச் செல்லவும்" : "GO TO SHOP"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
