'use strict';

/**
 * Emit tiny solid-color PNGs for every asset path the site references.
 * These are replaced with real art before launch — but having them lets the
 * build, dev server, and Playwright tests run without 404s.
 *
 * PNG format refresher:
 *   8-byte signature + IHDR chunk (header) + IDAT (deflated pixel data) + IEND.
 * We hand-roll a minimal 16x16 RGBA PNG with a single solid color.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const IMG_DIR = path.join(__dirname, '..', 'src', 'assets', 'img');

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function solidPng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;        // bit depth
  ihdr[9] = 6;        // color type RGBA
  ihdr[10] = 0;       // compression
  ihdr[11] = 0;       // filter
  ihdr[12] = 0;       // interlace

  // Raw pixel data: each row starts with filter byte 0, then RGBA per pixel.
  const rowLen = 1 + size * 4;
  const raw = Buffer.alloc(rowLen * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0;
    for (let x = 0; x < size; x++) {
      const off = y * rowLen + 1 + x * 4;
      raw[off] = rgba[0];
      raw[off + 1] = rgba[1];
      raw[off + 2] = rgba[2];
      raw[off + 3] = rgba[3];
    }
  }
  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const PLACEHOLDERS = [
  // Mascot: jackpot orange
  { rel: 'mascot/neutral.png',    color: [245, 166, 35, 255] },
  { rel: 'mascot/scratching.png', color: [245, 166, 35, 255] },
  { rel: 'mascot/winning.png',    color: [245, 166, 35, 255] },
  { rel: 'mascot/losing.png',     color: [245, 166, 35, 255] },
  // Logo: primary orange
  { rel: 'logo/primary.png',  color: [251, 97, 7, 255] },
  { rel: 'logo/compact.png',  color: [251, 97, 7, 255] },
  { rel: 'logo/wordmark.png', color: [251, 97, 7, 255] },
  { rel: 'logo/favicon.png',  color: [251, 97, 7, 255] },
  // Product: elevated surface
  { rel: 'product/hero.jpg',            color: [46, 48, 50, 255] },
  { rel: 'product/styled-desk.jpg',     color: [46, 48, 50, 255] },
  { rel: 'product/whats-in-box.jpg',    color: [46, 48, 50, 255] },
  { rel: 'product/display-closeup.jpg', color: [46, 48, 50, 255] },
  // Decor: signal teal
  { rel: 'decor/pixel-coin.png',    color: [27, 153, 139, 255] },
  { rel: 'decor/scratch-panel.png', color: [27, 153, 139, 255] },
];

function main() {
  for (const p of PLACEHOLDERS) {
    const out = path.join(IMG_DIR, p.rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    // The .jpg product files are actually PNGs internally — fine for placeholders;
    // replaced with real JPEGs before launch.
    fs.writeFileSync(out, solidPng(16, p.color));
  }
  console.log(`wrote ${PLACEHOLDERS.length} placeholder images`);
}

main();
