# Real-time dictation WebSocket endpoint (Flask-SocketIO)
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import logging
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import redis
import json
import os
import base64
import tempfile
import uuid

# Error handler for WebSocket events

def emit_error(message, code=None):
    error_payload = {'error': message}
    if code is not None:
        error_payload['code'] = code
    emit('error', error_payload)

# Create SocketIO instance for import by main.py
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading', logger=True, engineio_logger=True)

# Note: CORS and async_mode are configured in main.py via socketio.init_app()

# Get API key from environment
API_KEY = os.getenv('AURASCRIBE_API_KEY')

# Session management with Redis fallback
def get_redis_connection():
    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    try:
        client = redis.from_url(redis_url, decode_responses=True)
        client.ping()
        return client
    except:
        return None

redis_client = get_redis_connection()
local_sessions = {}  # Fallback storage

def save_session(session_id, data):
    try:
        if redis_client:
            redis_client.setex(f"ws_session:{session_id}", 3600, json.dumps(data))
        else:
            local_sessions[session_id] = data
    except Exception as e:
        local_sessions[session_id] = data

def get_session(session_id):
    try:
        if redis_client:
            data = redis_client.get(f"ws_session:{session_id}")
            return json.loads(data) if data else None
        else:
            return local_sessions.get(session_id)
    except:
        return local_sessions.get(session_id)

def delete_session(session_id):
    try:
        if redis_client:
            redis_client.delete(f"ws_session:{session_id}")
        local_sessions.pop(session_id, None)
    except:
        local_sessions.pop(session_id, None)

logger = logging.getLogger(__name__)

# Track active sessions
active_sessions = {}

# Allow toggling Google ID token enforcement for WebSocket connections
REQUIRE_WS_ID_TOKEN = os.getenv('REQUIRE_WS_ID_TOKEN', 'false').lower() in ('1', 'true')
logger.debug(f"WebSocket ID token enforcement: {REQUIRE_WS_ID_TOKEN}")

# Import Deepgram service
try:
    from services.deepgram_local_service import DeepgramLocalService
    deepgram_service = DeepgramLocalService()
    logger.info("WebSocket: Deepgram service loaded successfully")
except ImportError as e:
    logger.warning(f"WebSocket: Could not import Deepgram service: {e}")
    deepgram_service = None


@socketio.on('connect')
def handle_connect(auth=None):
    """Handle WebSocket connection with proper signature."""
    try:
        # Get the session ID from the request context
        sid = request.sid
        
        incoming_key = None
        if API_KEY:
            if auth and isinstance(auth, dict):
                incoming_key = auth.get('api_key')
            if not incoming_key:
                incoming_key = request.headers.get('X-API-KEY')
            if not incoming_key:
                auth_header = request.headers.get('Authorization', '')
                if auth_header.lower().startswith('bearer '):
                    incoming_key = auth_header.split(' ', 1)[1]
            
            if incoming_key != API_KEY:
                emit_error('Invalid API key', code=401)
                disconnect()
                return False

        token = None
        user_email = 'api-key-client'
        
        if auth and isinstance(auth, dict):
            token = auth.get('id_token')

        if token:
            try:
                idinfo = id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    '804651438822-tht7i2i5opqd0ea1vqcjtjekl1mvfgfl.apps.googleusercontent.com'
                )
                user_email = idinfo.get('email') or idinfo.get('sub') or user_email
            except Exception as e:
                logger.error(f"WebSocket OAuth2 verification failed: {e}")
                if REQUIRE_WS_ID_TOKEN:
                    emit_error('Invalid authentication', code=401)
                    disconnect()
                    return False
                logger.warning('Invalid id_token received; continuing with API key-only session')
        elif REQUIRE_WS_ID_TOKEN:
            emit_error('Authentication required', code=401)
            disconnect()
            return False
        else:
            logger.debug('WebSocket connected without Google id_token (REQUIRE_WS_ID_TOKEN=false)')

        # Initialize session data
        session_data = {
            'user_email': user_email,
            'audio_chunks': [],
            'language': 'fr-CA',
            'model': 'general-nova-3',
            'transcript_buffer': ''
        }
        save_session(sid, session_data)
        
        logger.info(f"WebSocket: Client connected - {sid}, user: {user_email}")
        emit('status', {
            'message': 'Connected to real-time dictation', 
            'session_id': sid, 
            'user_email': user_email
        })
        return True
        
    except Exception as e:
        logger.error(f"WebSocket connect error: {e}")
        emit_error(str(e))
        return False


