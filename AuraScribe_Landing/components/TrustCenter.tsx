import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, Lock, Server, Eye, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

export const TrustCenter: React.FC = () => {
    const { t } = useLanguage();
    const content = t.trustCenter;

    const icons = [FileText, Server, Eye, Lock, Globe];

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-950 relative">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-400/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <Button
                    variant="ghost"
                    href="#"
                    className="mb-8 pl-0 hover:bg-transparent text-slate-400 hover:text-neon-400 group"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Button>

                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-neon-400/30 text-neon-400 mb-6 shadow-[0_0_30px_rgba(0,255,163,0.1)]"
                    >
                        <ShieldCheck size={32} />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        {content.title}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        {content.subtitle}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="bg-slate-900/80 p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText size={20} className="text-neon-400" />
                                {content.reportTitle}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1 font-mono">
                                REF: AUDIT-2024-QC-001 • {content.date}
                            </p>
                        </div>
                        <div className="px-3 py-1 bg-neon-400/10 border border-neon-400/20 text-neon-400 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
                            Audit Passed
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-12">
                        {content.sections.map((section, index) => {
                            const Icon = icons[index] || FileText;
                            return (
                                <div key={index} className="relative pl-8 md:pl-12 border-l border-white/10">
                                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-slate-400">
                                        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
                                        {section.title}
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-sm md:text-base bg-white/5 p-6 rounded-xl border border-white/5">
                                        {section.content}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-slate-900/80 p-6 text-center border-t border-white/10">
                        <p className="text-xs text-slate-500">
                            This document serves as a public summary of our internal compliance audit.
                            Full technical documentation is available to regulatory bodies upon request.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TrustCenter;
