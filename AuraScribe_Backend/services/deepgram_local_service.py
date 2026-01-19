"""
deepgram_local_service.py
Updated for correct model names available on your server
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
        # Your Deepgram self-hosted instance - use internal Docker network address
        self.base_url = os.getenv('DEEPGRAM_SELF_HOSTED_URL', 'http://172.17.0.1:8080').rstrip('/')
        self.api_key = os.getenv('DEEPGRAM_API_KEY', '1e7b06318100c48315a6e638b18e86b54263a4a1')
        
        # Model configurations - FORCE ALL TO general-nova-3 for compatibility
        # Based on server logs showing: general-nova-3 works reliably
        self.models = {
            'en': 'general-nova-3',
            'fr': 'general-nova-3', 
            'es': 'general-nova-3',
            'default': 'general-nova-3'
        }
        
        # Model aliases - ALL map to general-nova-3 for compatibility
        self.model_aliases = {
            'nova-3': 'general-nova-3',
            'nova-2': 'general-nova-3', 
            'general': 'general-nova-3',
            '2-general': 'general-nova-3',
            'general-nova': 'general-nova-3',
            'medical': 'general-nova-3',
            'nova-2-medical': 'general-nova-3',
            'enhanced': 'general-nova-3',
            'base': 'general-nova-3'
        }
        
        # Default settings
        self.default_language = os.getenv('DEEPGRAM_DEFAULT_LANGUAGE', 'fr-CA')
        self.smart_format = os.getenv('DEEPGRAM_SMART_FORMAT', 'true').lower() == 'true'
        
        # Headers - try without API key for self-hosted instance
        self.headers = {
            'Content-Type': 'application/octet-stream'
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
    
    def get_model_for_language(self, language: str, requested_model: str = None) -> str:
        """Get appropriate model for language with fallback to available models"""
        
        # First try to map requested model to available model
        if requested_model and requested_model in self.model_aliases:
            return self.model_aliases[requested_model]
        
        # Otherwise use language-based mapping
        language_code = language.lower().split('-')[0]  # Convert 'en-US' to 'en'
        return self.models.get(language_code, self.models['default'])
    
    def get_safe_language_model_combo(self, language: str, model: str) -> Tuple[str, str]:
        """Get a safe language/model combination that works on your server"""

        # Map model to available models
        actual_model = self.get_model_for_language(language, model)

        # Simplify language codes to most supported versions (lowercase for Deepgram)
        language_lower = language.lower()
        if language_lower.startswith('fr'):
            safe_language = 'fr-ca'
        elif language_lower.startswith('en'):
            safe_language = 'en-us'
        else:
            safe_language = 'fr-ca'  # Default fallback

        return safe_language, actual_model
    
    def transcribe_audio_file(self, audio_file_path: str, **kwargs) -> Dict[str, Any]:
        """
        Transcribe audio file using your Deepgram instance with fallback logic
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
        Transcribe raw audio data with robust fallback logic for your server
        """
        original_language = kwargs.get('language', self.default_language)
        original_model = kwargs.get('model', 'general-nova-3')
        
        # Get safe language/model combination
        safe_language, safe_model = self.get_safe_language_model_combo(original_language, original_model)
        
        smart_format = kwargs.get('smart_format', self.smart_format)
        punctuate = kwargs.get('punctuate', True)
        utterances = kwargs.get('utterances', True)
        diarize = kwargs.get('diarize', True)
        detect_language = kwargs.get('detect_language', False)

        # Build parameters for the API call - simplified for self-hosted
        params = {
            'model': safe_model,
            'punctuate': str(punctuate).lower(),
            'detect_language': 'false'  # Disable auto-detect for reliability
        }
        
        # Only add language if not detecting
        if not detect_language:
            params['language'] = safe_language

        def try_transcribe(params_dict):
            try:
                url = f"{self.base_url}/v1/listen"
                
                # Log the exact parameters being used
                logger.info(f"Transcribing with params: {params_dict}")
                
                response = requests.post(
                    url,
                    params=params_dict,
                    data=audio_data,
                    headers=self.headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return self._parse_deepgram_response(result, safe_model)
                else:
                    error_text = response.text
                    try:
                        error_json = response.json()
                        error_text = json.dumps(error_json)
                    except:
                        pass
                    
                    logger.error(f"Deepgram error {response.status_code}: {error_text}")
                    return self._error_response(f"Deepgram error {response.status_code}: {error_text}")
                    
            except requests.exceptions.Timeout:
                return self._error_response("Request timeout")
            except requests.exceptions.RequestException as e:
                return self._error_response(f"Network error: {str(e)}")
            except Exception as e:
                return self._error_response(f"Unexpected error: {str(e)}")

        # Try the safe combination first
        result = try_transcribe(params)
        if result.get('success'):
            return result
        
        # If that failed, try some fallback combinations (lowercase for Deepgram)
        fallback_combinations = [
            {'model': 'general-nova-3', 'language': 'fr-ca'},
            {'model': 'general-nova-3', 'language': 'en-us'},
            {'model': '2-general-nova', 'language': 'fr-ca'},
        ]
        
        for fallback in fallback_combinations:
            if (fallback['model'] == safe_model and 
                fallback['language'] == safe_language):
                continue  # Skip if already tried
                
            fallback_params = params.copy()
            fallback_params.update(fallback)
            
            logger.info(f"Trying fallback: {fallback}")
            fallback_result = try_transcribe(fallback_params)
            
            if fallback_result.get('success'):
                logger.info("Fallback succeeded")
                return fallback_result
        
        # If all attempts failed, return the original error
        return result

    def _parse_deepgram_response(self, response: Dict[str, Any], model_used: str = "unknown") -> Dict[str, Any]:
        """Parse Deepgram API response"""
        try:
            results = response.get('results', {})
            channels = results.get('channels', [])
            
            if not channels:
                return self._error_response("No transcription channels found")
            
            channel = channels[0]
            alternatives = channel.get('alternatives', [])
            
            if not alternatives:
                return self._error_response("No transcription alternatives found")
            
            alternative = alternatives[0]
            transcript = alternative.get('transcript', '').strip()
            confidence = alternative.get('confidence', 0.0)
            
            # Extract words and their timestamps/confidence
            words = alternative.get('words', [])
            word_confidences = [word.get('confidence', 0.0) for word in words]
            word_timestamps = [
                {
                    'word': word.get('word', ''),
                    'start': word.get('start', 0.0),
                    'end': word.get('end', 0.0),
                    'confidence': word.get('confidence', 0.0)
                }
                for word in words
            ]
            
            # Extract utterances and speaker information
            utterances = []
            speaker_segments = []
            
            for utterance in channel.get('utterances', []):
                utterance_data = {
                    'start': utterance.get('start', 0.0),
                    'end': utterance.get('end', 0.0),
                    'transcript': utterance.get('transcript', ''),
                    'confidence': utterance.get('confidence', 0.0),
                    'speaker': utterance.get('speaker', 0)
                }
                utterances.append(utterance_data)
                
                speaker_segments.append({
                    'speaker': utterance.get('speaker', 0),
                    'start': utterance.get('start', 0.0),
                    'end': utterance.get('end', 0.0),
                    'text': utterance.get('transcript', '')
                })
            
            # Calculate audio duration from metadata
            metadata = results.get('metadata', {})
            audio_duration = metadata.get('duration')
            
            return {
                'success': True,
                'transcript': transcript,
                'confidence': confidence,
                'word_count': len(words),
                'word_confidences': word_confidences,
                'word_timestamps': word_timestamps,
                'utterances': utterances,
                'speaker_segments': speaker_segments,
                'audio_duration': audio_duration,
                'model_used': model_used,
                'language': results.get('language', 'unknown')
            }
            
        except Exception as e:
            return self._error_response(f"Response parsing error: {str(e)}")

    def _error_response(self, error_message: str) -> Dict[str, Any]:
        """Generate standardized error response"""
        return {
            'success': False,
            'error': error_message,
            'transcript': '',
            'confidence': 0,
            'word_count': 0,
            'word_confidences': [],
            'word_timestamps': [],
            'utterances': [],
            'speaker_segments': [],
            'audio_duration': None,
            'timestamp': datetime.now().isoformat()
        }

    def get_capabilities(self) -> Dict[str, Any]:
        """Get service capabilities and status"""
        connected, status = self.connection_status
        return {
            'connected': connected,
            'status': status,
            'base_url': self.base_url,
            'api_key_exists': bool(self.api_key),
            'available_models': list(self.model_aliases.keys()),
            'server_models': ['general-nova-3', '2-general-nova'],
            'supported_languages': ['fr-CA', 'en-US'],
            'default_language': self.default_language
        }