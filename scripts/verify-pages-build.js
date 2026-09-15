import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('dist/index.html', 'utf8');
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
const worker = await readFile('dist/sw.js', 'utf8');

for (const asset of ['./src/styles.css', './src/app.js', './manifest.webmanifest', './icon.svg']) {
  assert.ok(html.includes(asset), `index.html must reference ${asset} relatively`);
}
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.equal(manifest.icons[0].src, './icon.svg');
assert.match(worker, /new URL\('\.\/index\.html', self\.location\.href\)/);

const rootPath = /(?:href|src)="\/(?!\/)|register\('\/sw\.js'\)|"(?:start_url|scope|src)":\s*"\//;
assert.doesNotMatch(html + worker + JSON.stringify(manifest), rootPath);
console.log('✓ GitHub Pages project-site paths are relative and subpath-safe');
