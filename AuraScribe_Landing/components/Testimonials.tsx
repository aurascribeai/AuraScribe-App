
import React from 'react';
import { Quote } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Testimonials: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-lg text-slate-400">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {t.testimonials.items.map((item, index) => (
            <div 
              key={index} 
              className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col"
            >
              <div className="mb-6 text-neon-400 opacity-80">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg shadow-glow">★</span>
                ))}
              </div>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed italic flex-grow">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-lg">
                   {item.author.charAt(4)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{item.author}</h4>
                  <p className="text-sm text-slate-500">{item.role}</p>
                  <p className="text-xs text-neon-400 font-mono uppercase tracking-wide mt-0.5">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
