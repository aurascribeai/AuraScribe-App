
import React from 'react';
import { Server, ShieldCheck, Lock, CheckCircle, Database, Globe, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const Compliance: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="compliance" className="py-24 md:py-32 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-400/10 border border-neon-400/20 text-neon-400 rounded-full text-xs font-mono uppercase mb-8">
              <ShieldCheck size={14} />
              {t.compliance.tag}
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t.compliance.title} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-400 to-cyan-400">
                {t.compliance.titleHighlight}
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              {t.compliance.description}
            </p>

            <div className="space-y-4">
               {t.compliance.items.map((item, idx) => (
                 <div key={idx} className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-400/30 transition-all flex gap-4">
                    <div className="mt-1 shrink-0">
                      {idx === 0 && <Globe className="text-neon-400" size={20} />}
                      {idx === 1 && <Database className="text-cyan-400" size={20} />}
                      {idx === 2 && <Lock className="text-purple-400" size={20} />}
                      {idx === 3 && <Stethoscope className="text-emerald-400" size={20} />}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Holographic Terminal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1 }}
            className="relative perspective-1000 mt-8 lg:mt-0"
          >
            <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 border border-neon-400/30 shadow-[0_0_50px_rgba(0,255,163,0.1)] backdrop-blur-xl transform transition-transform hover:scale-[1.02]">
              {/* Glow overlay */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400 to-transparent"></div>
              
              {/* Header */}
              <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="text-xs font-mono text-neon-400/70">SECURE_SHELL_V2.0</div>
              </div>

              {/* Console Body */}
              <div className="p-4 md:p-8 font-mono text-xs md:text-sm space-y-4 overflow-x-auto">
                <div className="flex gap-3 whitespace-nowrap">
                  <span className="text-purple-400">root@aurascribe:~$</span>
                  <span className="text-white typing-effect">verify --region=montreal</span>
                </div>
                
                <div className="pl-4 border-l border-white/10 space-y-2 py-2">
                  <div className="flex justify-between text-slate-400 text-[10px] md:text-xs">
                    <span>PROTOCOL</span>
                    <span>STATUS</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-cyan-400">DATA_RESIDENCY</span>
                    <span className="text-neon-400 text-right">CONFIRMED (CA-EAST)</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-cyan-400">ENCRYPTION</span>
                    <span className="text-neon-400 text-right">AES-256-GCM</span>
                  </div>
                   <div className="flex justify-between gap-4">
                    <span className="text-cyan-400">PIPEDA/LAW25</span>
                    <span className="text-neon-400 text-right">COMPLIANT</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                   <span className="text-purple-400">root@aurascribe:~$</span>
                   <span className="w-2 h-4 bg-neon-400 animate-pulse"></span>
                </div>
              </div>
            </div>
            
            {/* Reflection under the card */}
            <div className="absolute -bottom-10 left-4 right-4 h-10 bg-neon-400/20 blur-xl rounded-[100%] opacity-30"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
