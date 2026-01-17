import React, { useState, useRef, useEffect } from 'react';
// Extend ImportMetaEnv to include VITE_WS_URL for TypeScript
declare global {
  interface ImportMetaEnv {
    VITE_WS_URL?: string;
  }
}
import Select from 'react-select';
import {
  Mic,
  Square,
  Pause,
  Play,
  Loader2,
  ShieldCheck,
  Info,
  User as UserIcon,
  CreditCard,
  CheckCircle2,
  Stethoscope,
  Zap,
  Calendar,
  MapPin,
  Camera,
  X,
  Key,
  Save,
  FileText,
  AlertCircle,
  Upload,
  File,
  Trash2
} from 'lucide-react';
import type { Language, PatientInfo, Task, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { uploadRecordingForTranscription, downloadSessionPDF, pushSessionToEMR, sendSessionViaEFax, createRealtimeSession, updateSessionStatus } from '../services/backendApi';
import {
  sanitizeHTML,
  validateRAMQ,
  validateDate,
  validatePostalCode,
  validateInput
} from '../utils/security';
import { useRealtimeTranscription } from '../src/utils/useRealtimeTranscription';

interface NewSessionProps {
  lang: Language;
  onComplete: (session: any, tasks: Task[]) => void;
  onError?: (title: string, message: string) => void;
  clinician?: User | null;
}

const DEFAULT_WS_URL = 'http://localhost:5000';

const NewSession: React.FC<NewSessionProps> = ({ lang, onComplete, onError, clinician }) => {
  // ============ ALL STATE DECLARATIONS FIRST ============
  const [step, setStep] = useState<'consent' | 'info' | 'recording' | 'processing'>('consent');
  const [consent, setConsent] = useState({ taken: false, decree: false });
  const [modelPref, setModelPref] = useState<string>(lang === 'en' ? 'medical' : 'nova-3');

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    fullName: '',
    dob: '',
    ramq: '',
    postalCode: ''
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [customFormRequest, setCustomFormRequest] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [micTranscript, setMicTranscript] = useState('');

  // Recording state - MUST be declared before useRealtimeTranscription hook
  const [isGenerating, setIsGenerating] = useState(false);
  const [recordedTranscript, setRecordedTranscript] = useState<string>('');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioMimeType, setAudioMimeType] = useState('audio/webm');
  const [backendStatus, setBackendStatus] = useState<string>('');
  const [backendSessionId, setBackendSessionId] = useState<string | null>(null);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Recording controls
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [waveforms, setWaveforms] = useState<number[]>(Array(40).fill(10));

  // ============ ALL REFS ============
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<any>(null);
  const visionAgent = useRef<{ isEnabled: boolean; scanRAMQCard: (base64: string) => Promise<any> }>({
    isEnabled: false,
    scanRAMQCard: async () => ({ fullName: '', ramq: '', dob: '', postalCode: '' })
  });
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const backendSessionIdRef = useRef<string | null>(null);

  // Media refs to manage stream lifecycle
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ============ HOOKS (after all state/refs) ============
  // Real-time transcription hook
  const websocketBackendUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE_URL || DEFAULT_WS_URL;

  const {
    transcript: realtimeTranscriptObj,
    connected: wsConnected,
    error: wsError,
    sendAudioChunk,
    stopRecording: stopRealtimeRecording,
    startRecording: startRealtimeRecording,
  } = useRealtimeTranscription({
    language: lang === 'fr' ? 'fr-CA' : 'en-US',
    model: modelPref,
    backendUrl: websocketBackendUrl,
    onStatus: (status) => {
      setBackendStatus(status?.message || '');
    }
  });

  const realtimeTranscript = realtimeTranscriptObj.transcript;
  const wsConfidence = realtimeTranscriptObj.confidence || 0;

  // ============ HELPER FUNCTIONS ============
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  // Microphone for custom request (Deepgram STT)
  const handleMicClick = async () => {
    setMicError(null);
    setIsMicActive((active) => !active);
  };

  const availableForms = [
    "Note d'absence (École/Travail)",
    "Formulaire CNESST",
    "Requête d'imagerie (IRM/CT)",
    "Consentement Chirurgical",
    "Demande de consultation"
  ];

  const toggleForm = (form: string) => {
    setSelectedForms(prev => prev.includes(form) ? prev.filter(f => f !== form) : [...prev, form]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMedia();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
        setWaveforms(prev => [...prev.slice(1), Math.random() * 40 + 5]);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Update recordedTranscript when real-time transcript updates
  useEffect(() => {
    if (isRecording && realtimeTranscript) {
      setRecordedTranscript(realtimeTranscript);
    }
  }, [realtimeTranscript, isRecording]);

  // Auto-scroll to show latest transcript
  useEffect(() => {
    if (transcriptEndRef.current && recordedTranscript) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [recordedTranscript]);

  // Scanner Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showScanner) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error(err);
          onError?.("Erreur Caméra", "Impossible d'accéder à la caméra pour le scan.");
          setShowScanner(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showScanner]);

  const captureAndScan = async () => {
    if (!visionAgent.current.isEnabled) {
      onError?.("Scanner d�sactiv�", "Le scan RAMQ n'est pas disponible tant qu'une cl� Vision n'est pas configur�e.");
      setShowScanner(false);
      return;
    }

    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      const base64 = imageData.split(',')[1];

      try {
        const data = await visionAgent.current.scanRAMQCard(base64);
        setPatientInfo(prev => ({
          ...prev,
          fullName: data.fullName || prev.fullName,
          ramq: data.ramq || prev.ramq,
          dob: data.dob || prev.dob,
          postalCode: data.postalCode || prev.postalCode
        }));
        setShowScanner(false);
      } catch (err) {
        onError?.("Échec du Scan", "Impossible de lire la carte. Veuillez réessayer ou saisir manuellement.");
      } finally {
        setIsScanning(false);
      }
    }
  };

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return ''; // Browser default
  };

  const stopMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  const normalizeGeneratedForms = (payload: any) => {
    if (!payload) return {};
    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload);
      } catch {
        return { raw: payload };
      }
    }
    return payload;
  };

  const getValueByPath = (obj: any, path: string[]) => {
    return path.reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
  };

  const formatGeneratedContent = (value: any): string | undefined => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
      const flattened = value.map(item => formatGeneratedContent(item)).filter(Boolean);
      return flattened.length ? flattened.join('\n\n') : undefined;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || undefined;
    }
    if (typeof value === 'object') {
      // Check for formatted_content first (from our agent)
      if (typeof value.formatted_content === 'string' && value.formatted_content.trim()) {
        return value.formatted_content.trim();
      }
      if (typeof value.content === 'string' && value.content.trim()) return value.content.trim();
      if (typeof value.text === 'string' && value.text.trim()) return value.text.trim();

      // Handle SOAP note object structure
      if (value.subjective || value.objective || value.assessment || value.plan) {
        const soapParts = [];
        if (value.subjective) soapParts.push(`SUBJECTIF / SUBJECTIVE:\n${value.subjective}`);
        if (value.objective) soapParts.push(`OBJECTIF / OBJECTIVE:\n${value.objective}`);
        if (value.assessment) soapParts.push(`ÉVALUATION / ASSESSMENT:\n${value.assessment}`);
        if (value.plan) soapParts.push(`PLAN:\n${value.plan}`);
        if (soapParts.length > 0) {
          return `=== NOTE SOAP / SOAP NOTE ===\n\n${soapParts.join('\n\n')}\n\n=== FIN DE LA NOTE / END OF NOTE ===`;
        }
      }

      // Handle patient explanation structure
      if (value.summary || value.instructions || value.follow_up) {
        const parts = [];
        if (value.summary) parts.push(`RÉSUMÉ / SUMMARY:\n${value.summary}`);
        if (value.instructions) parts.push(`INSTRUCTIONS:\n${value.instructions}`);
        if (value.follow_up) parts.push(`SUIVI / FOLLOW-UP:\n${value.follow_up}`);
        if (parts.length > 0) {
          return parts.join('\n\n');
        }
      }

      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const firstContentFromPaths = (payload: any, paths: string[][]) => {
    for (const path of paths) {
      const candidate = getValueByPath(payload, path);
      const formatted = formatGeneratedContent(candidate);
      if (formatted) return formatted;
    }
    return undefined;
  };

  const makeFormStatus = (content?: string) => ({
    status: content ? 'ready' : 'pending',
    content: content || undefined
  });

  const SOAP_PATHS = [
    ['soap', 'formatted_content'],
    ['clinicalData', 'soap', 'formatted_content'],
    ['clinicalData', 'soapNote', 'formatted_content'],
    ['soap'],
    ['clinicalData', 'soap'],
    ['clinicalData', 'soapNote'],
    ['clinicalData', 'summary'],
    ['analysis'],
    ['patientNote'],
    ['clinicalData', 'result', 'soap'],
    ['clinicalData', 'notes', 'soap']
  ];
  const PATIENT_NOTE_PATHS = [
    ['patientNote'],
    ['clinicalData', 'patientInstruction'],
    ['clinicalData', 'patientSummary'],
    ['analysis'],
    ['clinicalData', 'clinicalReasoning'],
    ['clinicalData', 'note']
  ];
  const DOCTOR_NOTE_PATHS = [
    ['clinicalData', 'clinicalReasoning'],
    ['clinicalData', 'doctorNote'],
    ['clinicalData', 'note'],
    ['clinicalData', 'clinicalNote']
  ];
  const PRESCRIPTION_PATHS = [
    ['prescription'],
    ['clinicalData', 'prescription'],
    ['billingData', 'prescription']
  ];
  const LAB_ORDER_PATHS = [
    ['labOrder'],
    ['clinicalData', 'labOrder'],
    ['clinicalData', 'orders', 'lab'],
    ['madoData', 'labOrder']
  ];
  const REFERRAL_PATHS = [
    ['referralLetter'],
    ['clinicalData', 'referralLetter'],
    ['clinicalData', 'referral'],
    ['complianceAudit', 'referral']
  ];

  const handleStart = async () => {
    try {
      stopMedia();
      setRecordedChunks([]);
      setRecordedAudio(null);
      setRecordedTranscript('');
      // Transcript will be cleared automatically by the hook on new session
      setBackendStatus('Creating session...');
      setBackendSessionId(null);
      setStep('recording');
      setIsRecording(true);
      setTimer(0);
      setWaveforms(Array(40).fill(10));

      // Create backend session first
      try {
        const session = await createRealtimeSession({
          patient_name: patientInfo.fullName,
          patient_ramq: patientInfo.ramq || undefined,
          patient_dob: patientInfo.dob || undefined,
          patient_postal_code: patientInfo.postalCode || undefined,
          language: lang,
          model_used: modelPref
        });
        setBackendSessionId(session.id);
        backendSessionIdRef.current = session.id;
        setBackendStatus(`Session ${session.id} created`);
      } catch (err) {
        setBackendStatus('Warning: Backend session creation failed, continuing offline');
      }

      // Start real-time transcription explicitly
      startRealtimeRecording();
      setBackendStatus('Recording with real-time transcription...');

      // Also record locally as backup
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      setAudioMimeType(mimeType || 'audio/webm');

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
          if (sendAudioChunk) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              const base64 = result.split(',')[1];
              sendAudioChunk(base64);
            };
            reader.readAsDataURL(event.data);
          }
        }
      };

      mediaRecorder.start(250);
    } catch (err) {
      console.error(err);
      onError?.("Acces Micro Refuse", "Veuillez autoriser le microphone pour utiliser AuraScribe.");
      setStep('info');
      setIsRecording(false);
    }
  };

  const handleStop = async () => {
    setIsRecording(false);
    stopMedia();

    // Stop real-time transcription
    stopRealtimeRecording();
    if (realtimeTranscript) {
      setRecordedTranscript(realtimeTranscript);
    }

    // Update backend session status
    if (backendSessionId) {
      try {
        await updateSessionStatus(backendSessionId, 'stopped');
        setBackendStatus('Session saved to backend');
      } catch (err) {
        // Session status update failed silently
      }
    }

    if (recordedChunks.length === 0) {
      return;
    }

    const audioBlob = new Blob(recordedChunks, { type: audioMimeType });
    setRecordedAudio(audioBlob);
    setRecordedChunks([]);
  };

  const handleGenerate = async () => {
    if (!recordedAudio) {
      onError?.('Aucun enregistrement', 'Veuillez enregistrer un audio avant la génération.');
      return;
    }

    setIsGenerating(true);
    setStep('processing');
    setBackendStatus('Uploading audio to backend...');

    const allFormRequests = [...selectedForms];
    if (customFormRequest.trim()) {
      allFormRequests.push(customFormRequest.trim());
    }

    // Inject persona context for Gemini
    const personaContext = SPECIALTY_PERSONAS[selectedSpecialty]?.context || '';

    try {
      // The /api/transcribe endpoint is synchronous and returns the transcription directly
      const transcriptionResult = await uploadRecordingForTranscription({
        audioBlob: recordedAudio,
        language: lang,
        model: modelPref,
        analyze: true,
        translateQuebecTerms: true,
      });

      setBackendStatus('Processing transcription result...');

      // Check if transcription was successful
      if (!transcriptionResult.success && transcriptionResult.error) {
        throw new Error(transcriptionResult.error);
      }

      // Use the transcript directly from the response
      const finalTranscript = transcriptionResult.transcript || recordedTranscript || '';
      setRecordedTranscript(finalTranscript);
      setBackendStatus('Result ready');

      // For now, generated_forms comes from transcription result if available
      const generatedFormsPayload = normalizeGeneratedForms(transcriptionResult.generated_forms);

      const soapContent = firstContentFromPaths(generatedFormsPayload, SOAP_PATHS) || finalTranscript;
      const patientNoteContent = firstContentFromPaths(generatedFormsPayload, PATIENT_NOTE_PATHS) || transcriptionResult.analysis;
      const doctorNoteContent = firstContentFromPaths(generatedFormsPayload, DOCTOR_NOTE_PATHS) || patientNoteContent;
      const prescriptionContent = firstContentFromPaths(generatedFormsPayload, PRESCRIPTION_PATHS);
      const labOrderContent = firstContentFromPaths(generatedFormsPayload, LAB_ORDER_PATHS);
      const referralContent = firstContentFromPaths(generatedFormsPayload, REFERRAL_PATHS);
      const madoData = generatedFormsPayload?.madoData || generatedFormsPayload?.complianceAudit?.madoData || generatedFormsPayload?.mado;

      const clinicianInfo = clinician ? {
        fullName: clinician.fullName,
        clinicName: clinician.clinicName,
        licenseNumber: clinician.licenseNumber,
        email: clinician.email
      } : undefined;

      const newSession = {
        id: `sess-${Date.now()}`,
        date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA'),
        createdAt: Date.now(),
        patientInfo,
        transcript: finalTranscript,
        forms: {
          soap: makeFormStatus(soapContent),
          patientNote: makeFormStatus(patientNoteContent),
          prescription: makeFormStatus(prescriptionContent),
          labOrder: makeFormStatus(labOrderContent),
          referralLetter: makeFormStatus(referralContent),
          doctorNote: makeFormStatus(doctorNoteContent),
          billingSuggestion: transcriptionResult.analysis ? { summary: transcriptionResult.analysis } : {}
        },
        madoData: madoData || null,
        clinicianInfo,
        errors: transcriptionResult.error ? [{ agent: 'Backend', message: transcriptionResult.error, severity: 'warning' as const }] : []
      };

      setRecordedAudio(null);
      onComplete(newSession, []);
    } catch (err) {
      console.error('Session processing error:', err);
      const fallbackTranscript = recordedTranscript || 'Transcription unavailable';
      const fallbackSession = {
        id: `sess-${Date.now()}`,
        date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA'),
        createdAt: Date.now(),
        patientInfo,
        transcript: fallbackTranscript,
        forms: {
          soap: {
            status: 'ready', content: `TRANSCRIPT:

${fallbackTranscript}

[Backend failed]` },
          patientNote: { status: 'ready', content: 'Backend processing failed. Please review manually.' }
        },
        madoData: null,
        clinicianInfo: clinician ? {
          fullName: clinician.fullName,
          clinicName: clinician.clinicName,
          licenseNumber: clinician.licenseNumber,
          email: clinician.email
        } : undefined,
        errors: [{ agent: 'Backend', message: err instanceof Error ? err.message : 'Unknown backend error', severity: 'critical' as const }]
      };
      onComplete(fallbackSession, []);
      onError?.('Backend error', err instanceof Error ? err.message : 'The generation failed.');
    } finally {
      setIsGenerating(false);
      setBackendStatus('');
    }
  }; const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Validation helper
  const validatePatientInfo = (): boolean => {
    const errors: Record<string, string> = {};

    // Full name validation
    const nameValidation = validateInput(patientInfo.fullName, 100);
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.error || 'Nom invalide';
    } else if (patientInfo.fullName.length < 3) {
      errors.fullName = 'Le nom doit contenir au moins 3 caractères';
    }

    // RAMQ validation
    if (patientInfo.ramq && !validateRAMQ(patientInfo.ramq)) {
      errors.ramq = 'Numéro RAMQ invalide (format: ABCD 1234 5678)';
    }

    // Date of birth validation
    if (patientInfo.dob && !validateDate(patientInfo.dob)) {
      errors.dob = 'Date invalide (format: AAAA-MM-JJ)';
    }

    // Postal code validation
    if (patientInfo.postalCode && !validatePostalCode(patientInfo.postalCode)) {
      errors.postalCode = 'Code postal invalide (format: A1A 1A1)';
    }

    // Custom form request validation
    if (customFormRequest) {
      const customValidation = validateInput(customFormRequest, 500);
      if (!customValidation.isValid) {
        errors.customFormRequest = customValidation.error || 'Demande personnalisée invalide';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Safe input handler with sanitization
  const handlePatientInfoChange = (field: keyof PatientInfo, value: string) => {
    // Sanitize input to prevent XSS
    const sanitized = sanitizeHTML(value);

    setPatientInfo({
      ...patientInfo,
      [field]: sanitized
    });

    // Clear error for this field
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: ''
      });
    }
  };

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Use backend session ID if available, otherwise generate a local one
  const sessionId = backendSessionId || `local-${Date.now()}`;
  const patientId = patientInfo.ramq || '';

  const handleDownloadPDF = async () => {
    setActionLoading('pdf');
    setActionError(null);
    try {
      const blob = await downloadSessionPDF(sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setActionError(err.message || 'PDF download failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePushToEMR = async () => {
    setActionLoading('emr');
    setActionError(null);
    try {
      await pushSessionToEMR(sessionId, patientId);
      alert('Document pushed to EMR!');
    } catch (err: any) {
      setActionError(err.message || 'EMR push failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendViaEFax = async () => {
    setActionLoading('efax');
    setActionError(null);
    try {
      const faxNumber = prompt('Numéro de fax destinataire:');
      if (!faxNumber) return;
      await sendSessionViaEFax(sessionId, faxNumber);
      alert('Document envoyé via eFax!');
    } catch (err: any) {
      setActionError(err.message || 'eFax send failed');
    } finally {
      setActionLoading(null);
    }
  };

  const SPECIALTY_PERSONAS: Record<string, { name: string; context: string }> = {
    'family': {
      name: 'Médecine de Famille',
      context: 'You are a family medicine doctor. Focus on holistic care, preventive medicine, and chronic disease management.'
    },
    'cardiology': {
      name: 'Cardiologie',
      context: 'You are a cardiologist. Focus on heart health, cardiovascular diagnostics, and treatment.'
    },
    'psychiatry': {
      name: 'Psychiatrie',
      context: 'You are a psychiatrist. Focus on mental health, psychiatric evaluation, and therapy.'
    },
    'pediatrics': {
      name: 'Pédiatrie',
      context: 'You are a pediatrician. Focus on child health, growth, and development.'
    },
    'geriatrics': {
      name: 'Gériatrie',
      context: 'You are a geriatrician. Focus on elderly care, frailty, and age-related conditions.'
    },
    // Add more specialties as needed
  };

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('family');

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-2 py-8 animate-in fade-in duration-500">

      {/* API Key Modal */}

      {/* RAMQ Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6">
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl w-full max-w-md relative aspect-[3/4] border border-slate-700">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay UI */}
            <div className="absolute inset-0 border-[3px] border-white/30 m-8 rounded-xl pointer-events-none flex flex-col justify-between p-4">
              <div className="text-center bg-black/50 text-white text-xs py-1 px-3 rounded-full mx-auto backdrop-blur-md">
                Alignez la carte RAMQ ici
              </div>
            </div>

            {isScanning && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 text-white z-20">
                <Loader2 size={48} className="animate-spin text-blue-500" />
                <p className="font-bold animate-pulse">Analyse Gemini Vision...</p>
              </div>
            )}

            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-all z-20"
            >
              <X size={24} />
            </button>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
              <button
                onClick={captureAndScan}
                disabled={isScanning}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm hover:scale-105 active:scale-95 transition-all"
              >
                <div className="w-16 h-16 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
          {backendStatus && (
            <p className="text-xs text-slate-500 text-center mt-2">{backendStatus}</p>
          )}
        </div>
      )}

      {step === 'consent' && (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-10 mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-[2rem] flex items-center justify-center text-blue-600 shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black heading-font text-slate-800 dark:text-white uppercase italic tracking-tighter">Conformité Loi 25</h2>
            <p className="text-slate-500 max-w-lg leading-relaxed">{t('law25_info')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => { setConsent({ taken: true, decree: false }); setStep('info'); }}
              className="p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-600 transition-all group bg-slate-50 dark:bg-slate-900"
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="text-emerald-500" size={24} />
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white text-left">{t('consent_taken')}</p>
            </button>
            <button
              onClick={() => { setConsent({ taken: false, decree: true }); setStep('info'); }}
              className="p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-amber-500 transition-all group bg-slate-50 dark:bg-slate-900"
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                <Info className="text-amber-500" size={24} />
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white text-left">{t('consent_not_required')}</p>
            </button>
          </div>
        </div>
      )}

      {step === 'info' && (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-10 mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-3xl font-black heading-font text-slate-800 dark:text-white uppercase italic tracking-tight">{t('patient_info')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Remplissez les informations du patient pour commencer</p>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <Camera size={18} /> {t('scan_ramq')}
            </button>
          </div>

          {/* Patient Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <UserIcon size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Informations Patient</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {t('full_name')}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="text"
                    value={patientInfo.fullName}
                    onChange={e => handlePatientInfoChange('fullName', e.target.value)}
                    placeholder="Jean Tremblay"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium ${validationErrors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    maxLength={100}
                    required
                  />
                </div>
                {validationErrors.fullName && (
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 px-1">
                    <AlertCircle size={14} />
                    {validationErrors.fullName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {t('ramq_number')}
                </label>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                  <input
                    type="text"
                    value={patientInfo.ramq}
                    onChange={e => handlePatientInfoChange('ramq', e.target.value)}
                    placeholder="ABCD 1234 5678"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all uppercase ${validationErrors.ramq ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    maxLength={14}
                  />
                </div>
                {validationErrors.ramq && (
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 px-1">
                    <AlertCircle size={14} />
                    {validationErrors.ramq}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  {t('dob')}
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                  <input
                    type="text"
                    value={patientInfo.dob}
                    onChange={e => handlePatientInfoChange('dob', e.target.value)}
                    placeholder="AAAA-MM-JJ"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-xl text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${validationErrors.dob ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    maxLength={10}
                  />
                </div>
                {validationErrors.dob && (
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 px-1">
                    <AlertCircle size={14} />
                    {validationErrors.dob}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  {t('postal_code')}
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                  <input
                    type="text"
                    value={patientInfo.postalCode}
                    onChange={e => handlePatientInfoChange('postalCode', e.target.value)}
                    placeholder="H1A 1A1"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-xl text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all uppercase ${validationErrors.postalCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    maxLength={7}
                  />
                </div>
                {validationErrors.postalCode && (
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 px-1">
                    <AlertCircle size={14} />
                    {validationErrors.postalCode}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form selection UI removed from info step; now only available in Advanced Options during 'recording' step. */}

          {/* Model Selection UI */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <Zap size={16} className="text-blue-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moteur Deepgram & Précision</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setModelPref('nova-3')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${modelPref === 'nova-3' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-transparent'}`}
              >
                <Zap size={18} />
                <span className="text-[10px] font-bold uppercase">Nova-3 (Ultra)</span>
              </button>
              <button
                onClick={() => setModelPref('nova-2')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${modelPref === 'nova-2' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-transparent'}`}
              >
                <Play size={18} />
                <span className="text-[10px] font-bold uppercase">Nova-2 (Speed)</span>
              </button>
              <button
                disabled={lang === 'fr'}
                onClick={() => setModelPref('medical')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${modelPref === 'medical' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-transparent disabled:opacity-30'}`}
              >
                <Stethoscope size={18} />
                <span className="text-[10px] font-bold uppercase">Medical (EN)</span>
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <p className="font-bold mb-1">Deux options d'enregistrement:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Enregistrement en direct:</strong> Cliquez sur le bouton ci-dessous pour enregistrer via votre microphone</li>
                  <li><strong>Fichier audio:</strong> Téléversez un fichier MP3/WAV pré-enregistré (section ci-dessus)</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            disabled={!patientInfo.fullName}
            onClick={() => {
              if (validatePatientInfo()) {
                handleStart();
              }
            }}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
          >
            <Mic size={20} /> {t('start_recording')}
          </button>
        </div>
      )}

      {step === 'recording' && (
        <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-16 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center space-y-12 mx-auto">
          <div className="flex items-center gap-3">
            {isRecording ? (
              <>
                <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-black text-rose-500 uppercase tracking-widest">Enregistrement Actif</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-black text-blue-500 uppercase tracking-widest">Prêt pour Génération</span>
              </>
            )}
          </div>

          <div className="text-6xl font-black text-slate-800 dark:text-white heading-font tabular-nums tracking-tighter">
            {formatTime(timer)}
          </div>

          {isRecording && (
            <>
              <div className="flex items-end justify-center gap-1 h-32 w-full max-w-md px-10">
                {waveforms.map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-600 rounded-full transition-all duration-300" style={{ height: `${h}%`, opacity: 0.1 + (i / 40) }}></div>
                ))}
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
                >
                  {isPaused ? <Play size={32} /> : <Pause size={32} />}
                </button>
                <button
                  onClick={handleStop}
                  className="w-24 h-24 rounded-[2.5rem] bg-rose-600 flex items-center justify-center text-white shadow-2xl shadow-rose-500/30 hover:scale-105 transition-all"
                >
                  <Square size={32} fill="currentColor" />
                </button>
              </div>
            </>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex flex-col gap-4 max-w-4xl w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Stethoscope className="text-blue-600 shrink-0" size={20} />
                <h3 className="text-xs font-black text-blue-800 dark:text-blue-200 uppercase tracking-widest">Transcription en Direct</h3>
              </div>
              {isRecording && (
                <div className="flex items-center gap-2">
                  {wsConnected ? (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">EN DIRECT</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">LOCAL</span>
                    </span>
                  )}
                  {wsConfidence > 0 && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(wsConfidence * 100)}%
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto bg-white/50 dark:bg-slate-900/30 rounded-2xl p-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 leading-relaxed whitespace-pre-wrap">
                {isRecording && realtimeTranscript ? (
                  <>
                    {realtimeTranscript}
                    <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                  </>
                ) : isRecording ? (
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-300 animate-pulse">
                    En attente de parole...
                  </span>
                ) : (
                  recordedTranscript || 'Aucune transcription disponible.'
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
            {wsError && (
              <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle size={14} />
                {wsError}
              </div>
            )}
          </div>

          {/* Advanced Options - Collapsible (Only section shown) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full overflow-hidden mt-8">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-slate-600 dark:text-slate-400" size={18} />
                <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Options Avancées & Formulaires</span>
              </div>
              <div className={`transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-slate-400">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {showAdvancedOptions && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* Pre-defined Forms Selection as Dropdown (to be replaced in next step) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-600" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents Prédéfinis</span>
                  </div>
                  <Select
                    isMulti
                    options={availableForms.map(form => ({ value: form, label: form }))}
                    value={selectedForms.map(form => ({ value: form, label: form }))}
                    onChange={options => setSelectedForms(options.map(opt => opt.value))}
                    classNamePrefix="react-select"
                    placeholder="Sélectionner les formulaires..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'var(--tw-bg-opacity, 1) #f8fafc',
                        borderRadius: '0.75rem',
                        borderColor: '#e2e8f0',
                        minHeight: '48px',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#64748b',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#e0e7ef',
                        color: '#334155',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#f1f5f9' : undefined,
                        color: state.isSelected ? '#fff' : '#334155',
                        fontWeight: 700,
                      }),
                    }}
                  />
                </div>

                {/* Custom Form Request (to be enhanced in next step) */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-600" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Demande Personnalisée</span>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <textarea
                        value={customFormRequest}
                        onChange={(e) => setCustomFormRequest(e.target.value)}
                        placeholder="Ex: Générer une lettre de référence en cardiologie avec ECG mentionné..."
                        className="w-full p-4 pr-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:border-amber-500 focus:ring-0 transition-all resize-none"
                        rows={3}
                      />
                      <button
                        type="button"
                        className={`absolute bottom-3 right-3 p-2 rounded-full bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800 transition-all ${isMicActive ? 'animate-pulse' : ''}`}
                        onClick={handleMicClick}
                        aria-label="Dicter avec le micro"
                        tabIndex={0}
                      >
                        <Mic size={18} className={isMicActive ? 'text-amber-600' : 'text-slate-400'} />
                      </button>
                      {isMicActive && micTranscript && (
                        <div className="absolute left-3 bottom-3 text-xs text-amber-600 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded shadow">
                          {micTranscript}
                        </div>
                      )}
                    </div>
                    {micError && (
                      <div className="text-xs text-red-500 px-1 pt-1">{micError}</div>
                    )}
                    <p className="text-[10px] text-slate-400 italic px-1">
                      Ces documents seront générés après l'enregistrement en plus des formulaires standard.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button - Only show when recording is stopped */}
          {!isRecording && (
            <>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !recordedAudio}
                className="w-full max-w-4xl py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-3xl font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Zap size={24} />
                    Générer les Formulaires
                  </>
                )}
              </button>
              {!recordedAudio && (
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-3">
                  Enregistrez un audio pour démarrer la génération.
                </p>
              )}
              {/* Action buttons after generation */}
              {recordedTranscript && (
                <>
                  {/* Display selected forms and custom request */}
                  <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Options Générées</h3>
                    <div className="mb-2">
                      <span className="font-bold text-slate-500">Formulaires sélectionnés :</span>
                      {selectedForms.length > 0 ? (
                        <ul className="list-disc list-inside ml-4 text-xs text-slate-700 dark:text-slate-200">
                          {selectedForms.map((form, idx) => (
                            <li key={idx}>{form}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="ml-2 text-xs text-slate-400">Aucun</span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">Demande personnalisée :</span>
                      {customFormRequest ? (
                        <span className="ml-2 text-xs text-slate-700 dark:text-slate-200">{customFormRequest}</span>
                      ) : (
                        <span className="ml-2 text-xs text-slate-400">Aucune</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-8">
                    <a
                      href="/AI_Images/AS-770_DT9070.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                      <FileText size={18} /> Télécharger AS-770 Officiel
                    </a>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={actionLoading === 'pdf'}
                      className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                      <FileText size={18} /> {actionLoading === 'pdf' ? 'Téléchargement...' : 'Télécharger PDF'}
                    </button>
                    <button
                      onClick={handlePushToEMR}
                      disabled={actionLoading === 'emr'}
                      className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                      <Upload /> {actionLoading === 'emr' ? 'Envoi...' : 'Copier/Push vers EMR'}
                    </button>
                    <button
                      onClick={handleSendViaEFax}
                      disabled={actionLoading === 'efax'}
                      className="flex items-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                    >
                      <FileText size={18} /> {actionLoading === 'efax' ? 'Envoi...' : 'Envoyer via eFax'}
                    </button>
                    {actionError && (
                      <div className="w-full text-xs text-red-500 mt-2 text-center">{actionError}</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {step === 'processing' && (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-20 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center justify-center space-y-8 mx-auto">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white animate-bounce shadow-2xl">
              <Zap size={40} />
            </div>
            <Loader2 className="absolute -top-4 -right-4 text-blue-600 animate-spin" size={48} />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black heading-font uppercase italic tracking-tighter">Aura Swarm Intelligence</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Analyse multi-agents : Rédaction SOAP, Détection MADO et Suggestion RAMQ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSession;
