
import React from 'react';
import {
  PlusCircle,
  Files,
  MessageSquare,
  Link2,
  FileText,
  CheckSquare,
  Users,
  Settings,
  Lightbulb,
  LogOut,
  Globe,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layout
} from 'lucide-react';
import { AppRoute, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Logo from './Logo';

interface SidebarProps {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  lang: Language;
  setLang: (l: Language) => void;
  isDark: boolean;
  toggleDark: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentRoute, setRoute, lang, setLang, isDark, toggleDark, isOpen, setIsOpen, onLogout
}) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const menuItems = [
    { id: AppRoute.NEW_SESSION, icon: <PlusCircle size={20} />, label: t('new_session') },
    { id: AppRoute.VIEW_SESSIONS, icon: <Files size={20} />, label: t('view_sessions') },
    { id: AppRoute.ASK_AURA, icon: <MessageSquare size={20} />, label: t('ask_aura') },
    { id: AppRoute.AURALINK, icon: <Link2 size={20} />, label: t('auralink') },
    { id: AppRoute.TASKS, icon: <CheckSquare size={20} />, label: t('tasks') },
    { id: AppRoute.SCHEDULE, icon: <Calendar size={20} />, label: t('schedule') },
    { id: AppRoute.TEMPLATES, icon: <Layout size={20} />, label: t('templates') },
    { id: AppRoute.COMMUNITY, icon: <Users size={20} />, label: t('community') },
    { id: AppRoute.RAMQ, icon: <FileText size={20} />, label: t('ramq') },
    { id: AppRoute.SETTINGS, icon: <Settings size={20} />, label: t('settings') },
    { id: AppRoute.REQUEST_FEATURE, icon: <Lightbulb size={20} />, label: t('request_feature') },
  ];

  return (
    <aside className={`fixed left-0 top-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md text-slate-500 hover:text-blue-600 z-10 hidden md:flex"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Logo Only */}
      <div className={`p-6 flex items-center justify-center`}>
        <Logo showText={false} className="w-10 h-10" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setRoute(item.id)}
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${currentRoute === item.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              } ${!isOpen && 'justify-center'}`}
            title={!isOpen ? item.label : ''}
          >
            {currentRoute === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
            )}
            <span className={`shrink-0 transition-transform duration-200 ${currentRoute !== item.id && 'group-hover:scale-110'}`}>{item.icon}</span>
            {isOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className={`flex items-center gap-2 ${isOpen ? 'justify-between' : 'flex-col'}`}>
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className={`flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${isOpen ? 'flex-1' : 'w-full'}`}
          >
            <Globe size={14} />
            {isOpen && lang}
          </button>
          <button
            onClick={toggleDark}
            className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${!isOpen && 'w-full flex justify-center'}`}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all ${!isOpen && 'justify-center'}`}
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span className="text-sm font-medium">{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
