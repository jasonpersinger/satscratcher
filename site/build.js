'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SRC = path.join(__dirname, 'src');
const DEFAULT_DIST = path.join(__dirname, 'dist');
const STATIC_FILES = ['CNAME', '_headers', '_redirects', 'robots.txt', 'sitemap.xml'];

function parseFrontmatter(source) {
  const match = source.match(/^<!--\s*\n([\s\S]*?)\n-->\s*\n?/);
  if (!match) {
    return { frontmatter: {}, body: source };
  }

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const item = line.match(/^\s*([a-zA-Z_][\w-]*)\s*:\s*(.*)\s*$/);
    if (item) {
      frontmatter[item[1]] = item[2];
    }
  }

  return { frontmatter, body: source.slice(match[0].length) };
}

function expandPartials(source, partialsDir) {
  return source.replace(/\{\{>\s*([a-zA-Z_][\w-]*)\s*\}\}/g, (_, name) => {
    return fs.readFileSync(path.join(partialsDir, `${name}.html`), 'utf8');
  });
}

function substituteVars(source, values) {
  return source.replace(/\{\{\s*([a-zA-Z_][\w-]*)\s*\}\}/g, (match, name) => {
    return Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match;
  });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
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

function loadEnv(envPath) {
  const vars = {};
  if (!fs.existsSync(envPath)) return vars;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const item = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (item) vars[item[1]] = item[2];
  }

  return vars;
}

function defaultVars() {
  return {
    SNIPCART_PUBLIC_KEY: process.env.SNIPCART_PUBLIC_KEY || 'REPLACE_ME',
    siteName: 'SatScratcher',
    siteUrl: 'https://satscratcher.shop',
    supportEmail: 'support@satscratcher.shop',
    productPrice: '39',
    currentYear: String(new Date().getFullYear())
  };
}

function renderPage(relPath, srcDir, layoutSrc, partialsDir, globalVars) {
  const raw = fs.readFileSync(path.join(srcDir, relPath), 'utf8');
  const parsed = parseFrontmatter(raw);
  const pageValues = {
    bodyClass: 'page',
    description: 'A pixel-art Bitcoin lottery miner desk toy.',
    ...globalVars,
    ...parsed.frontmatter
  };
  const values = {
    ...pageValues,
    content: substituteVars(parsed.body, pageValues)
  };

  const withPartials = expandPartials(layoutSrc, partialsDir);
  return substituteVars(withPartials, values);
}

function build(options = {}) {
  const srcDir = options.srcDir || DEFAULT_SRC;
  const distDir = options.distDir || DEFAULT_DIST;
  const envVars = options.vars || { ...loadEnv(path.join(__dirname, '.env')), ...process.env };
  const vars = { ...defaultVars(), ...envVars };
  const layoutPath = path.join(srcDir, '_layout.html');
  const layoutSrc = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : '{{content}}';
  const partialsDir = path.join(srcDir, '_partials');

  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  for (const rel of walkHtmlFiles(srcDir)) {
    const output = renderPage(rel, srcDir, layoutSrc, partialsDir, vars);
    const outPath = path.join(distDir, rel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output);
  }

  const assetsSrc = path.join(srcDir, 'assets');
  if (fs.existsSync(assetsSrc)) {
    copyDir(assetsSrc, path.join(distDir, 'assets'));
  }

  for (const name of STATIC_FILES) {
    const srcPath = path.join(__dirname, name);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(distDir, name));
    }
  }
}

module.exports = { build, parseFrontmatter, expandPartials, substituteVars };

if (require.main === module) {
  const start = Date.now();
  build();
  console.log(`built in ${Date.now() - start}ms`);
}
