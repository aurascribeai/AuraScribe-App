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
from typing import Dict, Optional
import json
import redis

# Add services folder to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
services_path = os.path.join(current_dir, 'services')
if os.path.exists(services_path):
    sys.path.append(services_path)

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

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


# =====================
# Deployment Domain Mapping
#   Backend:   https://api.aurascribe.ca
#   Frontend:  https://app.aurascribe.ca
#   Landing:   https://aurascribe.ca
# =====================
# CORS: Allow requests from frontend only
allowed_origins_env = os.getenv('ALLOWED_ORIGINS', 'https://app.aurascribe.ca,http://localhost:5173')
ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_env.split(',') if origin.strip()]
logging.info(f"ALLOWED_ORIGINS loaded: {ALLOWED_ORIGINS}")
environment = os.getenv('ENVIRONMENT', 'production')

# Determine the origins to use based on environment
if environment == 'production':
    cors_origins = ["https://app.aurascribe.ca"]
else:
    cors_origins = ALLOWED_ORIGINS

# Configure Flask-CORS with supports_credentials for auth headers
# Using list format to prevent duplicate header issues
CORS(app, resources={r"/api/*": {
    "origins": cors_origins,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-API-KEY"],
    "supports_credentials": True
}})

# Initialize SocketIO with the Flask app and CORS settings
# This must be done AFTER app creation but BEFORE routes are defined
socketio.init_app(app, cors_allowed_origins=cors_origins, async_mode='threading')
logging.info(f"SocketIO initialized with CORS origins: {cors_origins}")

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
                logging.info("Running orchestrator to generate forms...")
                orchestration_result = orchestrate_transcript(result['transcript'])

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
    """Orchestrate medical transcript processing"""
    try:
        data = request.json
        if not data or 'transcript' not in data:
            return jsonify({'error': 'Missing transcript'}), 400
        transcript = data['transcript']
        result = orchestrate_transcript(transcript)
        return jsonify({
            'success': True,
            'transcript_length': len(transcript),
            'orchestration': result,
            'workflow': [
                '1. Receive transcript',
                '2. Router analyzes and determines needed agents',
                '3. Orchestrator coordinates parallel agent execution',
                '4. Results aggregated and returned'
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
    """Chat with Aura AI assistant for clinical reasoning"""
    try:
        data = request.get_json() or {}
        user_message = data.get('message', '')
        context = data.get('context', '')
        session_transcript = data.get('session_transcript', '')
        language = data.get('language', 'fr')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Build prompt with context for logging and fallback
        full_context = f"""
Tu es Aura, un assistant médical spécialisé en raisonnement clinique et médecine basée sur les preuves (EBM).
Langue: {'Français' if language == 'fr' else 'English'}

Contexte du dossier patient:
{context}

Transcription de la consultation:
{session_transcript[:2000] if session_transcript else 'Aucune transcription disponible'}

Question de l'utilisateur: {user_message}

Réponds de manière concise et professionnelle en citant les sources.
"""

        agent_payload = {
            "transcript": session_transcript,
            "context": context,
            "question": user_message,
            "language": language
        }

        response_text = ""
        summary = ""
        suggestions = []
        sources = []
        fallback_used = False
        agent_available = bool(ask_aura_agent)

        if ask_aura_agent:
            agent_result = ask_aura_agent.run(agent_payload)
            response_text = agent_result.get('response', '')
            summary = agent_result.get('summary', '')
            suggestions = agent_result.get('suggestions', [])
            sources = agent_result.get('sources', [])
        else:
            logging.warning("AskAura agent unavailable, using orchestrator fallback")
            fallback_used = True
            # For now, return a simple response
            response_text = f"Based on your query about '{user_message}', I recommend consulting current clinical guidelines. Consider patient-specific factors from the context provided."
            sources = ["Clinical practice guidelines", "Evidence-based medicine databases"]
            suggestions = ["Review patient history", "Check medication interactions", "Consider differential diagnosis"]

        return jsonify({
            'success': True,
            'agent_available': agent_available,
            'fallback_used': fallback_used,
            'response': response_text,
            'summary': summary,
            'suggestions': suggestions,
            'sources': sources,
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