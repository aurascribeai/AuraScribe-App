
import React from 'react';
import { Activity, FileText, Brain, Sparkles, Target, Zap, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const CoreTech: React.FC = () => {
  const { t } = useLanguage();

  // Mapping translated keys to IDs
  const features = [
    { id: 'transcripts', label: t.coreTech.nodes.transcripts, icon: FileText, x: 20, y: 25, delay: 0 },
    { id: 'topics', label: t.coreTech.nodes.topics, icon: Sparkles, x: 75, y: 15, delay: 0.2 },
    { id: 'formatting', label: t.coreTech.nodes.formatting, icon: Zap, x: 85, y: 55, delay: 0.4 },
    { id: 'intent', label: t.coreTech.nodes.intent, icon: Target, x: 70, y: 80, delay: 0.6 },
    { id: 'sentiment', label: t.coreTech.nodes.sentiment, icon: Activity, x: 25, y: 75, delay: 0.8 },
    { id: 'model', label: t.coreTech.nodes.model, icon: Brain, x: 10, y: 50, delay: 1.0 },
  ];

  return (
    <section className="py-24 bg-slate-950 overflow-hidden relative min-h-[500px] md:min-h-[700px] flex items-center justify-center border-t border-white/5">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,163,0.03)_0%,transparent_60%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center mb-16 md:mb-20 relative z-20">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-neon-400/10 border border-neon-400/20 rounded-full text-neon-400 text-xs font-mono uppercase mb-4"
            >
              <Waves size={14} />
              <span>Under the Hood</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
            >
              {t.coreTech.title}
            </motion.h2>
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
              className="text-lg text-slate-400 max-w-2xl mx-auto"
            >
              {t.coreTech.subtitle}
            </motion.p>
        </div>
        
        {/* Radar Animation Container */}
        <div className="relative h-[400px] md:h-[600px] w-full max-w-5xl mx-auto flex items-center justify-center perspective-1000">
          
          {/* Rotating Radar Sweep */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
             <div className="w-[350px] md:w-[800px] h-[350px] md:h-[800px] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,255,163,0.1)_0deg,transparent_60deg)] rounded-full animate-[spin_8s_linear_infinite]"></div>
          </div>

          {/* Concentric Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[150, 250, 350, 500, 700].map((size, i) => (
              <div 
                key={i}
                className={`rounded-full border border-white/5 absolute animate-[pulse_4s_ease-in-out_infinite] ${size > 350 ? 'hidden md:block' : ''}`}
                style={{ 
                  width: size, 
                  height: size, 
                  animationDelay: `${i * 1}s`,
                  opacity: 0.5 - (i * 0.1)
                }}
              />
            ))}
          </div>
            
          {/* Center Core */}
          <div className="relative z-10 animate-float">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-900 rounded-full border border-neon-400/50 flex items-center justify-center shadow-[0_0_80px_rgba(0,255,163,0.3)] relative group cursor-pointer hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-neon-400/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 bg-neon-400/10 rounded-full animate-pulse"></div>
              <Activity size={32} className="md:w-10 md:h-10 text-neon-400 relative z-20 drop-shadow-[0_0_10px_rgba(0,255,163,0.8)]" />
            </div>
            {/* Center Connection Lines */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 800 600">
               <defs>
                 <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="rgba(0, 255, 163, 0)" />
                   <stop offset="50%" stopColor="rgba(0, 255, 163, 0.2)" />
                   <stop offset="100%" stopColor="rgba(0, 255, 163, 0)" />
                 </linearGradient>
               </defs>
               {features.map((f, i) => {
                 // Convert % to approximate px coordinates for SVG lines based on 800x600 viewbox
                 // Center is 400, 300
                 const targetX = (f.x / 100) * 800;
                 const targetY = (f.y / 100) * 600;
                 return (
                   <motion.line 
                     key={i}
                     initial={{ pathLength: 0, opacity: 0 }}
                     whileInView={{ pathLength: 1, opacity: 1 }}
                     transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                     x1="400" 
                     y1="300" 
                     x2={targetX} 
                     y2={targetY} 
                     stroke="url(#line-gradient)" 
                     strokeWidth="1"
                   />
                 )
               })}
            </svg>
          </div>

          {/* Floating Nodes */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {features.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: f.delay, type: "spring", stiffness: 100 }}
                className="absolute pointer-events-auto"
                style={{ left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-2 md:px-4 md:py-3 rounded-xl flex items-center gap-2 md:gap-3 shadow-xl hover:border-neon-400/50 hover:bg-slate-800 transition-all cursor-default group hover:shadow-[0_0_20px_rgba(0,255,163,0.15)]"
                >
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-neon-400 shadow-[0_0_10px_#00FFA3] animate-pulse" />
                  <span className="text-white font-medium text-xs md:text-sm tracking-wide group-hover:text-neon-400 transition-colors whitespace-nowrap">{f.label}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
