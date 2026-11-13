import { db } from '../_db.js';
import {
  applySecurityHeaders,
  checkRateLimit,
  getClientIp,
  timingSafeCompare,
  isValidEmail,
} from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const clientIp = getClientIp(req);

  // Rate limit check (max 10 verification attempts per 10 minutes per IP)
  const allowed = checkRateLimit(`otp_verify_${clientIp}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return res.status(429).json({
      error: 'Too many verification attempts. Please request a new code or try again later.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = String(body.email || '').trim().toLowerCase();
  const code = String(body.code || '').trim();
  const name = String(body.name || '').trim().slice(0, 100);

  if (!isValidEmail(email) || !code || code.length !== 6) {
    return res.status(400).json({ error: 'Please enter a valid email and 6-digit verification code.' });
  }

  const record = db.otps.get(email);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(401).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  // Increment failed attempt counter
  record.attempts = (record.attempts || 0) + 1;
  if (record.attempts > 5) {
    db.otps.delete(email);
    return res.status(429).json({ error: 'Too many incorrect attempts. This code has been invalidated.' });
  }

  // Timing-safe comparison to prevent side-channel leakage
  const matches = timingSafeCompare(record.code, code);
  if (!matches) {
    return res.status(401).json({
      error: `Invalid verification code. (${5 - record.attempts} attempts remaining)`,
    });
  }

  // Verification succeeded - clear OTP
  db.otps.delete(email);

  let user = db.users.get(email);
  if (!user) {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@modernproductslider.com').toLowerCase();
    user = {
      id: 'usr_' + Math.random().toString(36).slice(2, 8),
      name: name || record.name || email.split('@')[0],
      email,
      role: email === adminEmail ? 'admin' : 'customer',
      provider: 'email',
      planId: 'free',
      planName: 'Free Edition ($0/mo)',
      price: 0,
      apiKey: '',
      maxSites: 0,
      activeSites: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    db.users.set(email, user);
  }

  db.logs.unshift({
    id: Date.now(),
    event: 'Email Verified',
    detail: `${email} authenticated via 6-digit OTP (IP: ${clientIp})`,
    time: 'Just now',
    ok: true,
  });
  db.persist();

  return res.status(200).json({ success: true, user });
}
