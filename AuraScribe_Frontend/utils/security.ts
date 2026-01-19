/**
 * Security Utilities for AuraScribe
 * Provides input sanitization, validation, and security helpers
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes script tags, event handlers, and dangerous attributes
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  return sanitized;
}

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHTML(input: string): string {
  if (!input) return '';

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Validates RAMQ number format (Quebec health insurance number)
 * Format: ABCD 1234 5678 (4 letters + 8 digits)
 */
export function validateRAMQ(ramq: string): boolean {
  if (!ramq) return false;

  // Remove spaces and convert to uppercase
  const cleaned = ramq.replace(/\s/g, '').toUpperCase();

  // Check format: 4 letters followed by 8 digits
  const ramqPattern = /^[A-Z]{4}\d{8}$/;

  return ramqPattern.test(cleaned);
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function validateDate(date: string): boolean {
  if (!date) return false;

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) return false;

  // Check if it's a valid date
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * Validates Canadian postal code
 * Format: A1A 1A1 or A1A1A1
 */
export function validatePostalCode(postalCode: string): boolean {
  if (!postalCode) return false;

  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  const postalPattern = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;

  return postalPattern.test(cleaned);
}

/**
 * Sanitizes patient information to remove sensitive data for logging
 */
export function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = ['ramq', 'dob', 'postalCode', 'email', 'password', 'apiKey', 'token'];
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Validates that a string doesn't contain malicious patterns
 */
export function validateInput(input: string, maxLength: number = 1000): {
  isValid: boolean;
  error?: string;
} {
  if (!input) {
    return { isValid: false, error: 'Input is required' };
  }

  if (input.length > maxLength) {
    return { isValid: false, error: `Input exceeds maximum length of ${maxLength}` };
  }

  // Check for common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, error: 'Input contains potentially malicious content' };
    }
  }

  return { isValid: true };
}

/**
 * Rate limiting helper for API calls
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the time window
    const recentRequests = userRequests.filter((time) => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add new request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Masks sensitive data for display (e.g., RAMQ number)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return data;

  const masked = '•'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}

/**
 * Content Security Policy configuration
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.aurascribe.ca', 'wss://api.aurascribe.ca'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/**
 * Builds CSP header string
 */
export function buildCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}
