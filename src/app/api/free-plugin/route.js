// Public free-plugin info — used by the WordPress plugin's update
// checker and by the dashboard (free download card).
// GET /api/free-plugin -> {latest_version, file, size, date, notes, download}
import fs from 'fs';
import path from 'path';
import { json } from '../lib/auth';

export const dynamic = 'force-dynamic';

const FALLBACK_VERSION = '1.0.0';

function freeVersion() {
  try {
    const php = fs.readFileSync(
      path.join(process.cwd(), 'wordpress-plugin', 'modern-product-slider', 'modern-product-slider.php'),
      'utf8'
    );
    const m = php.match(/^\s*\*\s*Version:\s*([0-9.]+)/m);
    if (m) return m[1];
  } catch {}
  return FALLBACK_VERSION;
}

export async function GET() {
  const version = freeVersion();
  let size = '—';
  let date = new Date().toISOString().slice(0, 10);
  try {
    const stat = fs.statSync(path.join(process.cwd(), 'public', 'modern-product-slider-free.zip'));
    size = (stat.size / 1024).toFixed(0) + ' KB';
    date = stat.mtime.toISOString().slice(0, 10);
  } catch {}
  return json({
    latest_version: version,
    file: 'modern-product-slider-free.zip',
    size,
    date,
    notes: 'Free version: WooCommerce product sliders via shortcode and Gutenberg block, with license connect and update checker.',
    download: '/api/free-download',
  });
}
