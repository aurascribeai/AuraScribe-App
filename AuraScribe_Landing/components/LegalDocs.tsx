import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

interface LegalDocProps {
  type: 'privacy' | 'terms' | 'cookies' | 'sale' | 'disclaimer';
}

export const LegalDocs: React.FC<LegalDocProps> = ({ type }) => {
  const { t } = useLanguage();

  const content = t.legal[type];

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Button
          variant="ghost"
          href="#"
          className="mb-8 pl-0 hover:bg-transparent text-slate-400 hover:text-neon-400 group"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '';
          }}
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>

        <article className="bg-slate-950/70 p-8 md:p-12 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {content.title}
          </h1>
          <p className="text-slate-500 mb-12 border-b border-white/5 pb-8 font-mono text-sm">
            {content.lastUpdated}
          </p>

          <div className="space-y-12">
            {content.sections.map((section, index) => (
              <section key={index}>
                <h2 className="text-xl font-bold text-white mb-4 border-l-2 border-neon-400 pl-4">
                  {section.heading}
                </h2>
                <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};

export default LegalDocs;
