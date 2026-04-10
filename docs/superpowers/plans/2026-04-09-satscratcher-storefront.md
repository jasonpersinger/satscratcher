# SatScratcher Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `satscratcher.shop` storefront — a single-page Snipcart-checkout site plus setup guides, FAQ, and legal pages — matching the design in `docs/superpowers/specs/2026-04-09-satscratcher-design.md`.

**Architecture:** Pure HTML/CSS/JS with a tiny Node build script (`build.js`) that expands partials, injects frontmatter into a master layout, and substitutes `{{var}}` tokens. No SSG framework. Mirrors the stack of the user's other micro-brand `nixkey.shop` for portfolio consistency. Output is static files suitable for Cloudflare Pages. Snipcart is lazy-loaded on first user interaction (focus/mouseover/scroll/touchstart) with a 2750ms timeout fallback, matching the nixkey pattern verbatim. Tests use Node's built-in test runner for the build script and Playwright for end-to-end browser smoke tests.

**Tech Stack:** HTML5, CSS (custom properties only — no preprocessors, no Tailwind), vanilla JS, Node 22 for the build script, `node --test` for unit tests, Playwright for e2e tests, Snipcart v3.7.1 for checkout, Cloudflare Pages for hosting. Self-hosted WOFF2 fonts (Press Start 2P + Inter).

**Scope boundary:** This plan covers **only** the storefront (spec §3 and §4). The firmware fork (§5) and the printed quickstart card (§4.1) are separate subsystems with their own plans — do not touch them here.

---

## File Structure

Target layout after this plan is complete:

```
satscratcher/
├── .gitignore
├── README.md                                       # touched in Task 1
└── site/
    ├── README.md
    ├── package.json
    ├── .env.example                                # SNIPCART_PUBLIC_KEY placeholder
    ├── .gitignore
    ├── build.js                                    # exports { build, parseFrontmatter, expandPartials, substituteVars }
    ├── serve.js                                    # zero-dep static dev server
    ├── playwright.config.js
    ├── CNAME                                       # "satscratcher.shop"
    ├── _headers                                    # Cloudflare Pages headers
    ├── _redirects                                  # Cloudflare Pages redirects
    ├── robots.txt
    ├── sitemap.xml
    ├── src/
    │   ├── _layout.html                            # master page shell
    │   ├── _partials/
    │   │   ├── head.html
    │   │   ├── topbar.html
    │   │   ├── footer.html
    │   │   └── snipcart.html
    │   ├── assets/
    │   │   ├── css/
    │   │   │   ├── tokens.css
    │   │   │   ├── base.css
    │   │   │   └── components.css
    │   │   ├── js/
    │   │   │   ├── topbar-scroll.js
    │   │   │   └── faq-accordion.js
    │   │   ├── fonts/
    │   │   │   ├── PressStart2P-Regular.woff2
    │   │   │   ├── Inter-Regular.woff2
    │   │   │   ├── Inter-Medium.woff2
    │   │   │   └── Inter-Bold.woff2
    │   │   └── img/                                # placeholder PNGs from gen-placeholders.js
    │   │       ├── mascot/
    │   │       ├── logo/
    │   │       ├── product/
    │   │       └── decor/
    │   ├── index.html                              # main shop page
    │   ├── guide/
    │   │   ├── index.html
    │   │   ├── quickstart.html
    │   │   ├── get-a-bitcoin-address.html
    │   │   ├── what-if-i-win.html
    │   │   └── troubleshooting.html
    │   ├── faq.html
    │   ├── terms.html
    │   ├── privacy.html
    │   ├── shipping-and-returns.html
    │   └── 404.html
    ├── scripts/
    │   └── gen-placeholders.js
    ├── tests/
    │   ├── build.test.js                           # unit tests for build.js
    │   ├── smoke.test.js                           # Playwright: basic pages + elements
    │   ├── commerce.test.js                        # Playwright: Snipcart lazy-load behavior
    │   └── links.test.js                           # Playwright: every internal link resolves
    └── dist/                                       # build output, gitignored
```

**Design decision — why this structure, not Eleventy:**

The spec (§3.1) specifies Eleventy as the default, but with a precedent clause: *"If nixkey.shop uses a different static-site generator, this stack will mirror it instead."* Inspection of `/home/jason/NIXKEY/` shows nixkey uses **zero SSG** — just raw HTML served directly. So the storefront follows the same pattern: a ~90-line `build.js` handles partial expansion and variable substitution, and that's it. No `.eleventy.js`, no Nunjucks, no plugin ecosystem. The whole build is inspectable in one file.

**Design decision — `build.js` exports functions for test access:**

`build.js` exports `{ build, parseFrontmatter, expandPartials, substituteVars }` so `build.test.js` can call `build()` directly from the test process instead of spawning a child. Keeps tests fast and avoids any shell-related footguns.

---

## Task 1: Initialize git repository and top-level README

**Files:**
- Create: `/home/jason/satscratcher/.gitignore`
- Create: `/home/jason/satscratcher/README.md`
- Repo state: `/home/jason/satscratcher/` is NOT currently a git repo despite the GitHub remote existing.

- [ ] **Step 1: Check the current state**

Run: `cd /home/jason/satscratcher && git status`
Expected: `fatal: not a git repository (or any of the parent directories): .git`

- [ ] **Step 2: Initialize the repo**

Run: `cd /home/jason/satscratcher && git init -b main`
Expected: `Initialized empty Git repository in /home/jason/satscratcher/.git/`

- [ ] **Step 3: Write the top-level .gitignore**

Create `/home/jason/satscratcher/.gitignore`:

```
# Python (build/ PDF pipeline)
.venv/
__pycache__/
*.pyc

# Node (site/)
node_modules/
site/dist/
site/.env
site/test-results/
site/playwright-report/

# OS noise
.DS_Store
Thumbs.db

# Editor noise
.vscode/
.idea/
*.swp
```

- [ ] **Step 4: Write the top-level README**

Create `/home/jason/satscratcher/README.md`:

```markdown
# SatScratcher

A pre-flashed, pixel-art-branded Bitcoin "lottery" miner sold as a desk toy.

**Tagline:** Mine Bitcoin. Win (Maybe). Look Cool Regardless.

This repo contains the brand, storefront, firmware customization assets, and print materials for [satscratcher.shop](https://satscratcher.shop).

## Layout

- `docs/superpowers/specs/` — design and business spec
- `docs/satscratcher-design.pdf` — branded PDF render of the spec
- `build/` — Python PDF render pipeline (WeasyPrint)
- `site/` — storefront static site (pure HTML/CSS/JS + Snipcart)
- `firmware/` — asset pipeline and tools for the NMMiner fork (fork lives in a separate repo)
- `print/` — print-ready files for MOO quickstart cards

See `docs/superpowers/specs/2026-04-09-satscratcher-design.md` for the full spec.
```

- [ ] **Step 5: Add the GitHub remote and make the initial commit**

Run:
```
cd /home/jason/satscratcher
git remote add origin https://github.com/jasonpersinger/satscratcher.git
git add .gitignore README.md brandingexample.jpeg build/ docs/
git status
```
Expected: Staged changes show the spec, PDF, build pipeline, branding image, gitignore, README. `site/` does not yet exist.

- [ ] **Step 6: Commit**

```
git commit -m "chore: initial repo — spec, PDF pipeline, branding reference"
```
Expected: Commit succeeds.

---

## Task 2: Scaffold the `site/` directory

**Files:**
- Create: `site/package.json`
- Create: `site/.gitignore`
- Create: `site/.env.example`
- Create: `site/README.md`
- Create: `site/CNAME`

- [ ] **Step 1: Create the directory tree**

Run: `mkdir -p /home/jason/satscratcher/site/src/{_partials,assets/{css,js,fonts,img/mascot,img/logo,img/product,img/decor},guide} /home/jason/satscratcher/site/{scripts,tests}`

- [ ] **Step 2: Write site/package.json**

Create `/home/jason/satscratcher/site/package.json`:

```json
{
  "name": "satscratcher-site",
  "version": "0.1.0",
  "private": true,
  "description": "satscratcher.shop storefront",
  "type": "commonjs",
  "scripts": {
    "build": "node build.js",
    "serve": "node serve.js",
    "test": "node --test tests/build.test.js",
    "test:e2e": "playwright test",
    "gen-placeholders": "node scripts/gen-placeholders.js"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0"
  }
}
```

- [ ] **Step 3: Write site/.gitignore**

Create `/home/jason/satscratcher/site/.gitignore`:

```
node_modules/
dist/
.env
test-results/
playwright-report/
```

- [ ] **Step 4: Write site/.env.example**

Create `/home/jason/satscratcher/site/.env.example`:

```
# Copy to .env and fill in. The build script reads this.
# Snipcart dashboard → Account → API keys → Public API key
SNIPCART_PUBLIC_KEY=REPLACE_ME
```

- [ ] **Step 5: Write site/README.md**

Create `/home/jason/satscratcher/site/README.md`:

````markdown
# satscratcher.shop — Storefront

Pure HTML + CSS + JS. No framework. A tiny build script (`build.js`) expands
partials and substitutes variables into a master layout. That's the whole build.

## Commands

```bash
node build.js                     # builds to dist/
node serve.js                     # serves dist/ at http://localhost:4321
node --test tests/build.test.js   # unit tests for the build script
npx playwright test               # end-to-end browser tests (requires `npm install` first)
```

## How the build works

1. Each `src/*.html` file may start with an HTML comment frontmatter block:
   ```html
   <!--
   title: Page title
   description: Meta description
   bodyClass: home
   -->
   ```
2. The file contents become `{{content}}` inside `src/_layout.html`.
3. Any `{{> partialName }}` token is replaced with the contents of
   `src/_partials/partialName.html`.
4. Any `{{var}}` token is replaced with a frontmatter value or an env var.
5. Output is written to `dist/` preserving directory structure.
6. `src/assets/` is copied verbatim into `dist/assets/`.

## Environment

Copy `.env.example` to `.env` and fill in `SNIPCART_PUBLIC_KEY`. The build
reads it and injects it into the Snipcart partial. In CI / Cloudflare Pages,
set it as a build environment variable.
````

- [ ] **Step 6: Write site/CNAME**

Create `/home/jason/satscratcher/site/CNAME`:

```
satscratcher.shop
```

- [ ] **Step 7: Commit**

```
cd /home/jason/satscratcher
git add site/package.json site/.gitignore site/.env.example site/README.md site/CNAME
git commit -m "chore(site): scaffold site directory — package.json, env, README, CNAME"
```

---

## Task 3: Write `build.js` with unit tests (TDD)

**Files:**
- Create: `site/build.js`
- Create: `site/tests/build.test.js`

This is the heart of the site. Tiny (~100 lines) but every other task depends on it. We TDD it, and the tests call `build()` directly from the imported module — no child processes, no shells.

- [ ] **Step 1: Write the failing unit test file**

Create `/home/jason/satscratcher/site/tests/build.test.js`:

```javascript
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
```

- [ ] **Step 2: Run the test — expect failure**

Run: `cd /home/jason/satscratcher/site && node --test tests/build.test.js`
Expected: All tests fail with `Cannot find module '../build.js'`.

- [ ] **Step 3: Write the minimal build.js to make tests pass**

Create `/home/jason/satscratcher/site/build.js`:

```javascript
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
```

- [ ] **Step 4: Run the tests — expect all pass**

Run: `cd /home/jason/satscratcher/site && node --test tests/build.test.js`
Expected: All 8 tests pass.

- [ ] **Step 5: Commit**

