import requests
import json
from typing import Dict, Any

class DeepgramFixedService:
    def __init__(self):
        self.base_url = "http://34.19.193.244:8080"
        self.api_key = "1e7b06318100c48315a6e638b18e86b54263a4a1"
        
        # Map language to specific model UUIDs
        self.model_map = {
            # French models
            'fr': {
                'model': 'general-nova-3',
                'uuid': 'f351c28f-fd3d-474a-b68b-39605a874fb7',  # French version
                'language': 'fr'
            },
            'fr-ca': {
                'model': 'general-nova-3',
                'uuid': 'f351c28f-fd3d-474a-b68b-39605a874fb7',
                'language': 'fr-ca'
            },
            # English models
            'en': {
                'model': 'general-nova-3',
                'uuid': '40bd3654-e622-47c4-a111-63a61b23bfe8',  # English version
                'language': 'en'
            },
            'en-us': {
                'model': 'general-nova-3',
                'uuid': '40bd3654-e622-47c4-a111-63a61b23bfe8',
                'language': 'en-us'
            }
        }
        
        self.headers = {
            'Content-Type': 'audio/wav',
            'Authorization': f'Token {self.api_key}'
        }
    
    def get_model_config(self, language: str):
        """Get model configuration for language"""
        language = language.lower()
        
        # Try exact match
        if language in self.model_map:
            return self.model_map[language]
        
        # Try base language
        base_lang = language.split('-')[0]
        if base_lang in self.model_map:
            config = self.model_map[base_lang].copy()
            config['language'] = language  # Use requested language variant
            return config
        
        # Default to English
        return self.model_map['en']
    
    def transcribe(self, audio_file_path: str, language: str = 'fr') -> Dict[str, Any]:
        """Transcribe audio file"""
        
        # Get model configuration
        config = self.get_model_config(language)
        
        # Read audio file
        try:
            with open(audio_file_path, 'rb') as f:
                audio_data = f.read()
        except Exception as e:
            return {
                'success': False,
                'error': f'Cannot read audio file: {str(e)}'
            }
        
        # Build parameters - USE UUID instead of model name
        params = {
            'model': config['model'],
            'language': config['language']
        }
        
        # Add UUID if needed (some Deepgram instances need it)
        # params['uuid'] = config['uuid']
        
        url = f"{self.base_url}/v1/listen"
        
        print(f"Transcribing with:")
        print(f"  Model: {config['model']}")
        print(f"  Language: {config['language']}")
        print(f"  UUID: {config['uuid']}")
        print(f"  Audio size: {len(audio_data)} bytes")
        
        try:
            response = requests.post(
                url,
                headers=self.headers,
                params=params,
                data=audio_data,
                timeout=60
            )
            
            print(f"\nResponse status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract transcript
                transcript = ""
                if 'results' in result and 'channels' in result['results']:
                    for channel in result['results']['channels']:
                        for alt in channel.get('alternatives', []):
                            if 'transcript' in alt:
                                transcript += alt['transcript'] + " "
                
                return {
                    'success': True,
                    'transcript': transcript.strip(),
                    'language': config['language'],
                    'model_used': config['model'],
                    'uuid': config['uuid'],
                    'raw_response': result
                }
            else:
                error_text = response.text
                try:
                    error_json = response.json()
                    error_text = json.dumps(error_json)
                except:
                    pass
                
                return {
                    'success': False,
                    'error': f"Deepgram error {response.status_code}: {error_text}",
                    'params_used': params
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'params_used': params
            }
    
    def test_all_models(self):
        """Test all available model configurations"""
        print("=" * 60)
        print("Testing All Model Configurations")
        print("=" * 60)
        
        # Create small test audio
        test_audio = b'\x00' * 32000  # 1 second of silence at 16kHz
        
        test_cases = [
            ('fr', 'general-nova-3', 'f351c28f-fd3d-474a-b68b-39605a874fb7'),
            ('fr-ca', 'general-nova-3', 'f351c28f-fd3d-474a-b68b-39605a874fb7'),
            ('en', 'general-nova-3', '40bd3654-e622-47c4-a111-63a61b23bfe8'),
            ('en-us', 'general-nova-3', '40bd3654-e622-47c4-a111-63a61b23bfe8'),
            ('fr', '2-general-nova', 'c07cc5cd-d65f-48aa-9226-a9cc07999c3c'),
            ('en', '2-general-nova', '30089e05-99d1-4376-b32e-c263170674af'),
        ]
        
        for language, model_name, uuid in test_cases:
            print(f"\nTesting: {model_name} for {language}")
            
            params = {
                'model': model_name,
                'language': language
            }
            
            url = f"{self.base_url}/v1/listen"
            
            try:
                response = requests.post(
                    url,
                    headers=self.headers,
                    params=params,
                    data=test_audio,
                    timeout=30
                )
                
                print(f"  Status: {response.status_code}")
                print(f"  Params: {params}")
                
                if response.status_code == 200:
                    print(f"  ✅ Success!")
                else:
                    print(f"  ❌ Error: {response.text[:100]}")
                    
            except Exception as e:
                print(f"  ❌ Request failed: {e}")

# Test it
if __name__ == "__main__":
    service = DeepgramFixedService()
    
    # First, test all configurations
    service.test_all_models()
    
    # Then try with actual audio file
    print("\n" + "=" * 60)
    print("Testing with actual audio file")
    print("=" * 60)
    
    audio_file = r"C:/Users/Salah Taileb/Desktop/deepgram_test.m4a"
    
    # Test French
    print("\n--- Testing French ---")
    result_fr = service.transcribe(audio_file, language='fr')
    if result_fr['success']:
        print(f"✅ Success!")
        print(f"Transcript: {result_fr['transcript'][:200]}...")
    else:
        print(f"❌ Failed: {result_fr['error']}")
    
    # Test English
    print("\n--- Testing English ---")
    result_en = service.transcribe(audio_file, language='en')
    if result_en['success']:
        print(f"✅ Success!")
        print(f"Transcript: {result_en['transcript'][:200]}...")
    else:
        print(f"❌ Failed: {result_en['error']}")