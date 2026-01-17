# AuraScribe Deployment Guide - Simple Steps

This guide will help you deploy AuraScribe to your GCP VM. Follow each step carefully.

---

## BEFORE YOU START - What You Need

1. A GCP VM (Virtual Machine) already created
2. Your VM's IP address (example: `34.xx.xx.xx`)
3. Your domain `aurascribe.ca` pointing to your VM's IP
4. SSH access to your VM

---

## STEP 1: Connect to Your GCP VM

**On your Windows computer**, open PowerShell or Command Prompt and run:

```bash
gcloud compute ssh YOUR_VM_NAME --zone=northamerica-northeast1-a
```

Replace `YOUR_VM_NAME` with your actual VM name.

**OR** use the GCP Console:
1. Go to https://console.cloud.google.com
2. Click "Compute Engine" > "VM instances"
3. Click "SSH" button next to your VM

---

## STEP 2: Install Required Software on VM

**Run these commands ONE BY ONE on your VM** (after connecting via SSH):

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Allow your user to use Docker without sudo
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Nginx (web server)
sudo apt install nginx -y

# Install Certbot (for SSL/HTTPS)
sudo apt install certbot python3-certbot-nginx -y
```

**IMPORTANT:** After running these, disconnect and reconnect to your VM:
```bash
exit
```
Then SSH back in.

---

## STEP 3: Upload Your App to the VM

**On your Windows computer** (not the VM), open a NEW PowerShell window and run:

```bash
# Navigate to your project folder
cd "C:\Users\Salah Taileb\Desktop\AuraScribe_App"

# Create a zip file of your project
tar -czvf aurascribe.tar.gz --exclude=node_modules --exclude=.git --exclude=dist --exclude=__pycache__ .

# Upload to your VM (replace YOUR_VM_NAME and YOUR_ZONE)
gcloud compute scp aurascribe.tar.gz YOUR_VM_NAME:~ --zone=northamerica-northeast1-a
```

---

## STEP 4: Extract and Setup on VM

**Back on your VM** (SSH in again if needed):

```bash
# Create app directory
sudo mkdir -p /opt/aurascribe
sudo chown $USER:$USER /opt/aurascribe

# Move and extract the files
mv ~/aurascribe.tar.gz /opt/aurascribe/
cd /opt/aurascribe
tar -xzvf aurascribe.tar.gz
rm aurascribe.tar.gz

# Create credentials folder
mkdir -p /opt/aurascribe/credentials
```

---

## STEP 5: Upload Your Google Credentials

**On your Windows computer**, upload your Google credentials file:

```bash
gcloud compute scp "C:\Users\Salah Taileb\Desktop\legal\aurascribe-credentials.json" YOUR_VM_NAME:/opt/aurascribe/credentials/ --zone=northamerica-northeast1-a
```

---

## STEP 6: Configure Nginx (Web Server)

**On your VM**, create the Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/aurascribe
```

**Paste this entire configuration** (right-click to paste in terminal):

```nginx
# Landing page - aurascribe.ca and www.aurascribe.ca
server {
    listen 80;
    server_name aurascribe.ca www.aurascribe.ca;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend App - app.aurascribe.ca
server {
    listen 80;
    server_name app.aurascribe.ca;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API - api.aurascribe.ca
server {
    listen 80;
    server_name api.aurascribe.ca;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for real-time dictation
    location /socket.io {
        proxy_pass http://127.0.0.1:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Save the file:** Press `Ctrl+X`, then `Y`, then `Enter`

**Enable the configuration:**

```bash
# Create a link to enable the site
sudo ln -s /etc/nginx/sites-available/aurascribe /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test the configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## STEP 7: Setup SSL (HTTPS) - Makes Your Site Secure

**On your VM**, run:

```bash
sudo certbot --nginx -d aurascribe.ca -d www.aurascribe.ca -d app.aurascribe.ca -d api.aurascribe.ca
```

**When prompted:**
1. Enter your email address
2. Agree to terms (type `Y`)
3. Choose whether to share email (your choice)
4. Select `2` to redirect HTTP to HTTPS (recommended)

Certbot will automatically:
- Get free SSL certificates
- Configure Nginx for HTTPS
- Set up auto-renewal

---

## STEP 8: Build and Start the App

**On your VM:**

```bash
cd /opt/aurascribe

# Build all containers (this takes a few minutes)
docker compose build

# Start everything
docker compose up -d

# Check if everything is running
docker compose ps
```

You should see 4 services running: `redis`, `backend`, `frontend`, `landing`

---

## STEP 9: Verify Everything Works

**Test these URLs in your browser:**

1. **Landing Page:** https://aurascribe.ca
2. **App:** https://app.aurascribe.ca
3. **API Health:** https://api.aurascribe.ca/api/health (should show "OK")

---

## TROUBLESHOOTING

### Check if containers are running:
```bash
cd /opt/aurascribe
docker compose ps
```

### View logs if something is wrong:
```bash
# All logs
docker compose logs

# Just backend logs
docker compose logs backend

# Just frontend logs
docker compose logs frontend
```

### Restart everything:
```bash
cd /opt/aurascribe
docker compose down
docker compose up -d
```

### Check Nginx status:
```bash
sudo systemctl status nginx
```

### Renew SSL certificates (automatic, but you can force):
```bash
sudo certbot renew --dry-run
```

---

## DNS SETTINGS (If Not Already Done)

Make sure your domain registrar has these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | YOUR_VM_IP |
| A | www | YOUR_VM_IP |
| A | app | YOUR_VM_IP |
| A | api | YOUR_VM_IP |

Replace `YOUR_VM_IP` with your actual VM's external IP address.

---

## DONE!

Your AuraScribe app should now be live at:
- **Website:** https://aurascribe.ca
- **App:** https://app.aurascribe.ca
- **API:** https://api.aurascribe.ca

---

## QUICK REFERENCE - Commands Summary

```bash
# SSH to VM
gcloud compute ssh YOUR_VM_NAME --zone=northamerica-northeast1-a

# Go to app folder
cd /opt/aurascribe

# Start app
docker compose up -d

# Stop app
docker compose down

# View logs
docker compose logs -f

# Rebuild after changes
docker compose build && docker compose up -d
```
