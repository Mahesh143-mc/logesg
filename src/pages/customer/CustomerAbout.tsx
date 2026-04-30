import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Users, Heart, Sprout, CheckCircle2 } from 'lucide-react';

export function CustomerAbout() {
  const stats = [
    { label: 'விவசாயிகள்', value: '50+' },
    { label: 'வருட அனுபவம்', value: '15+' },
    { label: 'மகிழ்ச்சியான வாடிக்கையாளர்கள்', value: '2000+' },
    { label: 'இயற்கை தயாரிப்புகள்', value: '100%' },
  ];

  const values = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "இயற்கை விவசாயம்",
      desc: "நாங்கள் இரசாயன உரங்கள் இன்றி, இயற்கை முறையில் பயிர்களை விளைவிக்கிறோம்."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "வாடிக்கையாளர் அன்பு",
      desc: "உங்களின் ஆரோக்கியமே எங்களின் முதல் முன்னுரிமை."
    },
    {
      icon: <Sprout className="w-6 h-6" />,
      title: "நிலையான எதிர்காலம்",
      desc: "மண்ணின் வளத்தை பாதுகாத்து அடுத்த தலைமுறைக்கு வளமான பூமியை வழங்குகிறோம்."
    }
  ];

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 bg-emerald-50/50 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6"
          >
            எங்களைப் பற்றி
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            லோகேஷ் விவசாயி என்பது வெறும் விற்பனை தளம் அல்ல, இது மண்ணையும் மக்களையும் இணைக்கும் ஒரு பாலம்.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] sm:aspect-square rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" 
                  alt="Our Farm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl border border-slate-100 hidden sm:block">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-black text-slate-900">50+</div>
                    <div className="text-[10px] md:text-sm text-slate-500 font-bold uppercase tracking-widest">நிபுணத்துவ விவசாயிகள்</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6 md:space-y-8">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">எங்களின் பயணம்</h2>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                பாரம்பரிய விவசாய முறைகளை நவீன தொழில்நுட்பத்துடன் இணைத்து, நுகர்வோருக்கு தரமான பொருட்களை வழங்குவதே எங்கள் நோக்கம். ஒவ்வொரு பயிரும் மிகுந்த கவனத்துடனும் அன்புடனும் வளர்க்கப்படுகிறது.
              </p>
              
              <div className="space-y-4">
                {[
                  'நேரடி பண்ணை விநியோகம்',
                  'ரசாயனமற்ற இயற்கை முறை',
                  'நியாயமான விலை',
                  'வாடிக்கையாளர் திருப்தி'
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-slate-700 font-bold text-sm md:text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-emerald-400 mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">எங்கள் கொள்கைகள்</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                  {value.icon}
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
