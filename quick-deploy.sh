#!/bin/bash
# AuraScribe Quick Deploy Script for GCP VM
# This script deploys the latest changes from GitHub to your GCP VM

set -e

# Configuration
REMOTE_HOST="34.19.193.244" 
REMOTE_USER="aurascribe"  # Change this to your actual user
PROJECT_PATH="/opt/aurascribe"

echo "=============================================="
echo "🚀 AuraScribe Quick Deployment"
echo "=============================================="

# Check if SSH connection works
echo "📡 Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 $REMOTE_USER@$REMOTE_HOST "echo 'SSH connection successful'"; then
    echo "❌ SSH connection failed. Please ensure:"
    echo "   1. SSH key is properly configured"
    echo "   2. Remote user '$REMOTE_USER' is correct"
    echo "   3. VM is running and accessible"
    echo ""
    echo "💡 To set up SSH key authentication:"
    echo "   ssh-copy-id $REMOTE_USER@$REMOTE_HOST"
    echo ""
    exit 1
fi

echo "✅ SSH connection successful"

# Deploy using git pull + docker compose
echo "🔄 Deploying latest changes..."

ssh $REMOTE_USER@$REMOTE_HOST << 'EOF'
    set -e
    
    echo "📂 Navigating to project directory..."
    cd /opt/aurascribe
    
    echo "🔄 Pulling latest changes from GitHub..."
    git pull origin main
    
    echo "🛑 Stopping current containers..."
    docker compose down
    
    echo "🏗️  Building and starting updated containers..."
    docker compose up --build -d
    
    echo "⏱️  Waiting for services to start..."
    sleep 10
    
    echo "🔍 Checking service status..."
    docker compose ps
    
    echo "✅ Deployment complete!"
EOF

echo ""
echo "=============================================="
echo "🎉 Deployment Complete!"
echo "=============================================="
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: https://app.aurascribe.ca"
echo "   API: https://api.aurascribe.ca" 
echo "   Landing: https://www.aurascribe.ca"
echo ""
echo "📊 To check logs:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST 'cd /opt/aurascribe && docker compose logs -f'"
echo ""