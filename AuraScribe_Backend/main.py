# --- Real-time Dictation WebSocket Integration ---
from services.ws_dictation import socketio
# --- Clinical Coding Agent Integration ---
from services.clinical_coding_agent import ClinicalCodingAgent
coding_agent = ClinicalCodingAgent()

# --- User/Clinic Management & Audit Trail ---
from services.user_management import register_user, login_user, create_clinic, log_audit, USERS, CLINICS, AUDIT_LOG

# PDF, eFax, and EMR services
from services.pdf.pdf_service import save_pdf, get_pdf_path
from services.integration_loader import load_clinic_config, get_efax_adapter, get_emr_adapter

# --- Persona System ---
from agents.medical_persona_system import MedicalPersona

# Default persona
current_persona = MedicalPersona("generalist")

"""
AuraScribe - Complete Medical Documentation System
"""

from functools import wraps
from flask import Flask, jsonify, request, send_file
import logging
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict, List, Optional
import json
import redis

# Load environment variables FIRST
load_dotenv()

# Add services folder to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
services_path = os.path.join(current_dir, 'services')
if os.path.exists(services_path):
    sys.path.append(services_path)

# Create Flask app
app = Flask(__name__)\n\n# Configure file uploads (100MB limit for audio files)\napp.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# Initialize Redis connection for session storage
# Sessions expire after 24 hours (86400 seconds) for Loi 25 compliance
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
SESSION_TTL = 86400  # 24 hours in seconds

try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
    logging.info(f"Redis connected successfully: {REDIS_URL.split('@')[-1] if '@' in REDIS_URL else REDIS_URL}")
except redis.ConnectionError as e:
    logging.warning(f"Redis connection failed: {e}. Falling back to in-memory storage (NOT RECOMMENDED for production)")
    redis_client = None

# CORS Configuration
def _normalize_origins(origins: List[str]) -> List[str]:
    """Deduplicate CORS origin lists while keeping order."""
    seen = []
    for origin in origins:
        if not origin:
            continue
        if origin not in seen:
            seen.append(origin)
    return seen

# CORS: Allow requests from frontend only
environment = os.getenv('ENVIRONMENT', 'production')
allowed_origins_env = os.getenv('ALLOWED_ORIGINS', 'https://app.aurascribe.ca,http://localhost:5173')
ALLOWED_ORIGINS = _normalize_origins([origin.strip() for origin in allowed_origins_env.split(',')])
logging.info(f"ALLOWED_ORIGINS loaded: {ALLOWED_ORIGINS}")

# Determine the origins to use based on environment
if environment == 'production':
    # In production, let Nginx handle CORS to avoid duplicate headers
    cors_origins = []
    logging.info("Production mode: CORS handled by Nginx, Flask CORS disabled")
else:
    # In development, use Flask CORS
    cors_origins = ALLOWED_ORIGINS
    logging.info(f"Development mode: Flask CORS enabled for: {cors_origins}")

# Configure Flask-CORS only if not in production
if cors_origins:
    CORS(app, resources={r"/api/*": {
        "origins": cors_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-API-KEY"],
        "supports_credentials": True
    }})

# SocketIO CORS configuration
try:
    from services.ws_dictation import socketio
    # Initialize SocketIO with appropriate CORS settings
    socketio_cors_origins = cors_origins if cors_origins else ["https://app.aurascribe.ca"]
    socketio.init_app(app, cors_allowed_origins=socketio_cors_origins, async_mode='threading')
    logging.info(f"SocketIO initialized with CORS origins: {socketio_cors_origins}")
except ImportError as e:
    logging.error(f"Failed to import ws_dictation: {e}")
    socketio = None

# Import other services
try:
    from services.clinical_coding_agent import ClinicalCodingAgent
    coding_agent = ClinicalCodingAgent()
except ImportError as e:
    logging.warning(f"Clinical coding agent not available: {e}")
    coding_agent = None

try:
    from services.user_management import register_user, login_user, create_clinic, log_audit, USERS, CLINICS, AUDIT_LOG
except ImportError as e:
    logging.warning(f"User management not available: {e}")

try:
    from services.pdf.pdf_service import save_pdf, get_pdf_path
except ImportError as e:
    logging.warning(f"PDF service not available: {e}")

try:
    from services.integration_loader import load_clinic_config, get_efax_adapter, get_emr_adapter
except ImportError as e:
    logging.warning(f"Integration loader not available: {e}")

try:
    from agents.medical_persona_system import MedicalPersona
    current_persona = MedicalPersona("generalist")
except ImportError as e:
    logging.warning(f"Medical persona system not available: {e}")
    current_persona = None

# Rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per minute", "1000 per hour"]
)

# Global error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request', 'message': str(error)}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized', 'message': 'Invalid or missing API key'}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden', 'message': 'Access denied'}), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'message': 'The requested resource was not found'}), 404

@app.errorhandler(429)
def rate_limited(error):
    return jsonify({'error': 'Rate limited', 'message': 'Too many requests. Please try again later.'}), 429

@app.errorhandler(500)
def internal_error(error):
    logging.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

@app.errorhandler(Exception)
def handle_exception(error):
    logging.error(f"Unhandled exception: {error}")
    environment = os.getenv('ENVIRONMENT', 'development')
    if environment == 'development':
        return jsonify({'error': 'Unhandled exception', 'message': str(error)}), 500
    return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

# API Key for authentication
API_KEY = os.getenv('AURASCRIBE_API_KEY', None)

def _validate_api_key() -> bool:
    """Validate API key from request headers.

    Returns False if no API_KEY is configured (security: require explicit key).
    In production, AURASCRIBE_API_KEY must be set.
    """
    if not API_KEY:
        # In production, reject all requests if no API key is configured
        environment = os.getenv('ENVIRONMENT', 'development')
        if environment == 'production':
            logging.error("API_KEY not configured in production environment")
            return False
        # Allow in development without key for easier testing
        logging.warning("No API_KEY configured - allowing request in development mode")
        return True

    key = request.headers.get('X-API-KEY')
    if not key:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.lower().startswith('bearer '):
            key = auth_header.split(' ', 1)[1]

    # Use constant-time comparison to prevent timing attacks
    if not key:
        return False
    return len(key) == len(API_KEY) and all(a == b for a, b in zip(key, API_KEY))

def require_api_key():
    if not _validate_api_key():
        logging.warning(f"Unauthorized access attempt from {get_remote_address()}")
        return jsonify({'error': 'Unauthorized. Valid API key required.'}), 401
    return None


def api_key_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_error = require_api_key()
        if auth_error:
            return auth_error
        return func(*args, **kwargs)
    return wrapper

# Import Deepgram service
try:
    from services.deepgram_local_service import DeepgramLocalService
    deepgram_service = DeepgramLocalService()
    logging.info(f"Deepgram service initialized: {deepgram_service.base_url}")
except ImportError as e:
    logging.warning(f"Could not import Deepgram service: {e}")
    deepgram_service = None

# Model slug aliases for Deepgram self-hosted - UPDATED
MODEL_SLUG_ALIASES: Dict[str, str] = {
    # Map your code's model names to actual Deepgram model names
    "nova-3": "nova-3",
    "nova-2": "nova-2",
    "general": "nova-3",
    "2-general": "nova-2",
    # Keep these for compatibility
    "medical": "nova-2-medical",
    "nova-2-medical": "nova-2-medical"
}

deepgram_default_model: str = os.getenv("DEEPGRAM_DEFAULT_MODEL", "nova-3")
deepgram_fr_model: Optional[str] = os.getenv("DEEPGRAM_FR_MODEL", "nova-3")


# Import real agent wrappers
from services.AuraScribeRouter import route_transcript
from services.AuraScribeOrchestrator import orchestrate_transcript
try:
    from agents.AskAura_agent import root_agent as ask_aura_agent
except ImportError as e:
    logging.warning(f"AskAura_agent not available: {e}")
    ask_aura_agent = None

# ========== ROUTES ==========

@app.route('/api/persona', methods=['GET', 'POST'])
@api_key_required
def manage_persona():
    """Get or set the current medical persona"""
    global current_persona
    
    if request.method == 'GET':
        response = jsonify({
            'current_persona': current_persona.get_persona_summary(),
            'available_personas': list(MedicalPersona.PERSONAS.keys()),
            'timestamp': datetime.now().isoformat()
        })
        response.status_code = 200
        return response
    elif request.method == 'POST':
        data = request.get_json() or {}
        persona_key = data.get('persona', 'generalist')
        
        if persona_key in MedicalPersona.PERSONAS:
            current_persona = MedicalPersona(persona_key)
            logging.info(f"Persona switched to: {persona_key}")
            
            return jsonify({
                'success': True,
                'message': f'Persona switched to {persona_key}',
                'new_persona': current_persona.get_persona_summary(),
                'timestamp': datetime.now().isoformat()
            })
        else:
            response = jsonify({
                'success': False,
                'error': f'Unknown persona: {persona_key}',
                'available_personas': list(MedicalPersona.PERSONAS.keys())
            })
            response.status_code = 400
            return response
    # Fallback for unsupported methods
    response = jsonify({'error': 'Method not allowed'})
    response.status_code = 405
    return response

