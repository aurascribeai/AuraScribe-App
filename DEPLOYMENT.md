# AuraScribe Production Deployment Guide

This guide covers the complete process for deploying AuraScribe to production on GCP.

## Prerequisites

- Docker & Docker Compose installed
- GCP VM with nginx for reverse proxy
- SSL certificates (certbot or GCP-managed)
- Self-hosted Deepgram instance (or API key)
- Google Cloud credentials for Vertex AI

---

## 1. Environment Configuration

### Step 1.1: Generate Strong Secrets

Before configuring, generate secure random values:

```bash
# Generate API key (use same value for VITE_API_KEY and AURASCRIBE_API_KEY)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate Flask secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate Redis password
python -c "import secrets; print(secrets.token_urlsafe(24))"
```

### Step 1.2: Configure Root .env

Copy and configure the root environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Frontend build args - use PUBLIC URLs
VITE_API_BASE_URL=https://api.aurascribe.ca
VITE_API_KEY=<your-generated-api-key>

# Backend configuration
AURASCRIBE_API_KEY=<same-api-key-as-above>
SECRET_KEY=<your-generated-secret>
ENVIRONMENT=production

# Redis - MUST set a strong password
REDIS_PASSWORD=<your-redis-password>
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

# External services
DEEPGRAM_API_KEY=<your-deepgram-key>
DEEPGRAM_SELF_HOSTED_URL=http://your-deepgram-host:8080
GEMINI_API_KEY=<your-gemini-key>
GCP_PROJECT_ID=<your-gcp-project>
```

### Step 1.3: Configure Backend .env

```bash
cp AuraScribe_Backend/.env.example AuraScribe_Backend/.env
```

The backend `.env` should mirror the root configuration plus additional settings.

### Step 1.4: Mount Google Cloud Credentials

Place your service account JSON in a secure location and mount it:

```bash
# Create credentials directory
mkdir -p ./credentials

# Copy your service account file
cp /path/to/your-service-account.json ./credentials/aurascribe-credentials.json

# Set proper permissions
chmod 600 ./credentials/aurascribe-credentials.json
```

---

## 2. Build & Test Locally

```bash
# Build all containers
docker compose build

# Start services
docker compose up -d

# Check health
curl http://localhost:5000/api/health

# View logs
docker compose logs -f backend
```

### Verify Functionality

1. **Landing page**: http://localhost:4000
2. **Frontend**: http://localhost:3000
3. **API Health**: http://localhost:5000/api/health
4. **Redis connection**: Check backend logs for "Redis connected successfully"

```bash
# Stop when done testing
docker compose down
```

---

## 3. GCP VM Deployment

### Step 3.1: Install Docker on VM

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin
```

### Step 3.2: Transfer Files

```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ user@your-vm-ip:/opt/aurascribe/
```

### Step 3.3: Configure Host Nginx

Create `/etc/nginx/sites-available/aurascribe`:

```nginx
# Frontend - app.aurascribe.ca
server {
    listen 443 ssl http2;
    server_name app.aurascribe.ca;

    ssl_certificate /etc/letsencrypt/live/aurascribe.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aurascribe.ca/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API - api.aurascribe.ca
server {
    listen 443 ssl http2;
    server_name api.aurascribe.ca;

    ssl_certificate /etc/letsencrypt/live/aurascribe.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aurascribe.ca/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for /socket.io
    location /socket.io {
        proxy_pass http://127.0.0.1:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

> **Note:** Set `REQUIRE_WS_ID_TOKEN=true` in the backend environment when you want to enforce Google-issued `id_token`s on real-time socket connections. The default (`false`) allows API key‑only clients used during development or from the existing frontend integration.

# Landing - www.aurascribe.ca
server {
    listen 443 ssl http2;
    server_name www.aurascribe.ca aurascribe.ca;

    ssl_certificate /etc/letsencrypt/live/aurascribe.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aurascribe.ca/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name aurascribe.ca www.aurascribe.ca app.aurascribe.ca api.aurascribe.ca;
    return 301 https://$server_name$request_uri;
}
```

Enable and restart nginx:

```bash
sudo ln -s /etc/nginx/sites-available/aurascribe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 3.4: Start Services

```bash
cd /opt/aurascribe
docker compose up -d
```

---

## 4. Security Checklist

### Redis Security
- [x] Password authentication enabled
- [x] Not exposed publicly (127.0.0.1 only)
- [ ] TLS encryption (optional, recommended)

### API Security
- [x] API key required for all endpoints
- [x] Rate limiting enabled (100/min, 1000/hr)
- [x] CORS restricted to allowed origins
- [x] Environment set to `production`

### Session Security
- [x] Sessions stored in Redis with 24-hour TTL
- [x] Automatic expiration for Loi 25 compliance
- [ ] Session data encrypted at rest (configure Redis encryption)

### Network Security
- [x] All ports bound to localhost (127.0.0.1)
- [x] Nginx reverse proxy for TLS termination
- [x] HSTS headers configured
- [ ] Firewall rules (allow only 80/443)

---

## 5. Loi 25 / PIPEDA Compliance

### Automated Data Purging
- **Sessions**: Automatically expire after 24 hours via Redis TTL
- **PDFs**: Auto-purged before/after each upload cycle
- **Transcripts**: Stored only in Redis with TTL

### Required Actions
1. Mount `/uploaded_pdfs` to an encrypted volume
2. Enable Redis encryption at rest
3. Keep audit logs (`data/audit_log.json`) in secure storage
4. Document data retention policies for clinicians

---

## 6. Post-Deployment Validation

```bash
# 1. Check API health
curl https://api.aurascribe.ca/api/health

# 2. Verify Redis connection
docker compose logs backend | grep -i redis

# 3. Test authentication (should return 401)
curl https://api.aurascribe.ca/api/system

# 4. Test with API key (should return 200)
curl -H "X-API-KEY: your-api-key" https://api.aurascribe.ca/api/system

# 5. Check container health
docker compose ps
```

---

## 7. Maintenance

### Rotate API Keys

```bash
# 1. Generate new key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 2. Update .env files with new key

# 3. Rebuild and restart
docker compose build frontend
docker compose up -d
```

### View Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f redis
```

### Backup Data

```bash
# Backup audit logs
cp AuraScribe_Backend/data/audit_log.json /backup/

# Backup user data (if persisting users)
cp AuraScribe_Backend/data/users.json /backup/
```

### Update Containers

```bash
docker compose build --pull
docker compose up -d
```

---

## 8. Troubleshooting

### "Unauthorized" Errors
- Verify `VITE_API_KEY` matches `AURASCRIBE_API_KEY`
- Rebuild frontend after changing API key

### Redis Connection Failed
- Check Redis password in `REDIS_URL`
- Verify Redis container is running: `docker compose ps redis`

### WebSocket Not Connecting
- Verify nginx WebSocket configuration
- Check CORS origins include WebSocket URL

### Container Health Check Failing
- View logs: `docker compose logs backend`
- Check if dependencies (Redis) are healthy first
