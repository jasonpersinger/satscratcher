'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const { parseFrontmatter, expandPartials, substituteVars, build } = require('../build.js');

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

test('expandPartials inlines {{> name}} with the partial file contents', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sat-build-'));
  fs.mkdirSync(path.join(tmp, '_partials'));
  fs.writeFileSync(path.join(tmp, '_partials', 'foo.html'), '<span>FOO</span>');
  const out = expandPartials('before {{> foo}} after', path.join(tmp, '_partials'));
  assert.equal(out, 'before <span>FOO</span> after');
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('expandPartials is non-recursive by design (partials cannot include other partials)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sat-build-'));
  fs.mkdirSync(path.join(tmp, '_partials'));
  fs.writeFileSync(path.join(tmp, '_partials', 'a.html'), '{{> b}}');
  fs.writeFileSync(path.join(tmp, '_partials', 'b.html'), 'B');
  const out = expandPartials('{{> a}}', path.join(tmp, '_partials'));
  // After one pass, `a` is expanded but `{{> b}}` inside it remains.
  assert.equal(out, '{{> b}}');
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('substituteVars replaces {{var}} tokens from a values object', () => {
  const out = substituteVars('Hi {{name}}, your key is {{key}}.', { name: 'Jason', key: 'abc' });
  assert.equal(out, 'Hi Jason, your key is abc.');
});

test('substituteVars leaves unknown tokens untouched', () => {
  const out = substituteVars('Hello {{nope}}', { name: 'x' });
  assert.equal(out, 'Hello {{nope}}');
});

test('build() produces dist/index.html containing expanded partials and substituted vars', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sat-build-'));
  const src = path.join(tmp, 'src');
  const dist = path.join(tmp, 'dist');
  fs.mkdirSync(src, { recursive: true });
  fs.mkdirSync(path.join(src, '_partials'), { recursive: true });
  fs.mkdirSync(path.join(src, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(src, 'assets', 'style.css'), 'body{}');

  fs.writeFileSync(path.join(src, '_layout.html'),
    '<html><head><title>{{title}}</title></head><body>{{> topbar}}{{content}}</body></html>');
  fs.writeFileSync(path.join(src, '_partials', 'topbar.html'), '<nav>NAV</nav>');
  fs.writeFileSync(path.join(src, 'index.html'),
    '<!--\ntitle: Home\n-->\n<h1>Hello</h1>');

  build({ srcDir: src, distDir: dist, vars: {} });

  const output = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  assert.match(output, /<title>Home<\/title>/);
  assert.match(output, /<nav>NAV<\/nav>/);
  assert.match(output, /<h1>Hello<\/h1>/);
  // assets are copied
  assert.ok(fs.existsSync(path.join(dist, 'assets', 'style.css')));

  fs.rmSync(tmp, { recursive: true, force: true });
});

test('build() walks nested directories under src/', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sat-build-'));
  const src = path.join(tmp, 'src');
  const dist = path.join(tmp, 'dist');
  fs.mkdirSync(path.join(src, 'guide'), { recursive: true });
  fs.writeFileSync(path.join(src, '_layout.html'), '<html>{{content}}</html>');
  fs.writeFileSync(path.join(src, 'guide', 'quickstart.html'),
    '<!--\ntitle: QS\n-->\n<p>Start here.</p>');

  build({ srcDir: src, distDir: dist, vars: {} });

  const output = fs.readFileSync(path.join(dist, 'guide', 'quickstart.html'), 'utf8');
  assert.match(output, /<p>Start here\.<\/p>/);

  fs.rmSync(tmp, { recursive: true, force: true });
});
