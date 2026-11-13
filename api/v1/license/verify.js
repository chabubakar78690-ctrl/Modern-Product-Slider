import { db, findUserByApiKey } from '../_db.js';
import {
  applySecurityHeaders,
  checkRateLimit,
  getClientIp,
  sanitizeDomain,
} from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, message: 'Method not allowed. Use POST.' });
  }

  const clientIp = getClientIp(req);

  // Rate limit: max 120 verification requests per minute per IP
  const allowed = checkRateLimit(`lic_verify_${clientIp}`, 120, 60 * 1000);
  if (!allowed) {
    return res.status(429).json({ valid: false, message: 'Too many requests. Please slow down.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const apiKey = String(body.api_key || '').trim().slice(0, 100);
  const siteUrl = String(body.site_url || '').trim().slice(0, 255);

  if (!apiKey) {
    return res.status(400).json({ valid: false, message: 'API key is required.' });
  }

  const user = findUserByApiKey(apiKey);
  if (!user || user.status !== 'active' || user.planId === 'free') {
    db.logs.unshift({
      id: Date.now(),
      event: 'License Rejected',
      detail: `Unauthorized check: ${apiKey.slice(0, 14)}... from ${siteUrl || clientIp}`,
      time: 'Just now',
      ok: false,
    });
    db.persist();
    return res.status(401).json({
      valid: false,
      message: 'Invalid, suspended, or expired Modern Product Slider Pro license key.',
    });
  }

  const domain = sanitizeDomain(siteUrl);
  if (domain) {
    user.activeSites = user.activeSites || [];
    if (!user.activeSites.includes(domain)) {
      if (user.maxSites > 0 && user.activeSites.length >= user.maxSites) {
        return res.status(403).json({
          valid: false,
          message: `Single Site limit reached (${user.activeSites[0]}). Deactivate your existing domain in your dashboard or upgrade to Unlimited Sites ($10/mo).`,
          active_sites: user.activeSites,
        });
      }
      user.activeSites.push(domain);
    }
  }

  db.logs.unshift({
    id: Date.now(),
    event: 'License Verified',
    detail: `${user.email} (${user.planName}) → ${domain || 'CLI check'} (IP: ${clientIp})`,
    time: 'Just now',
    ok: true,
  });
  db.persist();

  return res.status(200).json({
    valid: true,
    plan: user.planName,
    site_limit: user.maxSites === -1 ? 'Unlimited Sites' : `${user.activeSites.length}/${user.maxSites} Site`,
    active_sites: user.activeSites,
  });
}
