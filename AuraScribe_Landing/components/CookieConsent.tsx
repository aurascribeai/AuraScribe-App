
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

export const CookieConsent: React.FC = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('aurascribe_consent');
    if (!consent) {
      // Small delay to not overwhelm user immediately on load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('aurascribe_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('aurascribe_consent', 'declined');
    setIsVisible(false);
  };

  const content = {
    fr: {
      title: "Conformité & Confidentialité",
      text: "Conformément à la Loi 25, nous vous informons que vos données résident exclusivement à Montréal. Nous utilisons des témoins essentiels pour améliorer votre expérience.",
      accept: "Accepter",
      decline: "Refuser"
    },
    en: {
      title: "Compliance & Privacy",
      text: "In compliance with Law 25, we ensure your data resides exclusively in Montreal. We use essential cookies to improve your experience.",
      accept: "Accept",
      decline: "Decline"
    }
  };

  const t = content[language];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, type: "spring", damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100]"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-start gap-4 mb-4 relative z-10">
              <div className="p-2 bg-neon-400/10 rounded-lg text-neon-400 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">{t.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t.text}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end relative z-10">
              <button 
                onClick={handleDecline}
                className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 transition-colors"
              >
                {t.decline}
              </button>
              <Button onClick={handleAccept} size="sm" variant="primary">
                {t.accept}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
