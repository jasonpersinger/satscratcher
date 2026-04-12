'use strict';

/**
 * Zero-dependency static file server for dist/.
 * Usage: node serve.js [port]
 *
 * Exists so Playwright tests can spin up the site without adding a server
 * dependency (express, vite, etc.) to package.json.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const DIST = path.join(__dirname, 'dist');
const PORT = Number(process.argv[2] || process.env.PORT || 4321);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico':  'image/x-icon',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
};

function resolveFile(urlPath) {
  var clean;
  try { clean = decodeURIComponent(urlPath.split('?')[0]); }
  catch (_) { return null; }
  // Prevent path traversal — resolve and check it's still inside DIST.
  var candidate = path.normalize(path.join(DIST, clean));
  if (!candidate.startsWith(DIST)) return null;

  // Directory → index.html
  try {
    var stat = fs.statSync(candidate);
    if (stat.isDirectory()) candidate = path.join(candidate, 'index.html');
  } catch (_) {
    // Try .html extension for extensionless routes
    if (!path.extname(candidate)) {
      var withHtml = candidate + '.html';
      if (fs.existsSync(withHtml)) return withHtml;
    }
    return null;
  }

  return fs.existsSync(candidate) ? candidate : null;
}

const server = http.createServer(function (req, res) {
  var file = resolveFile(req.url);
  if (!file) {
    var notFound = path.join(DIST, '404.html');
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFound).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404');
    }
    return;
  }
  var ext = path.extname(file).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, function () {
  console.log('serving ' + DIST + ' at http://localhost:' + PORT);
});
