import { db, findUserByApiKey, normalizeDomain } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ valid: false, message: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const apiKey = String(body.api_key || '').trim();
  const siteUrl = String(body.site_url || '').trim();

  if (!apiKey) {
    return res.status(400).json({ valid: false, message: 'API key is required.' });
  }

  const user = findUserByApiKey(apiKey);
  if (!user || user.status !== 'active' || user.planId === 'free') {
    db.logs.unshift({
      id: Date.now(),
      event: 'Verification Rejected',
      detail: `Rejected key ${apiKey.slice(0, 12)}...`,
      time: 'Just now',
      ok: false,
    });
    return res.status(401).json({ valid: false, message: 'Invalid, suspended, or expired API license key.' });
  }

  const domain = normalizeDomain(siteUrl);
  if (domain) {
    if (!user.activeSites.includes(domain)) {
      if (user.maxSites > 0 && user.activeSites.length >= user.maxSites) {
        return res.status(403).json({
          valid: false,
          message: `Single Site limit reached (${user.activeSites[0]}). Deactivate that site or upgrade to Unlimited ($10/mo).`,
        });
      }
      user.activeSites.push(domain);
    }
  }

  db.logs.unshift({
    id: Date.now(),
    event: 'License Verified',
    detail: `${user.email} (${user.planName}) → ${domain || 'API check'}`,
    time: 'Just now',
    ok: true,
  });

  return res.status(200).json({
    valid: true,
    plan: user.planName,
    site_limit: user.maxSites === -1 ? 'Unlimited Sites' : `${user.activeSites.length}/${user.maxSites} Site`,
    active_sites: user.activeSites,
  });
}
