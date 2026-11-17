// Free plugin download — no license needed.
// GET /api/free-download -> modern-product-slider-free.zip
// Prefers a ZIP the admin uploaded in Downloads (stored in the database),
// otherwise the ZIP built from wordpress-plugin/ by the prebuild step.
import fs from 'fs';
import path from 'path';
import { getDb } from '../lib/db';
import { json } from '../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const stored = await db.setting('free_zip').catch(() => null);
  if (stored && stored.data) {
    const buf = Buffer.from(stored.data, 'base64');
    return new Response(buf, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${stored.file || 'modern-product-slider-free.zip'}"`,
        'Content-Length': String(buf.length),
      },
    });
  }
  const file = path.join(process.cwd(), 'public', 'modern-product-slider-free.zip');
  if (!fs.existsSync(file)) {
    return json({ error: 'The free plugin file is not built yet. Please try again in a minute.' }, 404);
  }
  const stat = fs.statSync(file);
  const stream = fs.createReadStream(file);
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="modern-product-slider-free.zip"',
      'Content-Length': String(stat.size),
    },
  });
}
