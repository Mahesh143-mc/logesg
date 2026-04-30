import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send, Instagram, Facebook, Twitter } from 'lucide-react';

export function CustomerContact() {
  return (
    <div className="bg-slate-50 min-h-screen pb-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Dynamic Background Blobs */}
        <div className="absolute top-0 inset-x-0 h-[600px] -z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-[40%] h-[80%] bg-emerald-100/50 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-0 w-[30%] h-[60%] bg-green-100/40 rounded-full blur-[80px]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-emerald-100 shadow-sm text-xs font-black text-emerald-700 uppercase tracking-widest"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ஆதரவு மற்றும் விற்பனை</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight"
          >
            எங்களைத் தொடர்பு <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">கொள்க.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-500 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-medium"
          >
            எங்கள் பண்ணை தயாரிப்புகள் அல்லது இயற்கை முறைகளைப் பற்றி ஏதேனும் கேள்விகள் உள்ளதா? எங்களைத் தொடர்பு கொள்ளவும்.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col lg:flex-row"
        >
          
          {/* Contact Info */}
          <div className="lg:w-2/5 bg-slate-900 p-12 lg:p-20 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-6 tracking-tight">தொடர்பு விவரங்கள்</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-16">
                படிவத்தைப் பூர்த்தி செய்யவும், எங்கள் குழு 24 மணி நேரத்திற்குள் உங்களைத் தொடர்பு கொள்ளும்.
              </p>

              <div className="space-y-10">
                {[
                  { icon: <Phone />, label: "விற்பனை மற்றும் ஆதரவு", val: "+91 98765 43210" },
                  { icon: <Mail />, label: "மின்னஞ்சல் அனுப்புங்கள்", val: "hello@vivasayi.com" },
                  { icon: <MapPin />, label: "தலைமையகம்", val: "கோயம்புத்தூர், தமிழ்நாடு" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-6 group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all duration-300">
                      {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6 text-emerald-400 group-hover:text-white" })}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-black uppercase tracking-widest">{item.label}</div>
                      <div className="text-xl font-bold mt-1">{item.val}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-16 mt-16 border-t border-white/10">
              <div className="flex space-x-6">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <motion.a 
                    key={i}
                    href="#" 
                    whileHover={{ scale: 1.2, y: -5 }}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all text-slate-400"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-3/5 p-12 lg:p-20">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-800 ml-1">முதல் பெயர்</label>
                  <input 
                    type="text" 
                    placeholder="உதாரணம்: லோகேஷ்"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-800 ml-1">கடைசி பெயர்</label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-slate-800 ml-1">மின்னஞ்சல் முகவரி</label>
                <input 
                  type="email" 
                  placeholder="hello@company.com"
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-slate-800 ml-1">செய்தி</label>
                <textarea 
                  rows={5}
                  placeholder="நாங்கள் உங்களுக்கு எப்படி உதவ முடியும்?"
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none font-medium"
                />
              </div>

              <div className="pt-6">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-12 py-5 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center space-x-3 shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all"
                >
                  <Send className="w-5 h-5" />
                  <span>செய்தி அனுப்பு</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
