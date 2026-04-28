import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Award, ShieldCheck, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function CustomerHome() {
  const { setCurrentCustomerPage } = useStore();
  
  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Premium Quality",
      desc: "Handpicked produce directly from our fertile fields to your table, ensuring the highest standards of freshness."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "100% Organic",
      desc: "Grown without harmful chemicals. We use sustainable practices for your family's health and the earth's future."
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Same-Day Delivery",
      desc: "Harvested in the morning, delivered by evening. Experience the unmatched taste of farm-fresh produce."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Harvesting now for today's delivery</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-8"
            >
              Pure harvest, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
                delivered fresh.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Experience the modern way to buy organic produce. Directly from our tech-enabled farms to your doorstep with guaranteed freshness and traceability.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={() => {
                  setCurrentCustomerPage('product');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-semibold transition-all shadow-sm shadow-slate-900/10 active:scale-95 group"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => {
                  setCurrentCustomerPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-semibold transition-all active:scale-95"
              >
                Contact Sales
              </button>
            </motion.div>
          </div>

          {/* Hero Image / Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200 bg-slate-100 relative group">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop" 
                alt="Fresh organic produce" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-8 sm:p-12">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-2xl inline-block w-max">
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium">100% Quality Inspected</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Why choose Logesh Vivasayi?</h2>
            <p className="text-slate-500">We combine traditional farming wisdom with modern logistics to deliver an unparalleled experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Quality Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-16 lg:p-20 relative overflow-hidden">
            {/* Abstract glow inside dark card */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold tracking-wide">
                  Our Commitment
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                  Transparent farming, <br />
                  traceable quality.
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Every product from Logesh Vivasayi is grown with precise care for soil health and biodiversity. We don't just farm; we build sustainable agricultural systems for the future.
                </p>
                
                <ul className="space-y-4 pt-4">
                  {['Verified Organic Soil', 'Traditional Seed Varieties', 'Zero Chemical Pesticides'].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-slate-300 font-medium">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-6 relative">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-800 shadow-2xl relative translate-y-8">
                  <img src="https://images.unsplash.com/photo-1595856754020-0081d06e2361?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
                </div>
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-800 shadow-2xl relative -translate-y-8">
                  <img src="https://images.unsplash.com/photo-1592681890670-8bf1952d7e4b?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
