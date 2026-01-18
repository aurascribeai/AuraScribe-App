// AuraScribe Frontend API Service
// Connects React components to backend Flask endpoints

const DEFAULT_API_BASE_URL = 'http://localhost:5000';

// Use the env var so Docker or Vite can point to the backend (leave blank for proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

// Extend ImportMetaEnv type to include VITE_API_KEY

interface ImportMetaEnv {
    VITE_API_KEY?: string;
    [key: string]: any;
}

interface ImportMeta {
    env: ImportMetaEnv;
}
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (additional?: Record<string, string>) => {
    const headers: Record<string, string> = { ...(additional || {}) };
    if (API_KEY) {
        headers['X-API-KEY'] = API_KEY;
    }
    return headers;
};

// Health check
export async function getHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
        headers: getAuthHeaders()
    });
    return res.json();
}

// System info
export async function getSystemInfo() {
    const res = await fetch(`${API_BASE_URL}/api/system`, {
        headers: getAuthHeaders()
    });
    return res.json();
}

// Deepgram status
export async function getDeepgramStatus() {
    const res = await fetch(`${API_BASE_URL}/api/deepgram-status`, {
        headers: getAuthHeaders()
    });
    return res.json();
}

// Transcribe (ASR)
export async function transcribeAudio(audioBlob, model = 'nova-3') {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('model', model);
    const res = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    return res.json();
}

// Route transcript
export async function routeTranscript(transcript, options = {}) {
    const res = await fetch(`${API_BASE_URL}/api/route`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ transcript, ...options })
    });
    return res.json();
}

// Orchestrate transcript
export async function orchestrateTranscript(transcript, options = {}) {
    const res = await fetch(`${API_BASE_URL}/api/orchestrate`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ transcript, ...options })
    });
    return res.json();
}

// Process (generic)
export async function processDocument(data) {
    const res = await fetch(`${API_BASE_URL}/api/process`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    return res.json();
}

// Session management endpoints

// Create a new realtime session
export async function createRealtimeSession(data: {
    patient_name: string;
    patient_ramq?: string;
    patient_dob?: string;
    patient_postal_code?: string;
    language: string;
    model_used: string;
}) {
    const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    return res.json();
}

// Append transcript to a session
export async function appendTranscript(sessionId: string, text: string, isFinal: boolean = true) {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/transcript`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ text, is_final: isFinal })
    });
    return res.json();
}

// Update session status
export async function updateSessionStatus(sessionId: string, status: string) {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status })
    });
    return res.json();
}

// Upload recording for transcription
export async function uploadRecordingForTranscription(options: {
    audioBlob: Blob;
    language: string;
    model: string;
    analyze?: boolean;
    translateQuebecTerms?: boolean;
}) {
    const formData = new FormData();
    formData.append('audio', options.audioBlob);
    formData.append('language', options.language);
    formData.append('model', options.model);
    if (options.analyze) formData.append('analyze', 'true');
    if (options.translateQuebecTerms) formData.append('translate_quebec_terms', 'true');

    const res = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    return res.json();
}

// Wait for job completion (polling)
export async function waitForJobCompletion(
    jobId: string,
    options: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<any> {
    const { timeoutMs = 120000, intervalMs = 3000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();

        if (data.status === 'completed') {
            return data;
        }
        if (data.status === 'failed') {
            throw new Error(data.error || 'Job failed');
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Job timed out');
}

// Download session PDF
export async function downloadSessionPDF(sessionId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/pdf`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) {
        throw new Error('Failed to download PDF');
    }
    return res.blob();
}

// Push session to EMR
export async function pushSessionToEMR(sessionId: string, patientId: string) {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/emr`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ patient_id: patientId })
    });
    return res.json();
}

// Send session via eFax
export async function sendSessionViaEFax(sessionId: string, faxNumber: string) {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/efax`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ fax_number: faxNumber })
    });
    return res.json();
}

// List realtime sessions
export async function listRealtimeSessions(limit: number = 50) {
    const res = await fetch(`${API_BASE_URL}/api/sessions?limit=${limit}`, {
        headers: getAuthHeaders()
    });
    return res.json();
}

// ========== ASK AURA ENDPOINTS ==========

// Chat with Aura AI assistant
export async function askAuraChat(data: {
    message: string;
    context?: string;
    session_transcript?: string;
    language?: string;
}) {
    const res = await fetch(`${API_BASE_URL}/api/ask-aura/chat`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    return res.json();
}

// Generate study case summary
export async function askAuraStudyCase(data: {
    session_id?: string;
    transcript?: string;
    patient_info?: any;
    soap_content?: string;
    language?: string;
}) {
    const res = await fetch(`${API_BASE_URL}/api/ask-aura/study-case`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    return res.json();
}

// Research evidence-based medicine resources
export async function askAuraResearch(data: {
    query?: string;
    transcript?: string;
    language?: string;
}) {
    const res = await fetch(`${API_BASE_URL}/api/ask-aura/research`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function uploadClinicalFile(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const res = await fetch(`${API_BASE_URL}/api/v1/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'File upload failed');
    }

    return res.json();
}

// ========== AURALINK ENDPOINTS ==========

// Create a new AuraLink secure transfer
export async function createAuraLinkTransfer(data: {
    file_url: string;
    file_name: string;
    file_type?: string;
    file_size?: string;
    recipient_email: string;
    permissions?: {
        read?: boolean;
        download?: boolean;
        edit?: boolean;
    };
    security_method?: 'token' | 'password';
    password?: string;
    anti_capture?: boolean;
    expiry?: string;
}) {
    const res = await fetch(`${API_BASE_URL}/api/auralink/transfers`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    return res.json();
}

// List all AuraLink transfers
export async function listAuraLinkTransfers(limit: number = 50) {
    const res = await fetch(`${API_BASE_URL}/api/auralink/transfers?limit=${limit}`, {
        headers: getAuthHeaders()
    });
    return res.json();
}

// Delete/revoke an AuraLink transfer
export async function deleteAuraLinkTransfer(transferId: string) {
    const res = await fetch(`${API_BASE_URL}/api/auralink/transfers/${transferId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return res.json();
}

// Access an AuraLink file (public endpoint, no auth required)
export async function accessAuraLinkFile(transferId: string, token?: string, password?: string) {
    const params = new URLSearchParams();
    if (token) params.append('token', token);
    if (password) params.append('password', password);

    const res = await fetch(`${API_BASE_URL}/api/auralink/access/${transferId}?${params.toString()}`);
    return res.json();
}

// TODO: Add authentication, task, billing, template, and notification endpoints as backend expands
