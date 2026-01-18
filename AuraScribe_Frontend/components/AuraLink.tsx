
import React, { useState } from 'react';

// Fix for Vite env typing
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
import {
  ShieldCheck,
  Send,
  Lock,
  Clock,
  Eye,
  Download,
  Edit3,
  CameraOff,
  Mail,
  Key,
  Plus,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  ChevronRight,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Language, AuraLinkTransfer, ClinicalFile, Session } from '../types';
import { TRANSLATIONS } from '../constants';
import { uploadClinicalFile, createAuraLinkTransfer, listAuraLinkTransfers, deleteAuraLinkTransfer } from '../services/backendApi';

interface AuraLinkProps {
  lang: Language;
  sessions: Session[];
}

const AuraLink: React.FC<AuraLinkProps> = ({ lang, sessions }) => {

  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [transfers, setTransfers] = useState<AuraLinkTransfer[]>([]);
  const [step, setStep] = useState(1);
  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [accessLink, setAccessLink] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Wizard State
  const [selectedFile, setSelectedFile] = useState<ClinicalFile | null>(null);
  const [email, setEmail] = useState('');
  const [perms, setPerms] = useState({ read: true, download: false, edit: false });
  const [antiCapture, setAntiCapture] = useState(true);
  const [expiry, setExpiry] = useState('1h');
  const [securityMethod, setSecurityMethod] = useState<'token' | 'password'>('token');
  const [password, setPassword] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  // Fetch transfers from backend on mount
  React.useEffect(() => {
    void fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoadingTransfers(true);
      const result = await listAuraLinkTransfers();
      if (result.success && result.transfers) {
        // Map backend transfers to frontend format
        const mappedTransfers: AuraLinkTransfer[] = result.transfers.map((t: any) => ({
          id: t.id,
          file: {
            id: t.id,
            name: t.file?.name || 'Document',
            type: t.file?.type || 'pdf',
            size: t.file?.size || 'unknown'
          },
          recipientEmail: t.recipient_email,
          permissions: t.permissions || { read: true, download: false, edit: false },
          security: {
            method: 'token',
            value: '',
            antiCapture: true
          },
          expiry: t.expiry || '24h',
          status: t.status || 'active'
        }));
        setTransfers(mappedTransfers);
      }
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setLoadingTransfers(false);
    }
  };

  const handleDeleteTransfer = async (transferId: string) => {
    if (!confirm(lang === 'fr' ? 'Voulez-vous révoquer ce partage ?' : 'Do you want to revoke this share?')) {
      return;
    }
    try {
      const result = await deleteAuraLinkTransfer(transferId);
      if (result.success) {
        setTransfers(transfers.filter(t => t.id !== transferId));
      }
    } catch (err) {
      console.error('Failed to delete transfer:', err);
    }
  };

  const handleCreateTransfer = async () => {
    if (!selectedFile || !email) {
      setUploadError(lang === 'fr' ? 'Sélectionnez un fichier local et un destinataire.' : 'Select a local file and a recipient.');
      return;
    }
    if (selectedFile.type === 'form') {
      setUploadError(lang === 'fr' ? "Les formulaires internes ne peuvent pas encore être partagés. Téléversez un PDF ou une image." : "Internal forms cannot be shared yet. Upload a PDF or image.");
      return;
    }

    try {
      setUploadError(null);
      setUploading(true);

      let backendFileUrl = selectedFile.url || '';

      // Upload file if it's a local file
      if (selectedFile.fileObject) {
        const uploadResult = await uploadClinicalFile(selectedFile.fileObject);
        backendFileUrl = uploadResult.file_url || uploadResult.fileUrl || uploadResult.url || '';
        if (!uploadResult.success || !backendFileUrl) {
          setUploadError(lang === 'fr' ? 'Le téléchargement du fichier a échoué. Réessayez avec un PDF ou une image.' : 'File upload failed. Try again with a PDF or image.');
          return;
        }
      }

      if (!backendFileUrl) {
        setUploadError(lang === 'fr' ? 'Impossible de créer un lien sans fichier exporté.' : 'Cannot create a link without an exported file.');
        return;
      }

      // Create transfer via backend API
      const transferResult = await createAuraLinkTransfer({
        file_url: backendFileUrl,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        recipient_email: email,
        permissions: perms,
        security_method: securityMethod,
        password: securityMethod === 'password' ? password : undefined,
        anti_capture: antiCapture,
        expiry: expiry
      });

      if (!transferResult.success) {
        setUploadError(transferResult.error || (lang === 'fr' ? 'Erreur lors de la création du partage.' : 'Error creating the share.'));
        return;
      }

      // Update state with result from backend
      setGeneratedToken(transferResult.access_token || '');
      setAccessLink(transferResult.access_link || '');
      setEmailSent(transferResult.email_sent || false);

      // Add to local transfers list
      const newTransfer: AuraLinkTransfer = {
        id: transferResult.transfer_id,
        file: { ...selectedFile, url: backendFileUrl },
        recipientEmail: email,
        permissions: perms,
        security: {
          method: securityMethod,
          value: securityMethod === 'token' ? transferResult.access_token : password,
          antiCapture
        },
        expiry,
        status: 'active'
      };

      setTransfers([newTransfer, ...transfers]);
      setStep(4); // Show success screen with token/info
    } catch (err) {
      console.error('Transfer creation error:', err);
      setUploadError(lang === 'fr' ? 'Le téléchargement du fichier a échoué. Vérifiez votre connexion et réessayez.' : 'File upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetWizard = () => {
    setView('dashboard');
    setStep(1);
    setSelectedFile(null);
    setEmail('');
    setGeneratedToken('');
    setAccessLink('');
    setEmailSent(false);
    setPassword('');
    setUploadError(null);
    void fetchTransfers(); // Refresh transfers list
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold heading-font text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" /> {t('auralink_secure')}
          </h2>
          <p className="text-sm text-slate-500">Conforme Loi 25 & PIPEDA • Pipeline de partage de bout-en-bout</p>
        </div>
        <button
          onClick={() => setView('wizard')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus size={18} /> {t('share_clinical_file')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
            <Send size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sortants</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{transfers.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consultés</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expirés</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('active_transfers')}</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loadingTransfers ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 text-sm">
                {lang === 'fr' ? 'Chargement des transferts...' : 'Loading transfers...'}
              </p>
            </div>
          ) : transfers.length > 0 ? transfers.map(tr => (
            <div key={tr.id} className="p-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                  {tr.file.type === 'pdf' ? <FileIcon size={18} /> : tr.file.type === 'form' ? <FileText size={18} /> : <ImageIcon size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{tr.file.name}</p>
                  <p className="text-xs text-slate-500">{tr.recipientEmail}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {tr.permissions.read && <span className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg" title={lang === 'fr' ? 'Lecture' : 'Read'}><Eye size={14} /></span>}
                {tr.permissions.download && <span className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg" title={lang === 'fr' ? 'Téléchargement' : 'Download'}><Download size={14} /></span>}
                {tr.permissions.edit && <span className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg" title={lang === 'fr' ? 'Modification' : 'Edit'}><Edit3 size={14} /></span>}
                {tr.security.antiCapture && <span className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg" title="Anti-Capture"><CameraOff size={14} /></span>}
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {lang === 'fr' ? 'Expire dans' : 'Expires in'}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Clock size={12} className="text-blue-500" /> {tr.expiry}
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800">
                  {lang === 'fr' ? 'Actif' : 'Active'}
                </div>
                <button
                  onClick={() => handleDeleteTransfer(tr.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                  title={lang === 'fr' ? 'Révoquer le partage' : 'Revoke share'}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <ShieldCheck size={32} />
              </div>
              <p className="text-slate-500 text-sm">
                {lang === 'fr' ? 'Aucun transfert sécurisé actif.' : 'No active secure transfers.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWizard = () => (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={resetWizard} className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2">
          Annuler
        </button>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 w-12 rounded-full transition-all ${step >= i ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        {step === 1 && (
          <div className="p-10 flex-1 space-y-8 animate-in fade-in duration-300">
            <h3 className="text-2xl font-bold heading-font text-slate-800 dark:text-white">1. Sélection du fichier</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent App Forms */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Formulaires récents</p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {sessions.length > 0 ? sessions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedFile({ id: s.id, name: `Dossier_${s.patientInfo.fullName}_${s.date}`, type: 'form', size: '25kb' })}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${selectedFile?.id === s.id ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200'}`}
                    >
                      <FileText className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{s.patientInfo.fullName}</p>
                        <p className="text-[10px] text-slate-500">{s.date}</p>
                      </div>
                    </button>
                  )) : (
                    <p className="text-xs text-slate-400 italic">Aucune note clinique disponible.</p>
                  )}
                </div>
              </div>

              {/* Upload */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document local</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Limit size to 10MB
                        if (file.size > 10 * 1024 * 1024) {
                          alert('Fichier trop volumineux (max 10MB)');
                          return;
                        }
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        let type: ClinicalFile['type'] = 'pdf';
                      if (ext === 'pdf') type = 'pdf';
                      else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') type = 'image';
                      setSelectedFile({
                        id: 'local-' + Date.now(),
                        name: file.name,
                        type,
                          size: `${Math.round(file.size / 1024)}kb`,
                          fileObject: file
                        });
                        setUploadError(null);
                      }
                    }}
                />
                <div
                  className="h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Fichier trop volumineux (max 10MB)');
                        return;
                      }
                      const ext = file.name.split('.').pop()?.toLowerCase();
                      let type: ClinicalFile['type'] = 'pdf';
                      if (ext === 'pdf') type = 'pdf';
                      else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') type = 'image';
                      setSelectedFile({
                        id: 'local-' + Date.now(),
                        name: file.name,
                        type,
                          size: `${Math.round(file.size / 1024)}kb`,
                          fileObject: file
                        });
                        setUploadError(null);
                      }
                    }}
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Cliquez ou glissez un fichier</p>
                  <p className="text-xs text-slate-500 mt-2">PDF, JPEG, PNG (Max 10MB)</p>
                  {selectedFile && selectedFile.id.startsWith('local-') && (
                    <div className="mt-4 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-200">
                      Fichier sélectionné : {selectedFile.name}
                    </div>
                  )}
                </div>
                {uploadError && (
                  <p className="text-xs text-rose-600 mt-2">{uploadError}</p>
                )}
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button
                disabled={!selectedFile}
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2"
              >
                Suivant <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 flex-1 space-y-8 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-bold heading-font text-slate-800 dark:text-white">2. Destinataire & Permissions</h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('recipient_email')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setUploadError(null);
                    }}
                    placeholder="dr.confrere@clinique.ca"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('permissions')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setPerms({ ...perms, read: !perms.read })}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${perms.read ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 text-blue-700' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'}`}
                  >
                    <Eye size={18} /> <span className="text-sm font-bold">{t('permission_read')}</span>
                  </button>
                  <button
                    onClick={() => setPerms({ ...perms, download: !perms.download })}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${perms.download ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 text-blue-700' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'}`}
                  >
                    <Download size={18} /> <span className="text-sm font-bold">{t('permission_download')}</span>
                  </button>
                  <button
                    onClick={() => setPerms({ ...perms, edit: !perms.edit })}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${perms.edit ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 text-blue-700' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'}`}
                  >
                    <Edit3 size={18} /> <span className="text-sm font-bold">{t('permission_edit')}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3 text-rose-700 dark:text-rose-300">
                  <CameraOff size={20} />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{t('anti_capture')}</span>
                    <span className="text-[10px] opacity-70">Empêche les captures d'écran et impose un filigrane numérique.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={antiCapture}
                  onChange={(e) => setAntiCapture(e.target.checked)}
                  className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="pt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-bold">Précédent</button>
              <button
                disabled={!email}
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2"
              >
                Suivant <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-10 flex-1 space-y-8 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-bold heading-font text-slate-800 dark:text-white">3. Sécurité & Expiration</h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('expiration_time')}</label>
                <div className="flex flex-wrap gap-2">
                  {['15m', '1h', '24h', '7j'].map(val => (
                    <button
                      key={val}
                      onClick={() => setExpiry(val)}
                      className={`px-6 py-2 rounded-xl border text-sm font-bold transition-all ${expiry === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('security_method')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSecurityMethod('token')}
                    className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${securityMethod === 'token' ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-slate-800 border-transparent'}`}
                  >
                    <Key className={securityMethod === 'token' ? 'text-blue-600' : 'text-slate-400'} size={24} />
                    <div className="text-center">
                      <p className={`text-sm font-bold ${securityMethod === 'token' ? 'text-blue-700' : 'text-slate-700'}`}>{t('generate_token')}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Génère un code d'accès à usage unique.</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setSecurityMethod('password')}
                    className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${securityMethod === 'password' ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-slate-800 border-transparent'}`}
                  >
                    <Lock className={securityMethod === 'password' ? 'text-blue-600' : 'text-slate-400'} size={24} />
                    <div className="text-center">
                      <p className={`text-sm font-bold ${securityMethod === 'password' ? 'text-blue-700' : 'text-slate-700'}`}>{t('set_password')}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Utilisez votre propre mot de passe sécurisé.</p>
                    </div>
                  </button>
                </div>

                {securityMethod === 'password' && (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisissez un mot de passe robuste"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm animate-in zoom-in-95"
                  />
                )}
              </div>
            </div>

            <div className="pt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-bold">Précédent</button>
                <button
                  onClick={handleCreateTransfer}
                  disabled={uploading}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                Partager en toute sécurité <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-10 flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mb-2">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-3xl font-bold heading-font text-slate-800 dark:text-white">
                {lang === 'fr' ? 'Partage réussi !' : 'Share Successful!'}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                {lang === 'fr'
                  ? <>Le lien sécurisé a été préparé pour <strong>{email}</strong>.</>
                  : <>The secure link has been prepared for <strong>{email}</strong>.</>
                }
              </p>
              {emailSent && (
                <p className="text-emerald-600 text-sm mt-2 flex items-center justify-center gap-2">
                  <Mail size={14} />
                  {lang === 'fr' ? 'Courriel de notification envoyé' : 'Notification email sent'}
                </p>
              )}
            </div>

            <div className="w-full max-w-md p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
              {/* Access Link */}
              {accessLink && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {lang === 'fr' ? 'Lien d\'accès sécurisé' : 'Secure Access Link'}
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      readOnly
                      value={accessLink}
                      className="w-full bg-transparent text-xs text-slate-600 dark:text-slate-300 font-mono outline-none"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                  </div>
                    <button
                      onClick={() => {
                        void navigator.clipboard.writeText(accessLink);
                      }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold mt-1"
                  >
                    {lang === 'fr' ? 'Copier le lien' : 'Copy link'}
                  </button>
                </div>
              )}

              {/* Access Token */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {lang === 'fr' ? 'Jeton d\'accès sécurisé' : 'Secure Access Token'}
                </p>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900 flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-blue-600 tracking-widest">
                    {securityMethod === 'token' ? generatedToken.substring(0, 12) + '...' : '••••••••'}
                  </span>
                    <button
                      onClick={() => {
                        void navigator.clipboard.writeText(generatedToken);
                      }}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                    title={lang === 'fr' ? 'Copier le jeton' : 'Copy token'}
                  >
                    <Lock size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <AlertCircle className="text-blue-600 shrink-0" size={14} />
                <p className="text-[10px] text-blue-800 dark:text-blue-300">
                  {lang === 'fr'
                    ? 'Communiquez ce jeton au destinataire par un canal distinct (ex: SMS ou appel) pour une sécurité maximale.'
                    : 'Share this token with the recipient via a separate channel (e.g., SMS or call) for maximum security.'
                  }
                </p>
              </div>
            </div>

            <button
              onClick={resetWizard}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
            >
              {lang === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Loi 25 Compliant</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Lock size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">AES-256 Encrypted</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-2 py-8 transition-all duration-300">
      <div className="w-full max-w-5xl mx-auto">
        {view === 'dashboard' ? renderDashboard() : renderWizard()}
      </div>
    </div>
  );
};

export default AuraLink;
