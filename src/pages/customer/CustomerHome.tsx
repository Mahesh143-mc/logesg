import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Award, ShieldCheck, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

// Hero Images
import hero1 from '../../image/1.jpg';
import hero2 from '../../image/2.jpeg';
import hero3 from '../../image/3.jpg';
import hero4 from '../../image/4.jpg';
import hero5 from '../../image/6.jpg';

const heroImages = [hero1, hero2, hero3, hero4, hero5];

export function CustomerHome() {
  const { setCurrentCustomerPage } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "உயர்ந்த தரம்",
      desc: "எங்கள் பண்ணைகளில் இருந்து நேரடியாகப் பறிக்கப்பட்ட பொருட்கள், உங்கள் மேசைக்கு புத்துணர்ச்சியுடன் வரும்."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "100% இயற்கை",
      desc: "தீங்கு விளைவிக்கும் இரசாயனங்கள் இன்றி வளர்க்கப்படுகிறது. உங்கள் ஆரோக்கியமே எங்களின் நோக்கம்."
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "வேகமான விநியோகம்",
      desc: "காலையில் அறுவடை செய்யப்பட்டு, மாலையில் உங்கள் வீட்டிற்கு விநியோகிக்கப்படுகிறது."
    }
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={heroImages[currentImageIndex]}
              alt="Premium Farm"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">இன்று அறுவடை செய்யப்பட்டு விநியோகிக்கப்படுகிறது</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-tight mb-6"
            >
              தூய அறுவடை, <br />
              <span className="relative inline-block mt-4">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300">
                  புதிய விநியோகம்.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              இயற்கை விவசாய பொருட்களை வாங்குவதற்கான நவீன வழி. எங்களின் தொழில்நுட்பம் சார்ந்த பண்ணைகளில் இருந்து நேரடியாக உங்கள் வீட்டு வாசலுக்கு.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <button
                onClick={() => {
                  setCurrentCustomerPage('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-600/40 active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span>பொருட்களைப் பார்க்க</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setCurrentCustomerPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-6 bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl"
              >
                தொடர்பு கொள்ள
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features with Scroll Animation */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-slate-50 -skew-y-3 origin-right -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6"
            >
              ஏன் லோகேஷ் விவசாயி?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-lg font-medium"
            >
              நாங்கள் பாரம்பரிய விவசாய அறிவை நவீன தொழில்நுட்பத்துடன் இணைத்து சிறந்த அனுபவத்தை வழங்குகிறோம்.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.1)] transition-all duration-500 group"
              >
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-8 transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                  {React.cloneElement(feature.icon as React.ReactElement, { className: "w-10 h-10" })}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section with Parallax Effect */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900 rounded-[4rem] p-10 sm:p-20 relative overflow-hidden"
          >
            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#10b981_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="inline-flex px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black tracking-widest uppercase">
                  எங்கள் உறுதிப்பாடு
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white leading-[1] tracking-tighter">
                  வெளிப்படையான <br />
                  <span className="text-emerald-400">விவசாயம்.</span>
                </h2>
                <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  ஒவ்வொரு தயாரிப்பும் மண்ணின் ஆரோக்கியம் மற்றும் பல்லுயிர் பெருக்கத்திற்காக துல்லியமான கவனத்துடன் விளைவிக்கப்படுகிறது.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  {['இயற்கை மண்', 'பாரம்பரிய விதைகள்', 'பூச்சிக்கொல்லி இன்றி', 'நேரடி விநியோகம்'].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center space-x-3 text-slate-100 font-bold bg-white/5 border border-white/10 p-4 rounded-2xl"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-8">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-800 shadow-2xl relative"
                  >
                    <img src="https://images.unsplash.com/photo-1595856754020-0081d06e2361?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-800 shadow-2xl relative translate-y-12"
                  >
                    <img src="https://images.unsplash.com/photo-1592681890670-8bf1952d7e4b?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Farm Gallery Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6"
            >
              எங்கள் <span className="text-emerald-600">பண்ணை கேலரி</span>
            </motion.h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              இயற்கையின் அழகையும் எங்கள் கடின உழைப்பையும் இங்கே காணலாம். தூய்மையான விவசாயத்தின் சில காட்சிகள்.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop', title: 'பசுமையான வயல்' },
              { url: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=800&auto=format&fit=crop', title: 'இயற்கை அறுவடை' },
              { url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=800&auto=format&fit=crop', title: 'பண்ணை பராமரிப்பு' },
              { url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800&auto=format&fit=crop', title: 'நவீன விவசாயம்' },
              { url: 'https://images.unsplash.com/photo-1595033538458-9480011d3382?q=80&w=800&auto=format&fit=crop', title: 'புதிய காய்கறிகள்' },
              { url: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?q=80&w=800&auto=format&fit=crop', title: 'இயற்கை உரம்' }
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <span className="text-white font-bold text-xl">{img.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