```
cd /home/jason/satscratcher
git add site/build.js site/tests/build.test.js
git commit -m "feat(site): add build.js with frontmatter, partials, and var substitution"
```

---

## Task 4: Design tokens (CSS custom properties)

**Files:**
- Create: `site/src/assets/css/tokens.css`

- [ ] **Step 1: Write the tokens file**

Create `/home/jason/satscratcher/site/src/assets/css/tokens.css`:

```css
/* ============================================================
   SatScratcher design tokens
   Spec: docs/superpowers/specs/2026-04-09-satscratcher-design.md §2.2
   ============================================================ */

:root {
  /* Palette */
  --bg:          #252627;
  --bg-elevated: #2E3032;
  --bg-deep:     #1B1C1D;
  --text:        #CDD3D5;
  --text-dim:    #8A8F91;
  --primary:     #FB6107;  /* CTAs, logo, active links */
  --jackpot:     #F5A623;  /* prices, WIN moments */
  --signal:      #1B998B;  /* mining-active, success, dividers */
  --danger:      #C2402C;  /* form errors */
  --photo-bg:    #FFFFFF;  /* product photography backgrounds only */

  /* Type */
  --display: "Press Start 2P", "Courier New", monospace;
  --body:    "Inter", -apple-system, system-ui, sans-serif;

  /* Type scale — mobile-first; clamp() scales up to desktop */
  --fs-xs:   12px;
  --fs-sm:   14px;
  --fs-base: 16px;
  --fs-md:   18px;
  --fs-lg:   clamp(20px, 2.5vw, 26px);
  --fs-xl:   clamp(28px, 4vw, 40px);
  --fs-xxl:  clamp(36px, 6vw, 64px);

  /* Spacing scale — 4px base */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  --sp-7: 48px;
  --sp-8: 64px;
  --sp-9: 96px;

  /* Layout */
  --container-max: 1120px;
  --topbar-h: 64px;

  /* Motion */
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-fast: 120ms;
  --dur-med:  220ms;
}
```

- [ ] **Step 2: Commit**

```
cd /home/jason/satscratcher
git add site/src/assets/css/tokens.css
git commit -m "feat(site): add design tokens (palette, type, spacing)"
```

---

## Task 5: Base CSS (reset, typography, fonts)

**Files:**
- Create: `site/src/assets/css/base.css`

- [ ] **Step 1: Write the base stylesheet**

Create `/home/jason/satscratcher/site/src/assets/css/base.css`:

```css
/* ============================================================
   Base — reset, typography, @font-face
   Loads after tokens.css.
   ============================================================ */

/* ---- Fonts ---- */
@font-face {
  font-family: "Press Start 2P";
  src: url("/assets/fonts/PressStart2P-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("/assets/fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("/assets/fonts/Inter-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("/assets/fonts/Inter-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* ---- Reset ---- */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
img, svg, video { max-width: 100%; display: block; }
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
a { color: inherit; text-decoration: none; }
ul, ol { padding-left: var(--sp-5); }

/* ---- Page ---- */
html { scroll-behavior: smooth; scroll-padding-top: calc(var(--topbar-h) + var(--sp-4)); }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--body);
  font-size: var(--fs-base);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ---- Typography ---- */
h1, h2, h3, h4 {
  font-family: var(--display);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0 0 var(--sp-4) 0;
}
h1 { font-size: var(--fs-xxl); color: var(--primary); }
h2 { font-size: var(--fs-xl); color: var(--primary); }
h3 { font-size: var(--fs-lg); color: var(--jackpot); }
h4 { font-size: var(--fs-md); color: var(--signal); }

p { margin: 0 0 var(--sp-4) 0; }
strong { color: var(--text); font-weight: 700; }
em { color: var(--jackpot); font-style: italic; }

a.inline-link {
  color: var(--primary);
  border-bottom: 1px dotted var(--primary);
}
a.inline-link:hover { color: var(--jackpot); border-bottom-color: var(--jackpot); }

/* Pixel art should never be blurred */
img.pixel { image-rendering: pixelated; image-rendering: crisp-edges; }

/* ---- Layout primitive ---- */
.container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--sp-5);
}

/* Utility */
.sr-only {
  position: absolute;
  width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```
cd /home/jason/satscratcher
git add site/src/assets/css/base.css
git commit -m "feat(site): add base stylesheet (reset, typography, @font-face)"
```

---

## Task 6: Vendor the fonts

**Files:**
- Create: `site/src/assets/fonts/PressStart2P-Regular.woff2`
- Create: `site/src/assets/fonts/Inter-Regular.woff2`
- Create: `site/src/assets/fonts/Inter-Medium.woff2`
- Create: `site/src/assets/fonts/Inter-Bold.woff2`

The `build/fonts/` directory already contains the TTF variants used by the PDF pipeline. For the site we want WOFF2 (smaller, faster). Use `fonttools` (Python) to convert them.

- [ ] **Step 1: Check what's in the PDF pipeline's font directory**

Run: `ls /home/jason/satscratcher/build/fonts/`
Expected: TTF files including `PressStart2P-Regular.ttf`, `Inter-Regular.ttf`, and ideally weight variants.

- [ ] **Step 2: Install fonttools if missing**

Run: `/home/jason/satscratcher/.venv/bin/pip install fonttools brotli`
Expected: Installed (or already present).

- [ ] **Step 3: Convert Press Start 2P to WOFF2**

Write a tiny helper script at `/home/jason/satscratcher/site/scripts/convert-font.py`:

```python
#!/usr/bin/env python3
"""Convert a TTF to WOFF2. Usage: convert-font.py <input.ttf> <output.woff2>"""
import sys
from fontTools.ttLib import TTFont
f = TTFont(sys.argv[1])
f.flavor = 'woff2'
f.save(sys.argv[2])
print(f"wrote {sys.argv[2]}")
```

Then run:
```
cd /home/jason/satscratcher
.venv/bin/python site/scripts/convert-font.py \
  build/fonts/PressStart2P-Regular.ttf \
  site/src/assets/fonts/PressStart2P-Regular.woff2
```
Expected: `wrote site/src/assets/fonts/PressStart2P-Regular.woff2`. File should be < 20KB.

- [ ] **Step 4: Convert Inter weights**

If `build/fonts/` only has `Inter-Regular.ttf` (one static weight), convert that and copy it to the other two weight filenames as a placeholder. Real Medium/Bold static WOFF2 from [rsms.me/inter](https://rsms.me/inter/) can drop in later.

Run:
```
cd /home/jason/satscratcher
.venv/bin/python site/scripts/convert-font.py \
  build/fonts/Inter-Regular.ttf \
  site/src/assets/fonts/Inter-Regular.woff2
cp site/src/assets/fonts/Inter-Regular.woff2 site/src/assets/fonts/Inter-Medium.woff2
cp site/src/assets/fonts/Inter-Regular.woff2 site/src/assets/fonts/Inter-Bold.woff2
```

- [ ] **Step 5: Commit**

```
cd /home/jason/satscratcher
git add site/scripts/convert-font.py site/src/assets/fonts/
git commit -m "feat(site): vendor Press Start 2P and Inter as WOFF2"
```

---

## Task 7: Master layout, head partial, Snipcart partial

**Files:**
- Create: `site/src/_layout.html`
- Create: `site/src/_partials/head.html`
- Create: `site/src/_partials/snipcart.html`

- [ ] **Step 1: Write the head partial**

Create `/home/jason/satscratcher/site/src/_partials/head.html`:

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="{{description}}">
<meta name="theme-color" content="#252627">

<title>{{title}} — SatScratcher</title>

<link rel="icon" type="image/png" href="/assets/img/logo/favicon.png">
<link rel="apple-touch-icon" href="/assets/img/logo/favicon.png">

<!-- Font preloads — these are the 4 weights in base.css @font-face -->
<link rel="preload" href="/assets/fonts/PressStart2P-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Inter-Bold.woff2" as="font" type="font/woff2" crossorigin>

<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/components.css">

<!-- Open Graph -->
<meta property="og:title" content="{{title}} — SatScratcher">
<meta property="og:description" content="{{description}}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://satscratcher.shop{{ogPath}}">
<meta property="og:image" content="https://satscratcher.shop/assets/img/logo/primary.png">

<meta name="twitter:card" content="summary_large_image">
```

- [ ] **Step 2: Write the Snipcart partial**

Create `/home/jason/satscratcher/site/src/_partials/snipcart.html`:

```html
<!-- Snipcart v3.7.1 — lazy-loaded on first user interaction, with a 2750ms timeout fallback.
     Same pattern as nixkey.shop. The script/link tags are only added once the user touches the page.
     Public key is injected by build.js from SNIPCART_PUBLIC_KEY env var. -->
<script>
  window.SnipcartSettings = {
    publicApiKey: "{{SNIPCART_PUBLIC_KEY}}",
    loadStrategy: "on-user-interaction",
    loadCSS: true,
    modalStyle: "side",
    currency: "usd",
    timeoutDuration: 2750,
    version: "3.7.1"
  };
  (function () {
    var c, d = false, s, w = window, o = w.SnipcartSettings;
    if (!o.version) o.version = "3.0";
    s = ["focus", "mouseover", "touchmove", "scroll", "keydown"];
    w.LoadSnipcart = loadSnipcart;
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", setup)
      : setup();

    function setup() {
      if (o.loadStrategy) {
        if (o.loadStrategy === "on-user-interaction") {
          s.forEach(function (t) { document.addEventListener(t, loadSnipcart); });
          setTimeout(loadSnipcart, o.timeoutDuration);
        }
      } else {
        loadSnipcart();
      }
    }

    function loadSnipcart() {
      if (d) return;
      d = true;
      s.forEach(function (t) { document.removeEventListener(t, loadSnipcart); });
      var e = document.getElementsByTagName("head")[0];
      var r = document.querySelector("#snipcart");
      var i = document.querySelector('script[src^="https://cdn.snipcart.com"]');
      var n = document.querySelector('link[href^="https://cdn.snipcart.com"]');
      if (!r) {
        r = document.createElement("div");
        r.id = "snipcart";
        r.setAttribute("hidden", "true");
        document.body.appendChild(r);
      }
      c = document.createElement("div");
      c.className = "snipcart-main-container";
      c.setAttribute("data-snipcart-modal-style", o.modalStyle || "default");
      r.appendChild(c);
      if (o.loadCSS !== false && !n) {
        n = document.createElement("link");
        n.rel = "stylesheet";
        n.type = "text/css";
        n.href = "https://cdn.snipcart.com/themes/v" + o.version + "/default/snipcart.css";
        e.appendChild(n);
      }
      if (!i) {
        i = document.createElement("script");
        i.src = "https://cdn.snipcart.com/themes/v" + o.version + "/default/snipcart.js";
        i.async = true;
        i.setAttribute("data-api-key", o.publicApiKey);
        i.setAttribute("data-config-modal-style", o.modalStyle || "default");
        e.appendChild(i);
      }
    }
  })();
</script>
```

- [ ] **Step 3: Write the master layout**

Create `/home/jason/satscratcher/site/src/_layout.html`:

```html
<!doctype html>
<html lang="en">
<head>
{{> head}}
</head>
<body class="{{bodyClass}}">

{{> topbar}}

<main id="main">
{{content}}
</main>

{{> footer}}

{{> snipcart}}

<script src="/assets/js/topbar-scroll.js" defer></script>
<script src="/assets/js/faq-accordion.js" defer></script>
</body>
</html>
```

- [ ] **Step 4: Commit**

