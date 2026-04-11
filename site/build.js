'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SRC = path.join(__dirname, 'src');
const DEFAULT_DIST = path.join(__dirname, 'dist');

/**
 * Parse an HTML comment frontmatter block at the top of a file.
 *   <!--
 *   title: Hello
 *   bodyClass: home
 *   -->
 * Returns { frontmatter: {}, body: '' }. Missing block returns empty frontmatter.
 */
function parseFrontmatter(source) {
  const match = source.match(/^<!--\s*\n([\s\S]*?)\n-->\s*\n?/);
  if (!match) {
    return { frontmatter: {}, body: source };
  }
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^\s*([a-zA-Z_][\w-]*)\s*:\s*(.*)\s*$/);
    if (m) {
      frontmatter[m[1]] = m[2];
    }
  }
  return { frontmatter, body: source.slice(match[0].length) };
}

/**
 * Single-pass replacement of {{> name}} with the contents of
 * `<partialsDir>/name.html`. Intentionally non-recursive — keeps the mental
 * model trivial. If you need nesting, restructure the markup.
 */
function expandPartials(source, partialsDir) {
  return source.replace(/\{\{>\s*([a-zA-Z_][\w-]*)\s*\}\}/g, (_, name) => {
    const partialPath = path.join(partialsDir, `${name}.html`);
    return fs.readFileSync(partialPath, 'utf8');
  });
}

/**
 * Replace {{varName}} tokens with values from an object. Unknown tokens are
 * left as-is so missing data is visible instead of silently blanked.
 */
function substituteVars(source, values) {
  return source.replace(/\{\{\s*([a-zA-Z_][\w-]*)\s*\}\}/g, (match, name) => {
    return Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match;
  });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function walkHtmlFiles(dir, base = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name === 'assets') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(full, base));
    } else if (entry.name.endsWith('.html')) {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

function renderPage(relPath, srcDir, layoutSrc, partialsDir, globalVars) {
  const raw = fs.readFileSync(path.join(srcDir, relPath), 'utf8');
  const { frontmatter, body } = parseFrontmatter(raw);
  const values = { ...globalVars, ...frontmatter, content: body };
  // Layout: expand partials first, then substitute {{content}} and page vars.
  const withPartials = expandPartials(layoutSrc, partialsDir);
  return substituteVars(withPartials, values);
}

function loadEnv(envPath) {
  const vars = {};
  if (!fs.existsSync(envPath)) return vars;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) vars[m[1]] = m[2];
  }
  return vars;
}

function build(options = {}) {
  const srcDir = options.srcDir || DEFAULT_SRC;
  const distDir = options.distDir || DEFAULT_DIST;
  const envVars = options.vars || loadEnv(path.join(__dirname, '.env'));

  const layoutPath = path.join(srcDir, '_layout.html');
  const layoutSrc = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : '{{content}}';
  const partialsDir = path.join(srcDir, '_partials');

  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  for (const rel of walkHtmlFiles(srcDir)) {
    const output = renderPage(rel, srcDir, layoutSrc, partialsDir, envVars);
    const outPath = path.join(distDir, rel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output);
  }

  const assetsSrc = path.join(srcDir, 'assets');
  if (fs.existsSync(assetsSrc)) {
    copyDir(assetsSrc, path.join(distDir, 'assets'));
  }

  // Copy top-level static files (CNAME, _headers, _redirects, robots.txt, sitemap.xml)
  for (const name of ['CNAME', '_headers', '_redirects', 'robots.txt', 'sitemap.xml']) {
    const p = path.join(__dirname, name);
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(distDir, name));
  }
}

module.exports = { build, parseFrontmatter, expandPartials, substituteVars };

if (require.main === module) {
  const start = Date.now();
  build();
  console.log(`built in ${Date.now() - start}ms`);
}
