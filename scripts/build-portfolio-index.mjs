/**
 * Build lightweight index for CMS list thumbnails (cardImage per slug).
 * Output: public/admin/portfolio-index.json
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const casesDir = join(process.cwd(), 'src/content/cases');
const outPath = join(process.cwd(), 'public/admin/portfolio-index.json');

const files = readdirSync(casesDir).filter((f) => f.endsWith('.json'));
const index = [];

for (const file of files) {
  const data = JSON.parse(readFileSync(join(casesDir, file), 'utf8'));
  if (!data.slug) continue;
  index.push({
    slug: data.slug,
    order: data.order ?? 0,
    title: data.title ?? file.replace('.json', ''),
    cardImage: data.cardImage || null,
    video: data.video || null,
    published: data.published !== false,
  });
}

index.sort((a, b) => a.order - b.order);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log('portfolio-index:', index.length, 'entries →', outPath);
