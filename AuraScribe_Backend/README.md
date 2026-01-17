# AuraScribe Project Structure

## 🟢 Frontend (Current Directory)
The frontend is a React application built with TypeScript, Tailwind CSS, and Lucide icons. It follows a modular architecture where UI is separated from the "Swarm Intelligence" logic (Agents).

```text
.
├── PROJECT_STRUCTURE.md        # This file (Documentation)
├── index.html                 # App entry point & Import Maps
├── index.tsx                  # React DOM mounting
├── App.tsx                    # Main layout, routing, & global state
├── types.ts                   # Unified TypeScript interfaces
├── constants.tsx              # Localized strings (FR/EN) & static config
├── metadata.json              # Frame permissions (Microphone)
├── manifest.json              # PWA capabilities
│
├── components/                # UI Layer
│   ├── Auth.tsx               # Security & Login (Loi 25 compliant)
│   ├── Sidebar.tsx            # Navigation & Language toggle
│   ├── Logo.tsx               # Custom SVG branding
│   ├── NewSession.tsx         # Voice capture & patient info logic
│   ├── SessionViewer.tsx      # Document review & Real-time editor
│   ├── AskAura.tsx            # EBM Research & Chat mode
│   ├── AuraLink.tsx           # Secure clinical file sharing pipeline
│   ├── Tasks.tsx              # Clinical action tracker
│   ├── RAMQBilling.tsx        # Billing engine & Code suggestion
│   ├── Templates.tsx          # Custom form generator & branding
│   ├── Community.tsx          # Shared clinical templates
│   ├── Settings.tsx           # System config & Compliance monitor
│   ├── NotificationTray.tsx   # Real-time system alerts
│   ├── SecurityShield.tsx     # Session timer & Privacy (PHI) toggle
│   └── RequestFeature.tsx     # Feedback loop
│
└── services/                  # Logic Layer
    ├── deepgram.ts            # WebSocket connection for transcription
    ├── geminiService.ts       # Base Gemini API utilities
    ├── orchestrator.ts        # The "Swarm" controller (coordinates agents)
    └── agents/                # AI Specialized Micro-Agents
        ├── ClinicalAgent.ts   # Generates SOAP and Patient notes
        ├── PrescriptionAgent.ts # Extracted Rx & Dosages
        ├── LabAgent.ts        # Extracted Requisitions
        ├── BillingAgent.ts    # RAMQ Service/Diagnostic codes
        ├── TaskAgent.ts       # Action items extraction
        ├── ComplianceAgent.ts # Loi 25 auditing & MADO detection
        ├── MADOAgent.ts       # AS-770 Form auto-filling
        ├── VisionAgent.ts     # RAMQ Card OCR scanning
        ├── AskAuraAgent.ts    # RAG & EBM Research (Google Search)
        └── TemplateAgent.ts   # Form skeleton generation
```

---

## 🔵 Proposed Backend (Production Infrastructure)
For **Santé Québec** compliance, the backend must be hosted in `northamerica-northeast1` (Montreal).

```text
backend/
├── server.ts                  # Node.js/Fastify/Next.js entry
├── lib/
│   ├── vertex.ts              # Vertex AI IAM Auth (Canada Regional Endpoint)
│   ├── security.ts            # Data encryption at rest (KMS)
│   └── audit.ts               # Loi 25 Audit Logger (Log every PHI access)
│
├── api/                       # Secure Endpoints
│   ├── transcribe/            # Deepgram Proxy (Prevents key leak)
│   ├── process/               # Orchestrator Proxy (Vertex AI)
│   ├── share/                 # AuraLink Secure storage (S3 Canada)
│   └── emr/                   # HL7/FHIR Bridges (TELUS/MYLE)
│
├── db/                        # PostgreSQL (RDS Canada)
│   ├── schema.sql             # Users, Metadata (PHI is stored encrypted)
│   └── migrations/
│
└── functions/                 # Serverless tasks (Cloud Functions)
    ├── auto-purge.ts          # Logic to delete data after 24h
    └── report-mado.ts         # Secure transmission to Public Health
```

## 🔒 Compliance proofing (Loi 25)
1. **Frontend**: No PHI is stored in `localStorage`. All state is volatile.
2. **Connectivity**: All API calls use TLS 1.3.
3. **Data Sovereignty**: The `PROJECT_STRUCTURE.md` clearly separates the Frontend from the Regionalized Backend hosted in Montreal.

# AuraScribe MVP

Minimal viable product for AuraScribe clinical documentation system.

## Quick Start

1. **Clone and setup:**
```bash
git clone <your-repo>
cd aurascribe
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt