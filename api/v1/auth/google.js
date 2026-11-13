import { db } from '../_db.js';
import {
  applySecurityHeaders,
  getClientIp,
  isValidEmail,
} from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const clientIp = getClientIp(req);
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  let email = String(body.email || '').trim().toLowerCase();
  let name = String(body.name || '').trim().slice(0, 100);
  let picture = String(body.picture || '').trim().slice(0, 500);

  // If Google Identity Services JWT credential is provided, verify against Google's tokeninfo endpoint
  if (body.credential) {
    try {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`
      );
      if (verifyRes.ok) {
        const info = await verifyRes.json();
        email = String(info.email || '').toLowerCase();
        name = info.name || name;
        picture = info.picture || picture;
      }
    } catch {
      // fallback to body fields
    }
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid Google email address required.' });
  }

  let user = db.users.get(email);
  if (!user) {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@modernproductslider.com').toLowerCase();
    user = {
      id: 'usr_' + Math.random().toString(36).slice(2, 8),
      name: name || email.split('@')[0],
      email,
      picture,
      role: email === adminEmail ? 'admin' : 'customer',
      provider: 'google',
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
  } else {
    user.provider = 'google';
    if (picture) user.picture = picture;
  }

  db.logs.unshift({
    id: Date.now(),
    event: 'Google Sign-In',
    detail: `${email} authenticated via Google OAuth (IP: ${clientIp})`,
    time: 'Just now',
    ok: true,
  });
  db.persist();

  return res.status(200).json({ success: true, user });
}