@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection with proper signature."""
    try:
        sid = request.sid
        delete_session(sid)
        logger.info(f"WebSocket: Client disconnected - {sid}")
    except Exception as e:
        logger.error(f"WebSocket disconnect error: {e}")


@socketio.on('start_recording')
def handle_start_recording(data):
    """Handle start recording with proper signature."""
    try:
        sid = request.sid
        session_data = get_session(sid) or {'audio_chunks': [], 'transcript_buffer': ''}
        session_data.update({
            'language': data.get('language', 'fr-CA'),
            'model': data.get('model', 'general-nova-3'),
            'audio_chunks': [],
            'transcript_buffer': ''
        })
        save_session(sid, session_data)
        
        logger.info(f"WebSocket: Recording started - {sid}, lang={data.get('language')}")
        emit('recording_started', {'status': 'ok', 'session_id': sid})
    except Exception as e:
        logger.error(f"WebSocket start_recording error: {e}")
        emit_error(str(e))


@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    """Handle audio chunk with proper signature."""
    try:
        sid = request.sid
        session_data = get_session(sid)
        if not session_data:
            emit('error', {'message': 'Session not initialized. Call start_recording first.'})
            return

        audio_b64 = data.get('audio', '')
        is_final = data.get('is_final', False)
        
        if not audio_b64:
            emit('error', {'message': 'No audio data received'})
            return

        try:
            audio_bytes = base64.b64decode(audio_b64)
            session_data['audio_chunks'].append(audio_bytes.hex())  # Store as hex string for JSON
            
            chunk_count = len(session_data['audio_chunks'])
            # Process more frequently for better real-time performance (every 2-3 chunks)
            should_transcribe = is_final or (chunk_count % 3 == 0 and chunk_count > 0)
            
            if should_transcribe and deepgram_service:
                # Combine all audio chunks
                combined_audio = b''.join([bytes.fromhex(chunk) for chunk in session_data['audio_chunks']])
                
                # Save to temporary file
                temp_dir = tempfile.gettempdir()
                temp_filename = f"ws_audio_{uuid.uuid4()}.webm"
                temp_path = os.path.join(temp_dir, temp_filename)
                
                with open(temp_path, 'wb') as f:
                    f.write(combined_audio)

                try:
                    result = deepgram_service.transcribe_audio_file(
                        temp_path,
                        language=session_data.get('language', 'fr-CA'),
                        model=session_data.get('model', 'general-nova-3')
                    )
                    
                    if result.get('success') and result.get('transcript'):
                        transcript = result['transcript']
                        session_data['transcript_buffer'] = transcript
                        
                        emit('transcript_update', {
                            'transcript': transcript,
                            'is_final': is_final,
                            'confidence': result.get('confidence', 0),
                            'word_count': result.get('word_count', 0),
                            'speaker_segments': result.get('speaker_segments', [])
                        })
                        
                        logger.debug(f"WebSocket: Transcribed {len(transcript)} chars for {sid}, confidence: {result.get('confidence', 0)}")
                    else:
                        # Fallback to previous transcript if available
                        if session_data['transcript_buffer']:
                            emit('transcript_update', {
                                'transcript': session_data['transcript_buffer'],
                                'is_final': False,
                                'error': result.get('error', 'Transcription failed')
                            })
                finally:
                    # Clean up temporary file
                    try:
                        os.remove(temp_path)
                    except:
                        pass
            else:
                emit('chunk_received', {'chunk_number': chunk_count})
            
            save_session(sid, session_data)
            
        except Exception as decode_error:
            logger.error(f"WebSocket: Audio decode error - {decode_error}")
            emit('error', {'message': 'Invalid audio data format'})
            
    except Exception as e:
        logger.error(f"WebSocket audio_chunk error: {e}")
        emit_error(str(e))


@socketio.on('stop_recording')
def handle_stop_recording(data=None):
    """Handle stop recording with proper signature."""
    try:
        sid = request.sid
        session_data = get_session(sid)
        if not session_data:
            emit('error', {'message': 'No active session'})
            return

        if session_data['audio_chunks'] and deepgram_service:
            # Process final audio
            combined_audio = b''.join([bytes.fromhex(chunk) for chunk in session_data['audio_chunks']])
            temp_dir = tempfile.gettempdir()
            temp_filename = f"ws_final_{uuid.uuid4()}.webm"
            temp_path = os.path.join(temp_dir, temp_filename)
            
            with open(temp_path, 'wb') as f:
                f.write(combined_audio)

            try:
                result = deepgram_service.transcribe_audio_file(
                    temp_path,
                    language=session_data.get('language', 'fr-CA'),
                    model=session_data.get('model', 'general-nova-3')
                )
                
                final_transcript = result.get('transcript', session_data['transcript_buffer'])
                
                emit('recording_stopped', {
                    'status': 'ok',
                    'final_transcript': final_transcript,
                    'success': result.get('success', False),
                    'confidence': result.get('confidence', 0),
                    'word_count': result.get('word_count', 0),
                    'audio_duration': result.get('audio_duration'),
                    'speaker_segments': result.get('speaker_segments', [])
                })
                
                logger.info(f"WebSocket: Recording stopped - {sid}, transcript length: {len(final_transcript)}")
            finally:
                try:
                    os.remove(temp_path)
                except:
                    pass
        else:
            emit('recording_stopped', {
                'status': 'ok',
                'final_transcript': session_data.get('transcript_buffer', ''),
                'message': 'No audio data or Deepgram unavailable'
            })

        # Clean up session
        session_data['audio_chunks'] = []
        save_session(sid, session_data)
        
    except Exception as e:
        logger.error(f"WebSocket stop_recording error: {e}")
        emit_error(str(e))


@socketio.on('get_status')
def handle_get_status(data=None):
    """Handle get status with proper signature."""
    try:
        sid = request.sid
        session_data = get_session(sid) or {}
        
        emit('status', {
            'session_id': sid,
            'active': bool(session_data),
            'chunk_count': len(session_data.get('audio_chunks', [])),
            'current_transcript': session_data.get('transcript_buffer', ''),
            'deepgram_available': deepgram_service is not None
        })
    except Exception as e:
        logger.error(f"WebSocket get_status error: {e}")
        emit_error(str(e))
