/**
 * Lists root-level files and whether they are referenced by the live site.
 * Run: node scripts/audit-root.mjs
 * Optional: node scripts/audit-root.mjs --json > audit-root.json
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const jsonOut = process.argv.includes('--json');

const KEEP_ALWAYS = new Set([
  'package.json',
  'package-lock.json',
  'astro.config.mjs',
  'tsconfig.json',
  'README.md',
  '.gitignore',
  '.env.example',
  'index.legacy.html',
]);

const KEEP_PATTERNS = [
  /^hero-image\.png$/i,
  /^dynasty-logo\.png$/i,
  /^dynasty-hero-logo\.png$/i,
];

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    try {
      if (statSync(full).isDirectory()) {
        if (['node_modules', 'dist', '.astro', '.git', '.cursor'].includes(name)) continue;
        walkFiles(full, acc);
      } else {
        acc.push(full);
      }
    } catch {
      /* skip */
    }
  }
  return acc;
}

function loadTextFiles() {
  const dirs = ['src', 'public', 'scripts'];
  let blob = '';
  for (const d of dirs) {
    try {
      for (const f of walkFiles(resolve(d))) {
        if (/\.(html|css|js|astro|json|mjs)$/i.test(f)) {
          try {
            blob += readFileSync(f, 'utf8') + '\n';
          } catch {
            /* binary */
          }
        }
      }
    } catch {
      /* missing */
    }
  }
  return blob;
}

const referenceBlob = loadTextFiles();
const rootFiles = readdirSync(root).filter((n) => {
  try {
    return statSync(join(root, n)).isFile();
  } catch {
    return false;
  }
});

const report = [];

for (const name of rootFiles.sort()) {
  if (KEEP_ALWAYS.has(name) || KEEP_PATTERNS.some((p) => p.test(name))) {
    report.push({ file: name, status: 'keep', reason: 'config or primary site asset' });
    continue;
  }

  const referenced =
    referenceBlob.includes(name) ||
    referenceBlob.includes(name.replace(/ /g, '+')) ||
    referenceBlob.includes(encodeURI(name));

  let status = 'review';
  let reason = 'not referenced in src/public/scripts';

  if (/^project-.*\.html$/i.test(name)) {
    status = 'archive';
    reason = 'legacy standalone project page; portfolio uses Astro partials';
  } else if (/^Captura|^ChatGPT|^Diseño/i.test(name)) {
    status = 'archive';
    reason = 'screenshot or design draft';
  } else if (/\.(mov|MOV|mp4)$/i.test(name) && !name.includes('carolina')) {
    status = 'archive';
    reason = 'raw video; site uses public/videos/';
  } else if (/\.(svg|png|jpg|webp)$/i.test(name) && !referenced) {
    status = 'archive';
    reason = 'image not referenced; move to public/assets/raw/';
  } else if (referenced) {
    status = 'keep';
    reason = 'referenced in source';
  }

  report.push({ file: name, status, reason });
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const byStatus = (s) => report.filter((r) => r.status === s);

console.log('\nDynasty — root file audit\n');
console.log('KEEP (' + byStatus('keep').length + ')');
byStatus('keep').forEach((r) => console.log('  ', r.file, '—', r.reason));
console.log('\nARCHIVE (safe to move to public/assets/raw/ or _archive/) — ' + byStatus('archive').length);
byStatus('archive').forEach((r) => console.log('  ', r.file, '—', r.reason));
console.log('\nREVIEW — ' + byStatus('review').length);
byStatus('review').forEach((r) => console.log('  ', r.file, '—', r.reason));
console.log('\nTotal root files:', report.length);
console.log('Tip: do not delete until you confirm duplicates in public/.\n');
