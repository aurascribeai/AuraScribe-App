
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, Navigation, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';

export const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
        setError("Please agree to the privacy policy to continue.");
        return;
    }
    setIsSubmitting(true);
    setError(null);
    
    try {
      const FORM_ENDPOINT = "https://formspree.io/f/xvzgkbbk";
      
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          consent_given: "Yes",
          _subject: `AuraScribe Lead: ${formData.subject}`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message via API");
      }
      
      setIsSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setConsent(false);
      setTimeout(() => setIsSent(false), 5000);

    } catch (err) {
      console.error(err);
      setError("Unable to send message. Please try again or contact us directly at " + t.contact.details.email);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-950 relative overflow-hidden border-t border-white/5">
      {/* Glow Effect */}
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-neon-400/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            {t.contact.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            {t.contact.subtitle}
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Contact Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 lg:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="text-2xl font-bold text-white mb-8">{t.contact.infoTitle}</h3>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neon-400 group-hover:bg-neon-400 group-hover:text-slate-950 transition-all duration-300 shrink-0">
                  <Mail size={24} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">Email</h4>
                  <a href={`mailto:${t.contact.details.email}`} className="text-base md:text-lg text-white hover:text-neon-400 transition-colors font-medium break-words block">
                    {t.contact.details.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-300 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">Phone</h4>
                  <a href={`tel:${t.contact.details.phone.replace(/[^0-9]/g, '')}`} className="text-lg text-white hover:text-cyan-400 transition-colors font-medium">
                    {t.contact.details.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-400 group-hover:text-slate-950 transition-all duration-300 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">Office</h4>
                  <p className="text-lg text-white leading-relaxed font-medium">
                    {t.contact.details.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Abstract Tech Map */}
            <div className="mt-12 w-full h-48 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,255,163,0.1)_0deg,transparent_60deg)] animate-[spin_4s_linear_infinite] rounded-full scale-[2] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-4 h-4 bg-neon-400 rounded-full animate-ping absolute opacity-75"></div>
                    <div className="w-4 h-4 bg-neon-400 rounded-full border-2 border-slate-900 z-10 relative"></div>
                    <div className="mt-2 px-3 py-1 bg-slate-900/80 backdrop-blur text-xs font-mono text-neon-400 rounded-full border border-neon-400/30">
                        LAVAL_HQ
                    </div>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">LAT: 45.55</div>
                    <div className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">LNG: -73.75</div>
                </div>
                <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.contact.details.address)}`}
                   target="_blank"
                   rel="noopener noreferrer" 
                   className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]"
                >
                    <div className="flex items-center gap-2 text-white font-bold bg-slate-800 px-4 py-2 rounded-full border border-white/20">
                        <Navigation size={16} /> Open Maps
                    </div>
                </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col gap-6"
          >
             <h3 className="text-2xl font-bold text-white">{t.contact.formTitle}</h3>
             
             {/* LAW 25 PHI WARNING */}
             <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                <ShieldAlert size={24} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed uppercase tracking-tight">
                  {t.contact.phiWarning}
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-300 ml-1">{t.contact.labels.name}</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-neon-400 focus:border-neon-400 text-white placeholder-slate-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-300 ml-1">{t.contact.labels.email}</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-neon-400 focus:border-neon-400 text-white placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-slate-300 ml-1">{t.contact.labels.subject}</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-neon-400 focus:border-neon-400 text-white placeholder-slate-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-slate-300 ml-1">{t.contact.labels.message}</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-neon-400 focus:border-neon-400 text-white placeholder-slate-600 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="flex items-start gap-3 py-2">
                    <input 
                        type="checkbox" 
                        id="privacyConsent" 
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-slate-950 text-neon-400 focus:ring-neon-400"
                        required
                    />
                    <label htmlFor="privacyConsent" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
                        {t.contact.labels.privacyConsent}
                    </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting || isSent}
                  className={`w-full ${isSent ? 'bg-green-500 hover:bg-green-600 border-green-500' : ''}`}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : isSent ? (
                    <>
                      <CheckCircle className="mr-2" /> {t.contact.labels.success}
                    </>
                  ) : (
                    <>
                       {t.contact.labels.submit} <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
             </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
