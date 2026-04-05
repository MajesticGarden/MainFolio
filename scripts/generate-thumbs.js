import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.join(__dirname, '../public/gallery');
const DST = path.join(__dirname, '../public/thumbs');
const THUMB_WIDTH = 1200; // Increased from 600 for high-DPI (Retina) support

async function generateThumbs() {
  console.log('--- Generating High-Fidelity Thumbnails ---');

  if (!fs.existsSync(DST)) {
    fs.mkdirSync(DST, { recursive: true });
  }

  const files = fs.readdirSync(SRC).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
  const total = files.length;
  let count = 0;

  for (const file of files) {
    const srcPath = path.join(SRC, file);
    const destPath = path.join(DST, file);

    // Skip if thumb already exists (Run npm run clean-thumbs to force regenerate)
    if (fs.existsSync(destPath)) {
      count++;
      continue;
    } else {
      count++;
    }

    try {
      await sharp(srcPath)
        .resize(THUMB_WIDTH)
        .jpeg({ quality: 90, progressive: true, mozjpeg: true })
        .toFile(destPath);

      const size = (fs.statSync(destPath).size / 1024).toFixed(1);
      console.log(`[${count}/${total}] OK (${size}kb): ${file}`);
    } catch (err) {
      console.error(`[${count}/${total}] ERROR: ${file}`, err.message);
    }
  }

  console.log('--- Thumbnail Generation Complete ---');
}

generateThumbs();
