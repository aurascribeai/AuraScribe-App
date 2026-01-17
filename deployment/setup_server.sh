#!/bin/bash
# AuraScribe GCP VM Setup Script
# Run this script on a fresh GCP VM to set up the environment

set -e

echo "=========================================="
echo "AuraScribe GCP Server Setup"
echo "=========================================="

# Update system
echo "[1/8] Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install required packages
echo "[2/8] Installing required packages..."
sudo apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    nodejs \
    npm \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    curl \
    build-essential \
    ffmpeg

# Install Node.js 20 LTS
echo "[3/8] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create app directory
echo "[4/8] Creating application directory..."
sudo mkdir -p /opt/aurascribe
sudo chown $USER:$USER /opt/aurascribe

# Create Python virtual environment
echo "[5/8] Setting up Python virtual environment..."
cd /opt/aurascribe
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "[6/8] Installing Python dependencies..."
pip install --upgrade pip
pip install flask flask-cors flask-limiter flask-socketio python-dotenv google-generativeai deepgram-sdk gunicorn eventlet

# Create systemd service for backend
echo "[7/8] Creating systemd service..."
sudo tee /etc/systemd/system/aurascribe-backend.service > /dev/null <<EOF
[Unit]
Description=AuraScribe Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/aurascribe/backend
Environment=PATH=/opt/aurascribe/venv/bin
ExecStart=/opt/aurascribe/venv/bin/gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create nginx configuration
echo "[8/8] Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/aurascribe > /dev/null <<EOF
server {
    listen 80;
    server_name app.aurascribe.ca api.aurascribe.ca;

    # Frontend
    location / {
        root /opt/aurascribe/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/aurascribe /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy your application code to /opt/aurascribe/"
echo "2. Copy your .env file to /opt/aurascribe/backend/"
echo "3. Build the frontend: cd /opt/aurascribe/frontend && npm install && npm run build"
echo "4. Enable and start the backend: sudo systemctl enable aurascribe-backend && sudo systemctl start aurascribe-backend"
echo "5. Restart nginx: sudo systemctl restart nginx"
echo "6. Setup SSL with: sudo certbot --nginx -d app.aurascribe.ca -d api.aurascribe.ca"
echo ""
