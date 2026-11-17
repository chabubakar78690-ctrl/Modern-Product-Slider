// Builds the plugin ZIPs for the landing page and the dashboard.
// Runs as `prebuild` (npm run build triggers it automatically, including
// on Vercel), so the ZIPs never have to be committed — the plugin sources
// in wordpress-plugin/ are plain text files, and the ZIPs are regenerated
// from them on every deploy.
//   public/modern-product-slider-free.zip        -> landing page download
//   downloads/modern-product-slider-pro-<v>.zip -> license-gated Pro download
// The version comes from the plugin's own header (Version: x.y.z).
const fs = require('fs');
const path = require('path');

async function main() {
  const archiver = require('archiver');
  const root = path.join(__dirname, '..');
  const srcDir = path.join(root, 'wordpress-plugin', 'modern-product-slider');
  if (!fs.existsSync(srcDir)) {
    console.error('Plugin source missing:', srcDir);
    process.exit(1);
  }
  const header = fs.readFileSync(path.join(srcDir, 'modern-product-slider.php'), 'utf8');
  const version = (header.match(/^\s*\*\s*Version:\s*(\S+)/m) || [])[1] || '1.0.0';

  const build = (outFile, label) => new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const output = fs.createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => { console.log(`${label} ZIP built:`, outFile, fs.statSync(outFile).size, 'bytes'); resolve(); });
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(srcDir, 'modern-product-slider');
    archive.finalize();
  });

  await build(path.join(root, 'public', 'modern-product-slider-free.zip'), 'Free plugin');
  await build(path.join(root, 'downloads', `modern-product-slider-pro-${version}.zip`), 'Pro plugin');
  console.log('Plugin version:', version);
}

main().catch((e) => { console.error('Plugin build failed:', e); process.exit(1); });