```
cd /home/jason/satscratcher
git add site/src/_layout.html site/src/_partials/head.html site/src/_partials/snipcart.html
git commit -m "feat(site): add master layout, head partial, Snipcart lazy-loader"
```

---

## Task 8: Topbar partial + scroll behavior

**Files:**
- Create: `site/src/_partials/topbar.html`
- Create: `site/src/assets/js/topbar-scroll.js`
- Create: `site/src/assets/css/components.css`

- [ ] **Step 1: Write the topbar HTML**

Create `/home/jason/satscratcher/site/src/_partials/topbar.html`:

```html
<header class="topbar" data-topbar>
  <div class="topbar__inner container">
    <a class="topbar__brand" href="/" aria-label="SatScratcher home">
      <img class="pixel topbar__logo" src="/assets/img/logo/compact.png" alt="" width="32" height="32">
      <span class="topbar__wordmark">SatScratcher</span>
    </a>
    <nav class="topbar__nav" aria-label="Primary">
      <a href="/#what-it-is">What It Is</a>
      <a href="/#how-it-works">How It Works</a>
      <a href="/#faq">FAQ</a>
      <a href="/guide/">Guide</a>
    </nav>
    <button class="topbar__cart snipcart-checkout" aria-label="Open cart">
      <span aria-hidden="true">CART</span>
      <span class="snipcart-items-count topbar__cart-count"></span>
    </button>
  </div>
</header>
```

- [ ] **Step 2: Start components.css with the topbar styles**

Create `/home/jason/satscratcher/site/src/assets/css/components.css`:

```css
/* ============================================================
   Components
   ============================================================ */

/* ---- Topbar ---- */
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(37, 38, 39, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur-med) var(--ease);
}
.topbar[data-scrolled="true"] {
  border-bottom-color: var(--bg-elevated);
}
.topbar__inner {
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  gap: var(--sp-5);
}
.topbar__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
}
.topbar__logo { width: 32px; height: 32px; }
.topbar__wordmark {
  font-family: var(--display);
  font-size: var(--fs-sm);
  color: var(--primary);
  letter-spacing: 0.02em;
}
.topbar__nav {
  margin-left: auto;
  display: flex;
  gap: var(--sp-5);
  font-family: var(--body);
  font-weight: 500;
  font-size: var(--fs-sm);
}
.topbar__nav a {
  color: var(--text);
  padding: var(--sp-2) 0;
  border-bottom: 2px solid transparent;
  transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}
.topbar__nav a:hover { color: var(--primary); border-bottom-color: var(--primary); }

.topbar__cart {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: var(--primary);
  color: var(--bg);
  font-family: var(--display);
  font-size: var(--fs-xs);
  letter-spacing: 0.04em;
  border-radius: 2px;
  transition: background var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
}
.topbar__cart:hover { background: var(--jackpot); transform: translateY(-1px); }
.topbar__cart-count {
  display: inline-block;
  min-width: 18px;
  padding: 2px 6px;
  background: var(--bg);
  color: var(--jackpot);
  border-radius: 2px;
  font-size: 10px;
}

@media (max-width: 680px) {
  .topbar__nav { display: none; }
  .topbar__wordmark { display: none; }
}
```

- [ ] **Step 3: Write the topbar scroll behavior JS**

Create `/home/jason/satscratcher/site/src/assets/js/topbar-scroll.js`:

```javascript
(function () {
  'use strict';
  var topbar = document.querySelector('[data-topbar]');
  if (!topbar) return;

  function sync() {
    topbar.dataset.scrolled = window.scrollY > 4 ? 'true' : 'false';
  }

  sync();
  window.addEventListener('scroll', sync, { passive: true });
})();
```

- [ ] **Step 4: Commit**

```
cd /home/jason/satscratcher
git add site/src/_partials/topbar.html site/src/assets/js/topbar-scroll.js site/src/assets/css/components.css
git commit -m "feat(site): add sticky topbar with scroll-state"
```

---

## Task 9: Footer partial

**Files:**
- Create: `site/src/_partials/footer.html`
- Modify: `site/src/assets/css/components.css`

- [ ] **Step 1: Write the footer HTML**

Create `/home/jason/satscratcher/site/src/_partials/footer.html`:

```html
<footer class="footer">
  <div class="container footer__inner">
    <div class="footer__brand">
      <img class="pixel footer__mascot" src="/assets/img/mascot/neutral.png" alt="" width="48" height="48">
      <div>
        <div class="footer__wordmark">SATSCRATCHER</div>
        <div class="footer__tagline">Mine Bitcoin. Win (Maybe). Look Cool Regardless.</div>
      </div>
    </div>
    <div class="footer__cols">
      <div>
        <h4 class="footer__heading">Shop</h4>
        <ul>
          <li><a href="/">Main</a></li>
          <li><a href="/guide/">Setup Guide</a></li>
          <li><a href="/faq.html">FAQ</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer__heading">Fine Print</h4>
        <ul>
          <li><a href="/terms.html">Terms</a></li>
          <li><a href="/privacy.html">Privacy</a></li>
          <li><a href="/shipping-and-returns.html">Shipping &amp; Returns</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer__heading">Say Hi</h4>
        <ul>
          <li><a href="mailto:hi@satscratcher.shop">hi@satscratcher.shop</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer__bottom container">
    <span>&copy; 2026 SatScratcher. One human, one workshop.</span>
  </div>
</footer>
```

- [ ] **Step 2: Append footer CSS to components.css**

Append to `/home/jason/satscratcher/site/src/assets/css/components.css`:

```css

/* ---- Footer ---- */
.footer {
  margin-top: var(--sp-9);
  padding: var(--sp-8) 0 var(--sp-5) 0;
  background: var(--bg-deep);
  border-top: 2px solid var(--bg-elevated);
  color: var(--text-dim);
}
.footer__inner {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--sp-7);
}
.footer__brand { display: flex; gap: var(--sp-4); align-items: flex-start; }
.footer__mascot { width: 48px; height: 48px; }
.footer__wordmark {
  font-family: var(--display);
  font-size: var(--fs-md);
  color: var(--primary);
  letter-spacing: 0.03em;
}
.footer__tagline {
  font-family: var(--body);
  font-size: var(--fs-sm);
  color: var(--text);
  margin-top: var(--sp-2);
}
.footer__cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-5);
}
.footer__heading {
  font-family: var(--display);
  font-size: var(--fs-xs);
  color: var(--jackpot);
  margin: 0 0 var(--sp-3) 0;
  letter-spacing: 0.04em;
}
.footer ul { list-style: none; padding: 0; margin: 0; }
.footer li { margin-bottom: var(--sp-2); font-size: var(--fs-sm); }
.footer a { color: var(--text); }
.footer a:hover { color: var(--primary); }
.footer__bottom {
  margin-top: var(--sp-7);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--bg-elevated);
  font-family: var(--display);
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}
@media (max-width: 680px) {
  .footer__inner { grid-template-columns: 1fr; }
  .footer__cols { grid-template-columns: 1fr 1fr; }
}
```

- [ ] **Step 3: Commit**

```
cd /home/jason/satscratcher
git add site/src/_partials/footer.html site/src/assets/css/components.css
git commit -m "feat(site): add footer partial"
```

---

## Task 10: Placeholder asset generator

**Files:**
- Create: `site/scripts/gen-placeholders.js`
- Output: Stub PNGs in `site/src/assets/img/` for mascot, logo, product, and decor

The real pixel art and product photography come from Jason and a future photo shoot. For development we need placeholder PNGs so the build doesn't 404 on image requests. This script writes tiny valid PNGs using only Node's built-ins.

- [ ] **Step 1: Write the placeholder generator**

Create `/home/jason/satscratcher/site/scripts/gen-placeholders.js`:

```javascript
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
```

- [ ] **Step 2: Run the generator**

Run: `cd /home/jason/satscratcher/site && node scripts/gen-placeholders.js`
Expected: `wrote 14 placeholder images`

- [ ] **Step 3: Verify the placeholders exist**

Run: `find /home/jason/satscratcher/site/src/assets/img -type f | sort`
Expected: 14 files across mascot/, logo/, product/, decor/.

- [ ] **Step 4: Commit**

```
cd /home/jason/satscratcher
git add site/scripts/gen-placeholders.js site/src/assets/img/
git commit -m "feat(site): add placeholder asset generator and stub images"
```

---

## Task 11: Hero section (index.html, part 1)

**Files:**
- Create: `site/src/index.html`
- Modify: `site/src/assets/css/components.css`

- [ ] **Step 1: Create index.html with hero section only**

Create `/home/jason/satscratcher/site/src/index.html`:

```html
<!--
title: A Desk Toy Lottery Miner
description: Mine Bitcoin. Win (Maybe). Look Cool Regardless. A pre-flashed ESP32 lottery miner with pixel-art cat mascot.
bodyClass: home
ogPath: /
-->

<!-- ============= HERO ============= -->
<section class="hero">
  <div class="container hero__inner">
    <div class="hero__copy">
      <div class="hero__eyebrow">▌ A DESK TOY LOTTERY MINER ▐</div>
      <h1 class="hero__headline">
        Mine Bitcoin.<br>
        Win <span class="hero__win">(Maybe)</span>.<br>
        Look Cool Regardless.
      </h1>
      <p class="hero__subline">
        A pre-flashed desk toy that mines Bitcoin at a hashrate best described
        as <em>basically nothing</em>. Plug it in. Forget about it. Stay hopeful.
      </p>
      <div class="hero__cta">
        <a href="#product" class="btn btn--primary">GRAB ONE — $39</a>
        <a href="#how-it-works" class="btn btn--ghost">How it works ↓</a>
      </div>
    </div>
    <div class="hero__device">
      <img class="pixel hero__img" src="/assets/img/product/hero.jpg"
           alt="SatScratcher device showing the Scratching cat mascot on its screen"
           width="480" height="480">
      <img class="pixel hero__coin hero__coin--a" src="/assets/img/decor/pixel-coin.png" alt="" width="32" height="32">
      <img class="pixel hero__coin hero__coin--b" src="/assets/img/decor/pixel-coin.png" alt="" width="24" height="24">
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append hero CSS to components.css**

Append to `/home/jason/satscratcher/site/src/assets/css/components.css`:

```css

/* ---- Buttons ---- */
.btn {
  display: inline-block;
  padding: var(--sp-4) var(--sp-5);
  font-family: var(--display);
  font-size: var(--fs-sm);
  letter-spacing: 0.04em;
  border-radius: 2px;
  transition: background var(--dur-fast) var(--ease),
              color var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.btn--primary {
  background: var(--primary);
  color: var(--bg);
}
.btn--primary:hover { background: var(--jackpot); transform: translateY(-2px); }
.btn--ghost {
  color: var(--text);
  border: 2px solid var(--bg-elevated);
}
.btn--ghost:hover { border-color: var(--primary); color: var(--primary); }

/* ---- Hero ---- */
.hero {
  padding: var(--sp-9) 0 var(--sp-8) 0;
  background:
    radial-gradient(ellipse at top right, rgba(251, 97, 7, 0.08), transparent 60%),
    var(--bg);
}
.hero__inner {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--sp-7);
  align-items: center;
}
.hero__eyebrow {
  font-family: var(--display);
  font-size: var(--fs-xs);
  color: var(--jackpot);
  letter-spacing: 0.08em;
  margin-bottom: var(--sp-5);
}
.hero__headline {
  font-size: var(--fs-xxl);
  line-height: 1.25;
  color: var(--primary);
  margin: 0 0 var(--sp-5) 0;
}
.hero__win { color: var(--jackpot); }
.hero__subline {
  font-size: var(--fs-md);
  max-width: 520px;
  margin-bottom: var(--sp-6);
}
.hero__cta { display: flex; gap: var(--sp-4); flex-wrap: wrap; }
.hero__device { position: relative; }
.hero__img {
  width: 100%;
  max-width: 480px;
  margin-left: auto;
  background: var(--bg-elevated);
  border: 2px solid var(--primary);
  border-radius: 4px;
}
.hero__coin { position: absolute; }
.hero__coin--a { top: -8px; right: 40px; }
.hero__coin--b { bottom: 24px; right: -8px; }

