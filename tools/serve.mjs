/** VYROX development server — serves the built site from repo root on port 4173. */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, extname, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const notFound = (res) => {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
};

const serve = async (req, res) => {
  let url = new URL(req.url, `http://localhost:${port}`);
  let path = url.pathname === '/' ? '/index.html' : url.pathname;
  if (path.includes('..')) return notFound(res);

  const file = resolve(root, path.slice(1));
  if (!existsSync(file) || !file.startsWith(root)) {
    // Fall back to index.html for SPA-style page queries served from root.
    const index = resolve(root, 'index.html');
    if (existsSync(index)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(readFileSync(index, 'utf8'));
    } else {
      notFound(res);
    }
    return;
  }

  const type = mime[extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  res.end(readFileSync(file));
};

createServer(serve).listen(port, () => {
  console.log(`VYROX dev server: http://localhost:${port}/`);
  console.log(`Serving ${root}`);
});
