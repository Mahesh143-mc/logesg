import React, { useRef } from 'react';
import { m } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../../store/useStore';

interface CategorySectionProps {
  language: 'en' | 'ta';
}

const categories = [
  { id: 'coconut', name: { en: 'Coconut', ta: 'தேங்காய்' }, image: 'https://res.cloudinary.com/dyaufjpai/image/upload/v1779119722/billing/pmtmx30jfqxibguegcqh.jpg' },
  { id: 'coconut-oil', name: { en: 'Coconut Oil', ta: 'தேங்காய் எண்ணெய்' }, image: 'https://res.cloudinary.com/dyaufjpai/image/upload/billing/thyu0eszdi4zfbifbq05.jpg' },
  { id: 'greens', name: { en: 'Healthy Greens', ta: 'கீரைகள்' }, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=400&auto=format&fit=crop' },
  { id: 'pathi', name: { en: 'Pathi', ta: 'பத்தி' }, image: 'https://res.cloudinary.com/dyaufjpai/image/upload/v1780928340/billing/cuuwbqw8zvd20eidxwra.webp' },
  { id: 'appalam', name: { en: 'Appalam', ta: 'அப்பளம்' }, image: 'https://res.cloudinary.com/dyaufjpai/image/upload/v1782205764/billing/nuyjs5v3ejcw0ure7frb.webp' },
  { id: 'parrupu', name: { en: 'Parrupu', ta: 'பருப்பு' }, image: 'https://res.cloudinary.com/dyaufjpai/image/upload/v1781419617/billing/ku3sldvhnyc0utlgdk8r.webp' },
  { id: 'print-zerox', name: { en: 'Print & Zerox', ta: 'பிரிண்ட் & ஜெராக்ஸ்' }, image: 'https://res.cloudinary.com/dyaufjpai/image/upload/v1780678227/billing/lwjnc8p4iy6t3jxxkxr6.webp' },
];

export const CategorySection: React.FC<CategorySectionProps> = ({ language }) => {
  const { setCurrentCustomerPage } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Amount to scroll
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    // In a real app, we would set the category filter in the store before navigating
    // For now, just navigate to shop
    setCurrentCustomerPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const title = language === 'ta' ? 'பிரத்தியேக வகைகள்' : 'Exclusive Category';
  const subtitle = language === 'ta' ? 'வகை மூலம் வாங்கவும்' : 'SHOP BY CATEGORY';

  return (
    <section className="py-16 bg-[#FAFAFA] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header Title Section */}
        <div className="text-center mb-12">
          <m.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2"
          >
            {subtitle}
          </m.p>
          <m.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white"
          >
            {title}
          </m.h2>
          <m.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-16 h-1 bg-red-500 mx-auto mt-4 rounded-full"
          />
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Navigation Arrow */}
          <button 
            onClick={() => handleScroll('left')}
            className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>

          {/* Scrolling Categories */}
          <div 
            ref={scrollContainerRef}
            className="flex items-start gap-6 md:gap-8 overflow-x-auto scrollbar-hide py-4 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, idx) => (
              <m.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center gap-4 cursor-pointer min-w-[120px] md:min-w-[160px] snap-center group/card"
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* Circular Image Container */}
                <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full p-1 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 transition-transform duration-300 group-hover/card:scale-105 group-hover/card:shadow-emerald-500/20 group-hover/card:border-emerald-200">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
                    <img 
                      src={category.image} 
                      alt={category.name[language]}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover/card:bg-transparent transition-colors duration-300" />
                  </div>
                </div>

                {/* Category Title */}
                <h3 className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center px-2 group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors">
                  {category.name[language]}
                </h3>
              </m.div>
            ))}
          </div>

          {/* Right Navigation Arrow */}
          <button 
            onClick={() => handleScroll('right')}
            className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 -mr-0.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
