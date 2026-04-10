.PHONY: render-docs site-build site-test site-serve

render-docs:
	.venv/bin/python build/render.py

site-build:
	cd site && npm run build

site-test:
	cd site && npm test

site-serve:
	cd site && npm run serve
