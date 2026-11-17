// Public login-provider flags — used by the login popup to show only the
// providers the admin turned ON in Profile > Admin settings > Social login.
// Only the enabled flags are exposed; no keys or secrets ever leave the server.
// GET /api/auth/providers -> {google, facebook, apple}
import { getSettings } from '../../lib/db';
import { json } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { oauth } = await getSettings();
  return json({
    google: oauth?.google?.enabled !== false,
    facebook: oauth?.facebook?.enabled === true,
    apple: oauth?.apple?.enabled === true,
  });
}
