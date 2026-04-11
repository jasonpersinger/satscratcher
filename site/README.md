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
