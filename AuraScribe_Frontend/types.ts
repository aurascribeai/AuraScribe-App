
export type Language = 'fr' | 'en';

export enum AppRoute {
  NEW_SESSION = 'new-session',
  VIEW_SESSIONS = 'view-sessions',
  ASK_AURA = 'ask-aura',
  AURALINK = 'auralink',
  RAMQ = 'ramq',
  TASKS = 'tasks',
  SCHEDULE = 'schedule',
  TEMPLATES = 'templates',
  COMMUNITY = 'community',
  SETTINGS = 'settings',
  REQUEST_FEATURE = 'request-feature'
}

export interface User {
  fullName: string;
  clinicName: string;
  licenseNumber: string;
  phone?: string;
  email: string;
  role: string;
}

export interface PatientInfo {
  fullName: string;
  dob: string;
  ramq: string;
  postalCode: string;
}

export interface MADOReport {
  formNumber: string;
  formVersion: string;
  reportNumber: string;
  publicHealthUnit: string;
  urgency: string;
  isEmergency: boolean;
  reportRequired: boolean;
  patient: {
    fullName: string;
    dob: string;
    ramq: string;
    postalCode: string;
    municipality: string;
  };
  disease: {
    name: string;
    code: string;
  };
  clinicalContext: {
    onsetDate: string;
    severity: string;
    hospitalization: string;
    symptoms: string;
    narrative: string;
    exposureDetails?: string[];
  };
  exposures: string[];
  reporter: {
    fullName: string;
    clinicName: string;
    licenseNumber: string;
    phone: string;
    email: string;
  };
  instructions: string;
  summary: string;
  timestamp: string;
  diseaseDetected?: string[];
  sources?: string[];
}

export interface FormStatus {
  status: 'pending' | 'ready' | 'validated';
  content?: string;
}

export interface Session {
  id: string;
  date: string;
  createdAt: number;
  patientInfo: PatientInfo;
  transcript: string;
  forms: {
    [key: string]: FormStatus;
  };
  madoData?: MADOReport | null;
  clinicianInfo?: {
    fullName: string;
    clinicName: string;
    licenseNumber: string;
    phone?: string;
    email?: string;
  };
  billingSuggestion?: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'review' | 'signature' | 'send' | 'followup' | 'research' | 'manual';
  status: 'pending' | 'completed';
  dueDate?: string;
  relatedSessionId?: string;
}

export interface AuraNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  timestamp: number;
  isRead: boolean;
  actionRoute?: AppRoute;
  relatedId?: string;
}

export interface ClinicalTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  isPublic: boolean;
  authorName: string;
  province: string;
  createdAt: number;
}

export interface RAMQBill {
  id: string;
  sessionId: string;
  patientInitials: string;
  patientRamq: string;
  date: string;
  serviceCode: string;
  diagnosticCode: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'refused';
  transmissionDate?: string;
}

export interface ClinicalFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'form';
  size: string;
  content?: string;
  fileObject?: File;
  url?: string;
}

export interface AuraLinkTransfer {
  id: string;
  file: ClinicalFile;
  recipientEmail: string;
  permissions: {
    read: boolean;
    download: boolean;
    edit: boolean;
  };
  security: {
    method: 'token' | 'password';
    value: string;
    antiCapture: boolean;
  };
  expiry: string;
  status: 'active' | 'accessed' | 'expired';
}

export interface ClinicalForms {
  soap?: string;
  prescription?: string;
  labOrder?: string;
  patientNote?: string;
  referralLetter?: string;
  mado_as770?: string;
  workAccident?: string;
  doctorNote?: string;
}

export interface TranslationStrings {
  [key: string]: {
    fr: string;
    en: string;
  };
}

export interface Appointment {
  id: string;
  patientName: string;
  type: 'consult' | 'followup' | 'emergency';
  startTime: string;
  duration: number;
  dayIndex: number;
}
