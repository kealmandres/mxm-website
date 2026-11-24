// Local preview of the site with the Observatory blog function running.
//
//   node build.js && NOTION_TOKEN=... node scripts/observatory/dev-server.mjs   (PORT, default 3001)
//
// Serves dist/ and applies vercel.json's rewrites (read from the file, so routes match Vercel),
// running api/blog.js for the blog routes. A preview only: no caching, no headers from vercel.json.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from '../../api/blog.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT ?? 3001);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
    '.xml': 'application/xml', '.txt': 'text/plain', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'audio/webm', '.ttf': 'font/ttf',
    '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2' };

// vercel.json rewrites to local paths, as [regex, destination with $1.. for :params]
const rewrites = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).rewrites
    .filter(r => r.destination.startsWith('/'))
    .map(r => {
        const names = [];
        const re = new RegExp(`^${r.source.replace(/:([a-z]+)\*?/gi, (m, n) => (names.push(n), m.endsWith('*') ? '(.*)' : '([^/]+)'))}$`);
        return { re, names, destination: r.destination };
    });

function rewrite(pathname) {
    for (const r of rewrites) {
        const m = pathname.match(r.re);
        if (m) return r.names.reduce((d, n, i) => d.replaceAll(`:${n}`, m[i + 1]), r.destination);
    }
    return pathname;
}

http.createServer(async (req, res) => {
    const url = new URL(rewrite(new URL(req.url, 'http://x').pathname), `http://localhost:${PORT}`);
    if (url.pathname === '/api/blog') {
        const shim = {
            status(code) { res.statusCode = code; return shim; },
            setHeader(k, v) { res.setHeader(k, v); return shim; },
            send(body) { res.end(body); return shim; },
            redirect(code, to) { res.writeHead(code, { Location: to }); res.end(); return shim; },
        };
        const query = Object.fromEntries(url.searchParams);
        return handler({ method: req.method, query, headers: { ...req.headers, 'x-forwarded-proto': 'http' } }, shim);
    }
    let file = path.join(DIST, decodeURIComponent(url.pathname));
    if (!file.startsWith(DIST)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Preview with the blog function: http://localhost:${PORT}/future-observatory/blog/`));
