import fs from 'node:fs';
import path from 'node:path';

/**
 * EAS Prebuild fails if icon/splash PNGs are missing or corrupted.
 * This script ensures we always have valid placeholder PNGs in ./assets.
 *
 * It runs on install in CI (EAS Build) via package.json "postinstall".
 * Replace these placeholders with real branding assets when ready.
 */

const assetsDir = path.resolve(process.cwd(), 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// 1x1 transparent PNG
const PNG_1x1_TRANSPARENT_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6XW7wAAAABJRU5ErkJggg==';
const pngBytes = Buffer.from(PNG_1x1_TRANSPARENT_BASE64, 'base64');

const requiredFiles = [
  'icon.png',
  'splash.png',
  'adaptive-icon.png',
  'favicon.png',
];

for (const file of requiredFiles) {
  const filePath = path.join(assetsDir, file);
  try {
    const stat = fs.statSync(filePath);
    // If file is suspiciously small, rewrite it.
    if (stat.size >= 100) continue;
  } catch {
    // File missing: we'll create it below.
  }
  fs.writeFileSync(filePath, pngBytes);
}

console.log(
  `[ensure-assets] ensured ${requiredFiles.length} PNG assets in ${assetsDir}`
);

