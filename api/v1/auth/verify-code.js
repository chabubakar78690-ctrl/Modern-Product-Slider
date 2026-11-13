import { db } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = String(body.email || '').trim().toLowerCase();
  const code = String(body.code || '').trim();
  const name = String(body.name || '').trim();

  const record = db.otps.get(email);
  // Accept stored OTP OR any 6-digit code matching previewCode
  if (!record || record.code !== code || Date.now() > record.expiresAt) {
    return res.status(401).json({ error: 'Invalid or expired 6-digit verification code.' });
  }

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
    detail: `${email} signed in via Gmail OTP`,
    time: 'Just now',
    ok: true,
  });

  return res.status(200).json({ success: true, user });
}
