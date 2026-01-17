
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Database, Activity, FileJson, Server, Lock } from 'lucide-react';

export const Integrations: React.FC = () => {
  const { t } = useLanguage();

  const brands = [
    { name: "Omnimed", icon: Activity, color: "text-blue-400" },
    { name: "TELUS Health", icon: Database, color: "text-purple-400" },
    { name: "MYLE", icon: Server, color: "text-emerald-400" },
    { name: "RAMQ", icon: FileJson, color: "text-yellow-400" },
    { name: "SRFax", icon: Lock, color: "text-red-400" }
  ];

  return (
    <section id="integrations" className="py-20 bg-slate-950 border-t border-white/5 relative overflow-hidden">
      {/* Background glow for integration section */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h3 className="text-sm font-mono text-neon-400 mb-10 uppercase tracking-[0.2em] opacity-80 flex items-center justify-center gap-4">
          <span className="w-8 h-px bg-neon-400/50"></span>
          {t.integrations.title}
          <span className="w-8 h-px bg-neon-400/50"></span>
        </h3>
        
        <div className="flex flex-wrap justify-center gap-6">
           {brands.map((brand, i) => {
             const Icon = brand.icon;
             return (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 whileHover={{ scale: 1.05, y: -5 }}
                 className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-400/30 backdrop-blur-md px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg cursor-default group"
               >
                 <div className={`p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 transition-colors ${brand.color}`}>
                   <Icon size={20} />
                 </div>
                 <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">{brand.name}</span>
               </motion.div>
             );
           })}
        </div>
      </div>
    </section>
  );
};
