// Public plugin info — used by the WordPress plugin's update checker.
// GET /api/plugin -> {latest_version, file, date, notes, download_requires_license: true}
import { getDb } from '../lib/db';
import { json } from '../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const versions = await db.all('versions');
  const current = versions.find((v) => v.current) || versions[0];
  if (!current) return json({ error: 'No version published' }, 404);
  return json({
    latest_version: current.version,
    file: current.file,
    size: current.size,
    date: current.date,
    notes: current.notes,
    download_requires_license: true,
    download: '/api/download',
  });
}
