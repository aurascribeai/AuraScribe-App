
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/Button';
import { SIGNUP_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

export const Pricing: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-400/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-slate-400">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {t.pricing.tiers.map((tier, index) => {
            const isHighlighted = index === 1; // Pro plan is middle index
            const isEnterprise = index === 2; // Clinic/Custom plan
            
            // Wire buttons: Free/Pro -> App Signup, Enterprise -> Contact Form
            const buttonHref = isEnterprise ? '#contact' : SIGNUP_URL;

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col p-6 md:p-8 rounded-3xl transition-all duration-500 group ${
                  isHighlighted
                    ? 'bg-white/10 backdrop-blur-xl border border-neon-400 shadow-[0_0_40px_rgba(0,255,163,0.1)] md:scale-105 z-10' 
                    : 'bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neon-400 text-slate-950 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,163,0.4)]">
                    {t.pricing.mostPopular}
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${isHighlighted ? 'text-neon-400' : 'text-white'}`}>{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.price !== 'Custom' && tier.price !== '$0' && tier.price !== '0 $' && tier.price !== 'Sur mesure' && <span className="text-slate-400 font-medium">/mo</span>}
                  </div>
                  <p className="text-sm text-slate-400 mt-4 leading-relaxed">{tier.desc}</p>
                </div>

                <div className="h-px bg-white/10 mb-8"></div>

                <div className="flex-grow space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-0.5 ${isHighlighted ? 'text-neon-400 bg-neon-400/10' : 'text-slate-400 bg-white/5'}`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={isHighlighted ? 'primary' : 'outline'} 
                  href={buttonHref}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
