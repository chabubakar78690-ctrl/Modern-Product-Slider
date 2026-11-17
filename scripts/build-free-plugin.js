// Builds the Free plugin ZIP for the landing page download.
// Runs as `prebuild` (npm run build triggers it automatically, including
// on Vercel), so the ZIP never has to be committed — the plugin sources
// in wordpress-plugin/ are plain text files, and the ZIP is regenerated
// from them on every deploy.
const fs = require('fs');
const path = require('path');

async function main() {
  const archiver = require('archiver');
  const root = path.join(__dirname, '..');
  const srcDir = path.join(root, 'wordpress-plugin', 'modern-product-slider');
  const outFile = path.join(root, 'public', 'modern-product-slider-free.zip');
  if (!fs.existsSync(srcDir)) {
    console.error('Free plugin source missing:', srcDir);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const output = fs.createWriteStream(outFile);
  const archive = archiver('zip', { zlib: { level: 9 } });
  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(srcDir, 'modern-product-slider');
    archive.finalize();
  });
  console.log('Free plugin ZIP built:', outFile, fs.statSync(outFile).size, 'bytes');
}

main().catch((e) => { console.error('Free plugin build failed:', e); process.exit(1); });
