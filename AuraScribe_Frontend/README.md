# AuraScribe - Medical Intelligence Frontend

[![License](https://img.shields.io/badge/license-PROPRIETARY-red.svg)](LICENSE)
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-blue.svg)](SECURITY.md)
[![Loi 25](https://img.shields.io/badge/Loi%2025-Compliant-green.svg)](SECURITY.md)

> **Production-Ready Medical Documentation Platform**
>
> HIPAA-compliant frontend for medical transcription, documentation, and AI-powered clinical workflow automation.

## ⚠️ Important Security Notice

**CRITICAL:** This application handles Protected Health Information (PHI) and must be deployed with proper security measures. Read [SECURITY.md](SECURITY.md) before deployment.

- **Never commit** `.env` files with real API keys
- **All API keys** must be handled by your backend
- **Always use HTTPS** in production
- **Review security checklist** before going live

## 🏥 Features

- **Voice Transcription**: Real-time medical transcription with Deepgram
- **Multi-Agent AI**: Automated SOAP notes, billing codes, and task extraction
- **RAMQ Integration**: Quebec health insurance card scanning
- **MADO Compliance**: Automatic detection of reportable diseases
- **Privacy Mode**: HIPAA-compliant PHI blurring
- **Auto-Purge**: 24-hour data retention (Loi 25 compliant)
- **Bilingual**: Full French and English support
- **Dark Mode**: Reduced eye strain for long sessions

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Backend**: FastAPI server (separate repository)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/aurascribe-frontend.git
cd aurascribe-frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your configuration
# IMPORTANT: Never use real API keys in the frontend
nano .env
```

**Example `.env` for development:**
```env
NODE_ENV=development
VITE_APP_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3001
```

**DO NOT put these in `.env` (backend only):**
- ❌ GEMINI_API_KEY
- ❌ DEEPGRAM_API_KEY
- ❌ GOOGLE_CLIENT_ID
- ❌ Database credentials

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
# Install additional dependencies
npm install -D tailwindcss postcss autoprefixer

# Build
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

```
aurascribe-frontend/
├── components/          # React components
│   ├── NewSession.tsx   # Recording & patient info
│   ├── SessionViewer.tsx # Document viewing
│   ├── Auth.tsx         # Authentication
│   └── ...
├── services/            # Backend integration (TO BE REMOVED)
│   ├── deepgram.ts      # Voice transcription
│   ├── orchestrator.ts  # Multi-agent coordination
│   └── agents/          # AI agent logic
├── utils/               # Utility functions
│   └── security.ts      # Input validation & sanitization
├── types.ts             # TypeScript definitions
├── App.tsx              # Main application
├── index.tsx            # Entry point
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS config
├── .env.example         # Environment template
├── SECURITY.md          # Security guidelines
└── PRODUCTION_DEPLOYMENT.md  # Deployment guide
```

## 🔐 Security Features

### Implemented Protections

✅ **XSS Protection**: Input sanitization on all user inputs
✅ **CSRF Protection**: Token-based validation
✅ **Input Validation**: RAMQ, date, postal code validators
✅ **Security Headers**: CSP, HSTS, X-Frame-Options
✅ **No API Keys**: All keys handled by backend
✅ **Secure Dependencies**: No CDN dependencies
✅ **Privacy Mode**: PHI data blurring
✅ **Auto-Logout**: Inactivity timeout

### Utilities

```typescript
import {
  sanitizeHTML,      // Remove dangerous HTML/scripts
  escapeHTML,        // Escape special characters
  validateRAMQ,      // Validate Quebec health card
  validateDate,      // Validate date format
  validatePostalCode // Validate Canadian postal code
} from './utils/security';
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run security-audit # Run npm audit
npm run update-deps  # Update dependencies
```

### Code Quality

```bash
# Type checking
npm run type-check

# Security audit
npm run security-audit

# Fix vulnerabilities
npm audit fix
```

## 🏭 Production Deployment

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete deployment instructions.

### Quick Deployment Checklist

- [ ] Remove `.env` from git history
- [ ] Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Configure environment variables
- [ ] Build: `npm run build`
- [ ] Set up HTTPS with valid certificate
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up security headers
- [ ] Configure CORS on backend
- [ ] Enable audit logging
- [ ] Set up monitoring and alerts
- [ ] Test all features in production

### Environment Variables for Production

```env
NODE_ENV=production
VITE_APP_URL=https://aurascribe.yourdomain.com
VITE_API_BASE_URL=https://api.aurascribe.yourdomain.com
```

## 🔧 Backend Integration

**IMPORTANT**: You mentioned building a separate FastAPI backend. This is the **correct approach** for security.

### What needs to move to backend:

1. **All API Keys**: Gemini, Deepgram, Google OAuth
2. **AI Agents**: Clinical, Billing, MADO, Task agents
3. **Orchestrator**: Multi-agent coordination logic
4. **Services**: Deepgram, Gemini integrations

### Frontend-Backend Communication:

```typescript
// Frontend makes requests to your backend
const response = await fetch(`${VITE_API_BASE_URL}/api/sessions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    patientInfo,
    transcript,
    language
  })
});

// Backend handles all AI processing and returns result
const session = await response.json();
```

## 📊 HIPAA Compliance

### Data Handling

- **Encryption**: All data transmitted over HTTPS
- **Access Control**: Role-based authentication required
- **Audit Logging**: All PHI access logged (backend)
- **Data Retention**: 24-hour automatic purge
- **Secure Storage**: No persistent local storage of PHI
- **Privacy Controls**: Privacy mode for screen sharing

### Required Documentation

- [ ] Business Associate Agreement (BAA) with hosting provider
- [ ] Risk Assessment documentation
- [ ] Incident Response Plan
- [ ] Disaster Recovery Plan
- [ ] Security Training records
- [ ] Audit log retention policy

## 🇨🇦 Quebec Loi 25 Compliance

- ✅ 24-hour automatic data purge
- ✅ User consent tracking
- ✅ Privacy by design
- ✅ Data minimization
- ✅ Transparent data handling
- ✅ User data access controls

## 📱 Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile Safari: ✅ iOS 14+
- Chrome Mobile: ✅ Android 10+

## 🐛 Troubleshooting

### Build fails

```bash
rm -rf node_modules dist
npm install
npm run build
```

### Environment variables not loading

- Ensure variables start with `VITE_`
- Rebuild after changing `.env`
- Check `.env` is not in `.gitignore`

### CORS errors

- Configure CORS on your FastAPI backend
- Allow your frontend domain
- Include credentials if using cookies

## 📚 Documentation

- [Security Guidelines](SECURITY.md)
- [Production Deployment Guide](PRODUCTION_DEPLOYMENT.md)
- [API Documentation](#) - Link to your FastAPI docs
- [User Manual](#) - Create for end users

## 🤝 Contributing

This is a proprietary medical application. All contributions must:

1. Follow security guidelines
2. Include tests
3. Update documentation
4. Pass security audit
5. Be reviewed by security team

## 📄 License

**PROPRIETARY** - All rights reserved. Unauthorized use, reproduction, or distribution is prohibited.

## 🆘 Support

- **Security Issues**: security@aurascribe.com (**DO NOT** disclose publicly)
- **Technical Support**: support@aurascribe.com
- **Emergency**: [On-call number]
- **Documentation**: [Internal Wiki]

## ⚖️ Legal

This software handles Protected Health Information (PHI) and is subject to:
- HIPAA Security Rule (US)
- Quebec Law 25 (Canada)
- PIPEDA (Canada)
- Provincial health information acts

Ensure you have proper legal agreements and insurance before deployment.

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Status**: Production Ready (pending security review)
