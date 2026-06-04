/**
 * Moves root clutter and legacy folders into _archive/ (local only, gitignored).
 * Run: node scripts/archive-root.mjs
 */
import { mkdirSync, renameSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');

const ARCHIVE_DIRS = {
  design: join(root, '_archive', 'design-drafts'),
  html: join(root, '_archive', 'legacy-html'),
  media: join(root, '_archive', 'legacy-media'),
  folders: join(root, '_archive', 'legacy-folders'),
  dupPublic: join(root, '_archive', 'duplicate-public'),
};

for (const dir of Object.values(ARCHIVE_DIRS)) {
  mkdirSync(dir, { recursive: true });
}

function moveTo(dir, name) {
  const from = join(root, name);
  if (!existsSync(from)) return false;
  const to = join(dir, name);
  renameSync(from, to);
  console.log('  →', name);
  return true;
}

function moveFolderToArchive(folderName) {
  const from = join(root, folderName);
  if (!existsSync(from)) return false;
  const to = join(ARCHIVE_DIRS.folders, folderName);
  try {
    renameSync(from, to);
  } catch (err) {
    if (err?.code !== 'EPERM' && err?.code !== 'EXDEV') throw err;
    console.warn('  !', folderName + '/ — rename blocked; run: npm run archive:root again or move manually');
    return false;
  }
  console.log('  →', folderName + '/');
  return true;
}

console.log('\nArchiving root design drafts & legacy HTML…');
const rootFiles = readdirSync(root).filter((n) => {
  try {
    return statSync(join(root, n)).isFile();
  } catch {
    return false;
  }
});

for (const name of rootFiles) {
  if (/^Captura|^ChatGPT|^Diseño/i.test(name)) {
    moveTo(ARCHIVE_DIRS.design, name);
  } else if (/^project-.*\.html$/i.test(name)) {
    moveTo(ARCHIVE_DIRS.html, name);
  } else if (/^copy_.*\.(mov|MOV)$/i.test(name) || /\.(mov|MOV)$/i.test(name)) {
    moveTo(ARCHIVE_DIRS.media, name);
  } else if (
    /^DYNASTY\.png$/i.test(name) ||
    /^dynasty-logo-clean\.svg$/i.test(name) ||
    /^dynasty-logo\.svg$/i.test(name)
  ) {
    moveTo(ARCHIVE_DIRS.design, name);
  } else if (name === 'contact.html') {
    moveTo(ARCHIVE_DIRS.html, name);
  }
}

console.log('\nRemoving root duplicates (canonical copies live in public/)…');
for (const name of ['hero-image.png', 'dynasty-logo.png', 'dynasty-hero-logo.png']) {
  const pub = join(root, 'public', name);
  const atRoot = join(root, name);
  if (existsSync(atRoot) && existsSync(pub)) {
    moveTo(ARCHIVE_DIRS.dupPublic, name);
  }
}

console.log('\nMoving legacy / duplicate folders off repo root…');
const legacyFolders = [
  'BE ACADEMY',
  'TROPICAL',
  'dynasty-v2-separated',
  'squarespace-snippets',
  'squarespace-snippets-v2',
  'assets',
  'videos',
  'axones',
];
for (const f of legacyFolders) moveFolderToArchive(f);

const dupDynasty = join(root, 'public', 'assets', 'dynasty');
if (existsSync(dupDynasty)) {
  const to = join(ARCHIVE_DIRS.dupPublic, 'assets-dynasty');
  mkdirSync(join(ARCHIVE_DIRS.dupPublic), { recursive: true });
  renameSync(dupDynasty, to);
  console.log('  → public/assets/dynasty/ (unused duplicate tree)');
}

const staleContact = join(root, 'public', 'contact.html');
if (existsSync(staleContact)) {
  renameSync(staleContact, join(ARCHIVE_DIRS.html, 'contact-public-stale.html'));
  console.log('  → public/contact.html (stale; site uses src/partials)');
}

console.log('\nDone. Review _archive/ then delete that folder when you no longer need backups.\n');
