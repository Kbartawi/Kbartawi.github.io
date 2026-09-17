import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
async function pages(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) result.push(...await pages(resolve(dir, entry.name)));
    else if (entry.name.endsWith('.html')) result.push(resolve(dir, entry.name));
  }
  return result;
}
const missing = [];
for (const page of await pages(root)) {
  const html = await readFile(page, 'utf8');
  for (const [, value] of html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)) {
    if (value.startsWith('//')) continue;
    const pathname = decodeURIComponent(new URL(value, 'https://portfolio.local').pathname);
    let target = resolve(root, '.' + pathname);
    try {
      if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
      await stat(target);
    } catch { missing.push({ page, value }); }
  }
}
if (missing.length) throw new Error(JSON.stringify(missing, null, 2));
console.log('PASS: every generated internal page and asset link resolves.');
