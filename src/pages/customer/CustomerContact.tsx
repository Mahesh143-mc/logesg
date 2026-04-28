import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send, Instagram, Facebook, Twitter } from 'lucide-react';

export function CustomerContact() {
  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/80 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-600 uppercase tracking-wider"
          >
            <span>Support & Sales</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight"
          >
            Get in touch
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Have questions about our enterprise plans, organic processes, or just want to say hi? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Contact Info */}
          <div className="lg:w-2/5 bg-slate-900 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Contact Information</h2>
              <p className="text-slate-400 leading-relaxed mb-12">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-8">
                <div className="flex items-center space-x-5 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 transition-colors">
                    <Phone className="w-5 h-5 text-indigo-300 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sales & Support</div>
                    <div className="text-lg font-medium mt-0.5">+91 98765 43210</div>
                  </div>
                </div>

                <div className="flex items-center space-x-5 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 transition-colors">
                    <Mail className="w-5 h-5 text-indigo-300 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Us</div>
                    <div className="text-lg font-medium mt-0.5">hello@vivasayi.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-5 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 transition-colors">
                    <MapPin className="w-5 h-5 text-indigo-300 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Headquarters</div>
                    <div className="text-lg font-medium mt-0.5">Coimbatore, Tamil Nadu</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-12 mt-12 border-t border-white/10">
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all text-slate-400">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all text-slate-400">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all text-slate-400">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-3/5 p-10 lg:p-14">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 ml-1">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Jane"
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="jane@company.com"
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 ml-1">Message</label>
                <textarea 
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
