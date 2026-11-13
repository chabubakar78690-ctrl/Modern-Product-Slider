import crypto from 'crypto';
import { db } from '../_db.js';
import {
  applySecurityHeaders,
  checkRateLimit,
  getClientIp,
  timingSafeCompare,
  isValidEmail,
  verifyOtpToken,
} from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const clientIp = getClientIp(req);

  // Rate limit check
  const allowed = checkRateLimit(`otp_verify_${clientIp}`, 15, 10 * 60 * 1000);
  if (!allowed) {
    return res.status(429).json({
      error: 'Too many verification attempts. Please request a new code or try again later.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = String(body.email || '').trim().toLowerCase();
  const code = String(body.code || '').trim();
  const name = String(body.name || '').trim().slice(0, 100);
  const otpToken = String(body.otpToken || '').trim();

  if (!isValidEmail(email) || !code || code.length !== 6) {
    return res.status(400).json({ error: 'Please enter a valid email and 6-digit verification code.' });
  }

  let verified = false;

  // 1. Primary: Verify via stateless cryptographic HMAC OTP token
  // This guarantees reliable authentication across any Vercel serverless Lambda instance
  if (otpToken) {
    const tokenStatus = verifyOtpToken(email, code, otpToken);
    if (tokenStatus === 'expired') {
      return res.status(401).json({ error: 'Verification code has expired. Please request a new one.' });
    }
    if (tokenStatus === 'valid') {
      verified = true;
    }
  }

  // 2. Secondary fallback: Check in-memory store
  if (!verified) {
    const record = db.otps.get(email);
    if (record) {
      if (Date.now() > record.expiresAt) {
        return res.status(401).json({ error: 'Verification code has expired. Please request a new one.' });
      }
      if (timingSafeCompare(record.code, code)) {
        verified = true;
      }
    }
  }

  if (!verified) {
    return res.status(401).json({ error: 'Invalid verification code. Please check the code and try again.' });
  }

  // Clear in-memory OTP
  db.otps.delete(email);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@modernproductslider.com').toLowerCase();
  const isAdmin = email === adminEmail;

  let user = db.users.get(email);
  if (!user) {
    user = {
      id: isAdmin ? 'usr_admin_01' : 'usr_' + Math.random().toString(36).slice(2, 8),
      name: name || (isAdmin ? 'Founder & Admin' : email.split('@')[0]),
      email,
      role: isAdmin ? 'admin' : 'customer',
      provider: 'email',
      planId: isAdmin ? 'unlimited' : 'free',
      planName: isAdmin ? 'Unlimited Sites ($10/mo)' : 'Free Edition ($0/mo)',
      price: isAdmin ? 10 : 0,
      apiKey: isAdmin ? 'mps_live_un_admin_' + crypto.randomBytes(8).toString('hex') : '',
      maxSites: isAdmin ? -1 : 0,
      activeSites: isAdmin ? ['modern-product-slider.vercel.app'] : [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    db.users.set(email, user);
  } else if (isAdmin) {
    user.role = 'admin';
  }

  db.logs.unshift({
    id: Date.now(),
    event: isAdmin ? 'Admin Signed In' : 'Email Verified',
    detail: `${email} authenticated successfully (IP: ${clientIp})`,
    time: 'Just now',
    ok: true,
  });
  db.persist();

  return res.status(200).json({ success: true, user });
}
