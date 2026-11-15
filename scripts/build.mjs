import { mkdir, cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'assets']) {
  await cp(resolve(root, file), resolve(out, file), { recursive: true });
}
console.log('Built static landing page in dist/');
