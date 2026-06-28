import React, { useState, useEffect } from 'react';
import { m } from 'motion/react';
import { getOptimizedUrl } from '../../../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useStore } from '../../../store/useStore';

interface ThreeImageBannerSectionProps {
  language: string;
}

interface BannerData {
  image: string;
  title: string;
  subtitle: string;
  titleEn: string;
  subtitleEn: string;
}

export const ThreeImageBannerSection: React.FC<ThreeImageBannerSectionProps> = ({ language }) => {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentCustomerPage } = useStore();

  // 3 sample images representing farming/spices/organic products
  const defaultImages: BannerData[] = [
    {
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800",
      title: "சுத்தமான மசாலாப் பொருட்கள்",
      titleEn: "Pure Spices",
      subtitle: "இயற்கையான முறையில்",
      subtitleEn: "Naturally Processed"
    },
    {
      image: "https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&q=80&w=800",
      title: "கரிம தானியங்கள்",
      titleEn: "Organic Grains",
      subtitle: "பாரம்பரிய ரகங்கள்",
      subtitleEn: "Traditional Varieties"
    },
    {
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
      title: "புதிய காய்கறிகள்",
      titleEn: "Fresh Vegetables",
      subtitle: "தோட்டத்திலிருந்து நேரடியாக",
      subtitleEn: "Straight from Farm"
    }
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'featuredBanners');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().banners) {
          setBanners(docSnap.data().banners);
        } else {
          setBanners(defaultImages);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        setBanners(defaultImages);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) return null; // Or a subtle skeleton

  return (
    <section className="py-8 md:py-16 relative z-10 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <m.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mb-2"
          >
            {language === 'ta' ? 'பிரபலமான தேர்வுகள்' : 'POPULAR CHOICES'}
          </m.p>
          <m.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white"
          >
            {language === 'ta' ? 'பிரபலமான பிரிவுகள்' : 'Famous Categories'}
          </m.h2>
          <m.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-16 h-1 bg-emerald-500 mx-auto mt-4 rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banners.map((banner, idx) => {
            const title = language === 'ta' ? (banner.title || defaultImages[idx].title) : (banner.titleEn || banner.title || defaultImages[idx].titleEn);
            const subtitle = language === 'ta' ? (banner.subtitle || defaultImages[idx].subtitle) : (banner.subtitleEn || banner.subtitle || defaultImages[idx].subtitleEn);
            const image = banner.image || defaultImages[idx].image;

            return (
              <m.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                onClick={() => setCurrentCustomerPage('shop')}
                className="relative group h-[280px] sm:h-[320px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 cursor-pointer"
              >
                <img 
                  src={getOptimizedUrl(image, 800)} 
                  alt={title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-1.5 drop-shadow-md">{title}</h3>
                  <p className="text-sm font-bold text-emerald-300 drop-shadow-sm uppercase tracking-wider">{subtitle}</p>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
