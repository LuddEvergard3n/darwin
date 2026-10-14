import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
createServer(async (request, response) => {
  const path = normalize(join(root, decodeURIComponent(new URL(request.url, 'http://localhost').pathname.replace(/^\/+/, '') || 'index.html')));
  if (!path.startsWith(root)) { response.writeHead(403); return response.end(); }
  try { const file = (await stat(path)).isDirectory() ? join(path, 'index.html') : path; response.writeHead(200, { 'Content-Type': `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8` }); response.end(await readFile(file)); }
  catch { response.writeHead(404); response.end('Não encontrado'); }
}).listen(8082, () => console.log('Darwin em http://127.0.0.1:8082/'));
