"""
deepgram_local_service.py
Fixed for your specific Deepgram self-hosted instance
"""

import os
import requests
import logging
from typing import Optional, Dict, Any, Tuple
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class DeepgramLocalService:
    def __init__(self):
        """
        Initialize with your specific Deepgram configuration
        """
        # Your Deepgram self-hosted instance
        self.base_url = os.getenv('DEEPGRAM_SELF_HOSTED_URL', 'http://34.19.193.244:8080').rstrip('/')
        self.api_key = os.getenv('DEEPGRAM_API_KEY', '1e7b06318100c48315a6e638b18e86b54263a4a1')
        
        # Model configurations - UPDATED WITH CORRECT MODEL NAMES
        self.models = {
            'en': os.getenv('DEEPGRAM_EN_MODEL', 'nova-3'),
            'fr': os.getenv('DEEPGRAM_FR_MODEL', 'nova-3'),
            'default': os.getenv('DEEPGRAM_DEFAULT_MODEL', 'nova-3')
        }
        
        # Default settings
        self.default_language = os.getenv('DEEPGRAM_DEFAULT_LANGUAGE', 'fr-CA')
        self.smart_format = os.getenv('DEEPGRAM_SMART_FORMAT', 'true').lower() == 'true'
        
        # Headers
        self.headers = {
            'Content-Type': 'application/octet-stream',
            'Authorization': f'Token {self.api_key}'
        }
        
        logger.info(f"Initializing Deepgram self-hosted at: {self.base_url}")
        logger.info(f"Available models from instance: general-nova-3, 2-general-nova")
        logger.info(f"Using model mapping: {self.models}")
        
        # Test connection on init
        self.connection_status = self.test_connection()
    
    def test_connection(self) -> Tuple[bool, str]:
        """Test connection to your Deepgram instance"""
        try:
            # Try multiple endpoints
            endpoints_to_test = [
                '/v1/listen',  # Main endpoint
                '/v1/health',
                '/v1/projects',
                ''  # Base URL
            ]
            
            for endpoint in endpoints_to_test:
                url = f"{self.base_url}{endpoint}" if endpoint else self.base_url
                try:
                    # For /v1/listen, use a HEAD request to test without actually transcribing
                    if endpoint == '/v1/listen':
                        response = requests.head(
                            url, 
                            headers=self.headers, 
                            timeout=10
                        )
                    else:
                        response = requests.get(
                            url, 
                            headers=self.headers, 
                            timeout=10
                        )
                    
                    if response.status_code < 400:  # 2xx or 3xx
                        logger.info(f"✅ Connected to {url}")
                        return True, f"Connected to {endpoint if endpoint else 'base URL'}"
                        
                except requests.exceptions.RequestException as e:
                    logger.debug(f"Endpoint {endpoint} not accessible: {e}")
            
            return False, "Could not connect to any Deepgram endpoints"
            
        except Exception as e:
            logger.error(f"Connection test error: {e}")
            return False, str(e)
    
    def get_model_for_language(self, language: str) -> str:
        """Get appropriate model for language"""
        language = language.lower().split('-')[0]  # Convert 'en-US' to 'en'
        
        # Map to correct model names based on your instance
        if language == 'fr':
            return self.models.get('fr', 'general-nova-3')
        elif language == 'en':
            return self.models.get('en', 'general-nova-3')
        else:
            return self.models.get('default', 'general-nova-3')
    
    def transcribe_audio_file(self, audio_file_path: str, **kwargs) -> Dict[str, Any]:
        """
        Transcribe audio file using your Deepgram instance
        """
        try:
            # Read audio file
            with open(audio_file_path, 'rb') as audio_file:
                audio_data = audio_file.read()
            
            return self.transcribe_audio_data(audio_data, **kwargs)
            
        except FileNotFoundError:
            return self._error_response(f"File not found: {audio_file_path}")
        except Exception as e:
            return self._error_response(f"File error: {str(e)}")
    
    def transcribe_audio_data(self, audio_data: bytes, **kwargs) -> Dict[str, Any]:
        """
        Transcribe raw audio data with dynamic language/model selection and fallback logic
        """
        language = kwargs.get('language', self.default_language)
        model = kwargs.get('model')
        smart_format = kwargs.get('smart_format', self.smart_format)
        punctuate = kwargs.get('punctuate', True)
        utterances = kwargs.get('utterances', True)
        diarize = kwargs.get('diarize', True)  # Enable speaker diarization by default
        detect_language = kwargs.get('detect_language', False)

        # If no model specified, use appropriate one for language
        if not model:
            model = self.get_model_for_language(language)

        # Clean up model name
        if model.endswith('.en') or model.endswith('.fr'):
            model = model.rsplit('.', 1)[0]

        params = {
            'model': model,
            'smart_format': str(smart_format).lower(),
            'punctuate': str(punctuate).lower(),
            'utterances': str(utterances).lower(),
            'diarize': str(diarize).lower(),
            'detect_language': 'true' if detect_language else 'false',
            'language': language if not detect_language else None
        }
        params = {k: v for k, v in params.items() if v is not None}

        def try_transcribe(params, model, language):
            try:
                url = f"{self.base_url}/v1/listen"
                logger.info(f"Transcribing with params: {params}")
                response = requests.post(
                    url,
                    headers=self.headers,
                    params=params,
                    data=audio_data,
                    timeout=60
                )
                if response.status_code == 200:
                    result = response.json()
                    return self._format_response(result, model, language)
                else:
                    error_msg = f"Deepgram error {response.status_code}"
                    try:
                        error_detail = response.json()
                        error_msg += f": {json.dumps(error_detail)}"
                    except:
                        error_msg += f": {response.text[:200]}"
                    logger.error(error_msg)
                    return self._error_response(error_msg)
            except requests.exceptions.Timeout:
                return self._error_response("Deepgram timeout - server took too long to respond")
            except requests.exceptions.ConnectionError as e:
                return self._error_response(f"Cannot connect to Deepgram at {self.base_url}: {str(e)}")
            except Exception as e:
                return self._error_response(f"Transcription error: {str(e)}")

        # Try primary
        result = try_transcribe(params, model, language)

        # Fallback logic if failed or empty transcript
        if (not result.get('success')) or (not result.get('transcript')):
            fallback_combos = [
                (self.models.get('fr', 'nova-3'), 'fr-CA'),
                (self.models.get('en', 'nova-3'), 'en-US'),
                (self.models.get('default', 'nova-3'), self.default_language)
            ]
            for fb_model, fb_lang in fallback_combos:
                if (model == fb_model and language == fb_lang):
                    continue
                fb_params = params.copy()
                fb_params['model'] = fb_model
                fb_params['language'] = fb_lang
                fb_params['detect_language'] = 'false'
                fb_result = try_transcribe(fb_params, fb_model, fb_lang)
                if fb_result.get('success') and fb_result.get('transcript'):
                    return fb_result
        return result
    
    def _format_response(self, result: Dict, model: str, language: str) -> Dict[str, Any]:
        """Format Deepgram response with quality metrics and speaker diarization"""
        try:
            transcript = ""
            confidence = 0.0
            word_count = 0
            word_confidences = []
            word_timestamps = []
            audio_duration = None
            speaker_segments = []

            # Extract transcript, confidence, and word-level metrics
            if 'results' in result and 'channels' in result['results']:
                for channel in result['results']['channels']:
                    for alternative in channel.get('alternatives', []):
                        if 'transcript' in alternative:
                            transcript += alternative['transcript'] + " "
                        if 'confidence' in alternative:
                            confidence = max(confidence, alternative['confidence'])
                        if 'words' in alternative:
                            word_count += len(alternative['words'])
                            for word in alternative['words']:
                                word_confidences.append(word.get('confidence'))
                                word_timestamps.append({
                                    'word': word.get('word'),
                                    'start': word.get('start'),
                                    'end': word.get('end'),
                                    'confidence': word.get('confidence')
                                })

            transcript = transcript.strip()

            # Extract utterances if available
            utterances = result.get('results', {}).get('utterances', [])

            # Extract audio duration if available
            audio_duration = result.get('metadata', {}).get('duration')

            # Speaker diarization: extract speaker segments if available
            if utterances:
                for utt in utterances:
                    speaker_segments.append({
                        'speaker': utt.get('speaker'),
                        'start': utt.get('start'),
                        'end': utt.get('end'),
                        'transcript': utt.get('transcript')
                    })

            # Detect language if provided
            detected_language = result.get('results', {}).get('language', language)

            return {
                'success': True,
                'transcript': transcript,
                'confidence': confidence,
                'word_count': word_count,
                'model_used': model,
                'language': detected_language,
                'utterances': utterances,
                'word_confidences': word_confidences,
                'word_timestamps': word_timestamps,
                'audio_duration': audio_duration,
                'speaker_segments': speaker_segments,
                'raw_response': result,
                'source': 'deepgram_self_hosted',
                'server': self.base_url,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Format error: {e}")
            return self._error_response(f"Response format error: {str(e)}")
    
    def _error_response(self, error_msg: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            'success': False,
            'error': error_msg,
            'transcript': '',
            'source': 'deepgram_self_hosted',
            'server': self.base_url,
            'connection_status': self.connection_status[0],
            'timestamp': datetime.now().isoformat()
        }
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get Deepgram server capabilities"""
        try:
            # Try to get available models
            url = f"{self.base_url}/v1/models"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            models = []
            if response.status_code == 200:
                try:
                    models_data = response.json()
                    if isinstance(models_data, list):
                        models = [model.get('name', 'unknown') for model in models_data]
                except:
                    pass
            
            capabilities = {
                'connected': self.connection_status[0],
                'connection_message': self.connection_status[1],
                'base_url': self.base_url,
                'models_available': list(set(models)) if models else ['general-nova-3', '2-general-nova'],
                'default_language': self.default_language,
                'api_key_exists': bool(self.api_key and self.api_key != '1e7b06318100c48315a6e638b18e86b54263a4a1')
            }
            
            return capabilities
            
        except Exception as e:
            return {
                'connected': False,
                'error': str(e),
                'base_url': self.base_url,
                'models_available': ['general-nova-3', '2-general-nova']  # Based on your curl output
            }

# Create instance
deepgram_local = DeepgramLocalService()