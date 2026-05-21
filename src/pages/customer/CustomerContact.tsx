import React from 'react';
import { m } from 'motion/react';
import { Phone, Mail, MapPin, Send, Instagram, Facebook, Twitter, ChevronRight, Sprout } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getOptimizedUrl } from '../../lib/utils';
import { useState, useEffect } from 'react';

export function CustomerContact() {
  const { language } = useStore();
  const t = useTranslation(language);

  const [siteImages, setSiteImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSiteImages = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'frontendImages');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSiteImages(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching site images:", error);
      }
    };
    fetchSiteImages();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/30 relative overflow-hidden font-sans pb-32">
      {/* Background Decorative Ambient Orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <m.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-200/30 rounded-full blur-[120px]"
        />
        <m.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-green-200/30 rounded-full blur-[150px]"
        />
        {/* Glass grid overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#04785706_1px,transparent_1px),linear-gradient(to_bottom,#04785706_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Page Header / Hero Banner Section */}
      <section className="relative w-full h-[360px] md:h-[420px] pt-24 md:pt-28 flex items-center overflow-hidden">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={getOptimizedUrl(siteImages.contact_hero || "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2000&auto=format&fit=crop", 2000)}
            alt="Farm Contact Banner"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-zinc-950/90 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/30 via-transparent to-transparent z-10" />
        </div>

        {/* Hero Grid Container */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20 text-center space-y-4">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4.5 py-1.5 shadow-sm backdrop-blur-md"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">{t('support_sales')}</span>
          </m.div>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center justify-center space-x-2 text-xs md:text-sm font-semibold tracking-wide text-emerald-300/80 mb-2">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => window.location.href = '/'}>{language === 'ta' ? 'முகப்பு' : 'Home'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => window.location.href = '/shop'}>{language === 'ta' ? 'அனைத்து தொகுப்புகள்' : 'All collections'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-100 font-bold">{language === 'ta' ? 'எங்களைத் தொடர்பு கொள்க' : 'Contact Us'}</span>
          </nav>

          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase"
          >
            {language === 'ta' ? 'எங்களைத் தொடர்பு கொள்க' : 'Contact Us'}
          </m.h1>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-10">
        <m.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-emerald-900/5 overflow-hidden flex flex-col lg:flex-row"
        >
          
          {/* Contact Info */}
          <div className="lg:w-2/5 bg-slate-900 p-8 md:p-12 lg:p-20 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4 md:mb-6 tracking-tight">{t('contact_info')}</h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-10 md:mb-16 font-medium">
                {t('contact_info_desc')}
              </p>

              <div className="space-y-6 md:space-y-10">
                {[
                  { icon: <Phone />, label: t('sales_support'), val: "+91 87546 2190" },
                  { icon: <Mail />, label: t('send_email'), val: "logeshvivasayi@gmail.com" },
                  { icon: <MapPin />, label: t('headquarters'), val: t('office_address_val') }
                ].map((item, i) => (
                  <m.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-4 md:space-x-6 group cursor-pointer"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all duration-300">
                      {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5 md:w-6 md:h-6 text-emerald-400 group-hover:text-white" })}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.label}</div>
                      <div className="text-lg md:text-xl font-bold mt-1">{item.val}</div>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-16 mt-16 border-t border-white/10">
              <div className="flex space-x-6">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <m.a 
                    key={i}
                    href="#" 
                    whileHover={{ scale: 1.2, y: -5 }}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all text-slate-400"
                  >
                    <Icon className="w-5 h-5" />
                  </m.a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-3/5 p-12 lg:p-20">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-800 ml-1">{t('first_name')}</label>
                  <input 
                    type="text" 
                    placeholder={language === 'ta' ? "உதாரணம்: லோகேஷ்" : "e.g. Logesh"}
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-800 ml-1">{t('last_name')}</label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-slate-800 ml-1">{t('email_address')}</label>
                <input 
                  type="email" 
                  placeholder="example@email.com"
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-slate-800 ml-1">{t('message')}</label>
                <textarea 
                  rows={5}
                  placeholder={t('how_can_we_help')}
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none font-medium"
                />
              </div>

              <div className="pt-6">
                <m.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-12 py-5 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center space-x-3 shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all"
                >
                  <Send className="w-5 h-5" />
                  <span>{t('send_message_btn')}</span>
                </m.button>
              </div>
            </form>
          </div>
        </m.div>
      </div>
    </div>
  );
}
