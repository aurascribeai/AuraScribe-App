
import React from 'react';
import {
  Languages,
  Bot,
  ShieldCheck,
  FileText,
  Share2,
  GraduationCap,
  Cable,
  Mic
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const Features: React.FC = () => {
  const { t } = useLanguage();

  const icons = [FileText, Languages, Bot, ShieldCheck, FileText, Share2, Cable, Mic];

  // Use local AI_Images for features
  const cardImages = [
    '/AI_Images/AI_Image_1.jpg',
    '/AI_Images/AI_Image_2.jpg',
    '/AI_Images/AI_Image_3.jpg',
    '/AI_Images/AI_Image_4.jpg',
    '/AI_Images/AI_Image_5.jpg',
    '/AI_Images/AI_Image_6.jpg',
    '/AI_Images/AI_Image_7.jpg',
    '/AI_Images/AI_Image_8.jpg',
  ];

  // Bento Grid Layout Definitions
  const bentoClasses = [
    "md:col-span-2 md:row-span-2", // 1. Complete Documentation
    "md:col-span-2 md:row-span-2", // 2. Bilingual Brain
    "md:col-span-1 md:row-span-1", // 3. Multi-Agent
    "md:col-span-1 md:row-span-1", // 4. Compliance
    "md:col-span-1 md:row-span-1", // 5. Auto Forms
    "md:col-span-1 md:row-span-1", // 6. Sharing
    "md:col-span-1 md:row-span-1", // 7. EMR Sync
    "md:col-span-3 md:row-span-1", // 8. Voice-First
  ];

  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16 md:mb-20 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-neon-400/10 border border-neon-400/20 rounded-full text-neon-400 text-xs font-mono uppercase mb-4"
          >
            <Bot size={14} />
            <span>Next-Gen Capabilities</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-4xl lg:text-7xl font-bold text-white mb-6 tracking-tighter"
          >
            {t.features.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl font-light border-l-4 border-neon-400 pl-6 ml-0 md:ml-2"
          >
            {t.features.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(240px,auto)]">
          {t.features.items.map((feature, index) => {
            const Icon = icons[index] || Bot;
            const bgImage = cardImages[index];
            const hasImage = !!bgImage;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`
                  ${bentoClasses[index] || "col-span-1 row-span-1"}
                  group relative rounded-[2rem] md:rounded-[2.5rem] border border-white/10 
                  bg-slate-900/60 backdrop-blur-md overflow-hidden
                  hover:border-neon-400/50 transition-all duration-500
                  hover:shadow-[0_0_50px_rgba(0,255,163,0.15)]
                  flex flex-col justify-between
                  min-h-[280px] md:min-h-0
                `}
              >
                {/* Background Image with Overlay */}
                {hasImage && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-60"
                      style={{ backgroundImage: `url(${bgImage})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
                  </>
                )}

                {/* Glass Gradient for non-image cards */}
                {!hasImage && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                )}

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

                {/* Content */}
                <div className="p-6 md:p-8 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center 
                      transition-all duration-300 shadow-lg
                      ${hasImage ? 'bg-white/10 text-white backdrop-blur-md border border-white/20' : 'bg-slate-800 text-neon-400 border border-white/5'}
                      group-hover:scale-110 group-hover:bg-neon-400 group-hover:text-slate-950
                    `}>
                      <Icon size={20} className="md:w-6 md:h-6" />
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-bold text-white mb-2 tracking-tight ${hasImage ? 'text-2xl md:text-4xl' : 'text-xl'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${hasImage ? 'text-slate-300' : 'text-slate-400'} group-hover:text-white transition-colors`}>
                      {feature.desc}
                    </p>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-neon-400/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
