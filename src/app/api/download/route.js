// License-gated Pro download.
// GET /api/download?key=MPS-...&domain=mystore.com
// Checks the license (same rules as /api/license/verify), then streams the
// current Pro ZIP from the private downloads/ folder at the project root.
// The file is never served from public/ — a redirect to a public URL would
// let anyone share the link and download without a license.
import fs from 'fs';
import path from 'path';
import { getDb } from '../lib/db';
import { json, readSession } from '../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = String(searchParams.get('key') || '').trim().toUpperCase();
  const domain = String(searchParams.get('domain') || '').trim().toLowerCase();
  const session = readSession(req);
  const isAdmin = session?.role === 'admin';
  if (!isAdmin && (!key || !domain)) return json({ error: 'key and domain are required' }, 400);

  const db = getDb();

  if (!isAdmin) {
    const license = await db.find('licenses', 'key', key);
    if (!license || license.domain !== domain) return json({ error: 'License not valid for this domain' }, 403);
    if (license.status !== 'Active') return json({ error: 'License is not active' }, 403);
  }

  const versions = await db.all('versions');
  const current = versions.find((v) => v.current) || versions[0];
  if (!current) return json({ error: 'No plugin version published yet' }, 404);
  const filePath = path.join(process.cwd(), 'downloads', current.file);
  if (!fs.existsSync(filePath)) {
    return json({ error: `Pro ZIP ${current.file} has not been uploaded to the downloads/ folder yet. Ask the admin to upload v${current.version}.`, version: current.version }, 404);
  }
  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath);
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${current.file}"`,
      'Content-Length': String(stat.size),
      'Cache-Control': 'no-store',
    },
  });
}
