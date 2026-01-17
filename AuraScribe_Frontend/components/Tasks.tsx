
import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2,
  FileSignature,
  Send,
  Stethoscope,
  BookOpen,
  Trash2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Language, Task, Session } from '../types';
import { TRANSLATIONS } from '../constants';

interface TasksProps {
  lang: Language;
  tasks: Task[];
  sessions: Session[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ lang, tasks, sessions, onToggleTask, onAddTask, onDeleteTask }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'pending'>('all');
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'high') return task.priority === 'high';
    if (activeFilter === 'pending') return task.status === 'pending';
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <span className="px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-rose-100 dark:border-rose-900/30 flex items-center gap-1"><AlertCircle size={10} /> {t('priority_high')}</span>;
      case 'medium': return <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-100 dark:border-amber-900/30 flex items-center gap-1"><Clock size={10} /> {t('priority_medium')}</span>;
      default: return <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">{t('priority_low')}</span>;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'review': return <CheckSquare className="text-blue-500" size={18} />;
      case 'signature': return <FileSignature className="text-indigo-500" size={18} />;
      case 'send': return <Send className="text-emerald-500" size={18} />;
      case 'followup': return <Stethoscope className="text-amber-500" size={18} />;
      case 'research': return <BookOpen className="text-purple-500" size={18} />;
      default: return <Sparkles className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold heading-font text-slate-800 dark:text-white flex items-center gap-3">
            <CheckSquare className="text-blue-600" /> {t('tasks')}
          </h2>
          <p className="text-sm text-slate-500">Suivi intelligent des actions cliniques et administratives.</p>
        </div>
        <button 
          onClick={() => {
            const title = prompt(lang === 'fr' ? "Titre de la tâche" : "Task title");
            if (title) {
              onAddTask({
                id: Date.now().toString(),
                title,
                description: "",
                priority: "medium",
                type: "manual",
                status: "pending"
              });
            }
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus size={18} /> {t('add_task')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit shadow-sm">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Toutes ({tasks.length})
        </button>
        <button 
          onClick={() => setActiveFilter('high')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === 'high' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Haute Priorité ({tasks.filter(t => t.priority === 'high').length})
        </button>
        <button 
          onClick={() => setActiveFilter('pending')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          En attente ({tasks.filter(t => t.status === 'pending').length})
        </button>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4 pb-20">
        {filteredTasks.length > 0 ? filteredTasks.map(task => {
          const session = sessions.find(s => s.id === task.relatedSessionId);
          return (
            <div 
              key={task.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between gap-6 hover:border-blue-500/50 transition-all group shadow-sm ${task.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className={`w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 hover:border-blue-500'}`}
                >
                  {task.status === 'completed' && <CheckCircle2 size={20} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTaskIcon(task.type)}
                    <h4 className={`text-lg font-bold truncate leading-tight ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                      {task.title}
                    </h4>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{task.description || "Aucune description additionnelle."}</p>
                  
                  {session && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                        Patient: {session.patientInfo.fullName}
                      </span>
                    </div>
                  )}
                  {task.id.startsWith('ai-') && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                      <Sparkles size={10} /> {t('ai_generated_task')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                   <ChevronRight size={20} />
                 </button>
                 <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
            </div>
          );
        }) : (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <CheckSquare size={32} />
            </div>
            <p className="text-slate-500 text-sm">Toutes les tâches sont terminées. Bon travail, Dr. Rousseau.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
