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
  if (existing && existing.user_email !== session.email && session.role !== 'admin') {
    return json({ error: 'This domain is already connected to another account.' }, 409);
  }
  if (existing) return json({ error: 'This domain already has a license.', license: existing }, 409);
  const { plans } = await getSettings();
  const plan = plans.find((p) => p.id === body.planId) || plans.find((p) => p.id === 'single') || plans[1];
  const mine = (await db.all('licenses')).filter((l) => l.user_email === session.email);
  // A paid plan needs a completed payment first — otherwise anyone could
  // generate a Pro license without paying. The checkout's ITN creates the
  // license automatically, so a paying customer already has one (with an
  // empty domain); connecting a domain just attaches it below.
  if (plan.price > 0 && session.role !== 'admin') {
    const paid = (await db.all('payments')).some((p) => p.user_email === session.email && p.plan === plan.name && p.status === 'Completed');
    const emptyPaid = mine.find((l) => l.plan === plan.name && !l.domain);
    if (!paid && !emptyPaid) {
      return json({ error: `Please complete the payment for ${plan.name} first (Billing page) — the license is created automatically once PayFast confirms it.` }, 402);
    }
    if (emptyPaid) {
      const updated = await db.update('licenses', 'key', emptyPaid.key, { domain, status: 'Active' });
      return json({ ok: true, license: updated, connected: true }, 200);
    }
    // Single Site covers exactly one site — a second domain needs Unlimited.
    if (plan.id === 'single' && mine.some((l) => l.plan === plan.name && l.domain)) {
      return json({ error: 'Single Site covers one site. Upgrade to Unlimited Sites to connect more sites.' }, 409);
    }
  }
  const versions = await db.all('versions');
  const currentVersion = (versions.find((v) => v.current) || versions[0])?.version || '2.1.0';
  const license = await db.insert('licenses', {
    id: 'LIC-' + Math.floor(1000 + Math.random() * 9000),
    key: newKey(),
    user_email: session.email,
    plan: plan.name,
    domain,
    status: 'Active',
    version: currentVersion,
    created_at: new Date().toISOString().slice(0, 10),
    last_check: '—',
  });
  return json({ ok: true, license }, 201);
}

// PUT /api/licenses {key, domain} -> attach a domain to one of your own
// licenses (the "Connect site" step after paying). Only the owner (or the
// admin) can do this, and a domain can only belong to one license.
export async function PUT(req) {
  const { session, error } = requireUser(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const key = String(body.key || '').trim().toUpperCase();
  const domain = String(body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!key || !domain || !domain.includes('.')) return json({ error: 'A license key and a valid domain are required.' }, 400);
  const db = getDb();
  const license = await db.find('licenses', 'key', key);
  if (!license) return json({ error: 'Unknown license key.' }, 404);
  if (license.user_email !== session.email && session.role !== 'admin') return json({ error: 'This license belongs to another account.' }, 403);
  const taken = await db.find('licenses', 'domain', domain);
  if (taken && taken.key !== key) return json({ error: 'This domain is already connected to another license.' }, 409);
  const updated = await db.update('licenses', 'key', key, { domain, status: 'Active' });
  return json({ ok: true, license: updated }, 200);
}
