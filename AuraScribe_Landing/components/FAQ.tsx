import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-slate-950 relative border-t border-white/5 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-neon-400 text-xs font-mono uppercase mb-4">
            <HelpCircle size={14} />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            {t.faq.title}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {t.faq.items.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'bg-white/10 border-neon-400/30 shadow-[0_0_20px_rgba(0,255,163,0.05)]' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                    {item.q}
                  </span>
                  <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isOpen ? 'bg-neon-400 text-slate-950 rotate-90' : 'bg-white/5 text-slate-400'
                  }`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};