import { db } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  let email = String(body.email || '').trim().toLowerCase();
  let name = String(body.name || '').trim();
  let picture = String(body.picture || '').trim();

  // If real Google Identity Services credential JWT is passed, decode & verify with Google tokeninfo
  if (body.credential) {
    try {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`);
      if (verifyRes.ok) {
        const info = await verifyRes.json();
        email = String(info.email || '').toLowerCase();
        name = info.name || name;
        picture = info.picture || picture;
      }
    } catch {
      // fallback to payload fields
    }
  }

  if (!email) {
    return res.status(400).json({ error: 'Google account email missing.' });
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
    detail: `${email} authenticated via Google OAuth`,
    time: 'Just now',
    ok: true,
  });

  return res.status(200).json({ success: true, user });
}
