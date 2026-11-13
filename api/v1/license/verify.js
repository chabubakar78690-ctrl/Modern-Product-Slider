import { getOrCreateKey, normalizeDomain, globalStore } from './_store.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const apiKey = String(body.api_key || '').trim();
    const siteUrl = String(body.site_url || '').trim();

    if (!apiKey) {
      return res.status(400).json({ valid: false, message: 'API key is required.' });
    }

    const record = getOrCreateKey(apiKey);
    if (!record || record.status !== 'active') {
      return res.status(401).json({ valid: false, message: 'Invalid or inactive API license key.' });
    }

    const domain = normalizeDomain(siteUrl);
    if (domain) {
      const alreadyBound = record.active_sites.includes(domain);
      if (!alreadyBound) {
        if (record.max_sites > 0 && record.active_sites.length >= record.max_sites) {
          return res.status(403).json({
            valid: false,
            message: `Single Site limit reached (${record.active_sites[0]}). Deactivate that domain first or upgrade to the $10/mo Unlimited plan.`,
          });
        }
        record.active_sites.push(domain);
        globalStore.set(apiKey, record);
      }
    }

    return res.status(200).json({
      valid: true,
      plan: record.plan,
      site_limit: record.max_sites === -1 ? 'Unlimited Sites' : `${record.active_sites.length}/${record.max_sites} Site`,
      active_sites: record.active_sites,
    });
  } catch (err) {
    return res.status(500).json({ valid: false, message: 'Server verification error.' });
  }
}
