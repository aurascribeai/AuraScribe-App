
import React from 'react';
import { Mic, BrainCircuit, FileSignature, Network, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  const icons = [Mic, BrainCircuit, FileSignature, Network];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Circuitry Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            {t.howItWorks.title}
          </motion.h2>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            {t.howItWorks.subtitle}
          </motion.p>
        </div>

        <div className="relative">
          {/* Animated Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-slate-800 -z-10 overflow-hidden">
             <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-neon-400 to-transparent animate-[shimmer_3s_infinite]"></div>
          </div>

          <motion.div 
             variants={container}
             initial="hidden"
             whileInView="show"
             viewport={{ once: true }}
             className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8"
          >
            {t.howItWorks.steps.map((step, index) => {
              const Icon = icons[index];
              return (
                <motion.div 
                  key={index} 
                  variants={item}
                  className="flex flex-col items-center text-center group relative"
                >
                  {/* Step Card */}
                  <div className="relative mb-6 md:mb-8">
                     {/* Pulsing Ring */}
                     <div className="absolute inset-0 rounded-full bg-neon-400/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                     
                     <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-900 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10 group-hover:border-neon-400 group-hover:shadow-[0_0_50px_rgba(0,255,163,0.3)] transition-all duration-500">
                        {/* Inner Glass */}
                        <div className="absolute inset-2 rounded-full bg-white/5 backdrop-blur-sm"></div>
                        
                        <Icon size={32} className="md:w-10 md:h-10 text-slate-400 group-hover:text-neon-400 transition-all duration-500 relative z-20 group-hover:scale-110" />
                        
                        {/* Number Badge */}
                        <div className="absolute -top-1 -right-1 w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-800 border border-white/10 text-white flex items-center justify-center font-bold text-sm group-hover:bg-neon-400 group-hover:text-slate-950 transition-colors z-30 shadow-lg">
                          {index + 1}
                        </div>
                     </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm px-4">
                    {step.desc}
                  </p>

                  {/* Connecting Arrows - Mobile (Down) and Desktop (Right). Hidden on Tablet grid to avoid confusion */}
                  {index < 3 && (
                    <div className="mt-8 text-slate-700 absolute -bottom-10 left-1/2 -translate-x-1/2 lg:static lg:mt-0 lg:translate-x-0 lg:absolute lg:top-1/3 lg:-right-4 lg:text-slate-700 block md:hidden lg:block">
                      <ArrowRight size={24} className="rotate-90 lg:rotate-0" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
