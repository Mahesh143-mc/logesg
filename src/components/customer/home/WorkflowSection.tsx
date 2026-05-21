import React, { useMemo } from 'react';
import { m } from 'motion/react';
import { ShoppingBag, ShoppingCart, Truck, Package, ArrowRight } from 'lucide-react';

interface WorkflowSectionProps {
  language: 'ta' | 'en';
  copy: any;
}

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  language,
  copy
}) => {
  // Workflow Steps Config Array
  const workflowSteps = useMemo(() => [
    {
      icon: ShoppingBag,
      title: copy.step1Title,
      desc: copy.step1Desc,
      accentColor: "emerald",
      bgClass: "from-emerald-500/20 via-transparent to-emerald-500/10",
      cardBg: "bg-emerald-100/80 dark:bg-emerald-950/45 border-emerald-500/35 dark:border-emerald-500/25 shadow-lg shadow-emerald-500/[0.04]",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      iconActiveBg: "group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-emerald-500/35",
      badgeBg: "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      cardBorder: "hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-emerald-500/10",
      textClass: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
    },
    {
      icon: ShoppingCart,
      title: copy.step2Title,
      desc: copy.step2Desc,
      accentColor: "amber",
      bgClass: "from-amber-500/20 via-transparent to-amber-500/10",
      cardBg: "bg-amber-100/80 dark:bg-amber-950/45 border-amber-500/35 dark:border-amber-500/25 shadow-lg shadow-amber-500/[0.04]",
      iconBg: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
      iconActiveBg: "group-hover:bg-amber-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-amber-500/35",
      badgeBg: "bg-amber-100 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-500/30",
      cardBorder: "hover:border-amber-500/50 dark:hover:border-amber-500/40 hover:shadow-amber-500/10",
      textClass: "group-hover:text-amber-600 dark:group-hover:text-amber-400"
    },
    {
      icon: Truck,
      title: copy.step3Title,
      desc: copy.step3Desc,
      accentColor: "teal",
      bgClass: "from-teal-500/20 via-transparent to-teal-500/10",
      cardBg: "bg-teal-100/80 dark:bg-teal-950/45 border-teal-500/35 dark:border-teal-500/25 shadow-lg shadow-teal-500/[0.04]",
      iconBg: "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30",
      iconActiveBg: "group-hover:bg-teal-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-teal-500/35",
      badgeBg: "bg-teal-100 dark:bg-teal-500/30 text-teal-700 dark:text-teal-300 border-teal-500/30",
      cardBorder: "hover:border-teal-500/50 dark:hover:border-teal-500/40 hover:shadow-teal-500/10",
      textClass: "group-hover:text-teal-600 dark:group-hover:text-teal-400"
    },
    {
      icon: Package,
      title: copy.step4Title,
      desc: copy.step4Desc,
      accentColor: "lime",
      bgClass: "from-lime-500/20 via-transparent to-lime-500/10",
      cardBg: "bg-lime-100/80 dark:bg-lime-950/45 border-lime-500/35 dark:border-lime-500/25 shadow-lg shadow-lime-500/[0.04]",
      iconBg: "bg-lime-100 dark:bg-lime-500/20 text-lime-600 dark:text-lime-400 border-lime-500/30",
      iconActiveBg: "group-hover:bg-lime-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-lime-500/35",
      badgeBg: "bg-lime-100 dark:bg-lime-500/30 text-lime-700 dark:text-lime-300 border-lime-500/30",
      cardBorder: "hover:border-lime-500/50 dark:hover:border-lime-500/40 hover:shadow-lime-500/10",
      textClass: "group-hover:text-lime-600 dark:group-hover:text-lime-400"
    }
  ], [copy]);

  return (
    <section id="bento-features" className="py-24 md:py-32 border-y border-slate-200/50 dark:border-white/5 relative bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      
      {/* Soft floating blur gradients orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[130px] animate-float-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-lime-500/5 dark:bg-lime-500/10 blur-[120px] animate-float-fast" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex px-3 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4 font-poppins"
          >
            {copy.workflowTag}
          </m.div>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight font-poppins"
          >
            {language === "ta" ? (
              <>
                <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">லோகேஷ் விவசாயி</span> எவ்வாறு செயல்படுகிறது
              </>
            ) : (
              <>
                How <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">Logesh Vivasayi</span> Works
              </>
            )}
          </m.h2>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold mt-3 max-w-xl mx-auto"
          >
            {copy.workflowSubheading}
          </m.p>
        </div>

        {/* Workflow Cards Grid */}
        <div className="relative">
          
          {/* Desktop Connecting Line between cards */}
          <div className="absolute top-[40%] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-emerald-500/20 via-lime-500/40 to-emerald-500/20 -translate-y-1/2 hidden lg:block z-0 overflow-hidden">
            {/* Laser scanning dot walking the line */}
            <m.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
              className="w-1/3 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {workflowSteps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <m.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="relative group"
                >
                  {/* Step Card Container */}
                  <m.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-full h-full rounded-[2rem] ${step.cardBg} backdrop-blur-xl border p-6 md:p-7.5 flex flex-col justify-start items-start text-left shadow-lg shadow-slate-100/10 dark:shadow-black/15 relative overflow-hidden transition-all duration-300 min-h-[220px] lg:min-h-[250px] ${step.cardBorder}`}
                  >
                    
                    {/* Glowing card base hover background leak */}
                    <div className={`absolute -inset-px bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none -z-10 ${step.bgClass}`} />

                    {/* Step badge bubble */}
                    <div className={`absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-full text-xs font-black font-poppins border ${step.badgeBg}`}>
                      {idx + 1}
                    </div>

                    {/* Glowing Accent Border Border Top */}
                    <div className={`absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      step.accentColor === 'emerald' ? 'from-transparent via-emerald-400 to-transparent' :
                      step.accentColor === 'amber' ? 'from-transparent via-amber-400 to-transparent' :
                      step.accentColor === 'teal' ? 'from-transparent via-teal-400 to-transparent' :
                      'from-transparent via-lime-400 to-transparent'
                    }`} />

                    {/* Icon container */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-md group-hover:scale-110 mb-5 ${step.iconBg} ${step.iconActiveBg}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2 mt-2">
                      <h3 className={`text-lg font-black text-slate-950 dark:text-white tracking-tight font-poppins transition-colors ${step.textClass}`}>
                        {step.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                  </m.div>

                  {/* Glowing connector arrows for Desktop (idx < 3) */}
                  {idx < 3 && (
                    <div className="absolute top-[40%] -right-4 -translate-y-1/2 z-30 hidden lg:flex items-center justify-center pointer-events-none">
                      <m.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shadow-lg text-emerald-500 dark:text-emerald-400"
                      >
                        <ArrowRight className="w-4 h-4 font-black" />
                      </m.div>
                    </div>
                  )}

                </m.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