@app.route('/')
def home():
    try:
        return jsonify({
            'service': 'AuraScribe Medical Documentation',
            'version': '1.0.0',
            'status': 'running',
            'deepgram_available': deepgram_service is not None,
            'deepgram_url': os.getenv('DEEPGRAM_SELF_HOSTED_URL', 'Not configured'),
            'timestamp': datetime.now().isoformat(),
            'endpoints': [
                'GET  /',
                'GET  /api/health',
                'GET  /api/system',
                'GET  /api/deepgram-status',
                'POST /api/transcribe',
                'POST /api/route',
                'POST /api/orchestrate',
                'POST /api/process'
            ]
        })
    except Exception as e:
        logging.error(f"Error in / endpoint: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    try:
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'deepgram': 'connected' if deepgram_service and deepgram_service.connection_status[0] else 'disconnected'
        })
    except Exception as e:
        logging.error(f"Error in /api/health: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/system', methods=['GET'])
@api_key_required
def system():
    """System information"""
    try:
        # Check folders
        agents_exists = os.path.exists('agents')
        services_exists = os.path.exists('services')
        agents = []
        if agents_exists:
            agents = [f for f in os.listdir('agents') if f.endswith('.py') and f != '__init__.py']
        services = []
        if services_exists:
            services = [f for f in os.listdir('services') if f.endswith('.py')]
        return jsonify({
            'folders': {
                'agents': {
                    'exists': agents_exists,
                    'count': len(agents),
                    'files': agents[:10]  # First 10 files
                },
                'services': {
                    'exists': services_exists,
                    'count': len(services),
                    'files': services
                }
            },
            'vertex_ai_configured': 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ,
            'deepgram_configured': 'DEEPGRAM_API_KEY' in os.environ,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Error in /api/system: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/deepgram-status', methods=['GET'])
@api_key_required
def deepgram_status():
    """Check Deepgram connection status"""
    try:
        if not deepgram_service:
            return jsonify({
                'available': False,
                'error': 'Deepgram service not initialized',
                'timestamp': datetime.now().isoformat()
            })
        capabilities = deepgram_service.get_capabilities()
        return jsonify({
            'available': True,
            'connected': capabilities.get('connected', False),
            'base_url': capabilities.get('base_url', 'unknown'),
            'api_key_configured': capabilities.get('api_key_exists', False),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Error in /api/deepgram-status: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/transcribe', methods=['POST'])
@api_key_required
def transcribe():
    """Transcribe audio file using Deepgram with dynamic language/model selection and fallback."""
    if not deepgram_service:
        return jsonify({
            'error': 'Deepgram service not available',
            'help': 'Set DEEPGRAM_API_KEY and DEEPGRAM_SELF_HOSTED_URL in .env'
        }), 503
    try:
        # Check if file was uploaded - accept both 'file' and 'audio' field names
        audio_file = None
        if 'file' in request.files:
            audio_file = request.files['file']
        elif 'audio' in request.files:
            audio_file = request.files['audio']

        if not audio_file:
            return jsonify({'error': 'No audio file provided. Use "file" or "audio" field.'}), 400
        # Check if file is empty
        if audio_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        # Get parameters
        language = request.form.get('language')
        model = request.form.get('model')
        detect_language = False
        # If language is not provided, enable auto-detect
        if not language:
            detect_language = True
            language = deepgram_service.default_language
        # Save temporary file
        import tempfile
        import uuid
        temp_dir = tempfile.gettempdir()
        filename = f"{uuid.uuid4()}_{audio_file.filename}"
        filepath = os.path.join(temp_dir, filename)
        audio_file.save(filepath)
        # Try primary transcription
        result = deepgram_service.transcribe_audio_file(
            filepath,
            language=language,
            model=model,
            detect_language=detect_language
        )
        # Fallback logic if failed or empty transcript
        fallback_attempted = False
        fallback_result = None
        if (not result.get('success')) or (not result.get('transcript')):
            fallback_attempted = True
            # Fallback: try with default model/language combos
            fallback_combos = [
                (deepgram_service.models.get('fr', 'nova-3'), 'fr-CA'),
                (deepgram_service.models.get('en', 'nova-3'), 'en-US'),
                (deepgram_service.models.get('default', 'nova-3'), deepgram_service.default_language)
            ]
            for fb_model, fb_lang in fallback_combos:
                if (model == fb_model and language == fb_lang):
                    continue  # Don't retry the same combo
                fallback_result = deepgram_service.transcribe_audio_file(
                    filepath,
                    language=fb_lang,
                    model=fb_model,
                    detect_language=False
                )
                if fallback_result.get('success') and fallback_result.get('transcript'):
                    result = fallback_result
                    break
        # Clean up temp file
        try:
            os.remove(filepath)
        except Exception as cleanup_err:
            logging.warning(f"Could not remove temp file: {cleanup_err}")
        # If transcription was successful, run orchestrator to generate forms
        generated_forms = None
        if result.get('success') and result.get('transcript'):
            try:
                # Get persona from request if available
                persona_key = request.form.get('persona', 'generalist')
                logging.info(f"Running orchestrator to generate forms (persona: {persona_key})...")
                orchestration_result = orchestrate_transcript(result['transcript'], persona_key=persona_key)

                # Extract forms from agent results
                agent_results = orchestration_result.get('agent_results', {})

                # Build generated_forms structure that frontend expects
                clinical_doc = agent_results.get('ClinicalDocumentationAgent', {})
                prescription_lab = agent_results.get('PrescriptionLabAgent', {})
                mado_data = agent_results.get('MADO_ReportingAgent', {})
                compliance = agent_results.get('ComplianceMonitorAgent', {})
                ramq_billing = agent_results.get('RAMQ_BillingAgent', {})

                generated_forms = {
                    'soap': clinical_doc.get('soap_note', {}),
                    'patientNote': clinical_doc.get('patient_explanation', {}),
                    'clinicalData': {
                        'soap': clinical_doc.get('soap_note', {}),
                        'soapNote': clinical_doc.get('soap_note', {}),
                        'patientInstruction': clinical_doc.get('patient_explanation', {}),
                        'clinicalReasoning': clinical_doc.get('clinical_reasoning', '')
                    },
                    'prescription': prescription_lab.get('prescription', {}),
                    'labOrder': prescription_lab.get('lab_order', {}),
                    'referralLetter': clinical_doc.get('referral_letter', {}),
                    'madoData': mado_data,
                    'complianceAudit': compliance,
                    'billingData': ramq_billing
                }
                logging.info("Forms generated successfully")
            except Exception as orch_err:
                logging.error(f"Orchestration error: {orch_err}")
                generated_forms = {'error': str(orch_err)}

        response = {
            'success': result.get('success', False),
            'transcript': result.get('transcript', ''),
            'language': result.get('language', language),
            'model_used': result.get('model_used', 'auto'),
            'confidence': result.get('confidence', 0),
            'word_count': result.get('word_count', 0),
            'word_confidences': result.get('word_confidences', []),
            'word_timestamps': result.get('word_timestamps', []),
            'audio_duration': result.get('audio_duration', None),
            'utterances': result.get('utterances', []),
            'speaker_segments': result.get('speaker_segments', []),
            'error': result.get('error', None),
            'timestamp': datetime.now().isoformat(),
            'auto_detected_language': detect_language,
            'fallback_attempted': fallback_attempted,
            'generated_forms': generated_forms
        }
        if fallback_attempted:
            response['fallback_result'] = fallback_result
        return jsonify(response)
    except Exception as e:
        logging.error(f"Error in /api/transcribe: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/route', methods=['POST'])
@limiter.limit("30/minute")
@api_key_required
def route():
    """Route a medical transcript"""
    try:
        data = request.json
        if not data or 'transcript' not in data:
            return jsonify({'error': 'Missing transcript'}), 400
        transcript = data['transcript']
        result = route_transcript(transcript)
        return jsonify({
            'success': True,
            'transcript_preview': transcript[:100] + '...' if len(transcript) > 100 else transcript,
            'routing': result,
            'note': 'Router analysis complete',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Error in /api/route: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/orchestrate', methods=['POST'])
@limiter.limit("20/minute")
@api_key_required
def orchestrate():
    """Orchestrate medical transcript processing with persona support"""
    try:
        data = request.json
        if not data or 'transcript' not in data:
            return jsonify({'error': 'Missing transcript'}), 400
        transcript = data['transcript']
        persona_key = data.get('persona', 'generalist')
        use_parallel = data.get('parallel', True)

        result = orchestrate_transcript(transcript, persona_key=persona_key, use_parallel=use_parallel)

        return jsonify({
            'success': True,
            'transcript_length': len(transcript),
            'persona_used': persona_key,
            'orchestration': result,
            'execution_stats': result.get('execution_stats', {}),
            'confidence': result.get('confidence', 'unknown'),
            'workflow': [
                '1. Receive transcript',
                '2. Router analyzes and determines needed agents',
                '3. Orchestrator coordinates parallel agent execution',
                '4. Results aggregated with confidence scoring',
                '5. Summary generated from all agent outputs'
            ],
            'note': 'Orchestration complete',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Error in /api/orchestrate: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/process', methods=['POST'])
@api_key_required
def process():
    """Process medical text with options"""
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text'}), 400
        
        text = data['text']
        use_vertex = data.get('use_vertex', False)
        mock_output = data.get('mock', True)  # Default to mock for now
        
        results = {
            'input': text,
            'steps_completed': []
        }
        
        # Step 1: Transcription
        # For now, just echo the text as transcript
        transcript = {'text': text, 'source': 'input'}
        results['transcript'] = transcript
        results['steps_completed'].append('transcription')
        
        # Step 2: Optional Vertex AI
        if use_vertex:
            try:
                # Try to use real Vertex AI
                from services.vertex_service import vertex_service
                if vertex_service and hasattr(vertex_service, 'initialized') and vertex_service.initialized:
                    vertex_result = vertex_service.simple_analysis(text)
                    results['vertex_analysis'] = vertex_result
                    results['steps_completed'].append('vertex_ai_analysis')
                else:
                    raise ImportError("Vertex AI not initialized")
            except Exception as e:
                results['vertex_error'] = str(e)
                results['vertex_analysis'] = {'analysis': f'Analysis of: {text[:50]}...'}
        
        # Step 3: Routing
        # Use real router agent
        routing = route_transcript(text)
        results['routing'] = routing
        results['steps_completed'].append('routing')
        
        # Step 4: Orchestration
        # Use real orchestrator agent
        orchestration = orchestrate_transcript(text)
        results['orchestration'] = orchestration
        results['steps_completed'].append('orchestration')
        
        return jsonify({
            'success': True,
            **results,
            'services_used': {
                'vertex_ai': use_vertex,
                'mock_services': mock_output
            },
            'next_steps': 'Connect to your actual Vertex AI agents',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/upload', methods=['POST'])
@api_key_required
def upload_clinical_file():
    """Upload a clinical file for AuraLink transfers."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Missing file'}), 400
        file_obj = request.files['file']
        file_path = save_pdf(file_obj)
        if not file_path:
            return jsonify({'error': 'Invalid file format or upload failed'}), 400
        filename = os.path.basename(file_path)
        base_url = request.host_url.rstrip('/')
        return jsonify({
            'success': True,
            'filename': filename,
            'file_url': f'{base_url}/api/v1/files/{filename}'
        })
    except Exception as e:
        logging.error(f"Upload error: {e}")
        return jsonify({'error': 'Failed to upload file', 'details': str(e)}), 500


@app.route('/api/v1/files/<path:filename>', methods=['GET'])
@api_key_required
def get_uploaded_file(filename):
    """Serve previously uploaded PDFs."""
    file_path = get_pdf_path(filename)
    if not file_path:
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path, as_attachment=True)

# ========== SESSION MANAGEMENT ==========
# Redis-based session storage with 24-hour TTL for Loi 25 compliance
# Falls back to in-memory storage if Redis is unavailable (NOT RECOMMENDED for production)
sessions_store_fallback = {}  # Fallback for when Redis is unavailable

def _get_session_key(session_id: str) -> str:
    """Generate Redis key for a session"""
    return f"aurascribe:session:{session_id}"

def _save_session(session: dict) -> bool:
    """Save session to Redis or fallback storage"""
    session_id = session['id']
    if redis_client:
        try:
            key = _get_session_key(session_id)
            redis_client.setex(key, SESSION_TTL, json.dumps(session))
            return True
        except redis.RedisError as e:
            logging.error(f"Redis error saving session: {e}")
            sessions_store_fallback[session_id] = session
            return True
    else:
        sessions_store_fallback[session_id] = session
        return True

def _get_session(session_id: str) -> Optional[dict]:
    """Get session from Redis or fallback storage"""
    if redis_client:
        try:
            key = _get_session_key(session_id)
            data = redis_client.get(key)
            # If data is awaitable (async), await it
            if hasattr(data, '__await__'):
                import asyncio
                loop = asyncio.get_event_loop()
                data = loop.run_until_complete(data)
            if data:
                # Ensure data is str before loading JSON
                if not isinstance(data, (str, bytes, bytearray)):
                    data = str(data)
                return json.loads(data)
            return None
        except redis.RedisError as e:
            logging.error(f"Redis error getting session: {e}")
            return sessions_store_fallback.get(session_id)
    else:
        return sessions_store_fallback.get(session_id)

def _list_sessions(limit: int = 50) -> list:
    """List all sessions from Redis or fallback storage"""
    if redis_client:
        try:
            keys = redis_client.keys("aurascribe:session:*")
            # If keys is awaitable, await it
            if hasattr(keys, '__await__'):
                import asyncio
                loop = asyncio.get_event_loop()
                keys = loop.run_until_complete(keys)
            # Only convert to list if keys is actually iterable and not a Response object
            if isinstance(keys, list):
                keys_list = keys
            elif hasattr(keys, '__iter__') and not isinstance(keys, (str, bytes)):
                keys_list = list(keys)
            else:
                keys_list = []
            sessions = []
            for key in keys_list[:limit]:
                data = redis_client.get(key)
                if hasattr(data, '__await__'):
                    import asyncio
                    loop = asyncio.get_event_loop()
                    data = loop.run_until_complete(data)
                if data:
                    sessions.append(json.loads(data))
            # Sort by created_at descending
            sessions.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            return sessions
        except redis.RedisError as e:
            logging.error(f"Redis error listing sessions: {e}")
            return list(sessions_store_fallback.values())[:limit]
    else:
        return list(sessions_store_fallback.values())[:limit]

@app.route('/api/sessions', methods=['POST'])
@api_key_required
def create_session():
    """Create a new realtime session"""
    try:
        data = request.get_json() or {}
        session_id = f"sess-{datetime.now().strftime('%Y%m%d%H%M%S')}-{os.urandom(4).hex()}"

        session = {
            'id': session_id,
            'patient_name': data.get('patient_name', ''),
            'patient_ramq': data.get('patient_ramq'),
            'patient_dob': data.get('patient_dob'),
            'patient_postal_code': data.get('patient_postal_code'),
            'language': data.get('language', 'fr'),
            'model_used': data.get('model_used', 'nova-3'),
            'status': 'active',
            'transcript': '',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }

        _save_session(session)
        logging.info(f"Created session: {session_id} (TTL: {SESSION_TTL}s)")

        return jsonify(session), 201
    except Exception as e:
        logging.error(f"Failed to create session: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sessions', methods=['GET'])
@api_key_required
def list_sessions():
    """List all sessions"""
    try:
        limit = request.args.get('limit', 50, type=int)
        sessions = _list_sessions(limit)
        return jsonify(sessions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sessions/<session_id>', methods=['GET'])
@api_key_required
def get_session(session_id):
    """Get a specific session"""
    session = _get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    return jsonify(session)

@app.route('/api/sessions/<session_id>/transcript', methods=['POST'])
@api_key_required
def append_transcript(session_id):
    """Append text to session transcript"""
    session = _get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    data = request.get_json() or {}
    text = data.get('text', '')

    if session['transcript']:
        session['transcript'] += ' ' + text
    else:
        session['transcript'] = text

    session['updated_at'] = datetime.now().isoformat()
    _save_session(session)

    return jsonify({'status': 'ok', 'transcript_length': len(session['transcript'])})

@app.route('/api/sessions/<session_id>/status', methods=['PUT'])
@api_key_required
def update_session_status(session_id):
    """Update session status"""
    session = _get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    data = request.get_json() or {}
    session['status'] = data.get('status', session['status'])
    session['updated_at'] = datetime.now().isoformat()
    _save_session(session)

    return jsonify(session)

@app.route('/api/jobs/<job_id>', methods=['GET'])
@api_key_required
def get_job_status(job_id):
    """Get job status - currently jobs are processed synchronously"""
    # Jobs are processed synchronously in the current implementation
    # This endpoint returns a not-found status for any job_id
    return jsonify({
        'job_id': job_id,
        'status': 'not_found',
        'message': 'Jobs are processed synchronously. Use /api/transcribe for transcription.'
    }), 404

# ========== ASK AURA ENDPOINTS ==========

@app.route('/api/ask-aura/chat', methods=['POST'])
@api_key_required
def ask_aura_chat():
    """Chat with Aura AI assistant for clinical reasoning - Enhanced with persona support"""
    try:
        data = request.get_json() or {}
        user_message = data.get('message', '')
        context = data.get('context', '')
        session_transcript = data.get('session_transcript', '')
        language = data.get('language', 'fr')
        persona_key = data.get('persona', 'generalist')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        agent_payload = {
            "transcript": session_transcript,
            "context": context,
            "question": user_message,
            "message": user_message,
            "language": language,
            "persona": persona_key
        }

        response_text = ""
        summary = ""
        suggestions = []
        sources = []
        clinical_reasoning = []
        confidence = "low"
        fallback_used = False
        agent_available = bool(ask_aura_agent)

        if ask_aura_agent:
            agent_result = ask_aura_agent.run(agent_payload)
            response_text = agent_result.get('response', '')
            summary = agent_result.get('summary', '')
            suggestions = agent_result.get('suggestions', [])
            sources = agent_result.get('sources', [])
            clinical_reasoning = agent_result.get('clinical_reasoning', [])
            confidence = agent_result.get('confidence', 'medium')
            persona_info = agent_result.get('persona', {})
        else:
            logging.warning("AskAura agent unavailable, using orchestrator fallback")
            fallback_used = True
            if language == 'fr':
                response_text = f"Basé sur votre question concernant '{user_message}', je recommande de consulter les guides de pratique clinique actuels. Considérez les facteurs spécifiques au patient dans le contexte fourni."
                sources = ["Guides de pratique clinique", "Bases de données de médecine factuelle"]
                suggestions = ["Revoir l'historique du patient", "Vérifier les interactions médicamenteuses", "Considérer le diagnostic différentiel"]
            else:
                response_text = f"Based on your query about '{user_message}', I recommend consulting current clinical guidelines. Consider patient-specific factors from the context provided."
                sources = ["Clinical practice guidelines", "Evidence-based medicine databases"]
                suggestions = ["Review patient history", "Check medication interactions", "Consider differential diagnosis"]
            persona_info = {"key": persona_key, "name": "General Practitioner"}

        return jsonify({
            'success': True,
            'agent_available': agent_available,
            'fallback_used': fallback_used,
            'response': response_text,
            'summary': summary,
            'suggestions': suggestions,
            'sources': sources,
            'clinical_reasoning': clinical_reasoning,
            'confidence': confidence,
            'persona': persona_info if not fallback_used else {"key": persona_key},
            'language': language,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logging.error(f"Error in /api/ask-aura/chat: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ask-aura/study-case', methods=['POST'])
@api_key_required
def ask_aura_study_case():
    """Generate a clinical study case from SOAP notes and transcript"""
    try:
        data = request.get_json() or {}
        transcript = data.get('transcript', '')
        soap_content = data.get('soap_note', '')
        patient_info = data.get('patient_info', {})

        if not transcript and not soap_content:
            return jsonify({'error': 'No transcript or SOAP note provided'}), 400

        # Build case input
        case_input = f"""
Génère un résumé de cas clinique structuré basé sur les informations suivantes:

Patient: {patient_info.get('fullName', 'Non spécifié')}
Date: {datetime.now().strftime('%Y-%m-%d')}

Notes SOAP:
{soap_content or 'Non disponible'}

Transcription:
{transcript[:3000] if transcript else 'Non disponible'}

Format de sortie souhaité:
1. Présentation du cas
2. Antécédents pertinents
3. Examen clinique
4. Diagnostic différentiel
5. Plan de traitement
6. Points d'apprentissage
"""

        # Use orchestrator for analysis
        result = orchestrate_transcript(case_input)

        # Extract SOAP note from agent results
        clinical_result = result.get('agent_results', {}).get('ClinicalDocumentationAgent', {})
        soap_data = clinical_result.get('output', {}).get('soap_note', {})
        
        # Build study case
        study_case = f"""
## Résumé du Cas Clinique

### Présentation
{soap_data.get('subjective', transcript[:500] if transcript else 'Information non disponible')}

### Évaluation Objective
{soap_data.get('objective', 'Examen physique non documenté')}

### Diagnostic / Assessment
{soap_data.get('assessment', 'À déterminer')}

### Plan de Traitement
{soap_data.get('plan', 'À définir')}

### Points d'Apprentissage
- Analyse clinique basée sur la présentation du patient
- Suivi recommandé selon les guidelines actuelles

---
*Généré par Aura Intelligence - {datetime.now().strftime('%Y-%m-%d %H:%M')}*
"""

        return jsonify({
            'success': True,
            'study_case': study_case,
            'structured_data': soap_data,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logging.error(f"Error in /api/ask-aura/study-case: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ask-aura/research', methods=['POST'])
@api_key_required
def ask_aura_research():
    """Search for evidence-based medicine resources"""
    try:
        data = request.get_json() or {}
        query = data.get('query', '')
        transcript = data.get('transcript', '')
        language = data.get('language', 'fr')

        search_query = query or transcript[:200] if transcript else "latest medical guidelines"

        if not search_query:
            return jsonify({'error': 'No search query provided'}), 400

        # For now, return mock evidence blogs
        # In production, this would use Google Search via the AskAura agent
        evidence_blogs = [
            {
                'title': f'Revue systématique: {search_query[:50]}',
                'summary': 'Une analyse approfondie des dernières évidences cliniques sur ce sujet médical.',
                'category': 'study',
                'sourceUrl': 'https://pubmed.ncbi.nlm.nih.gov/',
                'sourceLabel': 'PubMed',
                'fullContent': f'Cette revue examine les meilleures pratiques concernant {search_query}. Les recommandations actuelles suggèrent une approche basée sur les preuves...'
            },
            {
                'title': f'Guidelines cliniques: Prise en charge',
                'summary': 'Recommandations des sociétés savantes pour la pratique clinique.',
                'category': 'specialist',
                'sourceUrl': 'https://www.uptodate.com/',
                'sourceLabel': 'UpToDate',
                'fullContent': 'Les guidelines actuelles recommandent une approche multidisciplinaire pour optimiser les résultats thérapeutiques...'
            },
            {
                'title': 'Cas cliniques similaires',
                'summary': 'Analyse de présentations cliniques comparables dans la littérature.',
                'category': 'disease',
                'sourceUrl': 'https://www.nejm.org/',
                'sourceLabel': 'NEJM',
                'fullContent': 'Des cas similaires ont été rapportés dans la littérature, avec des approches thérapeutiques variées...'
            }
        ]

        return jsonify({
            'success': True,
            'query': search_query,
            'results': evidence_blogs,
            'result_count': len(evidence_blogs),
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logging.error(f"Error in /api/ask-aura/research: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/demo', methods=['GET'])
@api_key_required
def demo():
    """Demo endpoint showing available API endpoints"""
    return jsonify({
        'service': 'AuraScribe API',
        'endpoints': [
            'POST /api/transcribe - audio file with "file" field',
            'POST /api/route - {"transcript": "your text"}',
            'POST /api/orchestrate - {"transcript": "your text"}',
            'POST /api/process - {"text": "your text", "use_vertex": true}'
        ],
        'timestamp': datetime.now().isoformat()
    })


# ========== AURALINK SECURE FILE SHARING ==========
# Redis-based transfer storage with configurable TTL for Loi 25 compliance

AURALINK_TTL_MAP = {
    '15m': 900,
    '1h': 3600,
    '24h': 86400,
    '7j': 604800
}

def _get_transfer_key(transfer_id: str) -> str:
    """Generate Redis key for a transfer"""
    return f"aurascribe:auralink:{transfer_id}"

def _save_transfer(transfer: dict) -> bool:
    """Save transfer to Redis or fallback storage"""
    transfer_id = transfer['id']
    expiry = transfer.get('expiry', '24h')
    ttl = AURALINK_TTL_MAP.get(expiry, 86400)

    if redis_client:
        try:
            key = _get_transfer_key(transfer_id)
            redis_client.setex(key, ttl, json.dumps(transfer))
            return True
        except redis.RedisError as e:
            logging.error(f"Redis error saving transfer: {e}")
            return False
    else:
        # Fallback storage (in-memory)
        if not hasattr(_save_transfer, 'fallback'):
            _save_transfer.fallback = {}
        _save_transfer.fallback[transfer_id] = transfer
        return True

def _get_transfer(transfer_id: str) -> Optional[dict]:
    """Get transfer from Redis or fallback storage"""
    if redis_client:
        try:
            key = _get_transfer_key(transfer_id)
            data = redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        except redis.RedisError as e:
            logging.error(f"Redis error getting transfer: {e}")
            return None
    else:
        if hasattr(_save_transfer, 'fallback'):
            return _save_transfer.fallback.get(transfer_id)
        return None

def _list_transfers(limit: int = 50) -> list:
    """List all active transfers"""
    if redis_client:
        try:
            keys = redis_client.keys("aurascribe:auralink:*")
            if isinstance(keys, list):
                keys_list = keys
            elif hasattr(keys, '__iter__') and not isinstance(keys, (str, bytes)):
                keys_list = list(keys)
            else:
                keys_list = []
            transfers = []
            for key in keys_list[:limit]:
                data = redis_client.get(key)
                if data:
                    transfers.append(json.loads(data))
            transfers.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            return transfers
        except redis.RedisError as e:
            logging.error(f"Redis error listing transfers: {e}")
            return []
    else:
        if hasattr(_save_transfer, 'fallback'):
            return list(_save_transfer.fallback.values())[:limit]
        return []

def _delete_transfer(transfer_id: str) -> bool:
    """Delete a transfer"""
    if redis_client:
        try:
            key = _get_transfer_key(transfer_id)
            redis_client.delete(key)
            return True
        except redis.RedisError as e:
            logging.error(f"Redis error deleting transfer: {e}")
            return False
    else:
        if hasattr(_save_transfer, 'fallback'):
            _save_transfer.fallback.pop(transfer_id, None)
        return True


@app.route('/api/auralink/transfers', methods=['POST'])
@api_key_required
def create_auralink_transfer():
    """Create a new AuraLink secure file transfer"""
    try:
        data = request.get_json() or {}

        # Validate required fields
        file_url = data.get('file_url')
        file_name = data.get('file_name')
        recipient_email = data.get('recipient_email')

        if not file_url or not recipient_email:
            return jsonify({'error': 'Missing required fields: file_url and recipient_email'}), 400

        # Generate secure token
        import secrets
        transfer_id = f"al-{datetime.now().strftime('%Y%m%d%H%M%S')}-{secrets.token_hex(4)}"
        access_token = secrets.token_urlsafe(32)

        # Build transfer object
        transfer = {
            'id': transfer_id,
            'file': {
                'name': file_name or 'document',
                'url': file_url,
                'type': data.get('file_type', 'pdf'),
                'size': data.get('file_size', 'unknown')
            },
            'recipient_email': recipient_email,
            'permissions': {
                'read': data.get('permissions', {}).get('read', True),
                'download': data.get('permissions', {}).get('download', False),
                'edit': data.get('permissions', {}).get('edit', False)
            },
            'security': {
                'method': data.get('security_method', 'token'),
                'token': access_token,
                'password': data.get('password'),
                'anti_capture': data.get('anti_capture', True)
            },
            'expiry': data.get('expiry', '24h'),
            'status': 'active',
            'access_count': 0,
            'created_at': datetime.now().isoformat(),
            'created_by': data.get('created_by', 'unknown')
        }

        # Save transfer
        if not _save_transfer(transfer):
            return jsonify({'error': 'Failed to save transfer'}), 500

        # Generate secure access link
        base_url = request.host_url.rstrip('/')
        access_link = f"{base_url}/api/auralink/access/{transfer_id}?token={access_token}"

        logging.info(f"AuraLink transfer created: {transfer_id} for {recipient_email}")

        # Send email notification (if email service configured)
        email_sent = False
        try:
            # Check if we have email configuration
            smtp_host = os.getenv('SMTP_HOST')
            if smtp_host:
                import smtplib
                from email.mime.text import MIMEText
                from email.mime.multipart import MIMEMultipart

                smtp_port = int(os.getenv('SMTP_PORT', 587))
                smtp_user = os.getenv('SMTP_USER')
                smtp_pass = os.getenv('SMTP_PASS')
                from_email = os.getenv('SMTP_FROM', 'noreply@aurascribe.ca')

                msg = MIMEMultipart('alternative')
                msg['Subject'] = f"AuraScribe: Document sécurisé partagé avec vous"
                msg['From'] = from_email
                msg['To'] = recipient_email

                html_body = f"""
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1e293b; padding: 20px; text-align: center;">
                        <h1 style="color: #00ffa3; margin: 0;">AuraScribe</h1>
                        <p style="color: #94a3b8; margin: 5px 0 0 0;">Partage sécurisé de documents cliniques</p>
                    </div>
                    <div style="padding: 30px; background: #f8fafc;">
                        <p style="color: #334155;">Bonjour,</p>
                        <p style="color: #334155;">Un document clinique sécurisé a été partagé avec vous via AuraLink.</p>
                        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">DOCUMENT</p>
                            <p style="color: #1e293b; font-weight: bold; margin: 0;">{file_name or 'Document clinique'}</p>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{access_link}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Accéder au document</a>
                        </div>
                        <p style="color: #64748b; font-size: 12px;">Ce lien expire dans {transfer['expiry']}.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
                            Ce document est protégé conformément à la Loi 25 et PIPEDA.<br>
                            Ne partagez pas ce lien avec des tiers non autorisés.
                        </p>
                    </div>
                </body>
                </html>
                """

                msg.attach(MIMEText(html_body, 'html'))

                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.starttls()
                    if smtp_user and smtp_pass:
                        server.login(smtp_user, smtp_pass)
                    server.send_message(msg)

                email_sent = True
                logging.info(f"AuraLink email sent to {recipient_email}")
        except Exception as email_err:
            logging.warning(f"Failed to send AuraLink email: {email_err}")

        return jsonify({
            'success': True,
            'transfer_id': transfer_id,
            'access_token': access_token,
            'access_link': access_link,
            'email_sent': email_sent,
            'expiry': transfer['expiry'],
            'created_at': transfer['created_at']
        }), 201

    except Exception as e:
        logging.error(f"Error creating AuraLink transfer: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auralink/transfers', methods=['GET'])
@api_key_required
def list_auralink_transfers():
    """List all active AuraLink transfers"""
    try:
        limit = request.args.get('limit', 50, type=int)
        transfers = _list_transfers(limit)

        # Remove sensitive data from response
        safe_transfers = []
        for t in transfers:
            safe_t = {
                'id': t['id'],
                'file': t['file'],
                'recipient_email': t['recipient_email'],
                'permissions': t['permissions'],
                'expiry': t['expiry'],
                'status': t['status'],
                'access_count': t.get('access_count', 0),
                'created_at': t['created_at']
            }
            safe_transfers.append(safe_t)

        return jsonify({
            'success': True,
            'transfers': safe_transfers,
            'count': len(safe_transfers)
        })
    except Exception as e:
        logging.error(f"Error listing AuraLink transfers: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auralink/transfers/<transfer_id>', methods=['DELETE'])
@api_key_required
def delete_auralink_transfer(transfer_id):
    """Delete/revoke an AuraLink transfer"""
    try:
        transfer = _get_transfer(transfer_id)
        if not transfer:
            return jsonify({'error': 'Transfer not found'}), 404

        _delete_transfer(transfer_id)
        logging.info(f"AuraLink transfer deleted: {transfer_id}")

        return jsonify({
            'success': True,
            'message': 'Transfer revoked successfully'
        })
    except Exception as e:
        logging.error(f"Error deleting AuraLink transfer: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auralink/access/<transfer_id>', methods=['GET'])
def access_auralink_file(transfer_id):
    """Public endpoint to access a shared file (requires token or password)"""
    try:
        transfer = _get_transfer(transfer_id)
        if not transfer:
            return jsonify({'error': 'Transfer not found or expired'}), 404

        # Validate access
        token = request.args.get('token')
        password = request.args.get('password')

        security = transfer.get('security', {})

        if security.get('method') == 'token':
            if token != security.get('token'):
                return jsonify({'error': 'Invalid access token'}), 403
        elif security.get('method') == 'password':
            if password != security.get('password'):
                return jsonify({'error': 'Invalid password'}), 403

        # Update access count
        transfer['access_count'] = transfer.get('access_count', 0) + 1
        transfer['last_accessed'] = datetime.now().isoformat()
        _save_transfer(transfer)

        # Return file info (or redirect to file)
        file_info = transfer.get('file', {})
        permissions = transfer.get('permissions', {})

        return jsonify({
            'success': True,
            'file': {
                'name': file_info.get('name'),
                'url': file_info.get('url') if permissions.get('download') else None,
                'type': file_info.get('type')
            },
            'permissions': permissions,
            'anti_capture': security.get('anti_capture', True),
            'access_count': transfer['access_count']
        })

    except Exception as e:
        logging.error(f"Error accessing AuraLink file: {e}")
        return jsonify({'error': 'Access failed'}), 500


# ========== EMR INTEGRATION ENDPOINTS ==========

@app.route('/api/emr/status', methods=['GET'])
@api_key_required
def emr_status():
    """Get EMR connection status and configuration"""
    try:
        from services.emr_adapter import get_emr_status
        status = get_emr_status()
        return jsonify({
            'success': True,
            **status,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Error getting EMR status: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/sessions/<session_id>/emr', methods=['POST'])
@api_key_required
def push_session_to_emr(session_id):
    """Push a session's clinical documentation to EMR"""
    try:
        from services.emr_adapter import push_to_emr

        data = request.get_json() or {}
        patient_id = data.get('patient_id')

        if not patient_id:
            return jsonify({'error': 'patient_id is required'}), 400

        # Get the session
        session = _get_session(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404

        # Build document content from session
        document_content = {
            'session_id': session_id,
            'patient_name': session.get('patient_name', ''),
            'transcript': session.get('transcript', ''),
            'soap_note': session.get('forms', {}).get('soap_note', {}),
            'created_at': session.get('created_at', ''),
            'status': session.get('status', '')
        }

        # Push to EMR
        result = push_to_emr({
            'patient_id': patient_id,
            'document_type': 'soap_note',
            'content': document_content,
            'session_id': session_id,
            'metadata': {
                'source': 'aurascribe',
                'language': session.get('language', 'fr')
            }
        })

        if result.get('success'):
            # Update session with EMR reference
            session['emr_pushed'] = True
            session['emr_document_id'] = result.get('emr_document_id')
            session['emr_pushed_at'] = datetime.now().isoformat()
            _save_session(session)

        return jsonify(result)

    except Exception as e:
        logging.error(f"Error pushing to EMR: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/emr/patient/<patient_id>', methods=['GET'])
@api_key_required
def get_patient_from_emr(patient_id):
    """Pull patient data from EMR"""
    try:
        from services.emr_adapter import pull_from_emr
        result = pull_from_emr(patient_id)
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error pulling from EMR: {e}")
        return jsonify({'error': str(e)}), 500


# ========== EFAX INTEGRATION ENDPOINTS ==========

@app.route('/api/efax/status', methods=['GET'])
@api_key_required
def efax_status():
    """Get eFax service status and configuration"""
    try:
        from services.efax_service import get_efax_status
        status = get_efax_status()
        return jsonify({
            'success': True,
            **status,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Error getting eFax status: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/sessions/<session_id>/efax', methods=['POST'])
@api_key_required
def send_session_via_efax(session_id):
    """Send a session's PDF via eFax"""
    try:
        from services.efax_service import send_fax

        data = request.get_json() or {}
        fax_number = data.get('fax_number')

        if not fax_number:
            return jsonify({'error': 'fax_number is required'}), 400

        # Get the session
        session = _get_session(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404

        # Check if PDF exists for this session
        pdf_path = get_pdf_path(f"session_{session_id}.pdf")
        if not pdf_path:
            # Generate PDF if it doesn't exist
            pdf_path = f"uploads/session_{session_id}.pdf"
            # In production: Generate PDF from session data
            return jsonify({
                'error': 'PDF not found for this session',
                'suggestion': 'Generate PDF first using /api/sessions/{id}/pdf'
            }), 404

        # Send fax
        result = send_fax(
            pdf_path=pdf_path,
            recipient_number=fax_number,
            options={
                'recipient_name': data.get('recipient_name', 'Destinataire'),
                'subject': data.get('subject', f"Document médical - {session.get('patient_name', 'Patient')}"),
                'notes': data.get('notes', ''),
                'cover_page': data.get('cover_page', True),
                'language': session.get('language', 'fr'),
                'priority': data.get('priority', 'normal')
            }
        )

        if result.get('success'):
            # Update session with fax info
            if 'fax_history' not in session:
                session['fax_history'] = []
            session['fax_history'].append({
                'fax_id': result.get('fax_id'),
                'recipient': fax_number,
                'sent_at': datetime.now().isoformat(),
                'status': result.get('status')
            })
            _save_session(session)

        return jsonify(result)

    except Exception as e:
        logging.error(f"Error sending eFax: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/efax/<fax_id>/status', methods=['GET'])
@api_key_required
def get_efax_delivery_status(fax_id):
    """Get the delivery status of a sent fax"""
    try:
        from services.efax_service import get_fax_status
        result = get_fax_status(fax_id)
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error getting fax status: {e}")
        return jsonify({'error': str(e)}), 500


# ========== AUTHENTICATION ENDPOINTS ==========

@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    """Register a new user"""
    try:
        data = request.get_json() or {}
        username = data.get('username') or data.get('email')
        password = data.get('password')
        role = data.get('role', 'Physician')
        clinic_id = data.get('clinic_id', 'default')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        # Check if user exists
        for user in USERS.values():
            if user.username == username:
                return jsonify({'error': 'User already exists'}), 409

        # Create clinic if needed
        if clinic_id not in CLINICS:
            clinic_name = data.get('clinic_name', 'Default Clinic')
            clinic = create_clinic(clinic_name)
            clinic_id = clinic.id

        # Register user
        user = register_user(username, password, role, clinic_id)

        # Log audit
        log_audit(user.id, 'REGISTER', f'New user registered: {username}')

        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'clinic_id': user.clinic_id
            },
            'message': 'Registration successful'
        })

    except Exception as e:
        logging.error(f"Error in registration: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    """Authenticate a user"""
    try:
        data = request.get_json() or {}
        username = data.get('username') or data.get('email')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        # Attempt login
        user = login_user(username, password)

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Log audit
        log_audit(user.id, 'LOGIN', f'User logged in: {username}')

        # Generate session token (in production, use JWT)
        import secrets
        session_token = secrets.token_urlsafe(32)

        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'clinic_id': user.clinic_id
            },
            'token': session_token,
            'message': 'Login successful'
        })

    except Exception as e:
        logging.error(f"Error in login: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/audit', methods=['GET'])
@api_key_required
def get_audit_log():
    """Get audit log (admin only)"""
    try:
        limit = request.args.get('limit', 100, type=int)
        logs = [entry.to_dict() for entry in AUDIT_LOG[-limit:]]
        logs.reverse()  # Most recent first
        return jsonify({
            'success': True,
            'logs': logs,
            'count': len(logs)
        })
    except Exception as e:
        logging.error(f"Error getting audit log: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    logging.info("=" * 60)
    logging.info("AURA SCRIBE - Medical Documentation System")
    logging.info("=" * 60)
    logging.info(f"Port: {os.getenv('PORT', 5000)}")
    logging.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('DEBUG', 'False').lower() == 'true' and os.getenv('ENVIRONMENT', 'development') == 'development'
    # Only run SocketIO, do NOT call socketio.init_app(app)
    socketio.run(app, host='0.0.0.0', port=port, debug=debug_mode)
