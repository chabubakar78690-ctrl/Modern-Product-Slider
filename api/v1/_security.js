import crypto from 'crypto';

// In-memory sliding window rate-limiter store
const rateLimitStore = new Map();

/**
 * Apply robust HTTP security headers to response
 */
export function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token, Accept');
}

/**
 * IP and Key-based sliding-window rate limiter
 * @param {string} key Identifier (IP or Email)
 * @param {number} maxRequests Maximum allowed requests in window
 * @param {number} windowMs Time window in milliseconds
 * @returns {boolean} true if allowed, false if rate limited
 */
export function checkRateLimit(key, maxRequests = 20, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || [];
  const validTimestamps = record.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitStore.set(key, validTimestamps);
  return true;
}

/**
 * Extract client IP from standard proxy headers
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Cryptographic timing-safe string comparison to protect against side-channel timing attacks
 */
export function timingSafeCompare(a = '', b = '') {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Email validation regex
 */
export function isValidEmail(email = '') {
  if (typeof email !== 'string' || email.length > 254) return false;
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email);
}

/**
 * Sanitize and normalize domain hostname
 */
export function sanitizeDomain(siteUrl = '') {
  try {
    const raw = String(siteUrl).trim();
    if (!raw) return '';
    const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase().slice(0, 150);
  } catch {
    return String(siteUrl).replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase().slice(0, 150);
  }
}

/**
 * Verify administrative authorization for protected admin routes
 */
export function verifyAdminAccess(req) {
  const adminSecret = process.env.ADMIN_SECRET || 'mps_superadmin_secret_2026';
  const headerSecret = req.headers['x-admin-token'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (headerSecret && timingSafeCompare(headerSecret, adminSecret)) {
    return true;
  }
  // Also permit local dev or session checking
  return false;
}
