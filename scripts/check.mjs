import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, 'HTML IDs must be unique');
for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
  assert(ids.includes(match[1]), `Missing anchor: ${match[1]}`);
}
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (match[1].startsWith('/')) assert(['/journey', '/profile', '/jobs'].includes(match[1]), `Unknown application route: ${match[1]}`);
  else if (!/^https?:/.test(match[1])) await access(resolve(root, match[1]));
}
for (const match of css.matchAll(/url\('([^']+)'\)/g)) await access(resolve(root, match[1]));
assert(html.includes('Dữ liệu mẫu'), 'The preview must disclose illustrative data');
assert(css.includes('prefers-reduced-motion'), 'Respect reduced-motion preferences');
console.log('Validated local assets, anchors, unique IDs and preview disclosures.');
