// Public license API — used by the WordPress plugin.
// POST /api/license/verify     {key, domain} -> {valid, plan, version, download}
// POST /api/license/deactivate {key, domain} -> deactivates the key
// No login needed: the license key + domain IS the credential. Only ever
// returns whether THIS key is valid for THIS domain.
import { getDb } from '../../lib/db';
import { json } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const action = params.action?.[0];
  const body = await req.json().catch(() => ({}));
  const key = String(body.key || '').trim().toUpperCase();
  const domain = String(body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!key || !domain) return json({ valid: false, error: 'key and domain are required' }, 400);

  const db = getDb();
  const license = await db.find('licenses', 'key', key);
  if (!license) return json({ valid: false, error: 'Unknown license key' }, 404);
  if (license.domain !== domain) return json({ valid: false, error: 'License is bound to a different domain' }, 403);

  if (action === 'deactivate') {
    await db.update('licenses', 'key', key, { status: 'Expired' });
    return json({ ok: true, valid: false, status: 'Expired' });
  }

  if (action === 'activate') {
    await db.update('licenses', 'key', key, { status: 'Active' });
    return json({ ok: true, valid: true, status: 'Active' });
  }

  if (action === 'verify') {
    if (license.status !== 'Active') return json({ valid: false, status: license.status, error: 'License is not active' }, 403);
    await db.update('licenses', 'key', key, { last_check: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    const versions = await db.all('versions');
    const current = versions.find((v) => v.current) || versions[0];
    return json({ valid: true, plan: license.plan, version: license.version, latest_version: current?.version, download: '/api/download?key=' + encodeURIComponent(key) + '&domain=' + encodeURIComponent(domain) });
  }

  return json({ error: 'Unknown license action' }, 404);
}
