

import React, { useState, useEffect } from 'react';

import {

  FileText,

  Printer,

  Download,

  Upload,

  Send,

  Stethoscope,

  CheckCircle,

  FileSignature,

  Trash2,

  ArrowLeft,

  ShieldCheck,

  Copy,

  Edit3,

  Save,

  Zap,

  Info

} from 'lucide-react';

import { Session, Language, FormStatus } from '../types';

import { TRANSLATIONS } from '../constants';
import { downloadSessionPDF, pushSessionToEMR, sendSessionViaEFax } from '../services/backendApi';



interface SessionViewerProps {

  session: Session;

  lang: Language;

  branding?: { header: string; footer: string };

  onDelete?: (id: string) => void;

  onBack?: () => void;

  isPrivacyMode?: boolean;

}



const SessionViewer: React.FC<SessionViewerProps> = ({ session, lang, branding, onDelete, onBack, isPrivacyMode = false }) => {

  const formKeys = Object.keys(session.forms);

  const [activeTab, setActiveTab] = useState<string>(formKeys[0] || 'soap');

  const [formStatuses, setFormStatuses] = useState<Record<string, FormStatus>>(session.forms);

  const [isEditing, setIsEditing] = useState(false);

  const [editedContent, setEditedContent] = useState('');

  const [hasReviewed, setHasReviewed] = useState(false);

  const [showMADO, setShowMADO] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const actionLoadingLabel = actionLoading === 'download'
    ? 'Téléchargement...'
    : actionLoading === 'emr'
      ? 'Transmission à l’EMR...'
      : actionLoading === 'fax'
        ? 'Envoi fax...'
        : null;



  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const madoData = session.madoData;



  const renderMADOForm = () => {
    if (!madoData) return null;

    const patient = madoData.patient || session.patientInfo;
    const clinical = madoData.clinicalContext || undefined;
    // Ensure clinical.onsetDate is defined for safe access
    const onsetDate = (clinical as any).onsetDate || '';
    const exposures = madoData.exposures && madoData.exposures.length > 0 ? madoData.exposures : ['À préciser'];
    // municipality may not exist on PatientInfo, so fallback to postalCode prefix or default
    const municipality = ("municipality" in patient && (patient as any).municipality) || patient.postalCode?.slice(0, 3).toUpperCase() || 'Montréal';
    const reporter = madoData.reporter || session.clinicianInfo || {
      fullName: '',
      clinicName: '',
      licenseNumber: '',
      phone: '',
      email: ''
    };
    const signatureDate = new Date(madoData.timestamp || Date.now()).toLocaleString('fr-CA', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    const renderField = (label: string, value?: string) => (
      <div className="grid grid-cols-[130px_1fr] gap-2 text-[11px]">
        <span className="font-semibold uppercase text-slate-500">{label}</span>
        <span className="font-semibold text-slate-800">{value || 'À préciser'}</span>
      </div>
    );

    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl space-y-6 dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-serif my-6">
        <div className="grid md:grid-cols-2 gap-4 items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Direction de la santé publique du Québec</p>
            <h1 className="text-3xl font-black uppercase tracking-tight">AS-770 — Formulaire MADO</h1>
          </div>
          <div className="space-y-1 text-right text-[11px]">
            <p className="font-bold text-slate-800">MADO {madoData.formNumber || 'AS-770'}</p>
            <p>Version {madoData.formVersion || '2025'}</p>
            <p className="text-[10px] text-slate-500">Numéro de déclaration : {madoData.reportNumber || 'à générer'}</p>
          </div>
        </div>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Personne atteinte</p>
            {renderField('Nom complet', patient.fullName)}
            {renderField('Numéro RAMQ', patient.ramq)}
            {renderField('Date de naissance', patient.dob)}
            {renderField('Code postal', patient.postalCode)}
            {renderField('Municipalité', municipality)}
          </div>
          <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Maladie à déclaration obligatoire</p>
            {renderField('Nom de la maladie', madoData.disease?.name)}
            {renderField('Code clinique', madoData.disease?.code)}
            {renderField('Déclaration requise', madoData.reportRequired ? 'Oui' : 'Non')}
            {renderField('Urgence', madoData.urgency || 'STANDARD')}
            {renderField('Déclaration urgente', madoData.isEmergency ? 'Oui' : 'Non')}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Contexte clinique</p>
            {renderField('Signes et symptômes', clinical && 'symptoms' in clinical ? (clinical as any).symptoms : undefined)}
            {renderField('Date d’apparition', onsetDate)}
            {renderField('Sévérité', clinical.severity)}
            {renderField('Hospitalisation', (clinical as any)?.hospitalization)}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1">Résumé clinique</p>
              <p className="text-sm leading-relaxed">
                {clinical?.narrative || session.transcript?.slice(0, 400) || 'Description clinique non disponible.'}
              </p>
            </div>
          </div>
          <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Expositions</p>
            <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
              {exposures.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1">Instructions</p>
              <p className="text-sm leading-relaxed">
                {madoData.instructions || 'Soumettre le formulaire AS-770 original au bureau régional dans les 24 heures suivant la prise en charge.'}
              </p>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Déclarant</p>
            {renderField('Nom', reporter.fullName)}
            {renderField('Clinique', reporter.clinicName)}
            {renderField('Licence professionnelle', reporter.licenseNumber)}
          </div>
          <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Coordonnées</p>
            {renderField('Téléphone', reporter.phone)}
            {renderField('Courriel', reporter.email)}
            {renderField('Date et heure', signatureDate)}
            <p className="text-[10px] text-slate-400">
              Signature électronique AuraScribe conforme aux exigences de la Loi 25 et de PIPEDA.
            </p>
          </div>
        </section>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/80 text-[11px] text-slate-500">
          Ce formulaire est destiné à la déclaration officielle MADO au Québec. Les renseignements sont chiffrés en transit et au repos, conservés le temps requis par la réglementation (24 heures avant purge automatique) et accessibles uniquement aux cliniciens autorisés.
        </div>
      </div>
    );
  };


  useEffect(() => {

    setEditedContent(formStatuses[activeTab]?.content || '');

    setIsEditing(false);

    setHasReviewed(false);

  }, [activeTab, formStatuses]);



  const handleValidate = () => {

    if (!hasReviewed) return;

    setFormStatuses({

      ...formStatuses,

      [activeTab]: { ...formStatuses[activeTab], status: 'validated', content: editedContent }

    });

    setIsEditing(false);

  };



  const handlePrint = () => {

    window.print();

  };



  const handleDownload = async () => {

    setActionLoading('download');

    setActionError(null);

    setActionMessage(null);

    try {

      const blob = await downloadSessionPDF(session.id);

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = `session_${session.id}.pdf`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

      setActionMessage('PDF téléchargé localement.');

    } catch (err: any) {

      setActionError(err?.message || 'Erreur lors du téléchargement du PDF');

    } finally {

      setActionLoading(null);

    }

  };



  const handleCopyToClipboard = () => {

    const contentToCopy = editedContent || session.transcript || '';

    if (!contentToCopy) {

      setActionError('Aucun contenu prêt pour la copie.');

      return;

    }

    setActionError(null);

    setActionMessage(null);

    void navigator.clipboard.writeText(contentToCopy);

    setActionMessage('Note copiée dans le presse-papiers.');

  };



  const handlePushToEMR = async () => {

    setActionLoading('emr');

    setActionError(null);

    setActionMessage(null);

    try {

      await pushSessionToEMR(session.id, session.patientInfo.ramq);

      setActionMessage('Document transmis à l’EMR.');

    } catch (err: any) {

      setActionError(err?.message || 'Échec de la transmission à l’EMR');

    } finally {

      setActionLoading(null);

    }

  };



  const handleSendViaFax = async () => {

    const faxNumber = prompt('Numéro de fax destinataire :');

    if (!faxNumber) return;

    setActionLoading('fax');

    setActionError(null);

    setActionMessage(null);

    try {

      await sendSessionViaEFax(session.id, faxNumber);

      setActionMessage(`eFax envoyé à ${faxNumber}.`);

    } catch (err: any) {

      setActionError(err?.message || 'Envoi fax échoué');

    } finally {

      setActionLoading(null);

    }

  };



  const renderPrintableForm = () => (

    <div className="hidden print:block print-container p-12 bg-white text-black font-serif">

      <div className="text-center mb-10 pb-4 border-b-2 border-black whitespace-pre text-[10px] uppercase tracking-[0.2em] font-sans">

        {branding?.header}

      </div>

      <div className="flex justify-between items-start mb-10">

        <div>

          <h2 className="text-2xl font-black uppercase mb-2 heading-font italic tracking-tight">

            {activeTab}

          </h2>

          <p className="text-sm font-bold">Patient: {session.patientInfo.fullName}</p>

          <p className="text-xs">RAMQ: {session.patientInfo.ramq}</p>

        </div>

        <div className="text-right">

          <p className="text-sm font-bold">Date: {session.date}</p>

          <p className="text-[10px] text-slate-400 mt-2 font-mono uppercase">AuraScribe ID: {session.id}</p>

        </div>

      </div>

      <div className="text-lg leading-relaxed whitespace-pre-wrap min-h-[500px]">

        {editedContent}

      </div>

      <div className="mt-20 flex justify-between items-end">

        <div className="text-[10px] text-slate-500 italic max-w-sm">

          {branding?.footer}

        </div>

        <div className="w-64 border-t border-black text-center pt-2">

          <p className="text-xs font-bold uppercase tracking-widest">Signature du MÃƒÂ©decin</p>

          <p className="text-[9px] text-slate-400 mt-1 italic">SignÃƒÂ© via AuraScribe Clinical Agent</p>

        </div>

      </div>

    </div>

  );



  return (

    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-20">

      {renderPrintableForm()}



      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">

        <button onClick={onBack} className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all">

          <ArrowLeft size={20} /> {t('view_sessions')}

        </button>

        <div className="flex items-center gap-6">

          <div className="text-right">

            <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1 heading-font italic tracking-tighter transition-all">

              {session.patientInfo.fullName}

            </h4>

            <p className="text-xs font-bold text-slate-400 tracking-wider transition-all">

              {session.date} • {session.patientInfo.ramq}

            </p>

          </div>

          {madoData && (

            <button

              onClick={() => setShowMADO(prev => !prev)}

              className="flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-2xl uppercase tracking-[0.3em] text-[10px] font-black transition-all shadow-lg hover:bg-amber-700"

            >

              <Info size={16} /> {showMADO ? 'Fermer AS-770' : 'Voir AS-770'}

            </button>

          )}

          <button onClick={() => onDelete?.(session.id)} className="p-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all border border-slate-100 dark:border-slate-800">

            <Trash2 size={22} />

          </button>

        </div>

      </div>

      {showMADO && renderMADOForm()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 no-print">

        <div className="lg:col-span-3 space-y-2 overflow-y-auto">

          {formKeys.map(key => (

            <button

              key={key}

              onClick={() => setActiveTab(key)}

              className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all ${activeTab === key

                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20 scale-105 z-10'

                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-100 dark:hover:border-slate-800 shadow-sm'

                }`}

            >

              <div className="flex items-center gap-3 min-w-0">

                <FileText size={18} className={activeTab === key ? 'text-white' : 'text-blue-500'} />

                <span className="text-xs font-black uppercase tracking-tight truncate">{key}</span>

              </div>

              {formStatuses[key]?.status === 'validated' && <CheckCircle size={14} className={activeTab === key ? 'text-white' : 'text-emerald-500'} />}

            </button>

          ))}



          <div className="mt-8 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] text-white space-y-6 shadow-2xl border border-slate-700 relative overflow-hidden group">

            <div className="absolute -top-4 -right-4 text-blue-500/10 group-hover:scale-110 transition-transform"><Zap size={100} /></div>

            <div className="flex items-center gap-3 text-blue-400 relative z-10">

              <ShieldCheck size={20} />

              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clinical Governance</span>

            </div>

            <p className="text-[11px] leading-relaxed text-slate-400 font-medium relative z-10">Ces documents sont chiffrÃƒÂ©s localement. Exportez vers votre DME avant la purge automatique de 24h.</p>

          </div>

        </div>



        <div className="lg:col-span-9 flex flex-col min-h-[600px]">

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col rounded-[2.5rem] h-full">

            <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">

              <div className="flex items-center gap-4">

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${formStatuses[activeTab]?.status === 'ready' ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-blue-600 text-white'}`}>

                  <FileText size={24} />

                </div>

                <div>

                  <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">

                    {activeTab}

                  </h2>

                  <div className="flex items-center gap-2 mt-0.5">

                    <span className={`text-[10px] font-black uppercase tracking-widest ${formStatuses[activeTab]?.status === 'validated' ? 'text-emerald-500' : 'text-amber-500'}`}>

                      Status: {formStatuses[activeTab]?.status === 'validated' ? 'Validated' : 'Pending Review'}

                    </span>

                  </div>

                </div>

              </div>

              <div className="flex gap-3">

                {!isEditing && (

                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all">

                    <Edit3 size={16} /> Edit Note

                  </button>

                )}

                {isEditing && (

                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">

                    <Save size={16} /> Save Changes

                  </button>

                )}

              </div>

            </div>



            <div className="flex-1 p-10 md:p-14 overflow-y-auto bg-[#fafafa] dark:bg-slate-950 font-serif text-xl leading-relaxed text-slate-800 dark:text-slate-200">

              {isEditing ? (

                <textarea

                  value={editedContent}

                  onChange={(e) => setEditedContent(e.target.value)}

                  className="w-full h-full min-h-[500px] bg-transparent border-none focus:ring-0 resize-none outline-none font-serif leading-relaxed"

                />

              ) : (

                <div className={`whitespace-pre-wrap transition-all duration-700 ${isPrivacyMode ? 'blur-2xl select-none opacity-10' : ''}`}>

                  {editedContent}

                </div>

              )}

            </div>



            <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">

              <div className="flex flex-col gap-8">

                {formStatuses[activeTab]?.status !== 'validated' && (

                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30 rounded-[2rem] flex items-center gap-5">

                    <input

                      type="checkbox"

                      id="review-confirm"

                      checked={hasReviewed}

                      onChange={(e) => setHasReviewed(e.target.checked)}

                      className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300"

                    />

                    <label htmlFor="review-confirm" className="text-xs font-bold text-blue-800 dark:text-blue-300 cursor-pointer leading-snug">

                      I confirm that I have reviewed this AI-generated content and I assume full clinical responsibility for its accuracy.

                    </label>

                  </div>

                )}



                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div className="flex flex-wrap gap-3">

                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-200 transition-all">

                      <Printer size={16} /> Print

                    </button>

                    <button onClick={handleDownload} disabled={actionLoading === 'download'} className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-200 transition-all disabled:cursor-wait disabled:opacity-60">

                      <Download size={16} /> Download

                    </button>

                    <button onClick={handleCopyToClipboard} className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-200 transition-all">

                      <Copy size={16} /> Copy Note

                    </button>

                    <button onClick={handlePushToEMR} disabled={actionLoading === 'emr'} className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-200 transition-all disabled:cursor-wait disabled:opacity-60">

                      <Upload size={16} /> Push to EMR

                    </button>

                    <button onClick={handleSendViaFax} disabled={actionLoading === 'fax'} className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-200 transition-all disabled:cursor-wait disabled:opacity-60">

                      <Send size={16} /> Send via Fax

                    </button>

                  </div>

                  {formStatuses[activeTab]?.status !== 'validated' && (

                    <button

                      disabled={!hasReviewed}

                      onClick={handleValidate}

                      className="flex items-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 transition-all active:scale-95"

                    >

                      <FileSignature size={20} /> Validate & Sign

                    </button>

                  )}

                </div>

                {(actionError || actionMessage || actionLoadingLabel) && (

                  <p className={`text-[10px] uppercase tracking-[0.2em] ${actionError ? 'text-rose-500' : 'text-slate-500'} mt-2`}>

                    {actionError || actionMessage || actionLoadingLabel}

                  </p>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};



export default SessionViewer;

