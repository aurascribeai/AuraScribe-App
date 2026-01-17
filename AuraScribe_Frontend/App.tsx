import React, { useState, useEffect } from 'react';
import { encryptData, decryptData } from './utils/crypto';
import Sidebar from './components/Sidebar';
import Logo from './components/Logo';
import NewSession from './components/NewSession';
import SessionViewer from './components/SessionViewer';
import AskAura from './components/AskAura';
import AuraLink from './components/AuraLink';
import Tasks from './components/Tasks';
import Templates from './components/Templates';
import Community from './components/Community';
import RAMQBilling from './components/RAMQBilling';
import Settings from './components/Settings';
import RequestFeature from './components/RequestFeature';
import Schedule from './components/Schedule';
import Auth from './components/Auth';
import SecurityShield from './components/SecurityShield';
import NotificationTray from './components/NotificationTray';
import { AppRoute, Language, Session, FormStatus, Task, ClinicalTemplate, RAMQBill, User, AuraNotification } from './types';
import { TRANSLATIONS } from './constants';
import { Bell, Clock, CheckCircle, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.NEW_SESSION);
  const [language, setLanguage] = useState<Language>('fr');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // State Management - sessions stored locally with encryption
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bills, setBills] = useState<RAMQBill[]>([]);
  const [notifications, setNotifications] = useState<AuraNotification[]>([]);
  const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState(false);

  const [branding, setBranding] = useState({
    header: '',
    footer: 'DOCUMENT CONFIDENTIEL • CONFORME LOI 25 • GÉRÉ PAR AURASCRIBE'
  });

  const [templates, setTemplates] = useState<ClinicalTemplate[]>([]);

  const addNotification = (notif: Omit<AuraNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AuraNotification = {
      ...notif,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const triggerError = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'critical'
    });
    setIsNotificationTrayOpen(true);
  };

  // Loi 25 Auto-Purge Logic - automatically removes sessions older than 24 hours
  useEffect(() => {
    const purgeInterval = setInterval(() => {
      const now = Date.now();
      const expirationLimit = 24 * 60 * 60 * 1000;

      setSessions(prev => {
        const expired = prev.filter(s => (now - s.createdAt) > expirationLimit);
        if (expired.length > 0) {
          addNotification({
            title: language === 'fr' ? 'Purge Loi 25' : 'Law 25 Purge',
            message: language === 'fr'
              ? `${expired.length} sessions ont été supprimées définitivement pour conformité.`
              : `${expired.length} sessions were permanently deleted for compliance.`,
            type: 'warning'
          });
        }
        return prev.filter(s => (now - s.createdAt) <= expirationLimit);
      });
    }, 60000);

    return () => clearInterval(purgeInterval);
  }, [language, currentRoute]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    addNotification({
      title: language === 'fr' ? 'Connexion réussie' : 'Login Successful',
      message: language === 'fr' ? `Bienvenue, ${user.fullName}.` : `Welcome, ${user.fullName}.`,
      type: 'success'
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleSessionComplete = (newSession: any, aiTasks: Task[]) => {
    setSessions([newSession, ...sessions]);
    setTasks([...aiTasks, ...tasks]);
    setActiveSession(newSession);
    setCurrentRoute(AppRoute.VIEW_SESSIONS);

    addNotification({
      title: language === 'fr' ? 'Swarm Aura terminé' : 'Aura Swarm Complete',
      message: language === 'fr'
        ? `Documentation pour ${newSession.patientInfo.fullName} prête.`
        : `Documentation for ${newSession.patientInfo.fullName} is ready.`,
      type: 'success',
      actionRoute: AppRoute.VIEW_SESSIONS,
      relatedId: newSession.id
    });

    if (newSession.madoData) {
      addNotification({
        title: language === 'fr' ? 'ALERTE MADO DÉTECTÉE' : 'MADO ALERT DETECTED',
        message: language === 'fr'
          ? `Une maladie à déclaration obligatoire (${newSession.madoData.diseaseDetected}) nécessite votre signature.`
          : `A mandatory reportable disease (${newSession.madoData.diseaseDetected}) requires your signature.`,
        type: 'critical',
        actionRoute: AppRoute.VIEW_SESSIONS,
        relatedId: newSession.id
      });
    }

    if (aiTasks.length > 0) {
      addNotification({
        title: language === 'fr' ? 'Nouvelles tâches IA' : 'New AI Tasks',
        message: language === 'fr'
          ? `${aiTasks.length} actions extraites de la session.`
          : `${aiTasks.length} actions extracted from the session.`,
        type: 'info',
        actionRoute: AppRoute.TASKS
      });
    }
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cette session ?' : 'Are you sure you want to delete this session?')) {
      setSessions(sessions.filter(s => s.id !== id));
      setTasks(tasks.filter(t => t.relatedSessionId !== id));
      if (activeSession?.id === id) setActiveSession(null);
    }
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' } : task));
  };

  const addTask = (task: Task) => setTasks([task, ...tasks]);
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const addTemplate = (template: ClinicalTemplate) => setTemplates([template, ...templates]);
  const deleteTemplate = (id: string) => setTemplates(templates.filter(t => t.id !== id));
  const handleSendBill = (bill: RAMQBill) => {
    setBills([bill, ...bills]);
    addNotification({
      title: language === 'fr' ? 'Facturation RAMQ' : 'RAMQ Billing',
      message: language === 'fr' ? 'Transmission vers le portail effectuée.' : 'Transmission to the portal completed.',
      type: 'success'
    });
  };

  const getRemainingTime = (createdAt: number) => {
    const elapsed = Date.now() - createdAt;
    const remaining = 24 * 60 * 60 * 1000 - elapsed;
    if (remaining <= 0) return 'Expiré';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleNotificationNavigate = (route: AppRoute, relatedId?: string) => {
    setCurrentRoute(route);
    setIsNotificationTrayOpen(false);
    if (relatedId && route === AppRoute.VIEW_SESSIONS) {
      const session = sessions.find(s => s.id === relatedId);
      if (session) setActiveSession(session);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Persistence for sensitive data (localStorage) ---
  useEffect(() => {
    const savedSessions = localStorage.getItem('sessions');
    if (savedSessions) {
      const decrypted = decryptData(savedSessions);
      if (decrypted) setSessions(decrypted);
    }
    const savedBills = localStorage.getItem('bills');
    if (savedBills) {
      const decrypted = decryptData(savedBills);
      if (decrypted) setBills(decrypted);
    }
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const decrypted = decryptData(savedTasks);
      if (decrypted) setTasks(decrypted);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sessions', encryptData(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('bills', encryptData(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('tasks', encryptData(tasks));
  }, [tasks]);
  // --- End sensitive data persistence ---

  // --- Persistence for additional app/user data (localStorage) ---
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const decrypted = decryptData(savedUser);
      if (decrypted) setCurrentUser(decrypted);
    }
    const savedDark = localStorage.getItem('isDarkMode');
    if (savedDark) setIsDarkMode(savedDark === 'true');
    const savedLang = localStorage.getItem('language');
    if (savedLang) setLanguage(savedLang as Language);
    const savedSidebar = localStorage.getItem('isSidebarOpen');
    if (savedSidebar) setIsSidebarOpen(savedSidebar === 'true');
    const savedBranding = localStorage.getItem('branding');
    if (savedBranding) setBranding(JSON.parse(savedBranding));
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', encryptData(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode ? 'true' : 'false');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('isSidebarOpen', isSidebarOpen ? 'true' : 'false');
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('branding', JSON.stringify(branding));
  }, [branding]);

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);
  // --- End additional app/user data persistence ---

  // --- Example: Sync non-sensitive data to server (implement your API call here) ---
  // useEffect(() => {
  //   fetch('/api/templates', { method: 'POST', body: JSON.stringify(templates) });
  // }, [templates]);
  // --- End non-sensitive data sync ---


  // ...existing code...
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} lang={language} />;
  }

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.NEW_SESSION:
        return <NewSession lang={language} onComplete={handleSessionComplete} onError={triggerError} clinician={currentUser} />;
      case AppRoute.VIEW_SESSIONS:
        if (activeSession) {
          return (
            <SessionViewer
              session={activeSession}
              lang={language}
              branding={branding}
              onDelete={handleDeleteSession}
              onBack={() => setActiveSession(null)}
              isPrivacyMode={isPrivacyMode}
            />
          );
        }
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 leading-tight">
                {t('deletion_warning')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Display only local sessions */}
              {sessions.length > 0 ? sessions.map(s => {
                const formsCount = Object.keys(s.forms).length;
                const validatedCount = (Object.values(s.forms) as FormStatus[]).filter(f => f.status === 'validated').length;

                return (
                  <div key={s.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col hover:border-blue-500 dark:hover:border-blue-500 transition-all group shadow-sm overflow-hidden">
                    <div onClick={() => setActiveSession(s)} className="p-6 cursor-pointer flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                          {isPrivacyMode ? '••' : s.patientInfo.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.date}</span>
                          <div className="flex items-center gap-1 justify-end text-[10px] text-amber-500 font-bold mt-1">
                            <Clock size={10} /> {getRemainingTime(s.createdAt)}
                          </div>
                        </div>
                      </div>
                      <h3 className={`font-bold text-slate-800 dark:text-white text-xl leading-tight transition-all ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                        {s.patientInfo.fullName}
                      </h3>
                      <p className={`text-xs font-medium text-slate-400 mt-1 transition-all ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                        {s.patientInfo.ramq}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                          <FileText size={12} /> {formsCount} Docs
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${validatedCount === formsCount ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          <CheckCircle size={12} /> {validatedCount}/{formsCount} {t('status_validated')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-20 text-center text-slate-400">Aucune session enregistrée.</div>
              )}
            </div>
          </div>
        );
      case AppRoute.ASK_AURA:
        return <AskAura sessions={sessions} lang={language} />;
      case AppRoute.AURALINK:
        return <AuraLink lang={language} sessions={sessions} />;
      case AppRoute.TASKS:
        return <Tasks lang={language} tasks={tasks} sessions={sessions} onToggleTask={toggleTaskStatus} onAddTask={addTask} onDeleteTask={deleteTask} />;
      case AppRoute.SCHEDULE:
        return <Schedule lang={language} onNavigate={setCurrentRoute} />;
      case AppRoute.TEMPLATES:
        return <Templates lang={language} templates={templates} branding={branding} setBranding={setBranding} onAddTemplate={addTemplate} onDeleteTemplate={deleteTemplate} />;
      case AppRoute.COMMUNITY:
        return <Community lang={language} templates={templates} />;
      case AppRoute.RAMQ:
        return <RAMQBilling lang={language} sessions={sessions} bills={bills} onSendBill={handleSendBill} />;
      case AppRoute.SETTINGS:
        return <Settings lang={language} />;
      case AppRoute.REQUEST_FEATURE:
        return <RequestFeature lang={language} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <Bell className="animate-pulse mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Module en attente</h3>
            <p>Le module {t(currentRoute)} est en cours de développement.</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex ${isPrivacyMode ? 'phi-privacy' : ''}`}>
      <style>{`
        .phi-privacy .blur-sensitive { filter: blur(12px); pointer-events: none; user-select: none; opacity: 0.3; }
        .phi-privacy input, .phi-privacy textarea { filter: blur(8px); pointer-events: none; }
      `}</style>

      {/* Sidebar - fixed position with proper z-index */}
      <Sidebar
        currentRoute={currentRoute}
        setRoute={setCurrentRoute}
        lang={language}
        setLang={setLanguage}
        isDark={isDarkMode}
        toggleDark={() => setIsDarkMode(!isDarkMode)}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Persistent header for app name and greeting */}
      <div className={`fixed top-0 z-40 flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'left-64 w-[calc(100%-16rem)]' : 'left-20 w-[calc(100%-5rem)]'}`}>
        <div className="flex items-center gap-3">
          <Logo showText={true} className="w-10 h-10" />
          <div>
            <h1 className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">AuraScribe</h1>
            <p className="text-2xl font-bold heading-font text-slate-800 dark:text-white">
              {language === 'fr' ? 'Bonjour' : 'Hello'}, {currentUser?.fullName.split(' ')[0] || 'Dr. Rousseau'}
            </p>
          </div>
        </div>
      </div>

      {/* Main content - properly offset from sidebar and header */}
      <main className={`flex-1 min-h-screen transition-all duration-300 p-4 sm:p-8 pt-32 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>

        {/* Main content below header */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderContent()}
        </div>

        <SecurityShield
          onLock={handleLogout}
          isPrivacyMode={isPrivacyMode}
          togglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
        />
      </main>
    </div>
  );
};

export default App;
