# satscratcher.shop Storefront

Pure HTML, CSS, and JavaScript. No framework. A tiny build script expands partials and substitutes variables into a master layout.

## Commands

```bash
npm install
npm run build
npm run serve
npm test
npx playwright test
```

## Build Model

1. Each `src/*.html` file may start with an HTML comment frontmatter block.
2. Page contents become `{{content}}` inside `src/_layout.html`.
3. `{{> partialName }}` tokens are replaced with `src/_partials/partialName.html`.
4. `{{var}}` tokens are replaced with frontmatter, `.env`, or process environment values.
5. Output is written to `dist/`, preserving directory structure.
6. `src/assets/` is copied verbatim into `dist/assets/`.

## Environment

Copy `.env.example` to `.env` and set `SNIPCART_PUBLIC_KEY`. In Cloudflare Pages, set it as a build environment variable.
