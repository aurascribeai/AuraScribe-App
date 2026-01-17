#\!/bin/bash
# AuraScribe Deployment Script
# Run this script to deploy updates to the GCP VM

set -e

# Configuration
REMOTE_USER="${REMOTE_USER:-aurascribe}"
REMOTE_HOST="${REMOTE_HOST:-34.19.193.244}"
REMOTE_PATH="/opt/aurascribe"

echo "=========================================="
echo "AuraScribe Deployment"
echo "=========================================="

# Check if remote host is set
if [ "$REMOTE_HOST" = "your-gcp-vm-ip" ]; then
    echo "Error: Please set REMOTE_HOST environment variable"
    echo "Example: REMOTE_HOST=34.19.193.244 ./deploy.sh"
    exit 1
fi

echo "[1/6] Building frontend..."
cd ../AuraScribe_Frontend
npm install
npm run build

echo "[2/6] Creating deployment package..."
cd ..
tar -czf /tmp/aurascribe-deploy.tar.gz     --exclude="node_modules"     --exclude=".git"     --exclude="__pycache__"     --exclude=".env"     --exclude=".env.local"     --exclude="*.pyc"     AuraScribe_Frontend/dist     AuraScribe_Backend

echo "[3/6] Uploading to server..."
scp /tmp/aurascribe-deploy.tar.gz $REMOTE_USER@$REMOTE_HOST:/tmp/

echo "[4/6] Extracting on server..."
ssh $REMOTE_USER@$REMOTE_HOST "cd /opt/aurascribe && tar -xzf /tmp/aurascribe-deploy.tar.gz && mv AuraScribe_Frontend/dist frontend/dist 2>/dev/null || true && mv AuraScribe_Backend/* backend/ 2>/dev/null || true"

echo "[5/6] Installing Python dependencies..."
ssh $REMOTE_USER@$REMOTE_HOST "cd /opt/aurascribe && source venv/bin/activate && pip install -r backend/requirements.txt 2>/dev/null || echo Skip"

echo "[6/6] Restarting services..."
ssh $REMOTE_USER@$REMOTE_HOST "sudo systemctl restart aurascribe-backend && sudo systemctl reload nginx"

echo "=========================================="
echo "Deployment Complete\!"
echo "=========================================="
echo ""
echo "Application deployed to: https://app.aurascribe.ca"
echo "API endpoint: https://api.aurascribe.ca"
echo ""

