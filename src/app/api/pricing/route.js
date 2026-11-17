// Public pricing — the landing page reads its prices from here so an admin
// price change in the dashboard shows up on the website too.
// GET /api/pricing -> {plans}
import { getSettings } from '../lib/db';
import { json } from '../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { plans } = await getSettings();
  return json({ plans });
}
