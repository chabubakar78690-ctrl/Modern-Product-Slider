// Licenses API (signed-in users).
// GET  /api/licenses            -> own licenses (admin: all)
// POST /api/licenses {domain, planId} -> create a license key for a domain
import { getDb, getSettings } from '../lib/db';
import { requireUser, json } from '../lib/auth';

export const dynamic = 'force-dynamic';

function newKey() {
  const part = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  return `MPS-${part()}-${part()}-${part()}`;
}

export async function GET(req) {
  const { session, error } = requireUser(req);
  if (error) return error;
  const db = getDb();
  const all = await db.all('licenses');
  const mine = session.role === 'admin' ? all : all.filter((l) => l.user_email === session.email);
  return json({ licenses: mine });
}

export async function POST(req) {
  const { session, error } = requireUser(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const domain = String(body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!domain || !domain.includes('.')) return json({ error: 'Enter a valid domain, e.g. mystore.com' }, 400);
  const db = getDb();
  const existing = await db.find('licenses', 'domain', domain);
  if (existing) return json({ error: 'This domain already has a license.', license: existing }, 409);
  const { plans } = await getSettings();
  const plan = plans.find((p) => p.id === body.planId) || plans.find((p) => p.id === 'single') || plans[1];
  const license = await db.insert('licenses', {
    id: 'LIC-' + Math.floor(1000 + Math.random() * 9000),
    key: newKey(),
    user_email: session.email,
    plan: plan.name,
    domain,
    status: 'Active',
    version: '2.1.0',
    created_at: new Date().toISOString().slice(0, 10),
    last_check: '—',
  });
  return json({ ok: true, license }, 201);
}
