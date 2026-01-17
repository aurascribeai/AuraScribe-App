
import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  User, 
  Copy, 
  Eye, 
  Layout, 
  Star,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Language, ClinicalTemplate } from '../types';
import { TRANSLATIONS } from '../constants';

interface CommunityProps {
  lang: Language;
  templates: ClinicalTemplate[];
}

const Community: React.FC<CommunityProps> = ({ lang, templates }) => {
  const publicTemplates = templates.filter(t => t.isPublic);
  const [search, setSearch] = useState('');
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const filtered = publicTemplates.filter(tmp => 
    tmp.title.toLowerCase().includes(search.toLowerCase()) || 
    tmp.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold heading-font text-slate-800 dark:text-white flex items-center gap-3">
            <Users className="text-emerald-600" /> {t('community')}
          </h2>
          <p className="text-sm text-slate-500">Explorez et importez des modèles partagés par vos confrères à travers le pays.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full md:w-96 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, spécialité..." 
            className="bg-transparent border-none text-sm focus:ring-0 flex-1 text-slate-700 dark:text-slate-300" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length > 0 ? filtered.map((tmp, idx) => (
          <div 
            key={tmp.id} 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col hover:border-emerald-500 transition-all group shadow-sm animate-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {tmp.category}
                </div>
                <div className="flex items-center gap-1 text-slate-300 group-hover:text-amber-400 transition-colors">
                  <Star size={16} fill="currentColor" />
                  <span className="text-xs font-bold text-slate-400">4.8</span>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">{tmp.title}</h4>
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-500 line-clamp-4 leading-relaxed">
                  {tmp.content}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                     <User size={14} />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{tmp.authorName}</p>
                     <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={8} /> {tmp.province}</p>
                   </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="Aperçu">
                  <Eye size={18} />
                </button>
              </div>
            </div>

            <button className="mx-6 mb-6 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/10">
              <Copy size={14} /> Importer le modèle
            </button>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
               <Users size={40} />
             </div>
             <p className="text-slate-500">Aucun modèle public trouvé correspondant à vos critères.</p>
          </div>
        )}
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
             <CheckCircle2 size={30} />
           </div>
           <div>
             <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Contribuez à la Communauté</h4>
             <p className="text-sm text-emerald-700 dark:text-emerald-400">Partagez vos meilleurs modèles pour aider vos confrères et améliorer la pratique clinique.</p>
           </div>
         </div>
         <button className="px-8 py-3 bg-white dark:bg-emerald-800 text-emerald-600 dark:text-emerald-100 rounded-xl font-bold text-sm border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 transition-all">
           En savoir plus
         </button>
      </div>
    </div>
  );
};

export default Community;
