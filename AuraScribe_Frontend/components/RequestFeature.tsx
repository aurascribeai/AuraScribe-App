
import React, { useState } from 'react';
import { 
  Lightbulb, 
  Send, 
  Layers, 
  Activity, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  Clock, 
  Plus, 
  Target, 
  Users, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Loader2,
  Trophy
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface RequestFeatureProps {
  lang: Language;
}

const RequestFeature: React.FC<RequestFeatureProps> = ({ lang }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const [formData, setFormData] = useState({
    title: '',
    category: 'workflow',
    impact: 'clinic',
    description: '',
    painPoint: ''
  });

  const roadmapItems = [
    { title: 'Dictée vocale directe en pharmacie', status: 'planned', icon: <Zap size={14} /> },
    { title: 'Support multi-langue (Arabe, Espagnol)', status: 'review', icon: <Clock size={14} /> },
    { title: 'Analyse des courbes de croissance pédiatriques', status: 'planned', icon: <Activity size={14} /> },
    { title: 'Intégration Apple Watch pour signes vitaux', status: 'released', icon: <CheckCircle2 size={14} /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto shadow-xl">
          <Trophy size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black heading-font text-slate-800 dark:text-white uppercase italic">Suggestion Reçue !</h2>
          <p className="text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto">
            Merci Dr. Rousseau. Votre suggestion a été transmise à notre comité d'innovation clinique. Vous recevrez une notification si elle est retenue pour la prochaine version.
          </p>
        </div>
        <button 
          onClick={() => setSubmitted(false)}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all"
        >
          Suggérer une autre idée
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
            <Lightbulb size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black heading-font text-slate-800 dark:text-white tracking-tighter italic uppercase">Innovation Portal</h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Co-créons le futur de la médecine assistée par IA</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Titre de la fonction</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Analyse automatique des radiographies"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="workflow">Vitesse & Workflow</option>
                    <option value="accuracy">Précision Clinique</option>
                    <option value="integration">Intégration EMR/Logiciel</option>
                    <option value="compliance">Conformité & Légal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Impact Estimé</label>
                  <select 
                    value={formData.impact}
                    onChange={e => setFormData({...formData, impact: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="individual">Individuel (Ma pratique)</option>
                    <option value="clinic">Clinique Entière</option>
                    <option value="system">Système de Santé (Public)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Description détaillée</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder="Expliquez comment cette fonction devrait fonctionner..."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Quel problème cela résout-il ?</label>
                <input 
                  type="text" 
                  value={formData.painPoint}
                  onChange={e => setFormData({...formData, painPoint: e.target.value})}
                  placeholder="Ex: Cela m'évite 15 minutes de saisie manuelle par patient."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Soumettre au Comité Innovation
              </button>
            </div>
          </form>
        </div>

        {/* Right: Roadmap & Impact */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-10">
              <Target size={200} />
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl font-black italic leading-none uppercase tracking-tighter">Notre engagement</h3>
              <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                Chez AuraScribe, chaque ligne de code est pensée pour redonner du temps aux médecins. Votre feedback est la boussole de notre équipe d'ingénierie.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Reçus ce mois</p>
                   <p className="text-2xl font-black mt-1">128</p>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">En production</p>
                   <p className="text-2xl font-black mt-1">14</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Innovation Roadmap</h3>
              <Layers size={18} className="text-slate-300" />
            </div>

            <div className="space-y-4">
              {roadmapItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-all group">
                   <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                       item.status === 'released' ? 'bg-emerald-100 text-emerald-600' : 
                       item.status === 'review' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                     }`}>
                       {item.icon}
                     </div>
                     <div>
                       <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.title}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                         {item.status === 'released' ? 'Déployé' : item.status === 'review' ? 'En révision' : 'Planifié'}
                       </p>
                     </div>
                   </div>
                   <button className="p-2 text-slate-300 hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                     <ChevronRight size={18} />
                   </button>
                </div>
              ))}
            </div>

            <button className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Voir le carnet complet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestFeature;
