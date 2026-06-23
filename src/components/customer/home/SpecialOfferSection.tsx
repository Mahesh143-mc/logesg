import React from 'react';
import { ArrowRight, Tag, Clock, Sparkles, Leaf } from 'lucide-react';
import { useStore } from '../../../store/useStore';

interface SpecialOfferSectionProps {
  language: string;
  siteImages?: Record<string, string>;
}

export function SpecialOfferSection({ language, siteImages = {} }: SpecialOfferSectionProps) {
  const { setCurrentCustomerPage } = useStore();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-slate-50">
      <div className="max-w-[95%] md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 rounded-3xl p-8 md:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 border border-emerald-700/50">
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Floating Leaves Background */}
          <Leaf className="absolute top-12 left-12 w-10 h-10 text-emerald-400/20 rotate-45 animate-pulse hidden md:block pointer-events-none" />
          <Leaf className="absolute bottom-16 right-16 w-16 h-16 text-lime-300/10 -rotate-12 animate-[pulse_4s_ease-in-out_infinite] hidden md:block pointer-events-none" />
          <Leaf className="absolute top-1/2 left-8 w-6 h-6 text-emerald-300/20 rotate-90 animate-[pulse_3s_ease-in-out_infinite] pointer-events-none" />
          <Leaf className="absolute bottom-1/4 right-1/3 w-12 h-12 text-green-400/10 rotate-180 animate-pulse hidden lg:block pointer-events-none" />

          {/* Top Right Corner Ribbon Design */}
          <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden rounded-tr-3xl z-20 pointer-events-none">
            <div className="absolute top-6 -right-[4.5rem] w-56 bg-gradient-to-r from-yellow-400 to-orange-500 text-emerald-950 font-black text-xs py-2 text-center shadow-lg transform rotate-45 border-y-2 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.5)] tracking-widest uppercase">
              {language === 'ta' ? 'மெகா ஆஃபர்' : 'Mega Offer'}
            </div>
          </div>
          
          {/* Bottom Left Corner Ribbon Design */}
          <div className="absolute bottom-0 left-0 w-32 h-32 overflow-hidden rounded-bl-3xl z-20 pointer-events-none">
            <div className="absolute bottom-6 -left-[4.5rem] w-56 bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-black text-xs py-2 text-center shadow-lg transform rotate-45 border-y-2 border-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.5)] tracking-widest uppercase">
              {language === 'ta' ? '100% இயற்கை' : '100% Organic'}
            </div>
          </div>
          
          {/* Subtle Decorative Pattern at Top & Bottom */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-400/15 via-transparent to-transparent opacity-60 pointer-events-none"></div>
          
          <div className="flex-1 space-y-6 relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-sm animate-bounce">
              <Tag className="w-4 h-4 text-yellow-400" />
              <span className="text-xs md:text-sm font-bold tracking-wider text-yellow-100 uppercase">
                {language === 'ta' ? 'சிறப்பு சலுகை' : 'Limited Time Offer'}
              </span>
            </div>
            
            <div className="relative inline-block mt-4 mb-2">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/30 via-orange-500/20 to-yellow-400/30 blur-2xl rounded-full animate-pulse"></div>
              <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight flex items-center justify-center gap-3 md:gap-4">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 animate-[pulse_2s_ease-in-out_infinite]" />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-500 drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]">
                  {language === 'ta' ? 'சிறப்பு சலுகை!' : 'Special Offer!'}
                </span>
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-orange-400 animate-[pulse_3s_ease-in-out_infinite]" />
              </h2>
            </div>
            
            <div className="flex flex-col items-center gap-5 pt-4 w-full">
              <button 
                onClick={() => setCurrentCustomerPage('shop')}
                className="bg-yellow-400 text-emerald-950 px-8 py-4 rounded-xl font-black text-base md:text-lg hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center justify-center space-x-3 w-fit whitespace-nowrap mx-auto relative overflow-hidden group"
              >
                {/* Shine effect on button */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span>{language === 'ta' ? 'இப்போதே வாங்க' : 'Shop Now'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center space-x-2 text-emerald-200/90 font-medium text-sm">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{language === 'ta' ? 'சலுகை விரைவில் முடிகிறது' : 'Offer ends soon'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10 block mt-8 md:mt-0 group">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-emerald-800/40 rounded-3xl blur-xl transform translate-y-4"></div>
              {/* Animated glowing border behind image */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[1.25rem] opacity-30 blur-sm group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
              <img 
                src={siteImages.special_offer || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop"} 
                alt="Special Offer" 
                className="relative w-full h-auto object-cover rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] border-4 border-emerald-800/50"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
