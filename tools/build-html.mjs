/**
 * VYROX static page generator.
 * src/pages/**\/*.html  ->  ./**\/*.html
 * Shared chrome lives once in src/partials. Generated HTML is never hand-edited.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = resolve(root, 'src/pages');
const partialsDir = resolve(root, 'src/partials');

if (!existsSync(pagesDir)) {
  console.error('build-html: src/pages does not exist');
  process.exit(1);
}

const partial = (name) => {
  const file = resolve(partialsDir, `${name}.html`);
  if (!existsSync(file)) throw new Error(`build-html: missing partial ${name}.html`);
  return readFileSync(file, 'utf8');
};

const partials = {
  head: partial('head'),
  header: partial('header'),
  footer: partial('footer'),
  overlays: partial('overlays'),
  scripts: partial('scripts'),
  adminHead: partial('admin-head'),
  adminShell: partial('admin-shell'),
  adminScripts: partial('admin-scripts')
};

const walk = (dir) => readdirSync(dir).flatMap((entry) => {
  const full = join(dir, entry);
  return statSync(full).isDirectory() ? walk(full) : [full];
});

const parsePage = (raw) => {
  const match = raw.match(/^\s*<!--([\s\S]*?)-->/);
  const meta = {};
  if (match && match[1].includes('@page')) {
    for (const [, key, value] of match[1].matchAll(/@(\w+):\s*(.+)/g)) {
      meta[key.toLowerCase()] = value.trim();
    }
  }
  const body = match && match[1].includes('@page') ? raw.slice(match[0].length) : raw;
  return { meta, body };
};

const applyTokens = (html, tokens) => html
  .replace(/\{\{ACTIVE:([\w-]+)\}\}/g, (_, key) => key === tokens.PAGE ? 'is-active' : '')
  .replace(/\{\{YEAR\}\}/g, String(new Date().getFullYear()))
  .replace(/\{\{(\w+)\}\}/g, (whole, key) => (key in tokens ? tokens[key] : whole));

const pages = walk(pagesDir).filter((file) => file.endsWith('.html'));
if (!pages.length) {
  console.error('build-html: no pages found in src/pages');
  process.exit(1);
}

const built = [];
for (const file of pages) {
  const rel = relative(pagesDir, file).replaceAll('\\', '/');
  const isAdmin = rel.startsWith('admin/');
  const depth = rel.split('/').length - 1;
  const rootPath = '../'.repeat(depth) || './';
  const { meta, body } = parsePage(readFileSync(file, 'utf8'));
  const page = meta.page || rel.replace('.html', '').split('/').pop();
  const title = meta.title || 'VYROX';
  const desc = meta.desc || 'VYROX — Your World. Your Rules. Premium general commerce, built for the bold.';

  const tokens = { PAGE: page, TITLE: title, DESC: desc, ROOT: rootPath, BODY: body, YEAR: String(new Date().getFullYear()) };

  let html;
  if (isAdmin) {
    html = applyTokens(partials.adminHead, tokens)
      + applyTokens(partials.adminShell, tokens)
      + applyTokens(partials.adminScripts, tokens);
  } else {
    html = applyTokens(partials.head, tokens)
      + applyTokens(partials.header, tokens)
      + applyTokens(partials.overlays, tokens)
      + `<main id="main">\n${body}\n</main>\n`
      + applyTokens(partials.footer, tokens)
      + applyTokens(partials.scripts, tokens);
  }

  const out = resolve(root, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  built.push(rel);
}

console.log(`build-html: ${built.length} pages`);
for (const page of built) console.log(`  ${page}`);
