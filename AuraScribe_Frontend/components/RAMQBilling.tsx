import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  History,
  Shield,
  Sparkles,
  Loader2,
  DollarSign,
  CreditCard,
  ArrowRight,
  ChevronDown,
  Printer,
  Download,
  EyeOff
} from 'lucide-react';
import { Language, Session, RAMQBill } from '../types';
import { TRANSLATIONS } from '../constants';
// import { BillingAgent } from '../services/agents/BillingAgent'; // Removed: file does not exist

interface RAMQBillingProps {
  lang: Language;
  sessions: Session[];
  bills: RAMQBill[];
  onSendBill: (bill: RAMQBill) => void;
}

const RAMQBilling: React.FC<RAMQBillingProps> = ({ lang, sessions, bills, onSendBill }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [currentBill, setCurrentBill] = useState<Partial<RAMQBill>>({
    serviceCode: '',
    diagnosticCode: '',
    amount: 0
  });

  // const billingAgent = useRef(new BillingAgent()); // Removed: file does not exist

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const handleAISuggestion = async () => {
    // TODO: Replace with backendApi call for AI billing code suggestion
    if (!selectedSession) return;
    setIsSuggesting(true);
    try {
      // Example: const suggestion = await backendApi.suggestBillingCodes(selectedSession, lang);
      // if (suggestion) {
      //   setCurrentBill({
      //     ...currentBill,
      //     serviceCode: suggestion.serviceCode,
      //     diagnosticCode: suggestion.diagnosticCode,
      //     amount: suggestion.amountSuggestion || 85.00
      //   });
      // }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSend = () => {
    if (!selectedSession || !currentBill.serviceCode) return;
    const newBill: RAMQBill = {
      id: Date.now().toString(),
      sessionId: selectedSession.id,
      patientInitials: selectedSession.patientInfo.fullName.split(' ').map(n => n[0]).join(''),
      patientRamq: selectedSession.patientInfo.ramq.substring(0, 4) + ' •••• ••••',
      date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA'),
      serviceCode: currentBill.serviceCode!,
      diagnosticCode: currentBill.diagnosticCode!,
      amount: currentBill.amount!,
      status: 'sent',
      transmissionDate: new Date().toISOString()
    };
    onSendBill(newBill);
    setSelectedSession(null);
    setCurrentBill({ serviceCode: '', diagnosticCode: '', amount: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold heading-font text-slate-800 dark:text-white">{t('billing_engine')}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Shield size={14} className="text-emerald-500" /> 100% Conforme RAMQ & Loi 25
            </p>
          </div>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Nouveaux Facturables
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            {t('previous_bills')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Selection & History Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Search size={12} /> Sélectionner une session
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto scrollbar-hide">
              {sessions.filter(s => !bills.find(b => b.sessionId === s.id)).map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`w-full p-4 flex items-center gap-4 text-left transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${selectedSession?.id === s.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm">
                    {s.patientInfo.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate flex items-center gap-2">
                      <EyeOff size={10} className="text-slate-400" /> •••••• ••••••
                    </p>
                    <p className="text-[10px] text-slate-500">{s.date} • {s.patientInfo.ramq.substring(0, 4)}...</p>
                  </div>
                  <ChevronDown size={14} className="text-slate-300" />
                </button>
              ))}
              {sessions.length === 0 && <div className="p-10 text-center text-xs text-slate-400 italic">Aucune session à facturer.</div>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <History size={14} /> Activité Récente
            </h3>
            <div className="space-y-3">
              {bills.slice(0, 3).map(b => (
                <div key={b.id} className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{b.patientInitials}</span>
                  </div>
                  <span className="text-slate-500">{b.amount.toFixed(2)} $</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-bold text-[9px] uppercase">{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Billing Form Panel */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            {/* RAMQ Form Header */}
            <div className="p-10 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">RAMQ - État d'Honoraires</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Génération Automatisée AuraScribe V1.6</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nº Professionnel</div>
                <div className="text-lg font-mono font-bold text-slate-800 dark:text-white">1928374-6</div>
              </div>
            </div>

            <div className="p-10 space-y-10">
              {/* Banner if no session selected */}
              {!selectedSession && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400 mb-2">
                    <CreditCard size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Prêt pour la facturation</h3>
                  <p className="text-xs text-slate-500 mt-1">Veuillez sélectionner une consultation patient dans la liste de gauche pour commencer.</p>
                  <button
                    onClick={() => setSelectedSession(sessions[0])}
                    className="mt-2 flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest"
                  >
                    Utiliser la dernière session <ArrowRight size={14} />
                  </button>
                </div>
              )}
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identification du Patient</label>
                    <div className="flex items-center gap-3">
                      <EyeOff size={16} className="text-slate-400" />
                      <div className="text-lg font-mono font-bold text-slate-800 dark:text-white">
                        {selectedSession ? selectedSession.patientInfo.ramq : '•••• •••• ••••'}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date de Service</label>
                    <div className="text-lg font-bold text-slate-800 dark:text-white">
                      {selectedSession ? selectedSession.date : '--- / --- / ---'}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('billing_codes')}</label>
                    <button
                      disabled={!selectedSession || isSuggesting}
                      onClick={handleAISuggestion}
                      className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full transition-all"
                    >
                      {isSuggesting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {t('suggest_codes')}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-4 px-2 bg-white dark:bg-slate-900 text-[9px] font-bold text-blue-600 uppercase tracking-widest">{t('service_code')}</label>
                      <input
                        type="text"
                        value={currentBill.serviceCode}
                        onChange={e => setCurrentBill({ ...currentBill, serviceCode: e.target.value })}
                        className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-500 focus:ring-0 text-sm font-mono font-bold"
                        placeholder="Ex: 00085"
                        disabled={!selectedSession}
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2 left-4 px-2 bg-white dark:bg-slate-900 text-[9px] font-bold text-blue-600 uppercase tracking-widest">{t('diagnostic_code')}</label>
                      <input
                        type="text"
                        value={currentBill.diagnosticCode}
                        onChange={e => setCurrentBill({ ...currentBill, diagnosticCode: e.target.value })}
                        className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-500 focus:ring-0 text-sm font-mono font-bold"
                        placeholder="Ex: 780.60"
                        disabled={!selectedSession}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Area */}
              <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                    <DollarSign size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Montant Total Estimé</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white">
                      {currentBill.amount?.toFixed(2)} $
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all" title="Imprimer">
                    <Printer size={20} />
                  </button>
                  <button className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all" title="Télécharger">
                    <Download size={20} />
                  </button>
                  <button
                    disabled={!selectedSession || !currentBill.serviceCode}
                    onClick={handleSend}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-500/20 transition-all scale-100 hover:scale-[1.02]"
                  >
                    <Send size={20} /> Transmettre à la RAMQ
                  </button>
                </div>
              </div>

              {/*<div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[2px] z-10 flex items-center justify-center p-12 text-center flex-col space-y-4">
                 <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400">
                   <CreditCard size={40} />
                 </div>
                 <div className="max-w-xs">
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white">Prêt pour la facturation</h3>
                   <p className="text-sm text-slate-500 mt-2">Veuillez sélectionner une consultation patient dans la liste de gauche pour commencer.</p>
                 </div>
                 <button 
                  onClick={() => setSelectedSession(sessions[0])}
                  className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest"
                 >
                   Utiliser la dernière session <ArrowRight size={14} />
                 </button>
               </div>*/}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-slate-400 opacity-50">
            <AlertCircle size={14} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Transmission sécurisée via le portail de facturation en ligne de la RAMQ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAMQBilling;
