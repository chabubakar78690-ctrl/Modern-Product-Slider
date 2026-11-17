// License-gated Pro download.
// GET /api/download?key=MPS-...&domain=mystore.com
// Checks the license (same rules as /api/license/verify), then serves the
// current Pro ZIP if the admin has uploaded it to public/downloads/.
// If no ZIP has been uploaded yet, returns 404 with a clear message.
import fs from 'fs';
import path from 'path';
import { getDb } from '../lib/db';
import { json } from '../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = String(searchParams.get('key') || '').trim().toUpperCase();
  const domain = String(searchParams.get('domain') || '').trim().toLowerCase();
  if (!key || !domain) return json({ error: 'key and domain are required' }, 400);

  const db = getDb();
  const license = await db.find('licenses', 'key', key);
  if (!license || license.domain !== domain) return json({ error: 'License not valid for this domain' }, 403);
  if (license.status !== 'Active') return json({ error: 'License is not active' }, 403);

  const versions = await db.all('versions');
  const current = versions.find((v) => v.current) || versions[0];
  if (!current) return json({ error: 'No plugin version published yet' }, 404);
  const filePath = path.join(process.cwd(), 'public', 'downloads', current.file);
  if (!fs.existsSync(filePath)) {
    return json({ error: `Pro ZIP ${current.file} has not been uploaded to public/downloads/ yet. Ask the admin to upload v${current.version}.`, version: current.version }, 404);
  }
  // Redirect to the static file (Vercel serves public/ directly).
  return Response.redirect(new URL(`/downloads/${current.file}`, req.url), 302);
}
