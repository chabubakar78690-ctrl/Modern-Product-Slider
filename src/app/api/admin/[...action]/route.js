// Admin API (admin session only).
// GET  /api/admin/overview            -> revenue, customers, licenses, MRR, recent payments, versions
// GET  /api/admin/users               -> all users
// GET  /api/admin/payments            -> all payments
// GET  /api/admin/versions  POST /api/admin/versions {version, file, notes?}
// GET  /api/admin/pricing  PUT /api/admin/pricing {plans}
// GET  /api/admin/settings PUT /api/admin/settings {oauth?, payfast?}
// PUT  /api/admin/users {email, status}
// PUT  /api/admin/account {name?, email?, password?}
import { getDb, getSettings, isDemoMode } from '../../lib/db';
import { requireAdmin, json, hashPassword, createSession, sessionCookie } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { session, error } = requireAdmin(req);
  if (error) return error;
  const db = getDb();
  const action = params.action?.[0];

  if (action === 'overview') {
    const [users, licenses, payments, versions] = await Promise.all([db.all('users'), db.all('licenses'), db.all('payments'), db.all('versions')]);
    const completed = payments.filter((p) => p.status === 'Completed');
    const revenue = completed.reduce((s, p) => s + Number(p.amount || 0), 0);
    // MRR from active licenses (users table has no plan column).
    const mrr = licenses.filter((l) => l.status === 'Active' && l.plan === 'Unlimited Sites').length * 10
      + licenses.filter((l) => l.status === 'Active' && l.plan === 'Single Site').length * 3;
    return json({ demo: isDemoMode(), revenue, customers: users.filter((u) => u.status === 'Active').length, totalUsers: users.length, activeLicenses: licenses.filter((l) => l.status === 'Active').length, totalLicenses: licenses.length, mrr, payments: payments.slice(0, 5), licenses: licenses.slice(0, 5), versions });
  }
  if (action === 'users') return json({ users: await db.all('users') });
  if (action === 'payments') return json({ payments: await db.all('payments') });
  if (action === 'versions') return json({ versions: await db.all('versions') });
  if (action === 'pricing') { const { plans } = await getSettings(); return json({ plans }); }
  if (action === 'settings') { const s = await getSettings(); return json({ oauth: s.oauth, payfast: s.payfast, demo: isDemoMode() }); }
  return json({ error: 'Unknown admin action' }, 404);
}

export async function POST(req, { params }) {
  const { error } = requireAdmin(req);
  if (error) return error;
  const db = getDb();
  const action = params.action?.[0];
  const body = await req.json().catch(() => ({}));

  if (action === 'versions') {
    const version = String(body.version || '').trim();
    const file = String(body.file || '').trim();
    if (!version || !file) return json({ error: 'Version and file name are required.' }, 400);
    const existing = await db.all('versions');
    for (const v of existing) await db.update('versions', 'version', v.version, { current: false });
    const row = await db.insert('versions', {
      version, date: new Date().toISOString().slice(0, 10), file,
      size: body.size || '—', current: true, notes: String(body.notes || 'Pro release.'),
    });
    return json({ ok: true, version: row }, 201);
  }
  return json({ error: 'Unknown admin action' }, 404);
}

export async function PUT(req, { params }) {
  const { session, error } = requireAdmin(req);
  if (error) return error;
  const db = getDb();
  const action = params.action?.[0];
  const body = await req.json().catch(() => ({}));

  if (action === 'pricing' && Array.isArray(body.plans)) {
    await db.saveSetting('plans', body.plans);
    return json({ ok: true, plans: body.plans });
  }
  if (action === 'settings') {
    if (body.oauth) await db.saveSetting('oauth', body.oauth);
    if (body.payfast) await db.saveSetting('payfast', body.payfast);
    return json({ ok: true });
  }
  if (action === 'users' && body.email && body.status) {
    const row = await db.update('users', 'email', String(body.email).toLowerCase(), { status: body.status });
    if (!row) return json({ error: 'User not found' }, 404);
    return json({ ok: true, user: row });
  }
  // Admin changes a customer's plan. The plan lives on their license:
  // Free expires their licenses; a paid plan activates their latest
  // license (or creates one with no domain yet — they connect a site
  // after that). The dashboard derives each user's plan from licenses.
  if (action === 'users' && body.email && body.plan) {
    const email = String(body.email).toLowerCase();
    const { plans } = await getSettings();
    const plan = plans.find((p) => p.name === body.plan) || plans.find((p) => p.id === body.plan);
    if (!plan) return json({ error: 'Unknown plan' }, 400);
    const user = await db.find('users', 'email', email);
    if (!user) return json({ error: 'User not found' }, 404);
    const mine = (await db.all('licenses')).filter((l) => l.user_email === email);
    if (plan.price <= 0) {
      for (const l of mine) await db.update('licenses', 'key', l.key, { status: 'Expired' });
    } else {
      const versions = await db.all('versions');
      const currentVersion = (versions.find((v) => v.current) || versions[0])?.version || '2.1.0';
      const latest = mine[mine.length - 1];
      if (latest) await db.update('licenses', 'key', latest.key, { plan: plan.name, status: 'Active' });
      else {
        const part = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
        await db.insert('licenses', {
          id: 'LIC-' + Math.floor(1000 + Math.random() * 9000),
          key: `MPS-${part()}-${part()}-${part()}`,
          user_email: email, plan: plan.name, domain: '', status: 'Active',
          version: currentVersion, created_at: new Date().toISOString().slice(0, 10), last_check: '—',
        });
      }
      await db.update('users', 'email', email, { status: 'Active' });
    }
    return json({ ok: true });
  }
  if (action === 'account') {
    const patch = {};
    if (body.name) patch.name = String(body.name).trim();
    if (body.email && String(body.email).includes('@')) patch.email = String(body.email).trim().toLowerCase();
    if (body.password && String(body.password).length >= 8) patch.password_hash = hashPassword(String(body.password));
    if (Object.keys(patch).length === 0) return json({ error: 'Nothing to update' }, 400);
    const row = await db.update('users', 'id', session.uid, patch);
    if (!row) return json({ error: 'Admin account not found' }, 404);
    const res = json({ ok: true, user: { id: row.id, name: row.name, email: row.email, role: row.role } });
    res.headers.set('Set-Cookie', sessionCookie(createSession(row)));
    return res;
  }
  return json({ error: 'Unknown admin action' }, 404);
}
