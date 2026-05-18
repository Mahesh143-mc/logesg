import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Users, Heart, Sprout, CheckCircle2, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';

export function CustomerAbout() {
  const { language } = useStore();
  const t = useTranslation(language);

  const stats = [
    { label: t('years_exp'), value: '3' },
    { label: t('happy_customers'), value: '200+' },
    { label: t('natural_products'), value: '100%' },
  ];

  const values = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: t('natural_title'),
      desc: t('natural_farming_desc'),
      cardBg: 'bg-emerald-100/90 border border-emerald-200/80',
      hoverStyle: 'hover:bg-emerald-200 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20',
      iconBg: 'bg-emerald-600 text-white',
      hoverIconBg: 'group-hover:bg-emerald-700',
      titleColor: 'text-emerald-900',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: t('customer_love'),
      desc: t('customer_love_desc'),
      cardBg: 'bg-rose-100/90 border border-rose-200/80',
      hoverStyle: 'hover:bg-rose-200 hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-400/20',
      iconBg: 'bg-rose-600 text-white',
      hoverIconBg: 'group-hover:bg-rose-700',
      titleColor: 'text-rose-900',
    },
    {
      icon: <Sprout className="w-6 h-6" />,
      title: t('sustainable_future'),
      desc: t('sustainable_future_desc'),
      cardBg: 'bg-amber-100/95 border border-amber-200/80',
      hoverStyle: 'hover:bg-amber-200 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15',
      iconBg: 'bg-amber-600 text-white',
      hoverIconBg: 'group-hover:bg-amber-700',
      titleColor: 'text-amber-955',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[10%] left-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-emerald-100/40 rounded-full blur-[80px] md:blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.15, 1, 1.15],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[20%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-50/50 rounded-full blur-[80px] md:blur-[100px]"
        />
      </div>

      {/* Page Header / Hero Banner Section */}
      <section className="relative w-full h-[360px] md:h-[420px] pt-24 md:pt-28 flex items-center overflow-hidden">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop"
            alt="Farm About Banner"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-zinc-950/90 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/30 via-transparent to-transparent z-10" />
        </div>

        {/* Hero Grid Container */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4.5 py-1.5 shadow-sm backdrop-blur-md"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">{language === 'ta' ? 'எங்கள் கதை' : 'Our Story'}</span>
          </motion.div>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center justify-center space-x-2 text-xs md:text-sm font-semibold tracking-wide text-emerald-300/80 mb-2">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => window.location.href = '/'}>{language === 'ta' ? 'முகப்பு' : 'Home'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => window.location.href = '/shop'}>{language === 'ta' ? 'அனைத்து தொகுப்புகள்' : 'All collections'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-100 font-bold">{language === 'ta' ? 'எங்களைப் பற்றி' : 'About Us'}</span>
          </nav>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase"
          >
            {t('about')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-emerald-100 max-w-3xl mx-auto leading-relaxed font-semibold px-4"
          >
            {t('about_hero_desc')}
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-transparent relative">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] sm:aspect-square rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl border border-emerald-900/10 shadow-emerald-950/5 hover:scale-[1.01] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" 
                  alt="Our Farm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-emerald-100 hidden sm:block">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-600/5">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-900">200+</div>
                    <div className="text-[10px] text-emerald-800/80 font-black uppercase tracking-wider leading-tight">{language === 'ta' ? 'மகிழ்ச்சியான வாடிக்கையாளர்கள்' : 'Happy Customers'}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6 md:space-y-8">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
                {language === 'ta' ? 'எங்கள் குறிக்கோள்' : 'OUR MISSION'}
              </h2>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold">
                {language === 'ta' 
                  ? 'எங்கள் சொந்த பண்ணையிலிருந்து புதிய மற்றும் பயனுள்ள பண்ணை பொருட்களை நேர்மையுடனும் அன்புடனும் நேரடியாக வாடிக்கையாளர்களுக்கு கொண்டு சேர்ப்பதே எங்கள் குறிக்கோள் ஆகும். ஒவ்வொரு தயாரிப்பும் தரம் மற்றும் பாரம்பரிய விவசாய மதிப்புகளுக்கு முக்கியத்துவம் அளித்து இயற்கையான முறையில் தயாரிக்கப்படுகிறது.' 
                  : 'Our goal is to bring fresh and useful farm products directly from our home farm to customers with honesty and care. Every product is prepared naturally with attention to quality and traditional farming values.'
                }
              </p>
              
              <div className="space-y-4">
                {[
                  language === 'ta' ? 'புதிய பண்ணை தயாரிப்புகள்' : 'Fresh Farm Products',
                  language === 'ta' ? 'இயற்கை மற்றும் வீட்டு முறை தயாரிப்பு தரம்' : 'Natural & Homemade Quality',
                  language === 'ta' ? 'மலிவான நேரடி விலை நிர்ணயம்' : 'Affordable Direct Pricing',
                  language === 'ta' ? 'நம்பகமான வாடிக்கையாளர் சேவை' : 'Trusted Customer Service'
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-3.5 text-slate-705 font-bold text-sm md:text-base bg-white/60 backdrop-blur-sm px-5 py-3.5 rounded-2xl border border-emerald-900/5 hover:border-emerald-600/25 transition-all shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-emerald-200/90 backdrop-blur-md border-y border-emerald-950/20 relative">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-3 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-center group"
              >
                <div className="text-4xl md:text-5xl font-black text-emerald-900 mb-2.5 group-hover:scale-105 transition-transform duration-300">{stat.value}</div>
                <div className="text-emerald-950/85 text-[11px] md:text-xs font-black uppercase tracking-widest leading-relaxed">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 bg-stone-200 border-t border-stone-300">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">{t('our_values')}</h2>
            <div className="w-16 h-1 bg-emerald-600 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${value.cardBg} ${value.hoverStyle} p-8 md:p-10 rounded-[2.5rem] shadow-sm hover:-translate-y-2 transition-all duration-300 relative group`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 ${value.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 ${value.hoverIconBg} transition-all duration-300 shadow-sm shadow-emerald-600/5`}>
                  {value.icon}
                </div>
                <h3 className={`text-lg md:text-xl font-black ${value.titleColor} mb-4 tracking-tight`}>{value.title}</h3>
                <p className="text-slate-700 leading-relaxed text-sm font-semibold">
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