@media (max-width: 860px) {
  .hero__inner { grid-template-columns: 1fr; }
  .hero__device { order: -1; }
}
```

- [ ] **Step 3: Run the build and verify the hero renders**

Run: `cd /home/jason/satscratcher/site && node build.js`
Expected: `built in Nms`

Run: `ls dist/ && head -20 dist/index.html`
Expected: `dist/index.html` exists and contains the expanded hero HTML with no `{{...}}` tokens remaining (except `{{SNIPCART_PUBLIC_KEY}}` if .env isn't set — fine for now).

- [ ] **Step 4: Commit**

```
cd /home/jason/satscratcher
git add site/src/index.html site/src/assets/css/components.css
git commit -m "feat(site): add hero section and button primitives"
```

---

## Task 12: "What It Is" three-column section

**Files:**
- Modify: `site/src/index.html`
- Modify: `site/src/assets/css/components.css`

- [ ] **Step 1: Append the what-it-is section to index.html**

Append to `/home/jason/satscratcher/site/src/index.html`:

```html

<!-- ============= WHAT IT IS ============= -->
<section class="what-it-is" id="what-it-is">
  <div class="container">
    <h2 class="section__heading">What It Is</h2>
    <div class="what-it-is__grid">
      <article class="what-col">
        <img class="pixel what-col__mascot" src="/assets/img/mascot/scratching.png" alt="" width="96" height="96">
        <h3>It mines Bitcoin.</h3>
        <p>Real ESP32, real NMMiner firmware, real SHA-256 hashing. It shows up to work every second it's plugged in.</p>
      </article>
      <article class="what-col">
        <img class="pixel what-col__mascot" src="/assets/img/mascot/losing.png" alt="" width="96" height="96">
        <h3>It (probably) won't win.</h3>
        <p>The odds are worse than terrible. We are being honest. Scams promise wins. We promise vibes.</p>
      </article>
      <article class="what-col">
        <img class="pixel what-col__mascot" src="/assets/img/mascot/winning.png" alt="" width="96" height="96">
        <h3>It looks rad on your desk.</h3>
        <p>A tiny pixel cat lives on it. It scratches when it's working. It celebrates when it finds a share. That's the whole product.</p>
      </article>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append what-it-is CSS to components.css**

Append to `/home/jason/satscratcher/site/src/assets/css/components.css`:

```css

/* ---- Section heading primitive ---- */
.section__heading {
  font-family: var(--display);
  font-size: var(--fs-xl);
  color: var(--primary);
  margin-bottom: var(--sp-6);
  padding-bottom: var(--sp-3);
  border-bottom: 2px solid var(--primary);
}

/* ---- What It Is ---- */
.what-it-is { padding: var(--sp-8) 0; }
.what-it-is__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-5);
}
.what-col {
  background: var(--bg-elevated);
  padding: var(--sp-6);
  border-left: 3px solid var(--signal);
  border-radius: 2px;
}
.what-col__mascot { width: 96px; height: 96px; margin-bottom: var(--sp-4); }
.what-col h3 {
  font-size: var(--fs-md);
  color: var(--jackpot);
  margin-bottom: var(--sp-3);
}
.what-col p { color: var(--text); margin: 0; }
@media (max-width: 860px) {
  .what-it-is__grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Commit**

```
cd /home/jason/satscratcher
git add site/src/index.html site/src/assets/css/components.css
git commit -m "feat(site): add What It Is three-column section"
```

---

## Task 13: Product card with Snipcart add-to-cart

**Files:**
- Modify: `site/src/index.html`
- Modify: `site/src/assets/css/components.css`

- [ ] **Step 1: Append the product section to index.html**

Append to `/home/jason/satscratcher/site/src/index.html`:

```html

<!-- ============= PRODUCT ============= -->
<section class="product" id="product">
  <div class="container product__inner">
    <div class="product__photo">
      <img class="pixel product__img" src="/assets/img/product/styled-desk.jpg"
           alt="SatScratcher on a desk" width="520" height="520">
    </div>
    <div class="product__info">
      <div class="product__eyebrow">THE ONLY SKU</div>
      <h2 class="product__name">SatScratcher</h2>
      <p class="product__tagline">A desk toy lottery miner, pre-flashed and ready to plug in.</p>

      <div class="infocard">
        <div class="infocard__title">INFO CARD</div>
        <div class="infocard__row"><span class="infocard__label">HASHRATE</span><span class="infocard__val">BASICALLY NOTHING</span></div>
        <div class="infocard__row"><span class="infocard__label">ODDS</span><span class="infocard__val">WORSE THAN TERRIBLE</span></div>
        <div class="infocard__row"><span class="infocard__label">POWER</span><span class="infocard__val">~1 WATT</span></div>
        <div class="infocard__row"><span class="infocard__label">VIBES</span><span class="infocard__val">IMMACULATE</span></div>
      </div>

      <div class="product__price-row">
        <span class="product__price">$39</span>
        <span class="product__ship">shipping included (US)</span>
      </div>

      <button class="btn btn--primary snipcart-add-item product__buy"
              data-item-id="satscratcher-v1"
              data-item-name="SatScratcher"
              data-item-price="39.00"
              data-item-url="https://satscratcher.shop/"
              data-item-description="Pre-flashed ESP32 Bitcoin lottery miner with pixel-art branding."
              data-item-image="https://satscratcher.shop/assets/img/product/hero.jpg"
              data-item-weight="120"
              data-item-shippable="true">
        ADD TO CART — $39
      </button>

      <div class="product__whats-in-box">
        <h4>What's in the box</h4>
        <div class="box-tiles">
          <div class="box-tile"><img class="pixel" src="/assets/img/product/hero.jpg" alt="" width="64" height="64"><span>1× SatScratcher device</span></div>
          <div class="box-tile"><img class="pixel" src="/assets/img/product/whats-in-box.jpg" alt="" width="64" height="64"><span>1× quickstart card</span></div>
          <div class="box-tile"><img class="pixel" src="/assets/img/logo/compact.png" alt="" width="64" height="64"><span>1× pixel cat sticker</span></div>
          <div class="box-tile"><img class="pixel" src="/assets/img/decor/pixel-coin.png" alt="" width="64" height="64"><span>0× actual Bitcoin</span></div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append product CSS to components.css**

Append to `/home/jason/satscratcher/site/src/assets/css/components.css`:

```css

/* ---- Product ---- */
.product { padding: var(--sp-8) 0; background: var(--bg-deep); }
.product__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-7);
  align-items: start;
}
.product__img {
  width: 100%;
  border: 2px solid var(--bg-elevated);
  border-radius: 4px;
  background: var(--bg-elevated);
}
.product__eyebrow {
  font-family: var(--display);
  font-size: var(--fs-xs);
  color: var(--signal);
  letter-spacing: 0.08em;
  margin-bottom: var(--sp-3);
}
.product__name {
  font-size: var(--fs-xl);
  color: var(--primary);
  margin-bottom: var(--sp-3);
}
.product__tagline { font-size: var(--fs-md); margin-bottom: var(--sp-5); }

/* Info card — the voice sample from the spec */
.infocard {
  background: var(--bg);
  border-left: 3px solid var(--primary);
  padding: var(--sp-5);
  margin-bottom: var(--sp-5);
  font-family: var(--display);
  font-size: var(--fs-xs);
  letter-spacing: 0.02em;
}
.infocard__title {
  color: var(--primary);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-3);
  letter-spacing: 0.06em;
}
.infocard__row {
  display: flex;
  justify-content: space-between;
  padding: var(--sp-2) 0;
  border-bottom: 1px dashed var(--bg-elevated);
}
.infocard__row:last-child { border-bottom: none; }
.infocard__label { color: var(--text-dim); }
.infocard__val   { color: var(--jackpot); }

.product__price-row {
  display: flex;
  align-items: baseline;
  gap: var(--sp-4);
  margin-bottom: var(--sp-4);
}
.product__price {
  font-family: var(--display);
  font-size: var(--fs-xxl);
  color: var(--jackpot);
}
.product__ship { color: var(--text-dim); font-size: var(--fs-sm); }
.product__buy { width: 100%; padding: var(--sp-5); font-size: var(--fs-md); }

.product__whats-in-box { margin-top: var(--sp-6); }
.product__whats-in-box h4 { margin-bottom: var(--sp-3); }
.box-tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-3);
}
.box-tile {
  background: var(--bg);
  padding: var(--sp-3);
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  text-align: center;
  font-size: 11px;
  color: var(--text-dim);
}

@media (max-width: 860px) {
  .product__inner { grid-template-columns: 1fr; }
  .box-tiles { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 3: Commit**

```
cd /home/jason/satscratcher
git add site/src/index.html site/src/assets/css/components.css
git commit -m "feat(site): add product card with Snipcart add-to-cart"
```

---

## Task 14: "How It Works" four-step section

**Files:**
- Modify: `site/src/index.html`
- Modify: `site/src/assets/css/components.css`

- [ ] **Step 1: Append how-it-works to index.html**

Append to `/home/jason/satscratcher/site/src/index.html`:

```html

<!-- ============= HOW IT WORKS ============= -->
<section class="how" id="how-it-works">
  <div class="container">
    <h2 class="section__heading">How It Works</h2>
    <ol class="how__steps">
      <li class="how__step">
        <div class="how__num">01</div>
        <h3>Unbox.</h3>
        <p>The device, a quickstart card, and a sticker. That is the entire contents.</p>
      </li>
      <li class="how__step">
        <div class="how__num">02</div>
        <h3>Plug into any USB.</h3>
        <p>Computer, phone charger, power bank. About 1 watt. It doesn't care.</p>
      </li>
      <li class="how__step">
        <div class="how__num">03</div>
        <h3>Add your Bitcoin address.</h3>
        <p>Join the SatScratcher WiFi network from your phone, paste an address, hit save. Don't have one? <a href="/guide/get-a-bitcoin-address.html" class="inline-link">We wrote a guide.</a></p>
      </li>
      <li class="how__step how__step--final">
        <div class="how__num">04</div>
        <h3>Wait forever.</h3>
        <p><em>Some customers have been waiting since 2024. They seem happy.</em></p>
      </li>
    </ol>
  </div>
</section>
```

- [ ] **Step 2: Append how-it-works CSS**

Append to `/home/jason/satscratcher/site/src/assets/css/components.css`:

```css

