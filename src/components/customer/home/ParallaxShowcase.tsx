import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Leaf } from 'lucide-react';
import { getOptimizedUrl } from '../../../lib/utils';

interface ParallaxShowcaseProps {
  language: 'ta' | 'en';
  copy?: any;
  siteImages?: Record<string, string>;
}

export const ParallaxShowcase: React.FC<ParallaxShowcaseProps> = ({
  language,
  siteImages = {} as Record<string, string>
}) => {
  return (
    <section className="relative min-h-[480px] lg:min-h-[550px] flex items-center justify-center overflow-hidden py-24 md:py-28 bg-emerald-950 text-white">
      
      {/* Parallax Fixed Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 pointer-events-none opacity-70 md:opacity-85"
        style={{
          backgroundImage: `url('${getOptimizedUrl(siteImages.parallax_bg || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1920&auto=format&fit=crop", 1920)}')`,
          backgroundAttachment: "fixed",
        }}
      />

      {/* Cinematic horizontal fade overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/98 via-emerald-950/85 to-emerald-950/30 md:to-transparent z-1" />

      {/* Ambient Blur Lighting Effects */}
      <div className="absolute inset-0 pointer-events-none z-2 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-lime-500/15 blur-[100px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE: Heading and Subheading */}
          <div className="lg:col-span-8 text-left space-y-4">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-4"
            >
              <div className="inline-flex px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                {language === "ta" ? "பண்ணையிலிருந்து நேரடியாக" : "Fresh From Farm"}
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-tight font-poppins max-w-3xl">
                {language === "ta" ? (
                  <>
                    நேரடியாக எமது <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 bg-clip-text text-transparent">நம்பிக்கையான விவசாயிகளிடமிருந்து</span> புதிய சுகாதாரமான பொருட்கள்
                  </>
                ) : (
                  <>
                    Healthy Products Directly From <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 bg-clip-text text-transparent">Trusted Farmers</span>
                  </>
                )}
              </h2>

              <p className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl">
                {language === "ta" ? (
                  "எங்கள் அதிநவீன டிஜிட்டல் ஆர்டர் அமைப்புகள் மற்றும் அதிவேக விநியோக தீர்வுகள் மூலம் விவசாயிகளின் புதிய அறுவடையை உங்களின் இல்லங்களுக்கு நேரடியாகப் பெற்றிடுங்கள்."
                ) : (
                  "Experience fresh agriculture products with modern digital ordering and fast delivery solutions."
                )}
              </p>
            </motion.div>

          </div>

          {/* RIGHT SIDE: Action Buttons */}
          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto lg:w-full max-w-xs"
            >
              <button 
                onClick={() => {
                  const el = document.getElementById('marketplace-preview');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group w-full sm:w-52 lg:w-full px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-lime-500 text-slate-950 hover:text-slate-950 dark:text-slate-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2.5"
              >
                <span>{language === "ta" ? "இப்போதே வாங்குங்கள்" : "Buy Now"}</span>
                <ShoppingBag className="w-4 h-4 group-hover:scale-115 transition-transform duration-300" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('marketplace-preview');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group w-full sm:w-52 lg:w-full px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest transition-all duration-300 border border-white/10 hover:border-white/25 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2.5"
              >
                <span>{language === "ta" ? "தயாரிப்புகளைக் காண்க" : "Explore Products"}</span>
                <Leaf className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </motion.div>

          </div>

        </div>
      </div>

    </section>
  );
};
