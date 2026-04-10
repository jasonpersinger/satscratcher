'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { build, parseFrontmatter, expandPartials, substituteVars } = require('../build.js');

test('parseFrontmatter extracts key/value pairs from an HTML comment block', () => {
  const input = '<!--\ntitle: Hello\nbodyClass: home\n-->\n<p>Body</p>';
  const { frontmatter, body } = parseFrontmatter(input);
  assert.equal(frontmatter.title, 'Hello');
  assert.equal(frontmatter.bodyClass, 'home');
  assert.equal(body.trim(), '<p>Body</p>');
});

test('parseFrontmatter returns empty frontmatter when no block is present', () => {
  const input = '<p>Just body.</p>';
  const { frontmatter, body } = parseFrontmatter(input);
  assert.deepEqual(frontmatter, {});
  assert.equal(body, input);
});

test('expandPartials inlines named partial files', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sat-build-'));
  fs.mkdirSync(path.join(tmp, '_partials'));
  fs.writeFileSync(path.join(tmp, '_partials', 'foo.html'), '<span>FOO</span>');
  assert.equal(expandPartials('before {{> foo}} after', path.join(tmp, '_partials')), 'before <span>FOO</span> after');
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('expandPartials is non-recursive by design', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sat-build-'));
  fs.mkdirSync(path.join(tmp, '_partials'));
  fs.writeFileSync(path.join(tmp, '_partials', 'a.html'), '{{> b}}');
  fs.writeFileSync(path.join(tmp, '_partials', 'b.html'), 'B');
  assert.equal(expandPartials('{{> a}}', path.join(tmp, '_partials')), '{{> b}}');
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('substituteVars replaces known tokens and leaves unknown tokens visible', () => {
  assert.equal(substituteVars('Hi {{name}}, {{missing}}.', { name: 'Jason' }), 'Hi Jason, {{missing}}.');
});

test('build writes pages and copies assets', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sat-build-'));
  const src = path.join(tmp, 'src');
  const dist = path.join(tmp, 'dist');
  fs.mkdirSync(path.join(src, '_partials'), { recursive: true });
  fs.mkdirSync(path.join(src, 'guide'), { recursive: true });
  fs.mkdirSync(path.join(src, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(src, '_layout.html'), '<html><head><title>{{title}}</title></head><body>{{> topbar}}{{content}}</body></html>');
  fs.writeFileSync(path.join(src, '_partials', 'topbar.html'), '<nav>NAV</nav>');
  fs.writeFileSync(path.join(src, 'assets', 'style.css'), 'body{}');
  fs.writeFileSync(path.join(src, 'index.html'), '<!--\ntitle: Home\n-->\n<h1>Hello</h1>');
  fs.writeFileSync(path.join(src, 'guide', 'quickstart.html'), '<!--\ntitle: QS\n-->\n<p>Start here.</p>');

  build({ srcDir: src, distDir: dist, vars: {} });

  assert.match(fs.readFileSync(path.join(dist, 'index.html'), 'utf8'), /<title>Home<\/title>/);
  assert.match(fs.readFileSync(path.join(dist, 'index.html'), 'utf8'), /<nav>NAV<\/nav>/);
  assert.match(fs.readFileSync(path.join(dist, 'guide', 'quickstart.html'), 'utf8'), /<p>Start here\.<\/p>/);
  assert.ok(fs.existsSync(path.join(dist, 'assets', 'style.css')));

  fs.rmSync(tmp, { recursive: true, force: true });
});