/* ---- How It Works ---- */
.how { padding: var(--sp-8) 0; }
.how__steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-4);
}
.how__step {
  background: var(--bg-elevated);
  padding: var(--sp-5);
  border-top: 3px solid var(--primary);
  border-radius: 2px;
  position: relative;
}
.how__step--final { border-top-color: var(--jackpot); }
.how__num {
  font-family: var(--display);
  font-size: var(--fs-xl);
  color: var(--jackpot);
  margin-bottom: var(--sp-3);
}
.how__step h3 {
  font-size: var(--fs-sm);
  color: var(--text);
  margin-bottom: var(--sp-3);
  letter-spacing: 0.02em;
}
.how__step p { font-size: var(--fs-sm); margin: 0; }
@media (max-width: 860px) {
  .how__steps { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .how__steps { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Commit**

```
cd /home/jason/satscratcher
git add site/src/index.html site/src/assets/css/components.css
git commit -m "feat(site): add How It Works four-step section"
```

---

## Task 15: FAQ accordion on the main page + JS

**Files:**
- Modify: `site/src/index.html`
- Create: `site/src/assets/js/faq-accordion.js`
- Modify: `site/src/assets/css/components.css`

- [ ] **Step 1: Append the FAQ section to index.html**

Append to `/home/jason/satscratcher/site/src/index.html`:

```html

<!-- ============= FAQ ============= -->
<section class="faq" id="faq">
  <div class="container">
    <h2 class="section__heading">FAQ</h2>
    <div class="faq__list">
      <details class="faq__item" id="q-scam">
        <summary>Is this a scam?</summary>
        <p>No, and we'll prove it: we're openly telling you that this thing will not win. Scams promise wins. We promise vibes. The SatScratcher is a real ESP32 Bitcoin miner running open-source firmware (NMMiner). It hashes Bitcoin the same way any other miner does — just very, very slowly.</p>
      </details>
      <details class="faq__item" id="q-win">
        <summary>Will I actually win Bitcoin?</summary>
        <p>Technically: yes, maybe. Practically: no. Mathematically: the odds are roughly one in three hundred billion per block attempt. The Bitcoin network produces a block every ten minutes. We leave the full calculation to you as an exercise.</p>
      </details>
      <details class="faq__item" id="q-experience">
        <summary>Do I need to know anything about Bitcoin to use this?</summary>
        <p>Nope. You need to be able to plug in a USB cable and copy-paste a string of text. <a href="/guide/get-a-bitcoin-address.html" class="inline-link">We wrote a guide</a> that walks you through getting a Bitcoin address in 5 minutes if you've never touched crypto.</p>
      </details>
      <details class="faq__item" id="q-wins">
        <summary>What happens if it wins?</summary>
        <p>We wrote <a href="/guide/what-if-i-win.html" class="inline-link">a whole page about this</a>, because we thought it was funny. Short version: the block reward goes to the address you set up, and you owe taxes on it.</p>
      </details>
      <details class="faq__item" id="q-power">
        <summary>How much electricity does this use?</summary>
        <p>About 1 watt — less than an LED nightlight. Running it 24/7 for a year costs around a dollar in electricity in the US. Cheaper than most hobbies.</p>
      </details>
      <details class="faq__item" id="q-return">
        <summary>Can I return it?</summary>
        <p>Yes. 30 days, undamaged, in the case. Shipping back is on you. We'll refund the purchase price, no hard feelings.</p>
      </details>
      <details class="faq__item" id="q-amazon">
        <summary>Is this the same as the ones on Amazon?</summary>
        <p>The board is similar. The firmware, the branding, the mascot, the setup guide, the quickstart card, and the human who answers support emails are not. You're paying for the thing <em>and</em> the experience of the thing. If you just want a bare board and can handle flashing firmware yourself, Amazon is a valid choice and we won't be offended.</p>
      </details>
    </div>
    <p class="faq__more"><a href="/faq.html" class="inline-link">More questions? Full FAQ →</a></p>
  </div>
</section>
```

- [ ] **Step 2: Write the FAQ accordion JS**

Create `/home/jason/satscratcher/site/src/assets/js/faq-accordion.js`:

```javascript
(function () {
  'use strict';

  // Native <details> does 90% of what we need. The only enhancement:
  // if the URL has a #hash pointing to a faq__item, open it on load and
  // smooth-scroll to it. Makes the FAQ items deep-linkable per spec §3.3.
  function openFromHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;
    var el = document.getElementById(hash);
    if (el && el.classList && el.classList.contains('faq__item')) {
      el.open = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Close other items when one opens, accordion-style (single-expand UX).
  function wireAccordionBehavior() {
    var items = document.querySelectorAll('.faq__item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  wireAccordionBehavior();
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();
```

- [ ] **Step 3: Append FAQ CSS**

Append to `/home/jason/satscratcher/site/src/assets/css/components.css`:

```css

/* ---- FAQ accordion ---- */
.faq { padding: var(--sp-8) 0; background: var(--bg-deep); }
.faq__list { display: flex; flex-direction: column; gap: var(--sp-3); }
.faq__item {
  background: var(--bg-elevated);
  border-left: 3px solid var(--signal);
  border-radius: 2px;
}
.faq__item summary {
  padding: var(--sp-4) var(--sp-5);
  cursor: pointer;
  font-weight: 700;
  font-size: var(--fs-md);
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.faq__item summary::-webkit-details-marker { display: none; }
.faq__item summary::after {
  content: "+";
  font-family: var(--display);
  color: var(--primary);
  font-size: var(--fs-md);
}
.faq__item[open] summary::after { content: "−"; color: var(--jackpot); }
.faq__item[open] { border-left-color: var(--primary); }
.faq__item p {
  padding: 0 var(--sp-5) var(--sp-5) var(--sp-5);
  margin: 0;
  color: var(--text);
}
.faq__more { margin-top: var(--sp-5); text-align: center; }
```

- [ ] **Step 4: Commit**

```
cd /home/jason/satscratcher
git add site/src/index.html site/src/assets/js/faq-accordion.js site/src/assets/css/components.css
git commit -m "feat(site): add FAQ accordion with deep-link support"
```

---

## Task 16: Dev server + Playwright smoke test

**Files:**
- Create: `site/serve.js`
- Create: `site/playwright.config.js`
- Create: `site/tests/smoke.test.js`

- [ ] **Step 1: Write the dev server**

Create `/home/jason/satscratcher/site/serve.js`:

```javascript
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
  // Strip query string and decode
  var clean = decodeURIComponent(urlPath.split('?')[0]);
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
```

- [ ] **Step 2: Write the Playwright config**

Create `/home/jason/satscratcher/site/playwright.config.js`:

```javascript
'use strict';
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: /.*\.(smoke|commerce|links)\.test\.js/,
  timeout: 15000,
  fullyParallel: true,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // The build must run before the server starts. We chain them in one command.
    command: 'node build.js && node serve.js 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
```

- [ ] **Step 3: Write the smoke test**

Create `/home/jason/satscratcher/site/tests/smoke.test.js`:

```javascript
'use strict';
const { test, expect } = require('@playwright/test');

test('homepage loads and contains key sections', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SatScratcher/);
  await expect(page.locator('.hero__headline')).toContainText('Mine Bitcoin');
  await expect(page.locator('#what-it-is')).toBeVisible();
  await expect(page.locator('#product')).toBeVisible();
  await expect(page.locator('#how-it-works')).toBeVisible();
  await expect(page.locator('#faq')).toBeVisible();
  await expect(page.locator('.footer')).toBeVisible();
});

test('topbar is sticky and nav has the four anchors', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topbar')).toBeVisible();
  const navLinks = page.locator('.topbar__nav a');
  await expect(navLinks).toHaveCount(4);
  await expect(navLinks.nth(0)).toHaveAttribute('href', '/#what-it-is');
});

test('FAQ accordion opens on click', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('.faq__item').first();
  await expect(first).not.toHaveAttribute('open', '');
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
});

test('add-to-cart button has all required Snipcart data attributes', async ({ page }) => {
  await page.goto('/');
  const buy = page.locator('.snipcart-add-item').first();
  await expect(buy).toHaveAttribute('data-item-id', 'satscratcher-v1');
  await expect(buy).toHaveAttribute('data-item-price', '39.00');
  await expect(buy).toHaveAttribute('data-item-name', 'SatScratcher');
});
```

- [ ] **Step 4: Install Playwright and run the smoke tests**

Run:
```
cd /home/jason/satscratcher/site
npm install
npx playwright install chromium
npx playwright test tests/smoke.test.js
```
Expected: All 4 smoke tests pass.

- [ ] **Step 5: Commit**

```
cd /home/jason/satscratcher
git add site/serve.js site/playwright.config.js site/tests/smoke.test.js site/package.json
test -f site/package-lock.json && git add site/package-lock.json
git commit -m "feat(site): add dev server, Playwright config, and smoke tests"
```

---

## Task 17: Guide hub page + shared prose styles

**Files:**
- Create: `site/src/guide/index.html`
- Modify: `site/src/assets/css/components.css`

- [ ] **Step 1: Write the guide hub**

Create `/home/jason/satscratcher/site/src/guide/index.html`:

```html
<!--
title: Setup Guide
description: Everything you need to set up your SatScratcher. Most people are done in five minutes.
bodyClass: guide-hub
ogPath: /guide/
-->

<section class="page-head">
  <div class="container">
    <h1>Setup Guide.</h1>
    <p class="page-head__sub">Most people are done in five minutes. Some people already were, before they bought it. Pick a page.</p>
  </div>
</section>

<section class="guide-grid">
  <div class="container">
    <div class="guide-cards">
      <a class="guide-card" href="/guide/quickstart.html">
        <div class="guide-card__num">01</div>
        <h3>Quickstart</h3>
        <p>Plug it in, join its WiFi, paste an address, done.</p>
      </a>
      <a class="guide-card" href="/guide/get-a-bitcoin-address.html">
        <div class="guide-card__num">02</div>
        <h3>Get a Bitcoin address</h3>
        <p>For people with zero crypto experience. Five minutes.</p>
      </a>
      <a class="guide-card" href="/guide/what-if-i-win.html">
        <div class="guide-card__num">03</div>
        <h3>What if I actually win?</h3>
        <p>The joke-serious page about the thing that won't happen.</p>
      </a>
      <a class="guide-card" href="/guide/troubleshooting.html">
        <div class="guide-card__num">04</div>
        <h3>Troubleshooting</h3>
        <p>The five things that go wrong, and how to fix them.</p>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append guide-hub and shared prose CSS**

Append to `/home/jason/satscratcher/site/src/assets/css/components.css`:

```css

/* ---- Page head (guides, legal, faq) ---- */
.page-head {
  padding: var(--sp-8) 0 var(--sp-5) 0;
  border-bottom: 2px solid var(--bg-elevated);
}
.page-head h1 { color: var(--primary); margin-bottom: var(--sp-3); }
.page-head__sub {
  font-size: var(--fs-md);
  color: var(--text);
  max-width: 640px;
}

/* ---- Guide grid ---- */
.guide-grid { padding: var(--sp-7) 0; }
.guide-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-4);
}
.guide-card {
  display: block;
  background: var(--bg-elevated);
  padding: var(--sp-5);
  border-left: 3px solid var(--primary);
  border-radius: 2px;
  transition: transform var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}
.guide-card:hover { transform: translateY(-2px); border-left-color: var(--jackpot); }
.guide-card__num {
  font-family: var(--display);
  font-size: var(--fs-md);
  color: var(--jackpot);
  margin-bottom: var(--sp-3);
}
.guide-card h3 { font-size: var(--fs-md); color: var(--text); margin-bottom: var(--sp-2); }
.guide-card p  { font-size: var(--fs-sm); color: var(--text-dim); margin: 0; }
@media (max-width: 680px) {
  .guide-cards { grid-template-columns: 1fr; }
}

/* ---- Content-page prose (shared by guides, legal, FAQ page) ---- */
.prose {
  max-width: 720px;
  padding: var(--sp-6) 0 var(--sp-8) 0;
}
.prose h3 { margin-top: var(--sp-5); }
.prose p  { font-size: var(--fs-md); line-height: 1.7; }
.prose ul, .prose ol { margin-bottom: var(--sp-4); }
.prose li { margin-bottom: var(--sp-2); font-size: var(--fs-md); line-height: 1.7; }
.prose blockquote {
  border-left: 3px solid var(--signal);
  padding: var(--sp-3) var(--sp-5);
  background: var(--bg-elevated);
  margin: var(--sp-4) 0;
}
.prose .warn {
  border-left: 3px solid var(--danger);
  background: var(--bg-elevated);
  padding: var(--sp-4) var(--sp-5);
  margin: var(--sp-5) 0;
}
.prose a { color: var(--primary); border-bottom: 1px dotted var(--primary); }
.prose a:hover { color: var(--jackpot); border-bottom-color: var(--jackpot); }
```

- [ ] **Step 3: Commit**

```
cd /home/jason/satscratcher
git add site/src/guide/index.html site/src/assets/css/components.css
git commit -m "feat(site): add guide hub and shared prose styles"
```

---

## Task 18: Quickstart guide

**Files:**
- Create: `site/src/guide/quickstart.html`

- [ ] **Step 1: Write the quickstart guide**

Create `/home/jason/satscratcher/site/src/guide/quickstart.html`:

```html
<!--
title: Quickstart
description: Five minutes to a slowly-mining desk toy. No crypto experience required.
bodyClass: guide
ogPath: /guide/quickstart.html
-->

<section class="page-head">
  <div class="container">
    <h1>Quickstart.</h1>
    <p class="page-head__sub">Five minutes to a slowly-mining desk toy. This will probably take less time than picking a WiFi password.</p>
  </div>
</section>

<section class="container">
  <div class="prose">
    <h3>1. Plug it in.</h3>
    <p>Any USB port. You'll see a pixel cat appear on the screen. Give it about 15 seconds — on first boot it'll automatically enter setup mode and broadcast its own WiFi network.</p>

    <h3>2. Join its WiFi.</h3>
    <p>On your phone or laptop, look for a network called <strong>SatScratcher</strong> and connect to it. You'll be dropped onto a tiny setup page served by the device itself.</p>
    <blockquote><em>Yes, the device is briefly its own WiFi router. Welcome to embedded electronics.</em></blockquote>

    <h3>3. Pick your home WiFi</h3>
    <p>from the list and type the password. The device will disconnect from its own network and reconnect through yours.</p>

    <h3>4. Paste a Bitcoin address.</h3>
    <p>Got one? Great, skip to step 5. Don't have one? <a href="/guide/get-a-bitcoin-address.html">Here's how to get one in 5 minutes</a>.</p>

    <h3>5. That's it.</h3>
    <p>The cat will start Scratching. You'll see a hashrate counter climb to ~1000 KH/s. That's your lottery ticket doing its best.</p>

    <hr>
    <p><a href="/guide/">← Back to the guide hub</a> · <a href="/guide/troubleshooting.html">Something broken? →</a></p>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```
cd /home/jason/satscratcher
git add site/src/guide/quickstart.html
git commit -m "content(site): add quickstart guide"
```

---

## Task 19: "Get a Bitcoin address" guide

**Files:**
- Create: `site/src/guide/get-a-bitcoin-address.html`

- [ ] **Step 1: Write the guide**

Create `/home/jason/satscratcher/site/src/guide/get-a-bitcoin-address.html`:

```html
<!--
title: Get a Bitcoin Address
description: How to get a Bitcoin receiving address in 5 minutes, with zero prior crypto experience.
bodyClass: guide
ogPath: /guide/get-a-bitcoin-address.html
-->

<section class="page-head">
  <div class="container">
    <h1>Bitcoin Address, 5 Minutes.</h1>
    <p class="page-head__sub">Zero prior experience required. No buying Bitcoin, no identity verification. Just a spot to receive.</p>
  </div>
</section>

<section class="container">
  <div class="prose">
    <p>You need something called a <em>receiving address</em> — a long string of letters and numbers that the SatScratcher sends your winnings to (in the cosmically unlikely event that you win). You don't need to buy any Bitcoin. You don't need to verify your identity at a bank. You just need a spot to receive.</p>

    <p>We recommend two apps, depending on how much setup you want to do.</p>

    <h3>Path A — Cash App (easiest, US only)</h3>
    <p>Cash App is the grocery-store-checkout-line of Bitcoin apps. You probably already have it.</p>
    <ol>
      <li>Open Cash App. Tap the Bitcoin tab (the ₿ icon at the bottom).</li>
      <li>Tap <strong>Deposit Bitcoin</strong>.</li>
      <li>Copy the address that appears. It starts with <code>bc1</code> or <code>3</code> or <code>1</code>.</li>
      <li>Paste it into the SatScratcher setup page during step 4 of the <a href="/guide/quickstart.html">quickstart</a>.</li>
    </ol>

    <h3>Path B — Strike (cleanest, also US)</h3>
    <p>Strike is built specifically around Bitcoin and has a cleaner address interface.</p>
    <ol>
      <li>Install Strike from the App Store or Play Store. Create an account (takes ~2 minutes).</li>
      <li>From the home tab, tap <strong>Receive</strong> → <strong>Bitcoin</strong> → <strong>On-chain</strong>.</li>
      <li>Copy the address. Paste it into SatScratcher.</li>
    </ol>

    <h3>Path C — You already know what you're doing</h3>
    <p>Use any wallet you want. Self-custody is great. We're not going to lecture you about it.</p>

    <div class="warn">
      <strong>⚠ One rule:</strong> Only send Bitcoin to a Bitcoin address. It's easy to accidentally paste the wrong thing. If the SatScratcher app says the address is invalid, don't override it — go back and copy it again.
    </div>

    <hr>
    <p><a href="/guide/">← Back to the guide hub</a></p>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```
cd /home/jason/satscratcher
git add site/src/guide/get-a-bitcoin-address.html
git commit -m "content(site): add get-a-bitcoin-address guide"
```

---

## Task 20: "What if I win" guide

**Files:**
- Create: `site/src/guide/what-if-i-win.html`

- [ ] **Step 1: Write the guide**

Create `/home/jason/satscratcher/site/src/guide/what-if-i-win.html`:

```html
<!--
title: What If I Actually Win
description: The joke-serious page about the thing that won't happen. But here's what happens if it does.
bodyClass: guide
ogPath: /guide/what-if-i-win.html
-->

<section class="page-head">
  <div class="container">
    <h1>What If I Actually Win?</h1>
    <p class="page-head__sub">First: you won't. Second: if you do, we want to hear about it.</p>
  </div>
</section>

<section class="container">
  <div class="prose">
    <p>It'll be the most improbable thing to ever happen to anyone who bought a thing on the internet for $39.</p>

    <p>Here's what actually happens if a real block is found:</p>

    <ul>
      <li>Your device will land on the <strong>Winning</strong> mascot screen (the cat with coin eyes).</li>
      <li>The block reward (~3.125 BTC at the current halving, worth roughly however-many-dollars Bitcoin is worth today) will be sent to the Bitcoin address you entered during setup.</li>
      <li>It will appear in whatever wallet owns that address, the same way any other Bitcoin arrives.</li>
      <li>You will owe taxes on it. We are not your accountant. Get one.</li>
    </ul>

    <p>The probability of this happening in your lifetime, with one SatScratcher running 24/7, is approximately the same as being struck by lightning while also being attacked by a shark. Do not plan your finances around it.</p>

    <p><em>The point of the SatScratcher is not the winning. The point is that it's running.</em></p>

    <hr>
    <p><a href="/guide/">← Back to the guide hub</a></p>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```
cd /home/jason/satscratcher
git add site/src/guide/what-if-i-win.html
git commit -m "content(site): add what-if-i-win guide"
```

---

## Task 21: Troubleshooting guide

**Files:**
- Create: `site/src/guide/troubleshooting.html`

- [ ] **Step 1: Write the guide**

Create `/home/jason/satscratcher/site/src/guide/troubleshooting.html`:

```html
<!--
title: Troubleshooting
description: Top five things that go wrong with a SatScratcher, and how to fix them.
bodyClass: guide
ogPath: /guide/troubleshooting.html
-->

<section class="page-head">
  <div class="container">
    <h1>Troubleshooting.</h1>
    <p class="page-head__sub">The five things that go wrong, and how to fix them.</p>
  </div>
</section>

<section class="container">
  <div class="prose">
    <h3>1. The screen is blank.</h3>
    <p>Unplug, wait 5 seconds, plug back in. If still blank, try a different USB cable. 90% of the time this is the cable.</p>

    <h3>2. I can't find the SatScratcher WiFi network.</h3>
    <p>It disappears after you've connected to your home WiFi once. If you want to change networks, hold the top button for 5 seconds to reset.</p>

    <h3>3. The hashrate is lower than advertised.</h3>
    <p>Normal fluctuation; it depends on the firmware's work cycle and your room temperature. Anything from 700–1100 KH/s is fine.</p>

    <h3>4. The mascot is stuck on Losing.</h3>
    <p>This means the device can't reach a mining pool. Check WiFi. If your WiFi is fine, the public pool is probably having a bad day — give it an hour.</p>

    <h3>5. Something else is broken.</h3>
    <p>Email <a href="mailto:hi@satscratcher.shop">hi@satscratcher.shop</a>. We respond within a day or two. We are one human.</p>

    <hr>
    <p><a href="/guide/">← Back to the guide hub</a></p>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```
cd /home/jason/satscratcher
git add site/src/guide/troubleshooting.html
git commit -m "content(site): add troubleshooting guide"
```

---

## Task 22: Full FAQ page

**Files:**
- Create: `site/src/faq.html`

- [ ] **Step 1: Write the full FAQ page**

Create `/home/jason/satscratcher/site/src/faq.html`:

```html
<!--
title: FAQ
description: Frequently asked questions about the SatScratcher Bitcoin lottery miner.
bodyClass: faq-page
ogPath: /faq.html
-->

<section class="page-head">
  <div class="container">
    <h1>FAQ.</h1>
    <p class="page-head__sub">Questions we either got asked, or wish we got asked. Links are deep-linkable — share them freely.</p>
  </div>
</section>

<section class="container">
  <div class="faq__list" style="max-width: 800px; padding: var(--sp-6) 0 var(--sp-8) 0;">

    <details class="faq__item" id="q-scam">
      <summary>Is this a scam?</summary>
      <p>No, and we'll prove it: we're openly telling you that this thing will not win. Scams promise wins. We promise vibes. The SatScratcher is a real ESP32 Bitcoin miner running open-source firmware (NMMiner). It hashes Bitcoin the same way any other miner does — just very, very slowly.</p>
    </details>

    <details class="faq__item" id="q-win">
      <summary>Will I actually win Bitcoin?</summary>
      <p>Technically: yes, maybe. Practically: no. Mathematically: the odds are roughly one in three hundred billion per block attempt. The Bitcoin network produces a block every ten minutes. We leave the full calculation to you as an exercise.</p>
    </details>

    <details class="faq__item" id="q-experience">
      <summary>Do I need to know anything about Bitcoin to use this?</summary>
      <p>Nope. You need to be able to plug in a USB cable and copy-paste a string of text. We wrote a <a href="/guide/get-a-bitcoin-address.html" class="inline-link">guide</a> that walks you through getting a Bitcoin address in 5 minutes if you've never touched crypto.</p>
    </details>

    <details class="faq__item" id="q-wins">
      <summary>What happens if it wins?</summary>
      <p>We wrote <a href="/guide/what-if-i-win.html" class="inline-link">a whole page about this</a>, because we thought it was funny. Short version: the block reward goes to the address you set up, and you owe taxes on it.</p>
    </details>

    <details class="faq__item" id="q-power">
      <summary>How much electricity does this use?</summary>
      <p>About 1 watt — less than an LED nightlight. Running it 24/7 for a year costs around a dollar in electricity in the US. Cheaper than most hobbies.</p>
    </details>

    <details class="faq__item" id="q-return">
      <summary>Can I return it?</summary>
      <p>Yes. 30 days, undamaged, in the case. Shipping back is on you. We'll refund the purchase price, no hard feelings. We'd rather have happy customers than reluctant owners.</p>
    </details>

    <details class="faq__item" id="q-amazon">
      <summary>Is this the same as the ones on Amazon?</summary>
      <p>The board is similar. The firmware, the branding, the mascot, the setup guide, the quickstart card, and the human who answers support emails are not. You're paying for the thing <em>and</em> the experience of the thing. If you just want a bare board and can handle flashing firmware yourself, Amazon is a valid choice and we won't be offended.</p>
    </details>

    <details class="faq__item" id="q-heat">
      <summary>Does it get hot?</summary>
      <p>Warm, not hot. Safe to leave on 24/7 in a normal room. If it's sitting in direct sunlight inside a sealed case in August, use some judgment.</p>
    </details>

    <details class="faq__item" id="q-firmware">
      <summary>Can I flash different firmware?</summary>
      <p>Yes — it's a standard ESP32-2432S028R ("CYD") board. Whatever firmware you can flash to one of those, you can flash to a SatScratcher. We ship it with a lightly-customized NMMiner build, but you own it.</p>
    </details>

    <details class="faq__item" id="q-international">
      <summary>Do you ship internationally?</summary>
      <p>Not directly from the site yet. Email us and we'll quote you USPS First-Class International. If you're ordering via Etsy, international shipping is already enabled there.</p>
    </details>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```
cd /home/jason/satscratcher
git add site/src/faq.html
git commit -m "content(site): add full FAQ page with deep-link anchors"
```

---

## Task 23: Legal trio (terms, privacy, shipping-and-returns)

**Files:**
- Create: `site/src/terms.html`
- Create: `site/src/privacy.html`
- Create: `site/src/shipping-and-returns.html`

Plain-language versions covering the basics of a one-human e-commerce store. Not legal advice; review before launch.

- [ ] **Step 1: Write terms.html**

Create `/home/jason/satscratcher/site/src/terms.html`:

```html
<!--
title: Terms of Sale
description: The plain-English terms of buying a SatScratcher.
bodyClass: legal
ogPath: /terms.html
-->

<section class="page-head">
  <div class="container">
    <h1>Terms of Sale.</h1>
    <p class="page-head__sub">Written in plain English because the alternative is insulting.</p>
  </div>
</section>

<section class="container">
  <div class="prose">
    <h3>What you're buying</h3>
    <p>A physical electronic device: an ESP32-2432S028R ("CYD") development board pre-flashed with a customized build of NMMiner firmware. It's a novelty desk toy that mines Bitcoin at a hashrate best described as "basically nothing." It is sold as-is for its entertainment and aesthetic value, not as a financial instrument or investment vehicle.</p>

    <h3>No promises about mining</h3>
    <p>We do not promise that the device will ever successfully mine a block or produce any Bitcoin. In fact, we actively tell you it won't. Any Bitcoin it does produce (shares, blocks, fractions thereof) belongs to you, the buyer, and goes to the Bitcoin address you enter during setup. We never hold, custody, or touch your Bitcoin.</p>

    <h3>Payment</h3>
    <p>Payment is processed by Snipcart and Stripe. We never see your card number.</p>

    <h3>Shipping and returns</h3>
    <p>See the <a href="/shipping-and-returns.html">shipping and returns page</a>.</p>

    <h3>Warranty</h3>
    <p>The device is covered by a 30-day functionality warranty from delivery. If it arrives DOA or fails within 30 days through no fault of yours, email us and we'll replace it. Physical damage, liquid damage, or flashing third-party firmware voids this warranty.</p>

    <h3>Liability</h3>
    <p>To the maximum extent permitted by law, our total liability for any claim arising from your purchase is limited to the amount you paid for the device. We are not liable for indirect, incidental, or consequential damages, including but not limited to lost lottery tickets, emotional distress about not winning Bitcoin, or disappointment.</p>

    <h3>Changes</h3>
    <p>We may update these terms. Purchases are governed by the terms in effect at the time of purchase.</p>

    <h3>Contact</h3>
    <p><a href="mailto:hi@satscratcher.shop">hi@satscratcher.shop</a></p>
  </div>
</section>
```

- [ ] **Step 2: Write privacy.html**

Create `/home/jason/satscratcher/site/src/privacy.html`:

```html
<!--
title: Privacy
description: The small amount of data we collect, why, and what we do with it.
bodyClass: legal
ogPath: /privacy.html
-->

<section class="page-head">
  <div class="container">
    <h1>Privacy.</h1>
    <p class="page-head__sub">Short version: we collect what Snipcart and Stripe need to ship you a thing. We do not sell it, share it, or build a profile of you.</p>
  </div>
</section>

<section class="container">
  <div class="prose">
    <h3>What we collect</h3>
    <ul>
      <li><strong>Order data</strong> — name, email, shipping address, order contents. Needed to ship the thing.</li>
      <li><strong>Payment data</strong> — handled by Stripe via Snipcart. We never see your full card number.</li>
      <li><strong>Support email</strong> — if you email us, we keep the thread so we can help you.</li>
    </ul>

    <h3>What we do not collect</h3>
    <ul>
      <li>No tracking pixels. No Meta pixel, no Google Analytics, no ad retargeting.</li>
      <li>No third-party marketing cookies.</li>
      <li>No newsletter signup (because there is no newsletter).</li>
      <li>No data from the device itself. The SatScratcher does not phone home. It talks to a public Bitcoin mining pool and that is all.</li>
    </ul>

    <h3>Who sees your data</h3>
    <ul>
      <li><strong>Snipcart</strong> processes your cart and order.</li>
      <li><strong>Stripe</strong> processes your payment.</li>
      <li><strong>USPS</strong> receives your shipping address on the label.</li>
      <li><strong>Cloudflare</strong> serves this site (standard request logs).</li>
      <li><strong>Us (one human)</strong>. We read orders and answer support emails.</li>
    </ul>

    <h3>Your rights</h3>
    <p>Email us and we'll delete everything we have about you, except what tax regulations require us to keep (order records for ~7 years). We'll confirm when it's done.</p>

    <h3>Contact</h3>
    <p><a href="mailto:hi@satscratcher.shop">hi@satscratcher.shop</a></p>
  </div>
</section>
```

- [ ] **Step 3: Write shipping-and-returns.html**

Create `/home/jason/satscratcher/site/src/shipping-and-returns.html`:

```html
<!--
title: Shipping and Returns
description: How we ship, how long it takes, and how returns work.
bodyClass: legal
ogPath: /shipping-and-returns.html
-->

<section class="page-head">
  <div class="container">
    <h1>Shipping and Returns.</h1>
    <p class="page-head__sub">USPS padded mailer, shipped from a US address by an actual human.</p>
  </div>
</section>

<section class="container">
  <div class="prose">
    <h3>Processing time</h3>
    <p>1–3 business days. Each device is flashed and test-booted before it ships, so there's a small amount of manual work per order. If you ordered on a Friday night, expect it to move on Monday.</p>

    <h3>Shipping — United States</h3>
    <p>USPS First-Class padded mailer, ~$4.50 shipping cost built into the $39 purchase price (so shipping reads as "free"). Typical delivery is 3–5 business days after shipping. Tracking is included.</p>

    <h3>Shipping — International</h3>
    <p>Not available directly from this site in v1. If you want one shipped abroad, email <a href="mailto:hi@satscratcher.shop">hi@satscratcher.shop</a> and we'll quote you actual USPS First-Class International (~$18–22 depending on country). If you're a European buyer, our Etsy listing may be easier — it has international shipping already set up.</p>

    <h3>Returns</h3>
    <p>30 days from delivery. The device must be undamaged and in its case. Return shipping is on you. We refund the full purchase price upon receipt (not the original shipping, which was a real cost). No restocking fee. No hard feelings.</p>

    <h3>DOA or defective</h3>
    <p>If your device arrives dead, or dies within 30 days through no fault of yours, email us with a photo or short video and we'll replace it at our cost, no return required. We'd rather mail you a replacement than argue about it.</p>

    <h3>Lost in transit</h3>
    <p>If USPS loses your package, we'll ship a replacement after 14 business days from the ship date (the point at which USPS considers it likely lost rather than delayed). If the original somehow turns up later, keep it.</p>

    <h3>Contact</h3>
    <p><a href="mailto:hi@satscratcher.shop">hi@satscratcher.shop</a></p>
  </div>
</section>
```

- [ ] **Step 4: Commit**

```
cd /home/jason/satscratcher
git add site/src/terms.html site/src/privacy.html site/src/shipping-and-returns.html
git commit -m "content(site): add terms, privacy, shipping-and-returns pages"
```

---

## Task 24: 404 page, robots.txt, sitemap.xml

**Files:**
- Create: `site/src/404.html`
- Create: `site/robots.txt`
- Create: `site/sitemap.xml`

- [ ] **Step 1: Write the 404 page**

Create `/home/jason/satscratcher/site/src/404.html`:

```html
<!--
title: 404 — Not Found
description: Nothing here.
bodyClass: error-404
ogPath: /404.html
-->

<section class="page-head">
  <div class="container">
    <h1>404.</h1>
    <p class="page-head__sub">Your odds of finding this page were worse than terrible. Congratulations.</p>
  </div>
</section>

<section class="container">
  <div class="prose" style="text-align: center;">
    <img class="pixel" src="/assets/img/mascot/losing.png" alt="" width="128" height="128" style="margin: var(--sp-6) auto;">
    <p>The page you wanted doesn't exist. Here are some pages that do:</p>
    <p>
      <a href="/" class="inline-link">Home</a> ·
      <a href="/guide/" class="inline-link">Setup Guide</a> ·
      <a href="/faq.html" class="inline-link">FAQ</a>
    </p>
  </div>
</section>
```

- [ ] **Step 2: Write robots.txt**

Create `/home/jason/satscratcher/site/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://satscratcher.shop/sitemap.xml
```

- [ ] **Step 3: Write sitemap.xml**

Create `/home/jason/satscratcher/site/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://satscratcher.shop/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://satscratcher.shop/guide/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://satscratcher.shop/guide/quickstart.html</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://satscratcher.shop/guide/get-a-bitcoin-address.html</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://satscratcher.shop/guide/what-if-i-win.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://satscratcher.shop/guide/troubleshooting.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://satscratcher.shop/faq.html</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://satscratcher.shop/terms.html</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://satscratcher.shop/privacy.html</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://satscratcher.shop/shipping-and-returns.html</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>
```

- [ ] **Step 4: Rebuild and verify everything is in dist/**

Run: `cd /home/jason/satscratcher/site && node build.js && ls dist/ dist/guide/`
Expected output includes all 10 HTML pages plus `robots.txt`, `sitemap.xml`, `CNAME`, and the assets/ directory.

- [ ] **Step 5: Commit**

```
cd /home/jason/satscratcher
git add site/src/404.html site/robots.txt site/sitemap.xml
git commit -m "feat(site): add 404 page, robots.txt, sitemap.xml"
```

---

## Task 25: Commerce and link-integrity Playwright tests

**Files:**
- Create: `site/tests/commerce.test.js`
- Create: `site/tests/links.test.js`

These tests avoid `page.evaluate()` / `$$eval()` entirely, reading via DOM locators and `page.content()` instead. Keeps the surface area small and the test intent obvious.

- [ ] **Step 1: Write the commerce test**

Create `/home/jason/satscratcher/site/tests/commerce.test.js`:

```javascript
'use strict';
const { test, expect } = require('@playwright/test');

test('clicking add-to-cart triggers Snipcart lazy-load', async ({ page }) => {
  await page.goto('/');

  // Before interaction, the Snipcart script should NOT yet be in the DOM.
  const before = await page.locator('script[src^="https://cdn.snipcart.com"]').count();
  expect(before).toBe(0);

  // Click the buy button. This is a "user interaction" and should kick the lazy-loader.
  await page.locator('.snipcart-add-item').first().click();

  // The lazy-loader appends a script to <head>. Wait for it.
  await page.waitForSelector('script[src^="https://cdn.snipcart.com"]', { timeout: 10000 });
  const after = await page.locator('script[src^="https://cdn.snipcart.com"]').count();
  expect(after).toBeGreaterThan(0);
});

test('Snipcart settings block is present in the rendered HTML with correct values', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  // We read the inline <script> body that declares window.SnipcartSettings.
  // Reading via content() (not a JS context call) keeps the test purely observational.
  expect(html).toContain('loadStrategy: "on-user-interaction"');
  expect(html).toContain('modalStyle: "side"');
  expect(html).toContain('currency: "usd"');
  expect(html).toContain('timeoutDuration: 2750');
});
```

- [ ] **Step 2: Write the link-integrity test**

Create `/home/jason/satscratcher/site/tests/links.test.js`:

```javascript
'use strict';
const { test, expect } = require('@playwright/test');

const PAGES = [
  '/',
  '/guide/',
  '/guide/quickstart.html',
  '/guide/get-a-bitcoin-address.html',
  '/guide/what-if-i-win.html',
  '/guide/troubleshooting.html',
  '/faq.html',
  '/terms.html',
  '/privacy.html',
  '/shipping-and-returns.html',
];

for (const pagePath of PAGES) {
  test(`page loads: ${pagePath}`, async ({ page }) => {
    const response = await page.goto(pagePath);
    expect(response.status()).toBe(200);
    // The footer is on every page — if it's missing, the layout broke.
    await expect(page.locator('.footer')).toBeVisible();
  });
}

test('every internal link on the homepage resolves to a 200', async ({ page, request }) => {
  await page.goto('/');

  // Enumerate anchors via locator.all() — no JS-context calls.
  const anchors = await page.locator('a[href]').all();
  const hrefs = [];
  for (const a of anchors) {
    const href = await a.getAttribute('href');
    if (href) hrefs.push(href);
  }

  // Internal = relative or root-relative. Skip mailto:, http(s)://, and pure hash fragments.
  const internal = hrefs.filter(h =>
    !h.startsWith('mailto:') &&
    !h.startsWith('http://') &&
    !h.startsWith('https://') &&
    !h.startsWith('#')
  );

  for (const href of internal) {
    const bare = href.split('#')[0];
    if (!bare) continue;
    const resp = await request.get(bare);
    expect(resp.status(), `${href} → ${bare}`).toBe(200);
  }
});
```

- [ ] **Step 3: Run the full Playwright suite**

Run: `cd /home/jason/satscratcher/site && npx playwright test`
Expected: All tests in smoke, commerce, and links suites pass.

- [ ] **Step 4: Commit**

```
cd /home/jason/satscratcher
git add site/tests/commerce.test.js site/tests/links.test.js
git commit -m "test(site): add commerce flow and link-integrity e2e tests"
```

---

## Task 26: Cloudflare Pages configuration

**Files:**
- Create: `site/_headers`
- Create: `site/_redirects`

- [ ] **Step 1: Write _headers**

Create `/home/jason/satscratcher/site/_headers`:

```
# Cache static assets aggressively; HTML gets short TTL.
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/assets/img/*
  Cache-Control: public, max-age=31536000, immutable

/assets/css/*
  Cache-Control: public, max-age=604800

/assets/js/*
  Cache-Control: public, max-age=604800

/*.html
  Cache-Control: public, max-age=300, must-revalidate

# Security headers across the whole site
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- [ ] **Step 2: Write _redirects**

Create `/home/jason/satscratcher/site/_redirects`:

```
# Strip trailing slashes on leaf pages for canonical URLs
/guide/quickstart/              /guide/quickstart.html              301
/guide/get-a-bitcoin-address/   /guide/get-a-bitcoin-address.html   301
/guide/what-if-i-win/           /guide/what-if-i-win.html           301
/guide/troubleshooting/         /guide/troubleshooting.html         301
/faq/                           /faq.html                           301
/terms/                         /terms.html                         301
/privacy/                       /privacy.html                       301
/shipping-and-returns/          /shipping-and-returns.html          301

# Courtesy short links
/setup                          /guide/                             302
/help                           /guide/troubleshooting.html         302
```

- [ ] **Step 3: Rebuild and verify both files are copied to dist/**

Run: `cd /home/jason/satscratcher/site && node build.js && ls dist/_headers dist/_redirects dist/CNAME`
Expected: All three files are present in `dist/`.

- [ ] **Step 4: Commit**

```
cd /home/jason/satscratcher
git add site/_headers site/_redirects
git commit -m "feat(site): add Cloudflare Pages headers and redirects"
```

---

## Task 27: First push and Cloudflare Pages setup

**Files:** None created — operational step.

This is the deploy step. Partially manual (Cloudflare dashboard side), so the plan documents what to do rather than automating it.

- [ ] **Step 1: Verify the final build works end-to-end**

Run:
```
cd /home/jason/satscratcher/site
node build.js
node --test tests/build.test.js
npx playwright test
```
Expected: Build succeeds, all unit tests pass, all e2e tests pass.

- [ ] **Step 2: Push to GitHub**

Run:
```
cd /home/jason/satscratcher
git log --oneline | head -20
git push -u origin main
```
Expected: Push succeeds. If the remote already has commits that diverge (unlikely since the repo was empty), stop and ask the user how to reconcile — do not force-push.

- [ ] **Step 3: Create the Cloudflare Pages project (manual, via dashboard)**

Tell the user:

> The code is pushed. To finish the deploy you need to create the Cloudflare Pages project yourself (one-time, ~2 minutes):
>
> 1. Go to https://dash.cloudflare.com/ → Workers & Pages → Create → Pages → **Connect to Git**.
> 2. Select the `jasonpersinger/satscratcher` repo.
> 3. Project name: `satscratcher`.
> 4. Production branch: `main`.
> 5. Build settings:
>    - **Framework preset:** None
>    - **Build command:** `cd site && node build.js`
>    - **Build output directory:** `site/dist`
>    - **Root directory:** leave blank
> 6. Environment variables (Production):
>    - `SNIPCART_PUBLIC_KEY` — paste your Snipcart public API key
>    - `NODE_VERSION` — `22`
> 7. Click **Save and Deploy**. First build takes ~30 seconds.
> 8. After the first successful deploy, go to **Custom domains** → add `satscratcher.shop` and `www.satscratcher.shop`. Cloudflare will walk you through DNS.
> 9. Verify: `https://satscratcher.shop` loads, add-to-cart opens Snipcart, all guide pages return 200.

- [ ] **Step 4: Smoke-test the live site**

Once Cloudflare Pages has deployed, run manually:
```
curl -sI https://satscratcher.shop/ | head -5
curl -s https://satscratcher.shop/ | grep -o '<title>[^<]*</title>'
curl -sI https://satscratcher.shop/guide/quickstart.html | head -5
```
Expected: 200 OK on both, title contains "SatScratcher".

- [ ] **Step 5: Final commit (if anything needs bookkeeping)**

If the deploy surfaces anything that needs a last-minute fix (e.g., a path adjustment, a missing asset), fix it, commit, and push. Otherwise this task is done.

---

## Self-Review

**Spec coverage check:**

| Spec section | Covered by |
|---|---|
| §3.1 Tech Stack | Task 2 (package.json), Task 3 (build.js), Task 27 (Cloudflare Pages) |
| §3.2 Page Map (10 routes) | Tasks 11–15 (/), 17 (/guide/), 18–21 (4 guides), 22 (/faq.html), 23 (legal trio) |
| §3.3 Main Page Sections | Tasks 8 (topbar), 11 (hero), 12 (what-it-is), 13 (product), 14 (how-it-works), 15 (faq), 9 (footer) |
| §3.4 Snipcart Integration | Task 7 (partial + lazy-loader), Task 13 (add-item attributes), Task 25 (commerce test) |
| §3.5 Performance target | Tasks 5–6 (font preloading + self-hosting), Task 26 (_headers cache config) |
| §4.2 Setup guide (5 pages) | Tasks 17–21 |
| §4.3 FAQ (6 questions + more) | Tasks 15 (inline), 22 (full page) |
| §2.2 Palette | Task 4 (tokens.css) |
| §2.3 Typography | Tasks 5–6 |
| §2.4 Voice | All content tasks — copy lifted directly from spec §4 |
| §4.1 Quickstart card | **NOT in this plan** — deferred to the print subsystem plan |
| §5 Firmware | **NOT in this plan** — deferred to the firmware subsystem plan |

**Placeholder scan:** No `TBD`, `TODO`, "add error handling," or "similar to Task N" phrases. Every step has either code to write or a command to run with expected output.

**Type/identifier consistency:**
- `parseFrontmatter`, `expandPartials`, `substituteVars`, `build` — defined in Task 3, referenced only via `require('../build.js')` in the test file.
- Snipcart class names (`.snipcart-add-item`, `.snipcart-checkout`, `.snipcart-items-count`) — consistent across topbar (Task 8), product card (Task 13), and tests (Tasks 16, 25).
- `data-item-id="satscratcher-v1"` — defined in Task 13, asserted in Task 16 smoke test.
- Font file names (`PressStart2P-Regular.woff2`, `Inter-{Regular,Medium,Bold}.woff2`) — consistent across Task 5 (@font-face), Task 6 (file creation), Task 7 (preload tags).
- Color tokens — defined in Task 4, referenced consistently throughout all component CSS.
- Page paths in sitemap (Task 24), _redirects (Task 26), links test (Task 25), and HTML files (Tasks 17–23) — all use `.html` extensions consistently.
- FAQ anchor IDs (`q-scam`, `q-win`, `q-experience`, `q-wins`, `q-power`, `q-return`, `q-amazon`) — consistent between Task 15 (main page FAQ) and Task 22 (full FAQ page), so deep-links work from both.

**Build order sanity:** The Playwright webServer command `node build.js && node serve.js 4321` rebuilds on every test run, so tests always see current state.

**Known accepted compromises:**
- Inter Medium and Bold are placeholder copies of Inter Regular in Task 6. Fine for visual development; replace with real static WOFF2 from rsms.me/inter before launch.
- Product photography and pixel-art assets are solid-color placeholders from Task 10. Replace with real JPEGs/PNGs before launch.
- `SNIPCART_PUBLIC_KEY` is injected via `.env` or Cloudflare env var; without it the add-to-cart button still renders but Snipcart's API won't initialize. Desired during development.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-09-satscratcher-storefront.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
