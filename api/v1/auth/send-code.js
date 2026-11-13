import { db } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid Gmail or email address.' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  db.otps.set(email, {
    code,
    name,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  let emailDelivered = false;
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
          html: `<div style="font-family:sans-serif;padding:24px;"><h2>Verify your email</h2><p>Your 6-digit verification code for <strong>Modern Product Slider</strong> is:</p><div style="font-size:32px;font-weight:800;letter-spacing:6px;padding:14px 20px;background:#f1f5f9;border-radius:8px;display:inline-block;">${code}</div><p style="color:#64748b;font-size:13px;margin-top:16px;">This code expires in 10 minutes.</p></div>`,
        }),
      });
      emailDelivered = mailRes.ok;
    } catch {
      emailDelivered = false;
    }
  }

  db.logs.unshift({
    id: Date.now(),
    event: 'OTP Requested',
    detail: `6-digit login code generated for ${email}`,
    time: 'Just now',
    ok: true,
  });

  return res.status(200).json({
    success: true,
    email,
    emailDelivered,
    // Included so you can test OTP verification immediately even before adding RESEND_API_KEY
    previewCode: emailDelivered ? undefined : code,
  });
}
