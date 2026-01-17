import requests
import json
from datetime import datetime

# Your Deepgram configuration
BASE_URL = "http://34.19.193.244:8080"
API_KEY = "1e7b06318100c48315a6e638b18e86b54263a4a1"

def test_connection():
    """Test basic connection to Deepgram"""
    print("=" * 60)
    print("Testing Deepgram Connection")
    print("=" * 60)
    
    # Test 1: Simple GET to base URL
    print("\n1. Testing base URL...")
    try:
        response = requests.get(BASE_URL, timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: GET to /v1/models
    print("\n2. Testing /v1/models endpoint...")
    try:
        url = f"{BASE_URL}/v1/models"
        response = requests.get(url, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            models = response.json()
            print(f"   Models found: {len(models)}")
            for model in models:
                print(f"   - {model.get('name')} (Languages: {model.get('languages', [])})")
        else:
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: POST to /v1/listen with minimal parameters
    print("\n3. Testing /v1/listen endpoint...")
    try:
        # First, let's create a tiny audio file or use silence
        import wave
        import io
        
        # Create 1 second of silence
        silence = b'\x00' * 16000 * 2  # 16kHz, 16-bit, 1 second
        
        url = f"{BASE_URL}/v1/listen"
        headers = {
            'Content-Type': 'audio/wav',
            'Authorization': f'Token {API_KEY}'
        }
        
        # Test with simplest parameters
        params = {
            'model': 'general-nova-3',
            'language': 'en'
        }
        
        response = requests.post(
            url,
            headers=headers,
            params=params,
            data=silence,
            timeout=30
        )
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:500]}")
        
    except Exception as e:
        print(f"   Error: {e}")

def test_models():
    """Test specific model combinations"""
    print("\n" + "=" * 60)
    print("Testing Model Combinations")
    print("=" * 60)
    
    # Read a small audio file
    audio_path = r"C:/Users/Salah Taileb/Desktop/deepgram_test.m4a"
    
    try:
        with open(audio_path, 'rb') as f:
            audio_data = f.read(10000)  # Just first 10KB for testing
    except:
        # Create dummy audio if file doesn't exist
        audio_data = b'\x00' * 10000
    
    # Test different combinations
    test_cases = [
        # (model, language, description)
        ('general-nova-3', 'en', 'English with general-nova-3'),
        ('general-nova-3', 'fr', 'French with general-nova-3'),
        ('2-general-nova', 'en', 'English with 2-general-nova'),
        ('2-general-nova', 'fr', 'French with 2-general-nova'),
        (None, 'en', 'English with no model (auto)'),
        (None, 'fr', 'French with no model (auto)'),
    ]
    
    for model, language, description in test_cases:
        print(f"\nTesting: {description}")
        
        url = f"{BASE_URL}/v1/listen"
        headers = {
            'Content-Type': 'audio/wav',
            'Authorization': f'Token {API_KEY}'
        }
        
        params = {}
        if model:
            params['model'] = model
        params['language'] = language
        
        try:
            response = requests.post(
                url,
                headers=headers,
                params=params,
                data=audio_data,
                timeout=30
            )
            
            print(f"  Status: {response.status_code}")
            print(f"  Params sent: {params}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"  ✅ Success! Model used: {result.get('results', {}).get('model_name', 'unknown')}")
            else:
                try:
                    error = response.json()
                    print(f"  ❌ Error: {error}")
                except:
                    print(f"  ❌ Error: {response.text[:200]}")
                    
        except Exception as e:
            print(f"  ❌ Request failed: {e}")

def test_without_language_param():
    """Test without language parameter (let Deepgram auto-detect)"""
    print("\n" + "=" * 60)
    print("Testing WITHOUT language parameter")
    print("=" * 60)
    
    # Create dummy audio
    audio_data = b'\x00' * 10000
    
    url = f"{BASE_URL}/v1/listen"
    headers = {
        'Content-Type': 'audio/wav',
        'Authorization': f'Token {API_KEY}'
    }
    
    # Test 1: Just model
    params = {'model': 'general-nova-3'}
    
    try:
        response = requests.post(
            url,
            headers=headers,
            params=params,
            data=audio_data,
            timeout=30
        )
        
        print(f"Status (model only): {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_connection()
    test_models()
    test_without_language_param()
    
    # Also test what models are actually available
    print("\n" + "=" * 60)
    print("Direct Model Query")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/v1/models", timeout=10)
        if response.status_code == 200:
            models = response.json()
            print(f"Raw models response:")
            print(json.dumps(models, indent=2))
    except Exception as e:
        print(f"Could not get models: {e}")