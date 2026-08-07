import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Maximize2, X, Sparkles, Download, ExternalLink, Tag } from 'lucide-react';
import { getOptimizedUrl } from '../../../lib/utils';

interface RateCardSectionProps {
  language: 'ta' | 'en';
  siteImages?: Record<string, string>;
}

export const RateCardSection: React.FC<RateCardSectionProps> = ({
  language,
  siteImages = {}
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const rateImageUrl = siteImages.rate_card || "https://res.cloudinary.com/dyaufjpai/image/upload/v1786081739/rate_hsae5v.jpg";

  const labels = {
    ta: {
      badge: "நாளாந்த விலைப்பட்டியல்",
      title: "இன்றைய விவசாய தயாரிப்பு விலைப்பட்டியல்",
      subtitle: "எங்கள் பண்ணையிலிருந்து நேரடியாக உங்களுக்காக நியாயமான மற்றும் புதிய தயாரிப்புகளின் விபரம்",
      clickToZoom: "பெரிதாக்கிப் பார்க்க கிளிக் செய்யவும்",
      fullView: "முழு பார்வையில்",
      download: "விலைப்பட்டியலை பதிவிறக்கவும்",
      close: "மூடு"
    },
    en: {
      badge: "DAILY RATE CHART",
      title: "Today's Fresh Produce Rate Card",
      subtitle: "Transparent & competitive farm-fresh pricing directly from Logesh Vivasayi",
      clickToZoom: "Click to View Full Resolution",
      fullView: "Full Screen View",
      download: "Download Rate Card",
      close: "Close"
    }
  };

  const currentLabel = labels[language] || labels.en;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = rateImageUrl;
    link.download = 'Logesh_Vivasayi_Rate_Card.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
        {/* Subtle Section Glow Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full blur-[140px]" />
        </div>

        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-4"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>{currentLabel.badge}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-poppins"
          >
            {currentLabel.title}
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium max-w-2xl mx-auto mt-3"
          >
            {currentLabel.subtitle}
          </m.p>
        </div>

        {/* Rate Card Container - Optimized for Mobile and Desktop */}
        <m.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative group rounded-3xl md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-emerald-500/20 dark:border-emerald-500/30 p-2 sm:p-4 md:p-6 shadow-2xl shadow-emerald-950/10 dark:shadow-emerald-950/40 overflow-hidden"
        >
          {/* Main Display Image */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="relative rounded-2xl md:rounded-[2rem] overflow-hidden cursor-pointer bg-slate-950/5 dark:bg-slate-950/50 group/img flex justify-center items-center"
          >
            <img
              src={getOptimizedUrl(rateImageUrl, 1600)}
              alt="Logesh Vivasayi Rate Card"
              className="w-full h-auto max-h-[800px] object-contain rounded-2xl md:rounded-[2rem] transition-transform duration-500 group-hover/img:scale-[1.01]"
              loading="eager"
            />

            {/* Hover / Touch Overlay Prompt */}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex flex-col items-center justify-center text-white space-y-3 p-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 transform group-hover/img:scale-110 transition-transform">
                <Maximize2 className="w-6 h-6" />
              </div>
              <span className="text-xs md:text-sm font-black tracking-wider uppercase bg-slate-900/80 px-4 py-2 rounded-full border border-white/20">
                {currentLabel.clickToZoom}
              </span>
            </div>

            {/* Floating Top Badge */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all flex items-center space-x-1.5 border border-white/20 active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentLabel.fullView}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Bar under Image */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 sm:px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>{language === 'ta' ? 'அனைத்து விவரங்களும் நேரலையில் புதுப்பிக்கப்படும்' : 'Updated daily for maximum transparency'}</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{currentLabel.download}</span>
              </button>
            </div>
          </div>
        </m.div>
      </section>

      {/* Lightbox Full Screen Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-8"
          >
            {/* Modal Container */}
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full max-h-[92vh] flex flex-col items-center justify-center bg-slate-900/90 rounded-2xl md:rounded-3xl border border-emerald-500/30 shadow-2xl p-2 sm:p-4 overflow-hidden"
            >
              {/* Top Controls Bar */}
              <div className="w-full flex items-center justify-between pb-3 px-2 sm:px-4 border-b border-white/10 text-white">
                <span className="text-xs sm:text-sm font-bold text-emerald-400">
                  Logesh Vivasayi Rate Card
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                    title={currentLabel.download}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    title={currentLabel.close}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Full Image Display with Pinch / Scroll Capability */}
              <div className="w-full flex-1 overflow-auto flex items-center justify-center p-2 custom-scrollbar">
                <img
                  src={rateImageUrl}
                  alt="Logesh Vivasayi Rate Card Full View"
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
                />
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};
