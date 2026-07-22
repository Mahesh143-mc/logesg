import React, { useState, useRef } from 'react';
import { m } from 'motion/react';
import { Play, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../utils/translations';

interface VideoFeedsSectionProps {
  language: 'en' | 'ta';
}

export const VideoFeedsSection: React.FC<VideoFeedsSectionProps> = ({ language }) => {
  const t = useTranslation(language);

  // Fallback copy if not in translations
  const title = language === 'ta' ? 'இன்ஸ்டாகிராம் ரீல்ஸ்' : 'Instagram feeds';
  const subtitle = language === 'ta' 
    ? 'எங்கள் இன்ஸ்டாகிராம் பக்கத்தில் இருந்து நேரடியாக விவசாய செயல்முறைகளை காணுங்கள்.' 
    : 'Experience our farm collections through videos sourced from our Instagram page.';

  // Real video data provided by user
  const videos = [
    {
      id: 1,
      poster: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=600&auto=format&fit=crop',
      src: 'https://res.cloudinary.com/dyaufjpai/video/upload/video_3_qo150t.mp4',
    },
    {
      id: 2,
      poster: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=600&auto=format&fit=crop',
      src: 'https://res.cloudinary.com/dyaufjpai/video/upload/video_2_iz1ppr.mp4',
    },
    {
      id: 3,
      poster: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop',
      src: 'https://res.cloudinary.com/dyaufjpai/video/upload/video_4_fm4bfy.mp4',
    },
    {
      id: 4,
      poster: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
      src: 'https://res.cloudinary.com/dyaufjpai/video/upload/Video_1_gylhgo.mp4',
    }
  ];

  const [unmutedVideoId, setUnmutedVideoId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Amount to scroll
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleMute = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setUnmutedVideoId(prev => prev === id ? null : id);
  };

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <m.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 font-poppins"
          >
            {title}
          </m.h2>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto"
          >
            {subtitle}
          </m.p>
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

          {/* Scrolling Videos */}
          <div 
            ref={scrollContainerRef}
            className="flex items-start gap-4 md:gap-6 overflow-x-auto scrollbar-hide py-4 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {videos.map((video, idx) => (
              <m.a
                href="https://www.instagram.com/logesh_vivasayi_721?igsh=c2Zzc3doaGw4eGZ2"
                target="_blank"
                rel="noopener noreferrer"
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                className="relative flex-shrink-0 w-[75vw] sm:w-[280px] lg:w-[320px] group rounded-3xl overflow-hidden aspect-[9/16] bg-slate-100 dark:bg-slate-900 shadow-xl shadow-emerald-900/5 border border-slate-200 dark:border-slate-800 block snap-center"
              >
              <video 
                src={video.src}
                poster={video.poster}
                autoPlay
                muted={unmutedVideoId !== video.id}
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

              {/* Sound On Indicator */}
              {unmutedVideoId === video.id && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-pulse">
                  Sound On
                </div>
              )}

              {/* Volume Toggle Button */}
              <button 
                onClick={(e) => toggleMute(e, video.id)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                {unmutedVideoId === video.id ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                ) : (
                  <VolumeX className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Fake UI overlays to mimic Instagram Reels */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white overflow-hidden p-0.5">
                    <img src="https://res.cloudinary.com/dyaufjpai/image/upload/q_auto/f_auto/v1779255158/Logo_final_-_2_unomy8.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-white text-xs font-bold tracking-wide">logesh_vivasayi_721</span>
                </div>
              </div>

            </m.a>
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
