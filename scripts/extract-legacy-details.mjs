import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('src/partials/portfolio.html', 'utf8');
const skipIds = new Set(['russo', 'beu', 'la-duquesa']);
const parts = html.split(/(?=<!-- DETAIL:)/);
const out = parts
  .filter((p) => {
    if (!p.startsWith('<!-- DETAIL:')) return false;
    const m = p.match(/id="det-([^"]+)"/);
    return m && !skipIds.has(m[1]);
  })
  .join('');

writeFileSync('src/partials/portfolio-legacy-details.html', out.trim());
console.log('legacy detail blocks:', out.split('<!-- DETAIL:').length - 1);
