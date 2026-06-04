/**
 * Keeps deploy lean: source videos in public/assets/raw/ are not used by the site.
 * If the folder reappears, move it to _archive/ before dev/build.
 */
import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';

const rawDir = resolve('public/assets/raw');
const archiveDir = resolve('_archive/public-assets-raw');

if (!existsSync(rawDir)) {
  console.log('prune-public: no public/assets/raw (ok)');
  process.exit(0);
}

mkdirSync(resolve('_archive'), { recursive: true });
if (existsSync(archiveDir)) {
  console.warn('prune-public: _archive/public-assets-raw already exists; remove public/assets/raw manually');
  process.exit(1);
}

renameSync(rawDir, archiveDir);
console.log('prune-public: moved public/assets/raw -> _archive/public-assets-raw');
