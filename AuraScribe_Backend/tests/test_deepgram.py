from services.deepgram_local_service import deepgram_local

AUDIO_PATH = r"C:/Users/Salah Taileb/Desktop/deepgram_test.m4a"

models = [
    ("nova-3", ["fr-CA", "fr-FR", "en-US", "en"]),
    ("nova-2", ["fr-CA", "fr-FR", "en-US", "en"])
]

print("=" * 60)
print("Testing Deepgram Self-Hosted Instance (Public Model Slugs + Language Codes)")
print("=" * 60)

for model, langs in models:
    for lang in langs:
        print(f"\n--- Testing model: {model}, language: {lang} ---")
        result = deepgram_local.transcribe_audio_file(
            AUDIO_PATH,
            model=model,
            language=lang
        )
        if result['success']:
            print(f"✅ Success: {len(result['transcript'])} characters")
            print(f"Transcript: {result['transcript'][:200]}...")
            print(f"Model used: {result.get('model_used', 'auto')}")
            print(f"Language detected: {result.get('language', 'unknown')}")
        else:
            print(f"❌ Error: {result['error']}")