import crypto from 'crypto';
import { db } from '../_db.js';
import {
  applySecurityHeaders,
  checkRateLimit,
  getClientIp,
  isValidEmail,
  createOtpToken,
} from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const clientIp = getClientIp(req);

  // 1. Sliding-window rate limit (max 10 requests per 10 minutes per IP)
  const allowed = checkRateLimit(`otp_send_${clientIp}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return res.status(429).json({
      error: 'Too many verification requests. Please wait a few minutes before trying again.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 100);

  // 2. Strict Email Validation
  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address (e.g. name@gmail.com).',
    });
  }

  // 3. Cryptographically secure 6-digit OTP
  const code = String(crypto.randomInt(100000, 999999));
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  // Generate stateless HMAC OTP token for serverless resilience
  const otpToken = createOtpToken(email, code, expiresAt);

  // Also save in memory cache
  db.otps.set(email, {
    code,
    name,
    attempts: 0,
    expiresAt,
  });

  let emailDelivered = false;

  // 4. Send via Resend SMTP API if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const mailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || 'Modern Product Slider <onboarding@resend.dev>',
          to: [email],
          subject: `${code} is your Modern Product Slider verification code`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #0b132b; margin-top: 0; font-size: 22px;">Modern Product Slider</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.5;">
                Hello${name ? ' ' + name : ''}, here is your one-time 6-digit verification code to sign in to your Pro License Portal:
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; padding: 14px 28px; background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; border-radius: 12px; display: inline-block; font-family: monospace;">
                  ${code}
                </span>
              </div>
              <p style="color: #64748b; font-size: 13px; line-height: 1.4;">
                This code will expire in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.
              </p>
            </div>
          `,
        }),
      });
      emailDelivered = mailRes.ok;
    } catch {
      emailDelivered = false;
    }
  }

  // 5. Audit Logging
  db.logs.unshift({
    id: Date.now(),
    event: 'OTP Requested',
    detail: `Verification code generated for ${email} (IP: ${clientIp})`,
    time: 'Just now',
    ok: true,
  });
  db.persist();

  return res.status(200).json({
    success: true,
    email,
    emailDelivered,
    otpToken,
    previewCode: emailDelivered ? undefined : code,
  });
}
