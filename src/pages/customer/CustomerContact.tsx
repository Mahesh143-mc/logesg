import React from 'react';
import { m } from 'motion/react';
import { Phone, Mail, MapPin, Send, Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useState, useEffect } from 'react';

export function CustomerContact() {
  const { language } = useStore();
  const t = useTranslation(language);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 relative overflow-hidden font-sans pb-32">
      {/* Ultra-subtle Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-400/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-teal-400/5 dark:bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Clean Minimalist Hero */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 flex flex-col items-center justify-center text-center px-4 z-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-600 dark:text-zinc-400">
            {t('support_sales')}
          </span>
        </m.div>

        <m.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight font-poppins max-w-4xl"
        >
          {language === 'ta' ? (
            <>
              <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">உரையாடலைத்</span> தொடங்குவோம்
            </>
          ) : (
            <>
              <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">Let's start</span> a conversation.
            </>
          )}
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold mt-4 max-w-xl mx-auto"
        >
          {language === 'ta' ? 'படிவத்தைப் பூர்த்தி செய்யவும், எங்கள் குழு 24 மணி நேரத்திற்குள் உங்களைத் தொடர்பு கொள்ளும்.' : 'Please fill out the form, and our team will get back to you within 24 hours.'}
        </m.p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
          {[
            { icon: <Phone />, label: t('sales_support'), val: "+91 87546 2190", delay: 0.3 },
            { icon: <Mail />, label: t('send_email'), val: "logeshvivasayi@gmail.com", delay: 0.4 },
            { icon: <MapPin />, label: t('headquarters'), val: t('office_address_val'), delay: 0.5 }
          ].map((item, i) => (
            <m.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: item.delay }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-zinc-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col items-center text-center group transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6" })}
              </div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3">{item.label}</h3>
              <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100">{item.val}</p>
            </m.div>
          ))}
        </div>

        {/* Clean Form Section */}
        <m.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto bg-white dark:bg-zinc-900/80 backdrop-blur-xl p-8 md:p-12 lg:p-16 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/40 dark:shadow-none"
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{language === 'ta' ? 'எங்களுக்கு ஒரு செய்தி அனுப்புங்கள்' : 'Send us a message'}</h2>
          </div>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1">{t('first_name')}</label>
                <input 
                  type="text" 
                  placeholder={language === 'ta' ? "உதாரணம்: லோகேஷ்" : "e.g. Logesh"}
                  className="w-full bg-slate-50/50 dark:bg-zinc-950/50 rounded-2xl px-6 py-4 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1">{t('last_name')}</label>
                <input 
                  type="text" 
                  placeholder="Doe"
                  className="w-full bg-slate-50/50 dark:bg-zinc-950/50 rounded-2xl px-6 py-4 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1">{t('email_address')}</label>
              <input 
                type="email" 
                placeholder="example@email.com"
                className="w-full bg-slate-50/50 dark:bg-zinc-950/50 rounded-2xl px-6 py-4 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1">{t('message')}</label>
              <textarea 
                rows={4}
                placeholder={t('how_can_we_help')}
                className="w-full bg-slate-50/50 dark:bg-zinc-950/50 rounded-2xl px-6 py-4 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none font-medium placeholder:text-slate-300 dark:placeholder:text-zinc-700"
              />
            </div>

            <div className="pt-4 flex justify-center">
              <m.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full flex items-center justify-center space-x-3 shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all duration-300 group"
              >
                <span>{t('send_message_btn')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </m.button>
            </div>
          </form>
        </m.div>

        {/* Social Links Mini Footer */}
        <m.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 flex justify-center space-x-6"
        >
          {[Instagram, Facebook, Twitter].map((Icon, i) => (
            <a 
              key={i}
              href="#" 
              className="text-slate-400 hover:text-emerald-500 transition-colors"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </m.div>

      </div>
    </div>
  );
}
