
import React, { useState, useRef } from 'react';
import {
  Layout,
  Plus,
  Sparkles,
  Search,
  Eye,
  Trash2,
  Globe,
  Lock,
  FileText,
  Save,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Image as ImageIcon,
  Type,
  X
} from 'lucide-react';
import { Language, ClinicalTemplate } from '../types';
import { TRANSLATIONS } from '../constants';
// import { TemplateAgent } from '../services/agents/TemplateAgent'; // Removed: file does not exist

interface TemplatesProps {
  lang: Language;
  templates: ClinicalTemplate[];
  branding: { header: string; footer: string };
  setBranding: (branding: { header: string; footer: string }) => void;
  onAddTemplate: (t: ClinicalTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const Templates: React.FC<TemplatesProps> = ({
  lang,
  templates,
  branding,
  setBranding,
  onAddTemplate,
  onDeleteTemplate
}) => {
  const [view, setView] = useState<'list' | 'create' | 'branding'>('list');
  const [isGenerating, setIsGenerating] = useState(false);

  const [newTemplate, setNewTemplate] = useState<Partial<ClinicalTemplate>>({
    title: '',
    category: 'Général',
    content: '',
    isPublic: false
  });
  const [aiPrompt, setAiPrompt] = useState('');

  // const templateAgent = useRef(new TemplateAgent()); // Removed: file does not exist

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      // TODO: Replace with backendApi call for AI template generation
      // const result = await backendApi.generateTemplateAI(aiPrompt);
      // setNewTemplate({ ...newTemplate, content: result });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!newTemplate.title || !newTemplate.content) return;
    const template: ClinicalTemplate = {
      id: Date.now().toString(),
      title: newTemplate.title,
      category: newTemplate.category || 'Général',
      content: newTemplate.content,
      isPublic: !!newTemplate.isPublic,
      authorName: 'Dr. Rousseau',
      province: 'Québec',
      createdAt: Date.now(),
    };
    onAddTemplate(template);
    setView('list');
    setNewTemplate({ title: '', category: 'Général', content: '', isPublic: false });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold heading-font text-slate-800 dark:text-white flex items-center gap-3">
            <Layout className="text-indigo-600" /> {t('templates')}
          </h2>
          <p className="text-sm text-slate-500">Créez des modèles avec l'en-tête de votre clinique.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView('branding')}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all"
          >
            <ImageIcon size={18} /> En-tête/Pied de page
          </button>
          {view === 'list' && (
            <button
              onClick={() => setView('create')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Plus size={18} /> {t('add_template')}
            </button>
          )}
        </div>
      </div>

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tmp => (
            <div key={tmp.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:border-indigo-500 transition-all group shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                  <FileText size={20} />
                </div>
                <div className="flex items-center gap-2">
                  {tmp.isPublic ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-slate-400" />}
                  <button onClick={() => onDeleteTemplate(tmp.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{tmp.title}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{tmp.category}</p>
              <div className="flex-1 text-sm text-slate-500 line-clamp-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[10px]">
                {tmp.content}
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all">
                Utiliser ce modèle <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {view === 'branding' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold heading-font">Personnalisation Clinique</h3>
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">En-tête de la Clinique (Header)</label>
              <textarea
                value={branding.header}
                onChange={e => setBranding({ ...branding, header: e.target.value })}
                className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl font-mono text-xs border-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pied de page (Footer)</label>
              <textarea
                value={branding.footer}
                onChange={e => setBranding({ ...branding, footer: e.target.value })}
                className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl font-mono text-xs border-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              />
            </div>
          </div>
          <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Aperçu Visuel</p>
            <div className="bg-white dark:bg-slate-900 p-8 shadow-inner rounded-xl min-h-[200px] flex flex-col justify-between border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-pre text-center leading-tight">{branding.header}</div>
              <div className="h-20 flex items-center justify-center text-slate-200 dark:text-slate-800 uppercase font-black tracking-widest opacity-10 italic">Contenu de la Note</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-pre text-center italic">{branding.footer}</div>
            </div>
          </div>
          <button onClick={() => setView('list')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20">
            Enregistrer la Marque Clinique
          </button>
        </div>
      )}

      {view === 'create' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600">
              <ArrowLeft size={18} /> Retour
            </button>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-500/20">
                <Save size={16} /> Enregistrer le modèle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Titre du modèle</label>
                  <input
                    type="text"
                    value={newTemplate.title}
                    onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Suivi HTA Standard"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('category')}</label>
                  <select
                    value={newTemplate.category}
                    onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Général</option>
                    <option>Cardiologie</option>
                    <option>Pédiatrie</option>
                    <option>Urgence</option>
                    <option>CNESST</option>
                  </select>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Sparkles size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Générateur Aura AI</span>
                </div>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm h-32 resize-none"
                  placeholder="Décrivez le formulaire ou la note que vous souhaitez générer..."
                ></textarea>
                <button
                  disabled={isGenerating || !aiPrompt}
                  onClick={handleGenerateAI}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {t('generate_with_ai')}
                </button>
              </div>
            </div>

            <div className="p-10 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Aperçu du contenu</label>
              <textarea
                value={newTemplate.content}
                onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                className="flex-1 w-full p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 resize-none shadow-inner"
                placeholder="Le contenu du modèle s'affichera ici..."
              ></textarea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
