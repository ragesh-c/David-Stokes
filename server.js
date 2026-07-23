/**
 * Local dev server for David Stokes website.
 * Serves static files AND handles admin API calls (write JSON, upload images).
 * Usage: node server.js
 */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const url    = require('url');

// ── Load .env file automatically ──────────────────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
  envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const PORT    = process.env.PORT || 8080;
const ROOT    = __dirname;
const DATA    = path.join(ROOT, 'data', 'journal-posts.json');
const IMG_DIR = path.join(ROOT, 'Img', 'Blogs');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

// ── helpers ──────────────────────────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

// Parse multipart/form-data — returns { fields:{}, files:[{name, filename, data}] }
function parseMultipart(buffer, boundary) {
  const sep   = Buffer.from('--' + boundary);
  const nl    = Buffer.from('\r\n');
  const parts = [];
  let start   = 0;

  while (true) {
    const idx = buffer.indexOf(sep, start);
    if (idx === -1) break;
    start = idx + sep.length;
    if (buffer[start] === 0x2d && buffer[start + 1] === 0x2d) break; // '--'
    // skip \r\n after boundary
    if (buffer[start] === 0x0d) start += 2;

    // find end of headers (blank line)
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), start);
    if (headerEnd === -1) break;
    const headers = buffer.slice(start, headerEnd).toString();
    start = headerEnd + 4;

    // find next boundary
    const nextBound = buffer.indexOf(sep, start);
    const bodyEnd   = nextBound === -1 ? buffer.length : nextBound - 2; // -2 for \r\n
    const body      = buffer.slice(start, bodyEnd);
    start = nextBound;

    const nameMatch     = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]*)"/);
    parts.push({
      name:     nameMatch     ? nameMatch[1]     : null,
      filename: filenameMatch ? filenameMatch[1] : null,
      data:     body,
    });
  }

  const fields = {};
  const files  = [];
  for (const p of parts) {
    if (p.filename !== null) files.push(p);
    else if (p.name)          fields[p.name] = p.data.toString();
  }
  return { fields, files };
}

// ── route handlers ────────────────────────────────────────────────────────────

// GET /api/posts  →  return the posts JSON
function handleGetPosts(res) {
  try {
    const raw = fs.readFileSync(DATA, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(raw);
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}

// POST /api/posts  →  body is the full JSON to write
async function handleSavePosts(req, res) {
  try {
    const buf  = await readBody(req);
    const data = JSON.parse(buf.toString());
    fs.writeFileSync(DATA, JSON.stringify(data, null, 2), 'utf8');
    json(res, 200, { ok: true });
  } catch (e) {
    json(res, 400, { error: e.message });
  }
}

// POST /api/upload  →  multipart image upload, saves to Img/Blogs/
async function handleUpload(req, res) {
  try {
    const ct       = req.headers['content-type'] || '';
    const match    = ct.match(/boundary=(.+)$/);
    if (!match) { json(res, 400, { error: 'No boundary' }); return; }
    const buf      = await readBody(req);
    const { files } = parseMultipart(buf, match[1].trim());
    if (!files.length) { json(res, 400, { error: 'No file' }); return; }

    const file     = files[0];
    const filename = Date.now() + '-' + (file.filename || 'upload.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
    const dest     = path.join(IMG_DIR, filename);
    fs.mkdirSync(IMG_DIR, { recursive: true });
    fs.writeFileSync(dest, file.data);
    json(res, 200, { url: '/Img/Blogs/' + filename });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}

// DELETE /api/post/:slug  →  remove post from JSON
async function handleDeletePost(req, res, slug) {
  try {
    const raw  = fs.readFileSync(DATA, 'utf8');
    const data = JSON.parse(raw);
    const orig = data.posts.length;
    data.posts = data.posts.filter(p => p.slug !== slug);
    if (data.posts.length === orig) { json(res, 404, { error: 'Not found' }); return; }
    fs.writeFileSync(DATA, JSON.stringify(data, null, 2), 'utf8');
    json(res, 200, { ok: true });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}

// Static file serving
function serveStatic(req, res, pathname) {
  // map /admin → /admin/index.html
  if (pathname.endsWith('/')) pathname += 'index.html';
  let filepath = path.join(ROOT, pathname);

  // security: no path traversal
  if (!filepath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }

  // if path is a directory, serve its index.html
  try {
    if (fs.statSync(filepath).isDirectory()) {
      filepath = path.join(filepath, 'index.html');
    }
  } catch (_) { /* doesn't exist — let readFile return ENOENT */ }

  fs.readFile(filepath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT' || err.code === 'EISDIR') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + pathname);
      } else {
        res.writeHead(500); res.end(err.message);
      }
      return;
    }
    const ext  = path.extname(filepath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

// ── server ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const parsed   = url.parse(req.url);
  const pathname = decodeURIComponent(parsed.pathname);

  // API routes
  if (pathname === '/api/posts') {
    if (req.method === 'GET')  return handleGetPosts(res);
    if (req.method === 'POST') return handleSavePosts(req, res);
  }
  if (pathname === '/api/upload' && req.method === 'POST') return handleUpload(req, res);

  const deleteMatch = pathname.match(/^\/api\/post\/(.+)$/);
  if (deleteMatch && req.method === 'DELETE') return handleDeletePost(req, res, deleteMatch[1]);

  // Static
  return serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`\n  David Stokes — local dev server`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://localhost:${PORT}/admin\n`);
});
