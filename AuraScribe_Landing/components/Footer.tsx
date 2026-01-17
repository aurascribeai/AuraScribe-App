
import React from 'react';
import { Github, Twitter, Linkedin, Shield } from 'lucide-react';
import { Logo } from './ui/Logo';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-white mb-6">
              <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                <Logo className="w-6 h-6 text-neon-400" />
              </div>
              <span className="text-xl font-bold tracking-tight">AuraScribe</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 mb-6">
              {t.footer.tagline}
            </p>
            
            {/* Law 25 Privacy Officer Disclosure */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-[11px] leading-relaxed">
                <div className="flex items-center gap-2 text-white font-bold mb-2">
                    <Shield size={14} className="text-neon-400" />
                    <span>{language === 'fr' ? 'Responsable de la vie privée' : 'Privacy Officer'}</span>
                </div>
                <p className="text-slate-400">Salah Taileb</p>
                <p className="text-slate-400">salah.taileb@auralistech.ca</p>
                <p className="text-slate-500 mt-2 italic">
                    {language === 'fr' 
                      ? 'Conformément à la Loi 25 (QC)' 
                      : 'In accordance with Quebec Law 25'}
                </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">{t.footer.product}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="hover:text-neon-400 transition-colors">{t.nav.features}</a></li>
              <li><a href="#pricing" className="hover:text-neon-400 transition-colors">{t.nav.pricing}</a></li>
              <li><a href="#how-it-works" className="hover:text-neon-400 transition-colors">{t.nav.howItWorks}</a></li>
              <li><a href="#blog" className="hover:text-neon-400 transition-colors">{t.nav.blog}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t.footer.legal}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#privacy" className="hover:text-neon-400 transition-colors">{t.legal.privacy.title}</a></li>
              <li><a href="#terms" className="hover:text-neon-400 transition-colors">{t.legal.terms.title}</a></li>
              <li><a href="#cookies" className="hover:text-neon-400 transition-colors">{t.legal.cookies.title}</a></li>
              <li><a href="#sale" className="hover:text-neon-400 transition-colors">{t.legal.sale.title}</a></li>
              <li><a href="#disclaimer" className="hover:text-neon-400 transition-colors">{t.legal.disclaimer.title}</a></li>
              <li><a href="#trust" className="hover:text-neon-400 transition-colors font-semibold text-neon-400/80">Trust Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t.footer.connect}</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li><a href="#contact" className="hover:text-neon-400 transition-colors">{t.nav.contact}</a></li>
              <li><a href="#faq" className="hover:text-neon-400 transition-colors">{t.nav.faq}</a></li>
            </ul>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-neon-400 hover:text-slate-950 transition-all"><Twitter size={18} /></a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-neon-400 hover:text-slate-950 transition-all"><Linkedin size={18} /></a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-neon-400 hover:text-slate-950 transition-all"><Github size={18} /></a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 text-center text-sm text-slate-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AuraScribe Health Inc. {t.footer.rights}</p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-400 animate-pulse"></span>
            <span className="font-mono text-xs">{t.footer.status}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
