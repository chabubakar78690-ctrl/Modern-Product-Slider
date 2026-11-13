import { db, findUserByApiKey } from '../_db.js';
import {
  applySecurityHeaders,
  getClientIp,
  sanitizeDomain,
} from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }

  const clientIp = getClientIp(req);
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const apiKey = String(body.api_key || '').trim().slice(0, 100);
  const domain = sanitizeDomain(body.site_url || '');

  const user = findUserByApiKey(apiKey);
  if (user && domain) {
    user.activeSites = (user.activeSites || []).filter((d) => d !== domain);
    db.logs.unshift({
      id: Date.now(),
      event: 'Domain Deactivated',
      detail: `${user.email} released domain ${domain} (IP: ${clientIp})`,
      time: 'Just now',
      ok: true,
    });
    db.persist();
  }

  return res.status(200).json({ success: true, active_sites: user?.activeSites || [] });
}
