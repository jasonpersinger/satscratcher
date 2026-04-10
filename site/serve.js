'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { build } = require('./build.js');

const PORT = Number(process.env.PORT || 4321);
const DIST = path.join(__dirname, 'dist');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function resolveRequest(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  let filePath = path.join(DIST, cleanPath);
  if (!filePath.startsWith(DIST)) return path.join(DIST, '404.html');
  if (cleanPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) return path.join(DIST, '404.html');
  return filePath;
}

build();

http.createServer((req, res) => {
  const filePath = resolveRequest(req.url || '/');
  const status = filePath.endsWith('404.html') && req.url !== '/404.html' ? 404 : 200;
  const ext = path.extname(filePath);
  res.writeHead(status, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`SatScratcher site: http://localhost:${PORT}`);
});
