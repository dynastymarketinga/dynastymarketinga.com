import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/content/cases';
const orderMap = {
  beu: 1,
  russo: 2,
  wcc: 3,
  lf: 4,
  'la-duquesa': 5,
  'jennyfer-portillo': 6,
  'dynasty-marketing': 8,
  'la-mubi-miami': 9,
  'laf-wine-opener': 10,
  'taco-x-libra': 11,
  axones: 12,
  'pensamientos-al-aire': 13,
  tl: 14,
};

const categoryPatches = {
  lf: 'branding content',
  axones: 'software content',
  'pensamientos-al-aire': 'content branding',
};

for (const file of readdirSync(dir)) {
  if (!file.endsWith('.json')) continue;
  const path = join(dir, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const slug = data.slug;

  if (orderMap[slug] !== undefined) data.order = orderMap[slug];
  if (categoryPatches[slug]) data.category = categoryPatches[slug];
  if (slug === 'carolina') data.published = false;
  else if (data.published === undefined) data.published = true;
  if (slug === 'axones') data.demoUrl = '/axones/index.html';

  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log('Updated case JSON metadata');
