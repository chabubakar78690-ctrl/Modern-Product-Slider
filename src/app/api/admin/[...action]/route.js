// Admin API (admin session only).
// GET  /api/admin/overview            -> revenue, customers, licenses, MRR, recent payments
// GET  /api/admin/users               -> all users
// GET  /api/admin/payments            -> all payments
// GET  /api/admin/pricing  PUT /api/admin/pricing {plans}
// GET  /api/admin/settings PUT /api/admin/settings {oauth?, payfast?}
import { getDb, getSettings, isDemoMode } from '../../lib/db';
import { requireAdmin, json } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { session, error } = requireAdmin(req);
  if (error) return error;
  const db = getDb();
  const action = params.action?.[0];

  if (action === 'overview') {
    const [users, licenses, payments] = await Promise.all([db.all('users'), db.all('licenses'), db.all('payments')]);
    const completed = payments.filter((p) => p.status === 'Completed');
    const revenue = completed.reduce((s, p) => s + Number(p.amount || 0), 0);
    const mrr = users.filter((u) => u.status === 'Active' && u.plan === 'Unlimited Sites').length * 10
      + users.filter((u) => u.status === 'Active' && u.plan === 'Single Site').length * 3;
    return json({ demo: isDemoMode(), revenue, customers: users.filter((u) => u.status === 'Active').length, totalUsers: users.length, activeLicenses: licenses.filter((l) => l.status === 'Active').length, totalLicenses: licenses.length, mrr, payments: payments.slice(0, 5), licenses: licenses.slice(0, 5) });
  }
  if (action === 'users') return json({ users: await db.all('users') });
  if (action === 'payments') return json({ payments: await db.all('payments') });
  if (action === 'pricing') { const { plans } = await getSettings(); return json({ plans }); }
  if (action === 'settings') { const s = await getSettings(); return json({ oauth: s.oauth, payfast: s.payfast, demo: isDemoMode() }); }
  return json({ error: 'Unknown admin action' }, 404);
}

export async function PUT(req, { params }) {
  const { error } = requireAdmin(req);
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
  return json({ error: 'Unknown admin action' }, 404);
}
