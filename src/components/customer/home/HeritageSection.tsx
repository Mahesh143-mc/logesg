import React from 'react';
import { motion } from 'motion/react';
import { getOptimizedUrl } from '../../../lib/utils';

interface HeritageSectionProps {
  language: 'ta' | 'en';
  copy?: any;
  setCurrentCustomerPage: (page: string) => void;
  siteImages?: Record<string, string>;
}

export const HeritageSection: React.FC<HeritageSectionProps> = ({
  language,
  setCurrentCustomerPage,
  siteImages = {} as Record<string, string>
}) => {
  return (
    <section id="brand-story" className="py-24 md:py-32 bg-emerald-100/45 dark:bg-emerald-900/20 border-y border-emerald-500/20 dark:border-emerald-500/10 relative overflow-hidden transition-all duration-500">
      
      {/* Soft Ambient Sparkle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-[550px] h-[550px] bg-emerald-500/18 dark:bg-emerald-500/22 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[550px] h-[550px] bg-lime-500/14 dark:bg-lime-500/16 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Description */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex px-3 py-1 rounded bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-4 font-poppins border border-emerald-500/30"
          >
            {language === "ta" ? "நமது பாரம்பரியம்" : "OUR HERITAGE"}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-poppins"
          >
            {language === "ta" ? (
              <>
                பசுமை <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">வாழ்வியல்</span> கதை
              </>
            ) : (
              <>
                THE STORY OF <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">VIVASAYI</span>
              </>
            )}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-emerald-800/80 dark:text-emerald-400/80 text-xs sm:text-sm font-semibold tracking-wide mt-3 max-w-xl mx-auto uppercase"
          >
            {language === "ta" ? "விவசாயிகளின் உன்னத உழைப்பை நவீன உலகிற்கு அறிமுகப்படுத்துகிறோம்" : "Bringing the soul of pure agriculture to the next generation"}
          </motion.p>
        </div>

        {/* Asymmetrical 2-Column Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: One Large Vertical Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              onClick={() => {
                setCurrentCustomerPage('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative w-full h-[500px] lg:h-[680px] rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 cursor-pointer select-none border border-slate-200/50 flex flex-col justify-end p-8 md:p-12 transition-all duration-500"
            >
              {/* Image Background */}
              <img loading="lazy" 
                src={getOptimizedUrl(siteImages.heritage_main || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop", 1200)} 
                alt="Fresh Organic Products" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out -z-20"
              />

              {/* Dark Cinematic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 group-hover:via-black/55 transition-colors duration-700 pointer-events-none -z-10" />

              {/* Left Aligned Content */}
              <div className="space-y-2 md:space-y-3 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-poppins">
                  {language === "ta" ? "புதிய இயற்கை தயாரிப்புகள்" : "Fresh Organic Products"}
                </h3>
                <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-sm leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  {language === "ta" ? "நம்பகமான விவசாயிகளிடமிருந்து நேரடியாகப் பெறப்பட்டது." : "Directly sourced from trusted farmers."}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: Two Stacked Horizontal Image Cards */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* TOP RIGHT CARD */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                onClick={() => {
                  setCurrentCustomerPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative w-full h-[240px] lg:h-[324px] rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 cursor-pointer select-none border border-slate-200/50 flex flex-col justify-end p-8 md:p-12 transition-all duration-500"
              >
                {/* Image Background */}
                <img loading="lazy" 
                  src={getOptimizedUrl(siteImages.heritage_small_1 || "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop", 1000)} 
                  alt="Join Our Farming Community" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out -z-20"
                />

                {/* Dark Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 group-hover:via-black/55 transition-colors duration-700 pointer-events-none -z-10" />

                {/* Left Aligned Content */}
                <div className="space-y-1.5 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight font-poppins">
                    {language === "ta" ? "விவசாய சமூகத்தில் இணையுங்கள்" : "Join Our Farming Community"}
                  </h3>
                  <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-md leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {language === "ta" ? "நவீன விவசாய தீர்வுகளுடன் இணையுங்கள்." : "Connect with modern agriculture solutions."}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* BOTTOM RIGHT CARD */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                onClick={() => {
                  setCurrentCustomerPage('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative w-full h-[240px] lg:h-[324px] rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 cursor-pointer select-none border border-slate-200/50 flex flex-col justify-end p-8 md:p-12 transition-all duration-500"
              >
                {/* Image Background */}
                <img loading="lazy" 
                  src={getOptimizedUrl(siteImages.heritage_small_2 || "https://images.unsplash.com/photo-1500937386664-56d159437b7f?q=80&w=1000&auto=format&fit=crop", 1000)} 
                  alt="Sustainable Agriculture" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out -z-20"
                />

                {/* Dark Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 group-hover:via-black/55 transition-colors duration-700 pointer-events-none -z-10" />

                {/* Left Aligned Content */}
                <div className="space-y-1.5 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight font-poppins">
                    {language === "ta" ? "நிலையான விவசாயம்" : "Sustainable Agriculture"}
                  </h3>
                  <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-md leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {language === "ta" ? "பசுமையான மற்றும் ஆரோக்கியமான எதிர்காலத்தை உருவாக்குவோம்." : "Building a greener and healthier future."}
                  </p>
                </div>
              </motion.div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};
