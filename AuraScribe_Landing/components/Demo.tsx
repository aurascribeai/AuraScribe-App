
import React, { useState, useEffect, useRef } from 'react';
import { Mic, FileText, Loader2, RotateCcw, Activity, Check, Sparkles, Brain, Stethoscope, Image as ImageIcon, Scan, Microscope, Info, AlertCircle, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

export const Demo: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'audio' | 'visual'>('audio');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Status states
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'generating' | 'complete'>('idle');

  // Audio Data
  const [displayedTranscript, setDisplayedTranscript] = useState('');
  const [displayedSoap, setDisplayedSoap] = useState({ s: '', o: '', a: '', p: '' });

  // Visual Data
  const [scanProgress, setScanProgress] = useState(0);
  const [visualResult, setVisualResult] = useState({ findings: '', diagnosis: '', confidence: '', recommendation: '' });

  // Simulation constants
  const fullTranscript = t.demo.rawTranscript;
  const soapData = t.demo.generatedSoap;
  const visualData = t.demo.visualAnalysis;

  // Image for visual demo
  const sampleImage = "https://images.unsplash.com/photo-1628151016024-bb9f187a5369?q=80&w=1000&auto=format&fit=crop";

  // Reset state when language or tab changes
  useEffect(() => {
    handleReset();
  }, [t, activeTab]);

  // --- AUDIO LOGIC ---
  useEffect(() => {
    if (activeTab === 'audio' && status === 'recording') {
      setDisplayedTranscript('');
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedTranscript((prev) => fullTranscript.slice(0, index));
        index++;
        if (index > fullTranscript.length) {
          clearInterval(interval);
          setTimeout(() => setStatus('processing'), 500);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [status, fullTranscript, activeTab]);

  useEffect(() => {
    if (activeTab === 'audio' && status === 'processing') {
      const timeout = setTimeout(() => {
        setStatus('generating');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [status, activeTab]);

  useEffect(() => {
    if (activeTab === 'audio' && status === 'generating') {
      const streamSection = async () => {
        const sections = ['s', 'o', 'a', 'p'] as const;
        for (const sec of sections) {
          await new Promise(r => setTimeout(r, 400));
          const text = soapData[sec];
          for (let i = 0; i <= text.length; i++) {
            setDisplayedSoap(prev => ({ ...prev, [sec]: text.slice(0, i) }));
            await new Promise(r => setTimeout(r, 10));
          }
        }
        setStatus('complete');
      };
      streamSection();
    }
  }, [status, soapData, activeTab]);

  // --- VISUAL LOGIC ---
  useEffect(() => {
    if (activeTab === 'visual' && status === 'processing') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setScanProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setStatus('generating');
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [status, activeTab]);

  useEffect(() => {
    if (activeTab === 'visual' && status === 'generating') {
      const fillData = async () => {
        await new Promise(r => setTimeout(r, 500));
        setVisualResult(prev => ({ ...prev, findings: visualData.findings }));
        await new Promise(r => setTimeout(r, 500));
        setVisualResult(prev => ({ ...prev, diagnosis: visualData.diagnosis, confidence: visualData.confidence }));
        await new Promise(r => setTimeout(r, 500));
        setVisualResult(prev => ({ ...prev, recommendation: visualData.recommendation }));
        setStatus('complete');
      };
      fillData();
    }
  }, [status, visualData, activeTab]);


  const handleStart = () => {
    if (activeTab === 'audio') setStatus('recording');
    else setStatus('processing');
  };

  // Handle text generation from textarea
  const handleGenerate = () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setDisplayedTranscript(inputText);
      setStatus('processing');
      setIsGenerating(false);
    }, 800);
  };

  const handleReset = () => {
    setStatus('idle');
    setDisplayedTranscript('');
    setDisplayedSoap({ s: '', o: '', a: '', p: '' });
    setScanProgress(0);
    setVisualResult({ findings: '', diagnosis: '', confidence: '', recommendation: '' });
    setInputText('');
    setIsGenerating(false);
  };

  const renderHighlightedTranscript = () => {
    if (status === 'recording' || status === 'idle') {
      return <p className="text-slate-300 leading-relaxed font-mono">{displayedTranscript}<span className="animate-pulse inline-block w-2 h-4 bg-neon-400 ml-1 align-middle"></span></p>;
    }
    const keywords = [
      "fatigue", "chronic", "chronique", "joint", "pain", "douleurs", "articulaires",
      "5mg", "prescription", "exam", "normal", "physique", "prednisone"
    ];
    let highlightedHtml = fullTranscript;
    keywords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedHtml = highlightedHtml.replace(regex, '<span class="text-neon-400 font-bold bg-neon-400/10 px-1 rounded">$1</span>');
    });
    return <p className="text-slate-300 leading-relaxed font-mono" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />;
  };

  return (
    <section id="demo" className="py-8 md:py-12 bg-slate-950 border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-neon-400 text-xs font-mono uppercase mb-4">
            <Sparkles size={14} />
            <span>Interactive Live Demo</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">{t.demo.title}</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">{t.demo.subtitle}</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 border border-white/10 p-1 rounded-full flex relative">
            <motion.div
              className="absolute top-1 bottom-1 bg-white/10 rounded-full"
              initial={false}
              animate={{
                left: activeTab === 'audio' ? '4px' : '50%',
                width: 'calc(50% - 4px)',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab('audio')}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'audio' ? 'text-neon-400 animate-pulse shadow-[0_0_10px_#00FFA3] bg-white/10' : 'text-slate-400 hover:text-white'}`}
              aria-current={activeTab === 'audio'}
            >
              <Mic size={16} /> {t.demo.modes.audio}
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'visual' ? 'text-neon-400 animate-pulse shadow-[0_0_10px_#00FFA3] bg-white/10' : 'text-slate-400 hover:text-white'}`}
              aria-current={activeTab === 'visual'}
            >
              <ImageIcon size={16} /> {t.demo.modes.visual}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto lg:h-[520px]">
          {/* Divider for mobile */}
          <div className="block lg:hidden w-full h-2 my-2 bg-gradient-to-r from-neon-400/10 via-white/5 to-cyan-400/10 rounded-full blur-sm" />

          {/* LEFT PANEL: INPUT */}
          <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-950/80 to-blue-900/40 backdrop-blur-2xl flex flex-col shadow-2xl transition-all duration-500 hover:border-blue-500/60 hover:shadow-[0_0_40px_#3b82f6] h-[260px] lg:h-auto order-1">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-slate-950/50">
              <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-widest">
                {activeTab === 'audio' ? <Mic size={16} /> : <Scan size={16} />}
                <span>{activeTab === 'audio' ? t.demo.inputTitle : t.demo.visualInputTitle}</span>
              </div>
            </div>

            <div className="flex-grow p-4 md:p-6 relative overflow-hidden flex flex-col">
              {activeTab === 'audio' && (
                <>
                  {status === 'idle' ? (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-700">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform duration-500 cursor-pointer" onClick={handleStart}>
                        <Mic size={28} className="md:w-8 md:h-8" />
                      </div>
                      <Button onClick={handleStart} variant="primary" className="bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-blue-500/20 border-0">
                        {t.demo.btnRecord}
                      </Button>
                      <div className="w-full max-w-md mt-2 text-left">
                        <label htmlFor="demo-textarea" className="block text-xs text-slate-400 mb-1 font-medium">Or type a clinical note:</label>
                        <textarea id="demo-textarea" className="w-full p-2 rounded-lg border border-white/10 bg-slate-800 text-white text-sm resize-none focus:ring-2 focus:ring-blue-400" rows={3} placeholder="Type your own clinical note..." value={inputText} onChange={e => setInputText(e.target.value)} />
                        <Button variant="secondary" className="mt-2 w-full relative overflow-hidden" onClick={handleGenerate} disabled={isGenerating}>
                          {isGenerating && <span className="absolute left-4 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-blue-400" size={18} /></span>}
                          <span className={isGenerating ? 'opacity-60' : ''}>Generate</span>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-6 bg-gradient-to-r from-blue-400/30 via-cyan-400/20 to-transparent blur-sm animate-pulse" />
                        </Button>
                        <span className="block text-[10px] text-slate-500 mt-1"><Info size={10} className="inline mr-1" />Try your own text or use the mic for a live demo.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col">
                      <div className="flex items-center gap-3 mb-4 md:mb-6">
                        {status === 'recording' && (
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-500 uppercase">
                          {status === 'recording' && t.demo.processingSteps.listening}
                          {status === 'processing' && t.demo.processingSteps.analyzing}
                          {(status === 'generating' || status === 'complete') && "Transcription Complete"}
                        </span>
                      </div>
                      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar text-sm md:text-base">
                        {renderHighlightedTranscript()}
                      </div>
                    </div>
                  )}
                  <AnimatePresence>
                    {status === 'processing' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-neon-400"
                      >
                        <Brain size={48} className="animate-bounce mb-4 text-neon-400" />
                        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">{t.demo.btnProcessing}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {activeTab === 'visual' && (
                <div className="flex-grow flex flex-col items-center justify-center h-full relative rounded-xl overflow-hidden border border-dashed border-white/20 bg-black/20">
                  {status === 'idle' ? (
                    <div className="text-center p-6 cursor-pointer hover:bg-white/5 transition-colors w-full h-full flex flex-col items-center justify-center" onClick={handleStart}>
                      <ImageIcon size={48} className="text-slate-500 mb-4" />
                      <Button variant="primary" size="sm">{t.demo.btnScan}</Button>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <img src={sampleImage} alt="Clinical Sample" className="w-full h-full object-cover opacity-80" />
                      {(status === 'processing' || status === 'generating' || status === 'complete') && (
                        <div className="absolute inset-0 bg-neon-400/10 z-10">
                          {status === 'processing' && (
                            <motion.div
                              className="absolute top-0 left-0 w-full h-1 bg-neon-400 shadow-[0_0_20px_#00FFA3]"
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: AI OUTPUT */}
          <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-950/80 to-cyan-900/40 backdrop-blur-2xl flex flex-col shadow-2xl transition-all duration-500 hover:border-neon-400/60 hover:shadow-[0_0_40px_#00FFA3] h-[340px] lg:h-auto order-2">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-slate-950/50">
              <div className="flex items-center gap-2 text-neon-400 font-mono text-xs uppercase tracking-widest">
                <FileText size={16} />
                <span>{activeTab === 'audio' ? t.demo.outputTitle : t.demo.visualOutputTitle}</span>
              </div>
              {status === 'complete' && <span className="px-2 py-0.5 rounded bg-neon-400/10 text-neon-400 text-[10px] font-bold border border-neon-400/20">READY_FOR_EMR</span>}
            </div>

            <div className="flex-grow p-4 md:p-6 relative flex flex-col font-mono text-sm text-slate-300">
              {(status === 'idle' || status === 'recording' || (status === 'processing' && activeTab === 'audio')) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                  {activeTab === 'audio' ? <Stethoscope size={64} className="mb-4 text-slate-500" /> : <Microscope size={64} className="mb-4 text-slate-500" />}
                  <p className="text-xs uppercase tracking-widest text-slate-500">Waiting for clinical data...</p>
                </div>
              ) : null}

              <div className="space-y-4 relative z-10 h-full overflow-y-auto custom-scrollbar">
                {activeTab === 'audio' && (
                  <>
                    {(status === 'generating' || status === 'complete') && (
                      <div className="opacity-0 animate-[fadeIn_0.5s_forwards]">
                        <span className="text-neon-400 text-xs block mb-1 opacity-70 font-bold">SUBJECTIVE</span>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">{displayedSoap.s}</div>
                      </div>
                    )}
                    {(status === 'generating' && displayedSoap.s === soapData.s || status === 'complete') && (
                      <div className="opacity-0 animate-[fadeIn_0.5s_forwards]">
                        <span className="text-cyan-400 text-xs block mb-1 opacity-70 font-bold">OBJECTIVE</span>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">{displayedSoap.o}</div>
                      </div>
                    )}
                    {(status === 'generating' && displayedSoap.o === soapData.o || status === 'complete') && (
                      <div className="opacity-0 animate-[fadeIn_0.5s_forwards]">
                        <span className="text-purple-400 text-xs block mb-1 opacity-70 font-bold">ASSESSMENT</span>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">{displayedSoap.a}</div>
                      </div>
                    )}
                    {(status === 'generating' && displayedSoap.a === soapData.a || status === 'complete') && (
                      <div className="opacity-0 animate-[fadeIn_0.5s_forwards]">
                        <span className="text-emerald-400 text-xs block mb-1 opacity-70 font-bold">PLAN</span>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">{displayedSoap.p}</div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'visual' && (
                  <>
                    {visualResult.findings && (
                      <div className="opacity-0 animate-[fadeIn_0.5s_forwards]">
                        <span className="text-neon-400 text-xs block mb-1 opacity-70 font-bold">VISUAL FINDINGS</span>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">{visualResult.findings}</div>
                      </div>
                    )}
                    {visualResult.diagnosis && (
                      <div className="grid grid-cols-2 gap-4 opacity-0 animate-[fadeIn_0.5s_forwards]">
                        <div>
                          <span className="text-red-400 text-xs block mb-1 opacity-70 font-bold">DIAGNOSIS</span>
                          <div className="p-3 rounded-lg bg-white/5 border border-white/5">{visualResult.diagnosis}</div>
                        </div>
                        <div>
                          <span className="text-yellow-400 text-xs block mb-1 opacity-70 font-bold">CONFIDENCE</span>
                          <div className="p-3 rounded-lg bg-white/5 border border-white/5">{visualResult.confidence}</div>
                        </div>
                      </div>
                    )}
                    {visualResult.recommendation && (
                      <div className="opacity-0 animate-[fadeIn_0.5s_forwards]">
                        <span className="text-emerald-400 text-xs block mb-1 opacity-70 font-bold">RECOMMENDED TREATMENT</span>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">{visualResult.recommendation}</div>
                      </div>
                    )}
                  </>
                )}

                {/* SENTINEL COMPLIANCE: ART 12.1 TRANSPARENCY BLOCK */}
                {status === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-6 border-t border-neon-400/20 bg-slate-950/80 p-5 rounded-2xl border border-neon-400/10 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-neon-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Info size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">{t.demo.transparency.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neon-400/10 text-[9px] font-bold border border-neon-400/20">
                        <BarChart3 size={10} />
                        {t.demo.transparency.confidenceLabel}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 flex gap-2">
                        <span className="text-neon-400 shrink-0">CODE:</span> {t.demo.transparency.parameters}
                      </p>
                      <p className="text-[10px] text-slate-400 flex gap-2">
                        <span className="text-neon-400 shrink-0">LOGIC:</span> {t.demo.transparency.reasoning}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-red-400/5 border border-red-400/10 flex items-start gap-3">
                      <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-red-400/90 font-bold italic leading-relaxed">
                        {t.demo.transparency.disclaimer}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {status === 'complete' && (
                <div className="absolute bottom-6 right-6 animate-[fadeIn_1s_ease-out] z-20">
                  <Button variant="ghost" size="sm" onClick={handleReset} className="bg-slate-800/80 backdrop-blur hover:bg-slate-700 text-xs">
                    <RotateCcw size={14} className="mr-2" />
                    {t.demo.btnReset}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
