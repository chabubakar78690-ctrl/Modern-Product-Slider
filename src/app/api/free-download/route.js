// Free plugin download — no license needed. The ZIP is built from
// wordpress-plugin/ by scripts/build-free-plugin.js (prebuild step).
// GET /api/free-download -> modern-product-slider-free.zip
import fs from 'fs';
import path from 'path';
import { json } from '../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
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
