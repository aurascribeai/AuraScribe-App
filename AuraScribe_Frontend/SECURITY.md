# Security Guidelines for AuraScribe Frontend

## Overview
This document outlines the security measures implemented in the AuraScribe frontend and provides guidelines for maintaining a secure, HIPAA-compliant application.

## Critical Security Measures Implemented

### 1. API Key Protection
**🚨 CRITICAL SECURITY WARNING: API Keys Currently Exposed in Browser Bundle**

**Current State:**
- ❌ **VITE_API_KEY, VITE_GEMINI_API_KEY, and VITE_DEEPGRAM_API_KEY are exposed in the browser**
- ❌ Any user can open DevTools and extract these API keys from the JavaScript bundle
- ❌ Extracted keys can be used to make unlimited API calls at your expense
- ✅ API keys removed from `vite.config.ts`
- ✅ `.env` file added to `.gitignore`
- ✅ `.env.example` created as template

**⚠️ URGENT ACTION REQUIRED FOR PRODUCTION:**

The current implementation uses `import.meta.env.VITE_*` which embeds API keys directly in the client-side bundle. This is a **severe security risk** for production environments.

**Immediate Steps:**
1. **DO NOT deploy this to production** without implementing a backend proxy
2. All API calls to Gemini and Deepgram MUST go through your FastAPI backend
3. Backend should validate requests and rate-limit to prevent abuse
4. Never use `VITE_` prefix for sensitive credentials in production

**For Development Only:**
The current setup works for local development but is NOT safe for production.

```bash
# To remove .env from git history (if committed):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Then force push (DANGEROUS - coordinate with team first)
git push origin --force --all
```

### 2. XSS (Cross-Site Scripting) Protection

Implemented in `utils/security.ts`:

- `sanitizeHTML()`: Removes dangerous HTML/scripts
- `escapeHTML()`: Escapes special characters
- `validateInput()`: Checks for malicious patterns
- Input sanitization applied to all user inputs in NewSession component

### 3. Input Validation

Validation functions for medical data:
- RAMQ number: `validateRAMQ()`
- Date of birth: `validateDate()`
- Postal code: `validatePostalCode()`
- Email: `validateEmail()`

All inputs have:
- Maximum length restrictions
- Pattern validation
- Real-time error feedback

### 4. Content Security Policy (CSP)

Headers configured in `vite.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 5. Secure Dependencies

- ❌ Removed CDN dependencies (Tailwind, ESM imports)
- ✅ All dependencies now bundled via npm
- ✅ Use `npm audit` regularly to check for vulnerabilities

## HIPAA Compliance Considerations

### Protected Health Information (PHI)

The following data is considered PHI and must be handled securely:
- Patient names
- RAMQ numbers
- Dates of birth
- Medical records
- Transcriptions

### Current Protections:

1. **Privacy Mode**: Blurs sensitive data on screen
2. **Local Data Expiry**: Automatic 24-hour purge (Loi 25 compliance)
3. **No Persistent Storage**: Data stored in memory only
4. **Secure Transmission**: All API calls should use HTTPS

### Required Backend Implementation:

Your FastAPI backend MUST implement:

1. **Authentication & Authorization**
   - JWT tokens with expiry
   - Role-based access control (RBAC)
   - Multi-factor authentication (MFA) for production

2. **Encryption**
   - TLS 1.3 for all communications
   - Encryption at rest for PHI
   - Encrypted database fields

3. **Audit Logging**
   - Log all PHI access
   - User action tracking
   - Retention for compliance periods

4. **API Security**
   - Rate limiting
   - CORS configuration
   - Request validation
   - API key rotation

## Production Checklist

### Before Deploying to Production:

- [ ] Remove all API keys from frontend code
- [ ] Verify `.env` is in `.gitignore` and not committed
- [ ] Replace Tailwind CDN with npm package
- [ ] Install and configure Tailwind: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Self-host fonts (download from Google Fonts)
- [ ] Configure CSP headers on your web server
- [ ] Set up HTTPS with valid SSL certificate
- [ ] Configure CORS to only allow your domain
- [ ] Enable security headers in production server
- [ ] Implement rate limiting on backend
- [ ] Set up monitoring and alerting
- [ ] Perform security audit / penetration testing
- [ ] Review and sign Business Associate Agreement (BAA) with all third-party services
- [ ] Implement backup and disaster recovery

### Environment Variables

**⚠️ Current State (Development Only):**
Currently using in frontend (INSECURE for production):
- `VITE_API_KEY` - ❌ Exposed in browser bundle
- `VITE_GEMINI_API_KEY` - ❌ Exposed in browser bundle
- `VITE_DEEPGRAM_API_KEY` - ❌ Exposed in browser bundle
- `VITE_APP_URL` - ✅ Safe to expose
- `VITE_API_BASE_URL` - ✅ Safe to expose

**Production Configuration (Recommended):**
Frontend should ONLY access:
- `VITE_APP_URL`: Your frontend URL
- `VITE_API_BASE_URL`: Your backend API URL

**Never expose in frontend (keep on backend only):**
- `GEMINI_API_KEY` - Keep on backend, use proxy endpoints
- `DEEPGRAM_API_KEY` - Keep on backend, use proxy endpoints
- `GOOGLE_CLIENT_ID` (use backend OAuth flow)
- `NEXTAUTH_SECRET`
- Database credentials
- Any other API keys or secrets

### Web Server Configuration

Example Nginx configuration for security headers:

```nginx
server {
    listen 443 ssl http2;
    server_name aurascribe.example.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(self), camera=(self)" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.aurascribe.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location / {
        root /var/www/aurascribe;
        try_files $uri $uri/ /index.html;
    }
}
```

## Common Security Vulnerabilities to Avoid

### 1. XSS (Cross-Site Scripting)
- ✅ Always sanitize user input
- ✅ Use React's built-in XSS protection
- ✅ Never use `dangerouslySetInnerHTML` without sanitization

### 2. CSRF (Cross-Site Request Forgery)
- Implement CSRF tokens on backend
- Use SameSite cookies
- Verify Origin header

### 3. Injection Attacks
- ✅ Validate all inputs
- Use parameterized queries on backend
- Never construct SQL from user input

### 4. Sensitive Data Exposure
- ✅ Never log PHI
- Use `sanitizeForLogging()` utility
- Implement proper access controls

### 5. Broken Authentication
- Use secure session management
- Implement account lockout
- Use strong password policies

## Monitoring and Incident Response

### What to Monitor:
- Failed login attempts
- Unusual API access patterns
- Data access outside business hours
- Large data exports
- Error rates and types

### Incident Response Plan:
1. Identify and contain the breach
2. Assess the scope of compromised data
3. Notify affected parties (required by HIPAA within 60 days)
4. Document the incident
5. Review and update security measures

## Regular Security Tasks

### Daily:
- Monitor security alerts
- Review access logs

### Weekly:
- Check for dependency updates
- Review error logs

### Monthly:
- Run `npm audit` and fix vulnerabilities
- Review user permissions
- Test backup restoration

### Quarterly:
- Security audit
- Update dependencies
- Review and update documentation
- Test incident response plan

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Quebec Law 25](https://www.quebec.ca/en/government/policies-orientations/modernization-protection-personal-information)
- [React Security Best Practices](https://react.dev/learn/keeping-components-pure)
- [Vite Security](https://vitejs.dev/guide/build.html#build-optimizations)

## Contact

For security concerns or to report vulnerabilities, contact:
- Security Team: security@aurascribe.com
- Emergency: [On-call number]

**DO NOT** disclose security vulnerabilities publicly before coordinating with the security team.
