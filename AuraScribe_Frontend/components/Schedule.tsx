
import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Plus, 
  MoreVertical,
  CalendarDays,
  ListTodo,
  AlertCircle,
  Stethoscope,
  Video,
  UserPlus
} from 'lucide-react';
import { Language, Appointment, AppRoute } from '../types';
import { TRANSLATIONS } from '../constants';

interface ScheduleProps {
  lang: Language;
  onNavigate?: (route: AppRoute) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ lang, onNavigate }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const daysFr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = lang === 'fr' ? daysFr : daysEn;

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', patientName: 'Jean Tremblay', type: 'consult', startTime: '09:00', duration: 30, dayIndex: 0 },
    { id: '2', patientName: 'Marie Côté', type: 'followup', startTime: '11:30', duration: 45, dayIndex: 1 },
    { id: '3', patientName: 'Luc Gauthier', type: 'emergency', startTime: '14:00', duration: 15, dayIndex: 2 },
    { id: '4', patientName: 'Sophie Leblanc', type: 'consult', startTime: '10:00', duration: 30, dayIndex: 3 },
  ]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'followup': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      default: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    }
  };

  const getAppointmentsForDay = (dayIdx: number) => appointments.filter(a => a.dayIndex === dayIdx);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <CalendarDays size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black heading-font text-slate-800 dark:text-white uppercase italic tracking-tighter">AuraSync Scheduler</h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{t('schedule')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-sm font-black px-4 uppercase tracking-widest italic">20 - 26 Mai, 2024</span>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800"></div>
            {days.map((day, i) => (
              <div key={i} className="p-4 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</p>
                <p className={`text-lg font-bold mt-1 ${i === 2 ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>{20 + i}</p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-hide">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 group">
                {/* Time Label */}
                <div className="p-4 text-right border-r border-slate-100 dark:border-slate-800 bg-slate-50/20">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{hour}:00</span>
                </div>
                
                {/* Day Slots */}
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const dayApps = getAppointmentsForDay(dayIdx).filter(a => parseInt(a.startTime.split(':')[0]) === hour);
                  
                  return (
                    <div key={dayIdx} className="relative h-20 border-r border-b border-slate-100 dark:border-slate-800 last:border-r-0 group-hover:bg-slate-50/30 transition-colors">
                      {dayApps.map(app => (
                        <div 
                          key={app.id} 
                          className={`absolute top-1 left-1 right-1 p-2 rounded-xl border text-[10px] font-bold shadow-sm cursor-pointer hover:scale-[1.02] transition-all z-10 flex flex-col justify-between ${getTypeStyles(app.type)}`}
                          style={{ height: `${(app.duration / 60) * 100}%` }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{app.patientName}</span>
                            <MoreVertical size={10} className="opacity-40" />
                          </div>
                          <div className="flex items-center gap-1 opacity-70">
                            <Clock size={8} /> {app.startTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Agenda */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
               <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                 <ListTodo size={16} className="text-indigo-600" /> Agenda du Jour
               </h3>
               <button className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20"><Plus size={14} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                {appointments.slice(0, 4).map((app, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 shadow-sm shrink-0 font-black text-xs">
                      {app.startTime}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{app.patientName}</p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">{app.type === 'consult' ? 'Consultation' : app.type === 'followup' ? 'Suivi' : 'Urgence'}</p>
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-1 text-blue-600" title="Démarrer Scribe"><Stethoscope size={14} /></button>
                         <button className="p-1 text-emerald-600" title="Télé-consultation"><Video size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-2xl space-y-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><UserPlus size={100} /></div>
             <h4 className="text-lg font-black italic uppercase tracking-tighter">Aura Assistant</h4>
             <p className="text-xs text-indigo-100 leading-relaxed font-medium">Vous avez <strong>12 patients</strong> aujourd'hui. <br/>Préparez-vous pour le cas complexe de 14h00.</p>
             <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Préparer ma Clinique</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
