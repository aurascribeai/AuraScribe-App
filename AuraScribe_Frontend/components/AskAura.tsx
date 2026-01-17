
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  BookOpen,
  Search,
  ShieldCheck,
  Loader2,
  Send,
  ExternalLink,
  BookMarked,
  User,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  X,
  Newspaper,
  Microscope,
  Stethoscope
} from 'lucide-react';
import { Session, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { askAuraChat, askAuraStudyCase, askAuraResearch } from '../services/backendApi';

interface AskAuraProps {
  sessions: Session[];
  lang: Language;
}

const AskAura: React.FC<AskAuraProps> = ({ sessions, lang }) => {
  const [activeMode, setActiveMode] = useState<'study_case' | 'evidence' | 'chat'>('chat');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Results states
  const [studyCase, setStudyCase] = useState<string>('');
  // TODO: Replace EvidenceBlog type with actual API response type
  const [evidenceBlogs, setEvidenceBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'aura', content: string }[]>([]);
  const [chatSources, setChatSources] = useState<string[]>([]);
  const [chatMeta, setChatMeta] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  const generateStudyCase = async () => {
    if (!selectedSession) return;
    setChatSources([]);
    setChatMeta('');
    setLoading(true);
    try {
      const result = await askAuraStudyCase({
        session_id: selectedSession.id,
        transcript: selectedSession.transcript,
        patient_info: selectedSession.patientInfo,
        soap_content: selectedSession.forms.soap?.content || '',
        language: lang
      });

      if (result.success && result.study_case) {
        setStudyCase(result.study_case);
        setActiveMode('study_case');
      }
    } catch (err) {
      // Study case generation failed
    } finally {
      setLoading(false);
    }
  };

  const performResearch = async (customQuery?: string) => {
    const query = customQuery || selectedSession?.transcript || "Dernières avancées médicales";
    setLoading(true);
    try {
      const result = await askAuraResearch({
        query: query,
        transcript: selectedSession?.transcript,
        language: lang
      });

      if (result.success && result.results) {
        setEvidenceBlogs(result.results);
        setActiveMode('evidence');
        setSelectedBlog(null);
      }
    } catch (err) {
      // Research failed
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const context = selectedSession
        ? `Dossier actuel: ${selectedSession.patientInfo.fullName}. Notes SOAP: ${selectedSession.forms.soap?.content}`
        : "Pas de session sélectionnée.";

      const result = await askAuraChat({
        message: userMsg,
        context: context,
        session_transcript: selectedSession?.transcript || '',
        language: lang
      });

      const replyContent = result.response || result.summary || result.error || "Désolé, une erreur s'est produite. Veuillez réessayer.";
      const agentAvailable = result.agent_available ?? true;
      const fallbackUsed = result.fallback_used ?? !agentAvailable;
      const meta = !agentAvailable
        ? "L'agent Ask Aura est hors ligne ; la réponse provient du fallback orchestré."
        : fallbackUsed
          ? "Réponse générée par l'orchestrateur fallback."
          : '';
      const normalizedSources = Array.isArray(result.sources)
        ? result.sources
          .map((source) => {
            if (typeof source === 'string') return source;
            if (source?.title) return source.title;
            if (source?.sourceLabel) return source.sourceLabel;
            if (source?.label) return source.label;
            if (source?.name) return source.name;
            return JSON.stringify(source);
          })
          .filter(Boolean)
        : [];

      setChatMeta(meta);
      setChatSources(normalizedSources);
      setChatHistory(prev => [...prev, { role: 'aura', content: replyContent }]);
    } catch (err) {
      setChatHistory(prev => [...prev, {
        role: 'aura',
        content: "Erreur de connexion au serveur. Vérifiez que le backend est en cours d'exécution."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'specialist': return <Stethoscope size={16} />;
      case 'study': return <Microscope size={16} />;
      case 'disease': return <Newspaper size={16} />;
      default: return <BookMarked size={16} />;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-2 py-8 animate-in fade-in duration-500 relative">
      {/* Blog Detail Overlay */}
      {selectedBlog && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-500 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setSelectedBlog(null)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={20} /> Retour
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-[10px] font-bold text-blue-600 uppercase">
              {getCategoryIcon(selectedBlog.category)}
              {selectedBlog.category}
            </div>
            <button onClick={() => setSelectedBlog(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-3xl mx-auto space-y-8">
              <h1 className="text-4xl font-bold heading-font text-slate-800 dark:text-white leading-tight">
                {selectedBlog.title}
              </h1>
              <div className="prose prose-blue dark:prose-invert max-w-none font-serif text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedBlog.fullContent}
              </div>
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Source de l'évidence</h4>
                <a
                  href={selectedBlog.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:border-blue-500 border border-transparent transition-all group"
                >
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                    <ExternalLink size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{selectedBlog.sourceLabel || "Article de Recherche"}</p>
                    <p className="text-xs text-slate-400 truncate max-w-md">{selectedBlog.sourceUrl}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold heading-font text-slate-800 dark:text-white">Ask Aura Intelligence</h2>
            <p className="text-sm text-slate-500">Raisonnement Clinique & Recherche EBM</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <User size={16} className="text-slate-400 ml-2" />
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer pr-8"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{s.patientInfo.fullName} ({s.date})</option>
            ))}
            {sessions.length === 0 && <option value="">Aucune session active</option>}
          </select>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden mx-auto">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <button
              onClick={() => setActiveMode('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeMode === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <MessageCircle size={20} />
              <span className="text-sm font-bold font-heading">Consultation Live</span>
            </button>
            <button
              onClick={generateStudyCase}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeMode === 'study_case' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <BookOpen size={20} />
              <span className="text-sm font-bold font-heading">{t('study_case_summary')}</span>
            </button>
            <button
              onClick={() => performResearch()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeMode === 'evidence' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <Search size={20} />
              <span className="text-sm font-bold font-heading">{t('evidence_blog')}</span>
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">EBM Grounding</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              Aura utilise la recherche Google pour vérifier les évidences cliniques et fournir des citations à jour.
            </p>
          </div>
        </div>

        {/* Display Area */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 animate-pulse">Consultation de la base de connaissances...</p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8">
            {activeMode === 'chat' && (
              <div className="space-y-6">
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                      <MessageCircle size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Démarrer une discussion clinique</h3>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto">Posez des questions à Aura sur les signes cliniques ou les interactions médicamenteuses.</p>
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-3xl px-6 py-4 text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatMeta && (
                  <div className="text-[11px] text-slate-500 italic mt-4">{chatMeta}</div>
                )}
                {chatSources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {chatSources.map((source, idx) => (
                      <span
                        key={`${source}-${idx}`}
                        className="text-[10px] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {activeMode === 'study_case' && (
              <div className="animate-in fade-in duration-700">
                <div className="flex items-center gap-3 text-indigo-600 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <BookMarked size={20} />
                  </div>
                  <h3 className="text-2xl font-bold heading-font m-0 tracking-tight">{t('study_case_summary')}</h3>
                </div>
                {studyCase ? (
                  <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {studyCase}
                  </div>
                ) : (
                  <div className="text-center py-24 text-slate-400">
                    Cliquez sur "Sommaire du Cas Clinique" pour générer l'analyse.
                  </div>
                )}
              </div>
            )}

            {activeMode === 'evidence' && (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center gap-3 text-emerald-600 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Search size={20} />
                  </div>
                  <h3 className="text-2xl font-bold heading-font m-0 tracking-tight">{t('evidence_blog')}</h3>
                </div>

                {evidenceBlogs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    {evidenceBlogs.map((blog, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col hover:border-blue-500 transition-all group shadow-sm animate-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${idx * 150}ms` }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                            {getCategoryIcon(blog.category)}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{blog.category || "Evidence"}</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-3 line-clamp-2 leading-snug">
                          {blog.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex-1 line-clamp-3 mb-6 leading-relaxed italic">
                          "{blog.summary}"
                        </p>
                        <button
                          onClick={() => setSelectedBlog(blog)}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-2xl text-xs font-bold transition-all"
                        >
                          {t('read_more')} <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Microscope size={48} className="mx-auto mb-4 opacity-20" />
                    Recherchez des évidences pour voir les blogues médicaux.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                placeholder={activeMode === 'evidence' ? "Rechercher évidences ou études..." : "Posez une question à Aura..."}
                className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium shadow-inner"
              />
              <button
                onClick={handleChat}
                disabled={loading || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20"
              >
                <Send size={18} />
              </button>
            </div>
            {activeMode === 'evidence' && (
              <button
                onClick={() => performResearch(chatInput)}
                className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
              >
                <Search size={16} /> Recherche EBM
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAura;
