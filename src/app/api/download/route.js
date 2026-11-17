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

  // 1. A ZIP the admin uploaded in Downloads (stored in the database) wins.
  const stored = await db.setting('pro_zip').catch(() => null);
  if (stored && stored.data) {
    const buf = Buffer.from(stored.data, 'base64');
    return new Response(buf, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${stored.file || current.file}"`,
        'Content-Length': String(buf.length),
        'Cache-Control': 'no-store',
      },
    });
  }

  // 2. The ZIP built on deploy (downloads/modern-product-slider-pro-<v>.zip).
  // If the exact published file is missing (e.g. the admin published a
  // version by hand), fall back to the newest Pro ZIP in the folder rather
  // than failing — the plugin inside is the same code.
  const dir = path.join(process.cwd(), 'downloads');
  let filePath = path.join(dir, current.file);
  if (!fs.existsSync(filePath)) {
    const candidates = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => /^modern-product-slider-pro-.*\.zip$/.test(f)).sort()
      : [];
    if (candidates.length === 0) {
      return json({ error: `Pro ZIP ${current.file} has not been uploaded to the downloads/ folder yet. Ask the admin to upload v${current.version} (Downloads → Upload plugin ZIP).`, version: current.version }, 404);
    }
    filePath = path.join(dir, candidates[candidates.length - 1]);
  }
  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath);
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
      'Content-Length': String(stat.size),
      'Cache-Control': 'no-store',
    },
  });
}
