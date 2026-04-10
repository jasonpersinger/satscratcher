# PDF Render Pipeline

`render.py` converts the source markdown spec into:

- `build/rendered.html`
- `docs/satscratcher-design.pdf`

## Run

```bash
.venv/bin/python build/render.py
```

For a fresh environment:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python build/render.py
```
