
import React from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle, Flame, Clock, ArrowRight } from 'lucide-react';
import { AuraNotification, Language, AppRoute } from '../types';

interface NotificationTrayProps {
  notifications: AuraNotification[];
  lang: Language;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onNavigate: (route: AppRoute, relatedId?: string) => void;
}

const NotificationTray: React.FC<NotificationTrayProps> = ({ 
  notifications, lang, onClose, onMarkAsRead, onNavigate 
}) => {
  const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <Flame className="text-rose-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'success': return <CheckCircle className="text-emerald-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return lang === 'fr' ? 'À l\'instant' : 'Just now';
    if (mins < 60) return `${mins}m`;
    return lang === 'fr' ? 'Plus d\'une heure' : 'Over an hour ago';
  };

  return (
    <div className="absolute top-14 right-0 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[300] overflow-hidden animate-in slide-in-from-top-2 duration-300">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-slate-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
            {lang === 'fr' ? 'Centre de Notifications' : 'Notification Center'}
          </h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-slate-50 dark:divide-slate-800">
        {sorted.length > 0 ? sorted.map(notif => (
          <div 
            key={notif.id}
            onClick={() => {
              onMarkAsRead(notif.id);
              if (notif.actionRoute) onNavigate(notif.actionRoute, notif.relatedId);
            }}
            className={`p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              notif.type === 'critical' ? 'bg-rose-50 dark:bg-rose-900/30' : 
              notif.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-blue-50 dark:bg-blue-900/30'
            }`}>
              {getIcon(notif.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className={`text-[11px] font-black uppercase tracking-tight ${notif.type === 'critical' ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                  {notif.title}
                </p>
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock size={10} /> {formatTime(notif.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {notif.message}
              </p>
              {notif.actionRoute && (
                <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-widest pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {lang === 'fr' ? 'Voir détails' : 'View details'} <ArrowRight size={10} />
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="p-12 text-center space-y-3">
             <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
               <Bell size={24} />
             </div>
             <p className="text-xs text-slate-400 italic">
               {lang === 'fr' ? 'Aucune nouvelle notification' : 'No new notifications'}
             </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
         <button className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
           {lang === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
         </button>
      </div>
    </div>
  );
};

export default NotificationTray;
