import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const target = resolve(root, "public", "landing");
await mkdir(target, { recursive: true });
for (const name of ["styles.css", "app.js", "assets"]) {
  await cp(resolve(root, name), resolve(target, name), { recursive: true });
}
// Absolute asset URLs let Next serve the original landing at / and /landing/index.html.
const html = (await readFile(resolve(root, "index.html"), "utf8"))
  .replace(/(src|href)="(assets\/[^\"]+|styles\.css|app\.js)"/g, '$1="/landing/$2"');
await writeFile(resolve(target, "index.html"), html);
console.log("Prepared Michii landing in public/landing/");
