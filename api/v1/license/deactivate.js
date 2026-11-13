import { db, findUserByApiKey, normalizeDomain } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const apiKey = String(body.api_key || '').trim();
  const domain = normalizeDomain(body.site_url || '');

  const user = findUserByApiKey(apiKey);
  if (user && domain) {
    user.activeSites = user.activeSites.filter((d) => d !== domain);
    db.logs.unshift({
      id: Date.now(),
      event: 'Domain Deactivated',
      detail: `${user.email} released ${domain}`,
      time: 'Just now',
      ok: true,
    });
  }

  return res.status(200).json({ success: true });
}
