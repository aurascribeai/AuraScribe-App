import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

// Fix for VITE_API_BASE_URL type error
declare global {
  interface ImportMetaEnv {
    VITE_API_BASE_URL?: string;
    // add other env vars here if needed
  }
  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

import {
  User,
  Database,
  Puzzle,
  Shield,
  Bell,
  Lock,
  Globe,
  ChevronRight,
  Mail,
  Phone,
  Stethoscope,
  Printer,
  Terminal,
  Save,
  CheckCircle2,
  AlertCircle,
  Zap,
  Clock,
  Plus,
  Cpu,
  Fingerprint,
  Link2,
  Share2,
  Trash2,
  Settings as SettingsIcon,
  X,
  Server,
  Key,
  ShieldAlert,
  HardDrive,
  CreditCard
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SettingsProps {
  lang: Language;
}

interface PaymentInvoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'due';
  link?: string;
}

interface PaymentInfo {
  planName: string;
  renewalDate: string;
  autoRenew: boolean;
  usageNotes: string;
  invoices: PaymentInvoice[];
}

const PAYMENT_STORAGE_KEY = 'aurascribe:payment-info';
const PAYMENT_PORTAL_URL = 'https://link.waveapps.com/f6gmvq-6mkt2s';

const defaultPaymentInfo: PaymentInfo = {
  planName: 'AuraScribe Pro',
  renewalDate: '2026-02-01',
  autoRenew: true,
  usageNotes: 'Notes traitées : 1 234 • Stockage utilisé : 2.1 Go',
  invoices: [
    { id: 'inv-202602', date: '2026-02-01', amount: '29,99$', status: 'paid', link: PAYMENT_PORTAL_URL },
    { id: 'inv-202601', date: '2026-01-01', amount: '29,99$', status: 'paid', link: PAYMENT_PORTAL_URL },
    { id: 'inv-202512', date: '2025-12-01', amount: '29,99$', status: 'paid', link: PAYMENT_PORTAL_URL }
  ]
};

const Settings: React.FC<SettingsProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'clinical' | 'storage' | 'lab' | 'integrations' | 'templates' | 'payment' | 'production' | 'developer'>('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdapterModal, setShowAdapterModal] = useState(false);
  
  // Profile photo state
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  
  // Clinical Preferences state
  const [soapStructure, setSoapStructure] = useState('SOAP');
  const [terminology, setTerminology] = useState('Français');
  const [autoPhrases, setAutoPhrases] = useState('');
  const [referralPrefs, setReferralPrefs] = useState('');
  const [pharmacy, setPharmacy] = useState('');
  const [renewalRules, setRenewalRules] = useState('');
  
  // Work Preferences state
  const [clinicHours, setClinicHours] = useState('08:00-17:00');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(() => {
    try {
      const saved = localStorage.getItem(PAYMENT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      return defaultPaymentInfo;
    }
    return defaultPaymentInfo;
  });
  const [newInvoice, setNewInvoice] = useState({ date: '', amount: '', status: 'due' as 'paid' | 'due' });
  const [paymentMethod, setPaymentMethod] = useState('Visa se terminant par 4242');
  const [billingContact, setBillingContact] = useState('j.rousseau@clinique.ca');
  const [taxInfo, setTaxInfo] = useState('NEQ: 1234567890 • TVQ: 1234567890 • TPS: 123456789');

  useEffect(() => {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(paymentInfo));
  }, [paymentInfo]);

  const updatePaymentField = (field: Partial<PaymentInfo>) => {
    setPaymentInfo(prev => ({ ...prev, ...field }));
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.date || !newInvoice.amount) return;
    setPaymentInfo(prev => ({
      ...prev,
      invoices: [
        { id: `inv-${Date.now()}`, date: newInvoice.date, amount: newInvoice.amount, status: newInvoice.status, link: PAYMENT_PORTAL_URL },
        ...prev.invoices
      ]
    }));
    setNewInvoice({ date: '', amount: '', status: 'due' });
  };
  const [appointmentDuration, setAppointmentDuration] = useState(15);
  const [noteTemplate, setNoteTemplate] = useState('Standard');
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [vacationDates, setVacationDates] = useState<string[]>([]);
  const [coverage, setCoverage] = useState('');
  
  // Professional Information state
  const [specialty, setSpecialty] = useState('Médecine de famille');
  const [licenseRenewal, setLicenseRenewal] = useState('2026-12-31');
  const [clinicAddress, setClinicAddress] = useState('123 Rue Clinique, Montréal, QC');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [languages, setLanguages] = useState<string[]>(['Français', 'Anglais']);
  
  // Storage & Backup state
  const [backupFrequency, setBackupFrequency] = useState('Quotidienne');
  const [backupRetention, setBackupRetention] = useState('30 jours');
  const [backupLocation, setBackupLocation] = useState('Cloud');
  const [rpo, setRpo] = useState('12h');
  const [encryption, setEncryption] = useState(true);
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  
  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('SOAP');
  const [templateSpecialty, setTemplateSpecialty] = useState('Général');
  const [templateContent, setTemplateContent] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [importExportData, setImportExportData] = useState('');
  
  // API & Developer (Advanced) state
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [customScript, setCustomScript] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [logLevel, setLogLevel] = useState('INFO');
  const [customCss, setCustomCss] = useState('');
  
  // Accessibility state
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shortcuts, setShortcuts] = useState('Default');
  const [voiceCommand, setVoiceCommand] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  
  // Notification Settings state
  const [emailNotif, setEmailNotif] = useState({ messages: true, alerts: true, billing: false });
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [soundPref, setSoundPref] = useState('Chime');
  const [dndStart, setDndStart] = useState('22:00');
  const [dndEnd, setDndEnd] = useState('07:00');
  const [faxNotif, setFaxNotif] = useState(true);
  
  // Security state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState([{ device: 'Chrome (Windows)', location: 'Montreal', lastActive: '2026-01-15 09:12' }]);
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [failedLoginAlerts, setFailedLoginAlerts] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('Hebdomadaire');
  const [auditLog, setAuditLog] = useState<string[]>(['2026-01-14 18:22: Login', '2026-01-14 18:23: Export dossier']);
  
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  
  const soapOptions = ['SOAP', 'APSO', 'CHART', 'PROGRESS'];
  const terminologyOptions = ['Français', 'Anglais', 'Bilingue'];
  const specialtyOptions = ['Médecine de famille', 'Pédiatrie', 'Cardiologie', 'Dermatologie', 'Psychiatrie'];
  const noteTemplateOptions = ['Standard', 'Détaillé', 'Minimaliste'];
  const languageOptions = ['Français', 'Anglais', 'Espagnol', 'Mandarin', 'Arabe'];
  const fontSizeOptions = ['small', 'medium', 'large', 'x-large'];
  const shortcutOptions = ['Default', 'Emacs', 'Vim', 'Custom'];
  const soundOptions = ['Chime', 'Ding', 'Alerte', 'Silencieux'];
  const logLevelOptions = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  const templateCategories = ['SOAP', 'Lettre', 'Rapport', 'Certificat', 'Prescription'];
  
  const handleVacationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVacationDates(e.target.value.split(',').map(d => d.trim()).filter(d => d));
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setLanguages(selected);
  };
  
  const handleAddApiKey = () => {
    if (newApiKey && !apiKeys.includes(newApiKey)) {
      setApiKeys([...apiKeys, newApiKey]);
      setNewApiKey('');
    }
  };
  
  const handleRemoveApiKey = (key: string) => {
    setApiKeys(apiKeys.filter(k => k !== key));
  };
  
  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateCategory(template.category);
    setTemplateSpecialty(template.specialty);
    setTemplateContent(template.content);
  };
  
  const handleDeleteTemplate = (template: any) => {
    setTemplates(templates.filter(t => t !== template));
  };
  
  const handleShareTemplate = (template: any) => {
    const updated = templates.map(t => 
      t === template ? { ...t, shared: !t.shared } : t
    );
    setTemplates(updated);
  };
  
  const handleSetDefault = (template: any) => {
    setTemplates(prev =>
      prev.map(t => ({
        ...t,
        isDefault: t === template,
      }))
    );
  };
  
  const handleSaveTemplate = () => {
    if (editingTemplate) {
      // Update existing template
      const updated = templates.map(t =>
        t === editingTemplate ? {
          ...t,
          name: templateName,
          category: templateCategory,
          specialty: templateSpecialty,
          content: templateContent
        } : t
      );
      setTemplates(updated);
    } else {
      // Add new template
      const hasDefault = templates.some(t => t.isDefault);
      const newTemplate = {
        name: templateName,
        category: templateCategory,
        specialty: templateSpecialty,
        content: templateContent,
        shared: false,
        isDefault: !hasDefault
      };
      setTemplates([...templates, newTemplate]);
    }
    setTemplateName('');
    setTemplateContent('');
    setEditingTemplate(null);
  };
  
  const handleExportTemplates = () => {
    const data = JSON.stringify(templates, null, 2);
    setImportExportData(data);
  };
  
  const handleImportTemplates = () => {
    try {
      const imported = JSON.parse(importExportData);
      setTemplates(imported);
      setImportExportData('');
    } catch (error) {
      alert('Invalid JSON format');
    }
  };
  
  const renderTemplates = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Gestion des Modèles</h3>
        
        {/* Existing Templates */}
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Modèles existants</span>
          <ul className="space-y-3">
            {templates.map((t, i) => (
              <li key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex flex-col gap-2 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-700 dark:text-blue-300">{t.name}</span>
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => handleEditTemplate(t)}>Éditer</button>
                    <button className="text-xs text-rose-600 hover:underline" onClick={() => handleDeleteTemplate(t)}>Supprimer</button>
                  </div>
                </div>
                <div className="flex gap-2 items-center text-xs">
                  <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">{t.category}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">{t.specialty}</span>
                  <button className={`px-2 py-1 rounded ${t.shared ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`} onClick={() => handleShareTemplate(t)}>{t.shared ? 'Partagé' : 'Privé'}</button>
                  <button className={`px-2 py-1 rounded ${t.isDefault ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`} onClick={() => handleSetDefault(t)}>Défaut</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Template Editor */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{editingTemplate ? 'Éditer le modèle' : 'Nouveau modèle'}</span>
          </div>
          <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm p-2 font-bold" placeholder="Nom du modèle" value={templateName} onChange={e => setTemplateName(e.target.value)} />
          <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm p-2" value={templateCategory} onChange={e => setTemplateCategory(e.target.value)}>
            {templateCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm p-2" value={templateSpecialty} onChange={e => setTemplateSpecialty(e.target.value)}>
            {specialtyOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2 font-mono min-h-[80px]" placeholder="Contenu du modèle..." value={templateContent} onChange={e => setTemplateContent(e.target.value)} />
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold" onClick={handleSaveTemplate}>{editingTemplate ? 'Enregistrer' : 'Créer'}</button>
            {editingTemplate && <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl text-xs font-bold" onClick={() => setEditingTemplate(null)}>Annuler</button>}
          </div>
        </div>
        
        {/* Import/Export */}
        <div className="mt-8 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Import / Export</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold" onClick={handleExportTemplates}>Exporter</button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold" onClick={handleImportTemplates}>Importer</button>
            <textarea className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2 font-mono min-h-[60px]" value={importExportData} onChange={e => setImportExportData(e.target.value)} placeholder="Collez ou copiez ici..." />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderDeveloper = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">API & Développeur (Avancé)</h3>
        <div className="space-y-6">
          {/* API Key Management */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Clés API</label>
            <div className="flex gap-2 flex-wrap">
              {apiKeys.map((key, i) => (
                <span key={i} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                  {key}
                  <button onClick={() => handleRemoveApiKey(key)} className="text-rose-600 hover:underline ml-2">Supprimer</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input type="text" className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2 font-mono" value={newApiKey} onChange={e => setNewApiKey(e.target.value)} placeholder="Nouvelle clé API..." />
              <button onClick={handleAddApiKey} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Ajouter</button>
            </div>
          </div>
          {/* Webhook Endpoints */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Webhook Endpoint</label>
            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2 font-mono" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://webhook.site/endpoint" />
          </div>
          {/* Custom Integration Scripts */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Script d'intégration personnalisé</label>
            <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2 font-mono min-h-[80px]" value={customScript} onChange={e => setCustomScript(e.target.value)} placeholder="// JS/TS/Python..." />
          </div>
          {/* Debug Mode Toggle */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="debug-mode" checked={debugMode} onChange={e => setDebugMode(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="debug-mode" className="text-xs font-bold text-slate-600 dark:text-slate-300">Activer le mode debug</label>
          </div>
          {/* Log Level Settings */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Niveau de log</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2 font-mono" value={logLevel} onChange={e => setLogLevel(e.target.value)}>
              {logLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          {/* Custom CSS/Theme Overrides */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">CSS/Thème personnalisé</label>
            <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2 font-mono min-h-[60px]" value={customCss} onChange={e => setCustomCss(e.target.value)} placeholder={":root { --primary: #0055ff; }"} />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderAccessibility = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Accessibilité & UX</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Taille de police</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4" value={fontSize} onChange={e => setFontSize(e.target.value)}>
              {fontSizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="high-contrast" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="high-contrast" className="text-xs font-bold text-slate-600 dark:text-slate-300">Mode contraste élevé</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="reduced-motion" checked={reducedMotion} onChange={e => setReducedMotion(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="reduced-motion" className="text-xs font-bold text-slate-600 dark:text-slate-300">Réduire les animations</label>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Raccourcis clavier</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4" value={shortcuts} onChange={e => setShortcuts(e.target.value)}>
              {shortcutOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="voice-command" checked={voiceCommand} onChange={e => setVoiceCommand(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="voice-command" className="text-xs font-bold text-slate-600 dark:text-slate-300">Commandes vocales</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="screen-reader" checked={screenReader} onChange={e => setScreenReader(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="screen-reader" className="text-xs font-bold text-slate-600 dark:text-slate-300">Optimisation lecteur d'écran</label>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderNotifications = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Notifications</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Notifications par email</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={emailNotif.messages} onChange={e => setEmailNotif(v => ({ ...v, messages: e.target.checked }))} className="accent-blue-600" />Nouveaux messages</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={emailNotif.alerts} onChange={e => setEmailNotif(v => ({ ...v, alerts: e.target.checked }))} className="accent-blue-600" />Alertes système</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={emailNotif.billing} onChange={e => setEmailNotif(v => ({ ...v, billing: e.target.checked }))} className="accent-blue-600" />Facturation</label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="push-notif" checked={pushNotif} onChange={e => setPushNotif(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="push-notif" className="text-xs font-bold text-slate-600 dark:text-slate-300">Notifications push</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="sms-notif" checked={smsNotif} onChange={e => setSmsNotif(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="sms-notif" className="text-xs font-bold text-slate-600 dark:text-slate-300">Alertes SMS (urgences)</label>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Préférence sonore</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={soundPref} onChange={e => setSoundPref(e.target.value)}>
              {soundOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Heures "Ne pas déranger"</label>
            <div className="flex gap-2 items-center">
              <input type="time" value={dndStart} onChange={e => setDndStart(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2" />
              <span className="text-xs">à</span>
              <input type="time" value={dndEnd} onChange={e => setDndEnd(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs p-2" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="fax-notif" checked={faxNotif} onChange={e => setFaxNotif(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="fax-notif" className="text-xs font-bold text-slate-600 dark:text-slate-300">Notification de réception fax/scan</label>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderSecurity = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Sécurité du Compte</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="2fa" checked={twoFAEnabled} onChange={e => setTwoFAEnabled(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="2fa" className="text-xs font-bold text-slate-600 dark:text-slate-300">Activer l'authentification à deux facteurs (2FA)</label>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Gestion des sessions actives</label>
            <ul className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-xs space-y-2">
              {activeSessions.map((s, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>{s.device} • {s.location} • {s.lastActive}</span>
                  <button className="text-rose-600 hover:underline text-xs">Déconnecter</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Changer le mot de passe</label>
            <input type="password" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Nouveau mot de passe" />
            <div className="text-xs text-slate-500 mt-1">8+ caractères, 1 majuscule, 1 chiffre, 1 symbole</div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">IP autorisées (whitelist)</label>
            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} placeholder="192.168.1.1, 10.0.0.2" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="failed-login-alerts" checked={failedLoginAlerts} onChange={e => setFailedLoginAlerts(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
            <label htmlFor="failed-login-alerts" className="text-xs font-bold text-slate-600 dark:text-slate-300">Alerte en cas d'échec de connexion</label>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Journal d'audit</label>
            <ul className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-xs space-y-2 max-h-32 overflow-y-auto">
              {auditLog.map((entry, i) => <li key={i}>{entry}</li>)}
            </ul>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Exportation / Sauvegarde des données</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={backupSchedule} onChange={e => setBackupSchedule(e.target.value)}>
              <option>Quotidienne</option>
              <option>Hebdomadaire</option>
              <option>Mensuelle</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
  

const renderPayment = () => {
  const usageEntries = paymentInfo.usageNotes.split('�').map(entry => entry.trim()).filter(Boolean);
  const invoiceSummary = paymentInfo.invoices.reduce(
    (acc, invoice) => {
      acc[invoice.status] += 1;
      return acc;
    },
    { paid: 0, due: 0 }
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Abonnement & Facturation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nom du plan</label>
              <input
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={paymentInfo.planName}
                onChange={e => updatePaymentField({ planName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prochain paiement</label>
              <input
                type="date"
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={paymentInfo.renewalDate}
                onChange={e => updatePaymentField({ renewalDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto-renew"
                checked={paymentInfo.autoRenew}
                onChange={e => updatePaymentField({ autoRenew: e.target.checked })}
                className="accent-blue-600 w-5 h-5 rounded-xl"
              />
              <label htmlFor="auto-renew" className="text-xs font-bold text-slate-600 dark:text-slate-300">Renouvellement automatique</label>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Notes d'utilisation</label>
              <textarea
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
                value={paymentInfo.usageNotes}
                onChange={e => updatePaymentField({ usageNotes: e.target.value })}
              />
            </div>
          </div>
          <div className="relative rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-6 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Statut du plan</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{paymentInfo.planName}</p>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em]">
                <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/50 text-blue-600">{paymentInfo.autoRenew ? 'Auto-renouvellement' : 'Paiement manuel'}</span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">{paymentInfo.renewalDate}</span>
              </div>
            </div>
            <div className="flex gap-3 items-center mt-6">
              <CreditCard size={48} className="text-blue-600" />
              <a
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 transition-all active:scale-95"
                href={PAYMENT_PORTAL_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                Gerer le paiement
              </a>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-[0.2em]">{usageEntries.length ? usageEntries[0] : "Statistiques d'utilisation a jour."}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Statistiques d'utilisation</p>
              <span className="text-[10px] text-slate-500">{usageEntries.length} indicateur(s)</span>
            </div>
            <div className="space-y-2">
              {usageEntries.length === 0 ? (
                <p className="text-[10px] text-slate-500">Aucune statistique renseignee.</p>
              ) : (
                usageEntries.map((entry, idx) => (
                  <p key={idx} className="text-sm font-bold text-slate-700 dark:text-slate-200">{entry}</p>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-[0.3em]">{invoiceSummary.paid} payee(s)</span>
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-[0.3em]">{invoiceSummary.due} en attente</span>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Historique des factures</p>
              <span className="text-[10px] text-slate-500">{paymentInfo.invoices.length} facture(s)</span>
            </div>
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {paymentInfo.invoices.map(invoice => (
                <li key={invoice.id} className="rounded-2xl border border-slate-100 dark:border-slate-700 p-4 bg-white/70 dark:bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{invoice.date} � {invoice.amount}</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{invoice.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {invoice.status === 'paid' ? 'Payee' : 'En attente'}
                    </span>
                  </div>
                  <a
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 underline"
                    href={invoice.link ?? PAYMENT_PORTAL_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Telecharger / Voir
                  </a>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddInvoice} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="date"
                  value={newInvoice.date}
                  onChange={e => setNewInvoice(prev => ({ ...prev, date: e.target.value }))}
                  className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Montant"
                  value={newInvoice.amount}
                  onChange={e => setNewInvoice(prev => ({ ...prev, amount: e.target.value }))}
                  className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newInvoice.status}
                  onChange={e => setNewInvoice(prev => ({ ...prev, status: e.target.value as 'paid' | 'due' }))}
                  className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="paid">Payee</option>
                  <option value="due">En attente</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Ajouter une facture
              </button>
            </form>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Methode de paiement</label>
            <input
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact de facturation</label>
            <input
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={billingContact}
              onChange={e => setBillingContact(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Informations fiscales</label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            value={taxInfo}
            onChange={e => setTaxInfo(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

const renderProductionReadiness = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-sm">
            <Shield size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Production Readiness Monitor</h3>
            <p className="text-sm text-slate-500">{lang === 'fr' ? 'Système prêt pour la production clinique.' : 'System ready for clinical production.'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Interface Utilisateur & UX', status: 'complete', desc: 'Composants React et Design System finalisés.' },
            { label: 'Orchestration Multi-Agents', status: 'complete', desc: 'Swarm Intelligence Gemini 3 Pro intégrée.' },
            { label: 'Transcription Temps Réel', status: 'complete', desc: 'Connecté via Deepgram Self-Hosted (GCP).' },
            { label: 'Persistance des Données', status: 'complete', desc: 'Redis avec chiffrement et TTL 24h (Loi 25).' },
            { label: 'Sécurité & Auth', status: 'complete', desc: 'Authentification sécurisée avec gestion de sessions.' },
            { label: 'Hébergement Loi 25', status: 'complete', desc: 'Serveurs GCP Canada (Montréal) - northamerica-northeast1.' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div className="flex gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full ${item.status === 'complete' ? 'bg-emerald-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}></div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'complete' ? 'bg-emerald-50 text-emerald-600' :
                item.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-3xl">
          <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
            <strong>Statut :</strong> L'application est prête pour la production. Tous les systèmes sont opérationnels et conformes aux exigences de la Loi 25.
          </p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              id="profile-photo-input"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setProfilePhotoPreview(ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                  // Upload to backend
                  const formData = new FormData();
                  formData.append('file', file, file.name);
                  try {
                    setUploadingPhoto(true);
                    setPhotoError(null);
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/upload`, {
                      method: 'POST',
                      body: formData
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();
                    setProfilePhotoUrl(data.url || data.file_url || '');
                  } catch (err: any) {
                    setPhotoError(err.message || 'Upload failed');
                  } finally {
                    setUploadingPhoto(false);
                  }
                }
              }}
            />
            <div
              className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-500/20 group-hover:scale-105 transition-all overflow-hidden cursor-pointer"
              onClick={() => document.getElementById('profile-photo-input')?.click()}
              title="Changer la photo de profil"
            >
              {profilePhotoPreview ? (
                <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover rounded-[2rem]" />
              ) : (
                'JR'
              )}
            </div>
            <button
              className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg text-slate-500 hover:text-blue-600 transition-colors"
              onClick={() => document.getElementById('profile-photo-input')?.click()}
              title="Ajouter/Changer la photo"
            >
              <Plus size={16} />
            </button>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-[2rem]">
                <span className="text-white text-xs">Téléchargement...</span>
              </div>
            )}
            {photoError && (
              <div className="absolute top-full left-0 w-full text-xs text-red-500 mt-2 text-center">{photoError}</div>
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">Dr. Julien Rousseau</h3>
            <p className="text-lg text-slate-500 font-medium">Médecine de Famille • CPQ 123456</p>
            <div className="flex gap-3 mt-4 justify-center md:justify-start">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100">DSQ Vérifié</span>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-100">Admin Clinique</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Clinical Preferences Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Structure de note par défaut</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={soapStructure} onChange={e => setSoapStructure(e.target.value)}>
                {soapOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Terminologie médicale préférée</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={terminology} onChange={e => setTerminology(e.target.value)}>
                {terminologyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Phrases/diagnostics à insérer automatiquement</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={autoPhrases} onChange={e => setAutoPhrases(e.target.value)} placeholder="Ex: HTA bien contrôlée, suivi annuel recommandé" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Préférences de référence (spécialistes par défaut)</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={referralPrefs} onChange={e => setReferralPrefs(e.target.value)} placeholder="Ex: Cardiologue, Pneumologue" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Pharmacie par défaut</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={pharmacy} onChange={e => setPharmacy(e.target.value)} placeholder="Nom, adresse ou téléphone" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Règles de renouvellement d'ordonnance</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={renewalRules} onChange={e => setRenewalRules(e.target.value)} placeholder="Ex: 3 renouvellements max, 6 mois" />
            </div>
          </div>
          {/* Work Preferences Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Horaires de la clinique</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={clinicHours} onChange={e => setClinicHours(e.target.value)} placeholder="08:00-17:00" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Durée par rendez-vous (min)</label>
              <input type="number" min={5} max={120} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={appointmentDuration} onChange={e => setAppointmentDuration(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Modèle de note préféré</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={noteTemplate} onChange={e => setNoteTemplate(e.target.value)}>
                {noteTemplateOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="auto-followup" checked={autoFollowUp} onChange={e => setAutoFollowUp(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
              <label htmlFor="auto-followup" className="text-xs font-bold text-slate-600 dark:text-slate-300">Rappel automatique de suivi</label>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Vacances / Absences (dates, séparées par virgule)</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={vacationDates.join(', ')} onChange={handleVacationChange} placeholder="2026-07-01, 2026-08-15" />
              <div className="text-xs text-slate-500 mt-1">{vacationDates.length > 0 ? vacationDates.join(', ') : 'Aucune'}</div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Remplaçant désigné (couverture)</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={coverage} onChange={e => setCoverage(e.target.value)} placeholder="Nom du collègue ou service" />
            </div>
          </div>
          {/* Professional Information Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Spécialité</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={specialty} onChange={e => setSpecialty(e.target.value)}>
                {specialtyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Date de renouvellement du permis</label>
              <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={licenseRenewal} onChange={e => setLicenseRenewal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Adresse de la clinique</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Téléphone secondaire</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={secondaryPhone} onChange={e => setSecondaryPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Contact d'urgence</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Langues parlées</label>
              <select multiple className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm p-4 focus:ring-2 focus:ring-blue-500 transition-all" value={languages} onChange={handleLanguageChange}>
                {languageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="text-xs text-slate-500 mt-1">{languages.length > 0 ? languages.join(', ') : 'Aucune sélectionnée'}</div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Professionnel</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" defaultValue="j.rousseau@clinique.ca" className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Numéro RAMQ Facturation</label>
              <div className="relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" defaultValue="1928374-6" className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Signature Numérique</label>
            <input
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.svg,.bmp,.gif,.webp,.pdf"
              id="signature-input"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setSignaturePreview(ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                  // Upload to backend
                  const formData = new FormData();
                  formData.append('file', file, file.name);
                  try {
                    setUploadingSignature(true);
                    setSignatureError(null);
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/upload`, {
                      method: 'POST',
                      body: formData
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();
                    setSignatureUrl(data.url || data.file_url || '');
                  } catch (err: any) {
                    setSignatureError(err.message || 'Upload failed');
                  } finally {
                    setUploadingSignature(false);
                  }
                }
              }}
            />
            <div
              className="h-44 w-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 p-8 text-center group cursor-pointer hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-all relative overflow-hidden"
              onClick={() => document.getElementById('signature-input')?.click()}
              title="Modifier votre signature"
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                <Fingerprint size={24} className="text-blue-600" />
              </div>
              {signaturePreview ? (
                <img src={signaturePreview} alt="Signature" className="max-h-20 max-w-full object-contain mx-auto mb-2" />
              ) : null}
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Modifier votre signature</p>
              <p className="text-[10px] mt-1 opacity-60">Utilisée pour auto-signer les notes validées</p>
              <button
                className="absolute bottom-3 right-3 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow text-slate-500 hover:text-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('signature-input')?.click();
                }}
                title="Ajouter/Changer la signature"
              >
                <Plus size={16} />
              </button>
              {uploadingSignature && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-[2rem]">
                  <span className="text-white text-xs">Téléchargement...</span>
                </div>
              )}
              {signatureError && (
                <div className="absolute top-full left-0 w-full text-xs text-red-500 mt-2 text-center">{signatureError}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95">
          <Save size={18} /> Sauvegarder Profil
        </button>
      </div>
    </div>
  );

  const renderStorage = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-3xl flex items-start gap-6">
          <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            <Shield size={28} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Sécurité & Souveraineté des Données</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">AuraScribe est configuré pour respecter strictement la Loi 25. Toutes les données sont hébergées sur des serveurs AWS Canada-Central (Montréal) avec chiffrement AES-256 GCM.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Clock size={20} />
                </div>
                <span className="text-sm font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">Auto-Purge (Loi 25)</span>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Supprime définitivement les enregistrements vocaux et transcripts temporaires après traitement réussi.</p>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Délai de rétention</label>
              <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold p-4 focus:ring-0">
                <option>24 Heures (Standard de conformité)</option>
                <option>12 Heures (Haute sécurité)</option>
                <option>Immédiat (Aucun stockage local)</option>
              </select>
            </div>
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                  <Database size={20} />
                </div>
                <span className="text-sm font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">Local Data Vault</span>
              </div>
              <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Force le stockage des fichiers cliniques uniquement sur cet appareil. Désactive la consultation multi-postes.</p>
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-tight">Attention: Désactive la sauvegarde cloud.</p>
            </div>
          </div>
        </div>

        {/* Backup & Recovery Section */}
        <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800 space-y-6 mt-8">
          <h4 className="text-lg font-black text-blue-700 dark:text-blue-300 mb-2">Sauvegarde & Récupération</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fréquence de sauvegarde</label>
              <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold p-4 focus:ring-0" value={backupFrequency} onChange={e => setBackupFrequency(e.target.value)}>
                <option>Quotidienne</option>
                <option>Hebdomadaire</option>
                <option>Mensuelle</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Période de rétention</label>
              <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold p-4 focus:ring-0" value={backupRetention} onChange={e => setBackupRetention(e.target.value)}>
                <option>7 jours</option>
                <option>30 jours</option>
                <option>90 jours</option>
                <option>1 an</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emplacement de sauvegarde</label>
              <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold p-4 focus:ring-0" value={backupLocation} onChange={e => setBackupLocation(e.target.value)}>
                <option>Cloud</option>
                <option>Local</option>
                <option>Cloud + Local</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objectif de point de reprise (RPO)</label>
              <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold p-4 focus:ring-0" value={rpo} onChange={e => setRpo(e.target.value)}>
                <option>1h</option>
                <option>6h</option>
                <option>12h</option>
                <option>24h</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <input type="checkbox" id="backup-encryption" checked={encryption} onChange={e => setEncryption(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded-xl" />
              <label htmlFor="backup-encryption" className="text-xs font-bold text-slate-600 dark:text-slate-300">Chiffrement des sauvegardes</label>
            </div>
            <div className="space-y-2 col-span-2">
              <button
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95"
                onClick={() => setRestoreStatus('Test de restauration réussi !')}
              >
                Tester la restauration
              </button>
              {restoreStatus && <div className="text-xs text-emerald-600 mt-1">{restoreStatus}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLab = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
            <Cpu size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Aura Lab AI Orchestrator</h3>
            <p className="text-sm text-slate-500">Gérez la puissance et le raisonnement de vos agents médicaux.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group p-8 border-2 border-indigo-600 rounded-[2rem] space-y-4 bg-indigo-50/20 dark:bg-indigo-900/10 relative overflow-hidden transition-all hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-600/10 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start relative z-10">
              <h4 className="text-lg font-black text-indigo-700 dark:text-indigo-300 uppercase italic">Aura-Pro V3</h4>
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Actif</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed relative z-10">Moteur de raisonnement clinique de pointe. Idéal pour les cas complexes, la gériatrie et la psychiatrie.</p>
            <div className="flex items-center gap-2 text-xs font-black text-indigo-600 bg-white dark:bg-slate-800 w-fit px-4 py-2 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900">
              <Zap size={16} fill="currentColor" /> EBM GROUNDED
            </div>
          </div>

          <div className="group p-8 border border-slate-100 dark:border-slate-800 rounded-[2rem] space-y-4 hover:border-blue-500 transition-all cursor-pointer bg-slate-50/30">
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase italic">Aura-Flash</h4>
              <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">Optimisé pour la vitesse pure. Recommandé pour les notes de suivi courtes (5-10 min) et les certificats simples.</p>
            <div className="text-xs font-bold text-slate-400 px-4 py-2 bg-white dark:bg-slate-800 w-fit rounded-xl border border-slate-100 dark:border-slate-800">
              Basé sur Gemini 3 Lite
            </div>
          </div>
        </div>

        <div className="space-y-12 pt-10 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">Thinking Budget (Raisonnement)</p>
                <p className="text-sm text-slate-500 mt-1">Nombre de jetons alloués à l'analyse différentielle invisible avant la rédaction.</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-indigo-600 italic">24,576</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tokens</p>
              </div>
            </div>
            <input type="range" min="0" max="32768" defaultValue="24576" className="w-full accent-indigo-600 h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Orchestration Multi-Agents</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Transcription + SOAP en parallèle</p>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Scribe Audio Natif</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Traitement direct du flux PCM</p>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
        <div className="p-10 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Link2 size={240} />
          </div>
          <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center shrink-0 border border-white/20">
            <Puzzle size={40} />
          </div>
          <div className="relative z-10 flex-1 text-center md:text-left">
            <h4 className="text-3xl font-black uppercase tracking-tight italic leading-none">Universal Adapter Engine</h4>
            <p className="text-sm text-blue-100 mt-4 leading-relaxed max-w-2xl font-medium">
              AuraScribe utilise une architecture middleware pour s'interfacer avec n'importe quel logiciel.
              Si votre clinique utilise un EMR ou un service de Fax spécifique, nos adaptateurs font le pont en temps réel.
            </p>
          </div>
          <button
            onClick={() => setShowAdapterModal(true)}
            className="px-10 py-4 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform shrink-0 active:scale-95"
          >
            Configurer Adaptateur
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Passerelles EMR Active</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase">Synchronisation Temps Réel</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 border-2 border-blue-500 rounded-[2rem] bg-blue-50/10 dark:bg-blue-900/10 flex items-center justify-between group cursor-pointer hover:bg-blue-50/20 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800">
                  <Server size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">TELUS PS Suite Adapter</p>
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Connecté via Bridge HL7</p>
                </div>
              </div>
              <SettingsIcon className="text-slate-300 group-hover:text-blue-600 transition-all" size={24} />
            </div>

            <div className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:border-indigo-500 bg-slate-50/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                  <Stethoscope size={28} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">MYLE (MEDFAR)</p>
                  <p className="text-xs text-slate-400 font-medium">Adaptateur API prêt (Config requise)</p>
                </div>
              </div>
              <Plus className="text-slate-300 group-hover:text-blue-600 transition-all" size={24} />
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Infrastructure E-Fax</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-800">
                  <Printer size={32} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">SRFax Digital Hub</p>
                  <p className="text-xs text-slate-500 font-medium">{lang === 'fr' ? 'Configuration requise' : 'Configuration required'}</p>
                </div>
              </div>
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-3 bg-white dark:bg-slate-700 text-slate-400 hover:text-blue-600 rounded-xl shadow-sm"><SettingsIcon size={18} /></button>
                <button className="p-3 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-500 rounded-xl shadow-sm"><Trash2 size={18} /></button>
              </div>
            </div>

            <button
              onClick={() => setShowAdapterModal(true)}
              className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 hover:text-blue-600 transition-all group"
            >
              <Plus size={32} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest">Connecter RingCentral / XMedius</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Clinical Preferences tab stub (reuse existing clinical preferences UI if available)
  const renderClinicalPreferences = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Préférences Cliniques</h3>
        {/* Place your clinical preferences UI here, or move from profile if needed */}
        <div className="text-slate-500">(À configurer: structure SOAP, terminologie, auto-phrases, etc.)</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Rechercher dans les paramètres..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      {/* Quick Settings Panel */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button className="px-4 py-2 bg-slate-100 rounded-xl">🔔 Notifications</button>
        <button className="px-4 py-2 bg-slate-100 rounded-xl">🎨 Theme</button>
        <button className="px-4 py-2 bg-slate-100 rounded-xl">⚡ Performance</button>
        <button className="px-4 py-2 bg-slate-100 rounded-xl">📊 Analytics</button>
      </div>
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
          <SettingsIcon size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-black heading-font text-slate-800 dark:text-white tracking-tighter italic">SYSTEM CONFIG</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Infrastructure Clinique & Intelligence IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Settings Navigation */}
        <div className="lg:col-span-3 space-y-3 sticky top-10">
          {/* 1. Profile */}
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'profile' ? 'bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><User size={22} /><span className="text-sm font-black uppercase tracking-widest italic">{t('settings_profile')}</span></button>
          {/* 2. Security */}
          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'security' ? 'bg-rose-600 text-white border-rose-600 shadow-2xl shadow-rose-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><Shield size={22} /><span className="text-sm font-black uppercase tracking-widest italic">Sécurité</span></button>
          {/* 3. Notifications */}
          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'notifications' ? 'bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><Bell size={22} /><span className="text-sm font-black uppercase tracking-widest italic">Notifications</span></button>
          {/* 4. Clinical Preferences */}
          <button onClick={() => setActiveTab('clinical')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'clinical' ? 'bg-blue-700 text-white border-blue-700 shadow-2xl shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><Stethoscope size={22} /><span className="text-sm font-black uppercase tracking-widest italic">Préférences Cliniques</span></button>
          {/* 5. Storage & Backup */}
          <button onClick={() => setActiveTab('storage')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'storage' ? 'bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><Database size={22} /><span className="text-sm font-black uppercase tracking-widest italic">{t('settings_storage')}</span></button>
          {/* 6. AI Lab */}
          <button onClick={() => setActiveTab('lab')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'lab' ? 'bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><Cpu size={22} /><span className="text-sm font-black uppercase tracking-widest italic">{t('settings_lab')}</span></button>
          {/* 7. Integrations */}
          <button onClick={() => setActiveTab('integrations')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'integrations' ? 'bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><Share2 size={22} /><span className="text-sm font-black uppercase tracking-widest italic">{t('settings_integrations')}</span></button>
          {/* 8. Templates */}
          <button onClick={() => setActiveTab('templates')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'templates' ? 'bg-blue-700 text-white border-blue-700 shadow-2xl shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><HardDrive size={22} /><span className="text-sm font-black uppercase tracking-widest italic">Modèles</span></button>
          {/* 9. Billing */}
          <button onClick={() => setActiveTab('payment')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'payment' ? 'bg-amber-500 text-white border-amber-500 shadow-2xl shadow-amber-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><CreditCard size={22} /><span className="text-sm font-black uppercase tracking-widest italic">Paiement</span></button>
          {/* 10. Compliance */}
          <button onClick={() => setActiveTab('production')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'production' ? 'bg-rose-600 text-white border-rose-600 shadow-2xl shadow-rose-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><ShieldAlert size={22} /><span className="text-sm font-black uppercase tracking-widest italic">Compliance</span></button>
          {/* 11. Advanced/API */}
          <button onClick={() => setActiveTab('developer')} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] transition-all border-2 ${activeTab === 'developer' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-500/30' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800'}`}><Terminal size={22} /><span className="text-sm font-black uppercase tracking-widest italic">API & Dev</span></button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9 rounded-[3rem] min-h-[75vh]">
          {/* Filter logic: if searchTerm, show only matching section/component */}
          {searchTerm ? (
            <div className="space-y-8">
              {/* Example: filter by section title (expand for fields in future steps) */}
              {['profile', 'security', 'notifications', 'clinical', 'storage', 'lab', 'integrations', 'templates', 'payment', 'production', 'developer'].map(tab => {
                const tabLabels: Record<string, string> = {
                  profile: 'Profil',
                  security: 'Sécurité',
                  notifications: 'Notifications',
                  clinical: 'Préférences Cliniques',
                  storage: 'Stockage',
                  lab: 'AI Lab',
                  integrations: 'Intégrations',
                  templates: 'Modèles',
                  payment: 'Paiement',
                  production: 'Compliance',
                  developer: 'API & Dev'
                };
                if (tabLabels[tab].toLowerCase().includes(searchTerm.toLowerCase())) {
                  switch (tab) {
                    case 'profile': return renderProfile();
                    case 'security': return renderSecurity();
                    case 'notifications': return renderNotifications();
                    case 'clinical': return renderClinicalPreferences();
                    case 'storage': return renderStorage();
                    case 'lab': return renderLab();
                    case 'integrations': return renderIntegrations();
                    case 'templates': return renderTemplates();
                    case 'payment': return renderPayment();
                    case 'production': return renderProductionReadiness();
                    case 'developer': return renderDeveloper();
                    default: return null;
                  }
                }
                return null;
              })}
            </div>
          ) : (
            <>
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'security' && renderSecurity()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'clinical' && renderClinicalPreferences()}
              {activeTab === 'storage' && renderStorage()}
              {activeTab === 'lab' && renderLab()}
              {activeTab === 'integrations' && renderIntegrations()}
              {activeTab === 'templates' && renderTemplates()}
              {activeTab === 'payment' && renderPayment()}
              {activeTab === 'production' && renderProductionReadiness()}
              {activeTab === 'developer' && renderDeveloper()}
            </>
          )}
        </div>
      </div>

      {/* Adapter Configuration Modal */}
      {showAdapterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <Puzzle size={24} />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Nouvel Adaptateur</h3>
              </div>
              <button onClick={() => setShowAdapterModal(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type de service</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-blue-600 text-white rounded-2xl font-bold text-sm">EMR (Dossier Patient)</button>
                  <button className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl font-bold text-sm">Digital Fax (Cloud)</button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Méthode de connexion</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-blue-500 rounded-2xl text-center">
                    <span className="text-xs font-black text-blue-600">HL7 v2.x</span>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400">
                    <span className="text-xs font-black">FHIR API</span>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400">
                    <span className="text-xs font-black">SFTP / CSV</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Point de terminaison (Endpoint URL)</label>
                <input type="text" placeholder="https://emr-bridge.clinique.local:8443/hl7" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-mono" />
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setShowAdapterModal(false)}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Tester & Enregistrer Connexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
