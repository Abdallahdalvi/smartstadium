/**
 * Minimal dependency-free development server for the static SmartStadium app.
 * Run with `npm start` and visit http://127.0.0.1:4174.
 */

'use strict';

const http = require('http');
const { readFile } = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = 4174;
const ROOT = __dirname;
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function respond(response, statusCode, body = '') {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relativePath);

  if (!filePath.startsWith(`${ROOT}${path.sep}`)) {
    respond(response, 403, 'Forbidden');
    return;
  }

  readFile(filePath, (error, data) => {
    if (error) {
      respond(response, error.code === 'ENOENT' ? 404 : 500, error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream'
    });
    response.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`SmartStadium is running at http://${HOST}:${PORT}`);
});
