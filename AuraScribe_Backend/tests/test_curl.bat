# Test 1: French with general-nova-3
curl -X POST \
  "http://34.19.193.244:8080/v1/listen?model=general-nova-3&language=fr" \
  -H "Authorization: Token 1e7b06318100c48315a6e638b18e86b54263a4a1" \
  -H "Content-Type: audio/wav" \
  --data-binary "@silence.wav"

# Test 2: English with general-nova-3  
curl -X POST \
  "http://34.19.193.244:8080/v1/listen?model=general-nova-3&language=en" \
  -H "Authorization: Token 1e7b06318100c48315a6e638b18e86b54263a4a1" \
  -H "Content-Type: audio/wav" \
  --data-binary "@silence.wav"

# Test 3: French with 2-general-nova
curl -X POST \
  "http://34.19.193.244:8080/v1/listen?model=2-general-nova&language=fr" \
  -H "Authorization: Token 1e7b06318100c48315a6e638b18e86b54263a4a1" \
  -H "Content-Type: audio/wav" \
  --data-binary "@silence.wav"

# Test 4: English with 2-general-nova
curl -X POST \
  "http://34.19.193.244:8080/v1/listen?model=2-general-nova&language=en" \
  -H "Authorization: Token 1e7b06318100c48315a6e638b18e86b54263a4a1" \
  -H "Content-Type: audio/wav" \
  --data-binary "@silence.wav"