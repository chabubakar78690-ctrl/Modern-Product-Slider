// Payments API (signed-in users).
// GET /api/payments -> own payments (admin: all)
import { getDb } from '../lib/db';
import { requireUser, json } from '../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { session, error } = requireUser(req);
  if (error) return error;
  const db = getDb();
  const all = await db.all('payments');
  const mine = session.role === 'admin' ? all : all.filter((p) => p.user_email === session.email);
  return json({ payments: mine });
}
