# SatScratcher

A pre-flashed, pixel-art-branded Bitcoin "lottery" miner sold as a desk toy.

**Tagline:** Mine Bitcoin. Win (Maybe). Look Cool Regardless.

This repo contains the brand, storefront, firmware customization assets, and print materials for [satscratcher.shop](https://satscratcher.shop).

## Layout

- `docs/superpowers/specs/` - design and business spec
- `docs/satscratcher-design.pdf` - branded PDF render of the spec
- `build/` - Python PDF render pipeline with WeasyPrint
- `site/` - storefront static site
- `firmware/` - asset pipeline and tools for the NMMiner fork
- `print/` - print-ready quickstart card workspace

See `docs/superpowers/specs/2026-04-09-satscratcher-design.md` for the full spec.

## Commands

```bash
make render-docs
make site-build
make site-test
make site-serve
```

The docs renderer currently expects the checked-in `.venv/` or an equivalent Python environment with `markdown`, `jinja2`, and `weasyprint` installed.
