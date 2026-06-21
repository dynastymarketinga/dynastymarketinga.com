/**
 * One-time migration: gallery[] → sections[] for CMS preview + editing.
 * Run: node scripts/migrate-gallery-to-sections.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const casesDir = join(process.cwd(), 'src/content/cases');

function galleryToSections(gallery) {
  return gallery.map((src) => ({
    type: 'media',
    images: [{ src, alt: '' }],
  }));
}

const files = readdirSync(casesDir).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const path = join(casesDir, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));

  if (data.sections?.length || !data.gallery?.length) continue;

  data.sections = galleryToSections(data.gallery);
  delete data.gallery;

  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Migrated:', file, '→', data.sections.length, 'sections');
}
