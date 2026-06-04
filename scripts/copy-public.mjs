import { cpSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const pairs = [
  ['src/styles', 'public/styles'],
  ['src/scripts', 'public/scripts'],
];

for (const [from, to] of pairs) {
  mkdirSync(resolve(to), { recursive: true });
  cpSync(resolve(from), resolve(to), { recursive: true, force: true });
  console.log(`copied ${from} -> ${to}`);
}
