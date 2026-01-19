#!/usr/bin/env python3
"""
Quick fix for the syntax error in main.py
Run this on your server to fix the backend issue
"""

# Run these commands on your server:
print("""
CRITICAL SYNTAX ERROR FIX NEEDED!

SSH into your server and run this command to fix the backend:

cat > /opt/aurascribe/fix_main.py << 'EOF'
import re

# Read the current main.py file
with open('/opt/aurascribe/AuraScribe_Backend/main.py', 'r') as f:
    content = f.read()

# Fix the malformed line with literal \\n characters
fixed_content = content.replace(
    'app = Flask(__name__)\\\\n\\\\n# Configure file uploads (100MB limit for audio files)\\\\napp.config[\\'MAX_CONTENT_LENGTH\\'] = 100 * 1024 * 1024  # 100MB',
    '''app = Flask(__name__)

# Configure file uploads (100MB limit for audio files)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB'''
)

# Write the fixed content back
with open('/opt/aurascribe/AuraScribe_Backend/main.py', 'w') as f:
    f.write(fixed_content)

print("Fixed syntax error in main.py")
EOF

# Run the fix
cd /opt/aurascribe
python3 fix_main.py

# Restart the backend
docker compose restart backend

# Check if it's working
docker compose ps
""")