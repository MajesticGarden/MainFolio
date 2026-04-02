import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.join(__dirname, '../public/gallery');
const DST = path.join(__dirname, '../public/thumbs');
const THUMB_WIDTH = 600; // Optimized from 1200 for 440px grid cells

async function generateThumbs() {
  console.log('--- Generating Vercel-Optimized Thumbnails ---');

  if (!fs.existsSync(DST)) {
    fs.mkdirSync(DST, { recursive: true });
  }

  const files = fs.readdirSync(SRC).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
  const total = files.length;
  let count = 0;

  for (const file of files) {
    const srcPath = path.join(SRC, file);
    const destPath = path.join(DST, file);

    // Skip if thumb already exists (Speeds up Vercel builds)
    // NOTE: To force regenerate at 600px, manually delete the public/thumbs folder once.
    if (fs.existsSync(destPath)) {
      count++;
      // check size? if it's too large, it might be an old 1200px one
      const stats = fs.statSync(destPath);
      if (stats.size > 100 * 1024) { // over 100kb? Probably old 1200px thumb
        console.log(`[${count}/${total}] UPDATING (Too large): ${file}`);
      } else {
        // console.log(`[${count}/${total}] SKIP (exists): ${file}`);
        continue;
      }
    } else {
      count++;
    }

    try {
      await sharp(srcPath)
        .resize(THUMB_WIDTH)
        .jpeg({ quality: 75, progressive: true })
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
