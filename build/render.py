#!/usr/bin/env python3
"""
Render the SatScratcher design doc markdown into a branded PDF.

Pipeline:
  markdown file → strip frontmatter → python-markdown → HTML →
  jinja2 template → weasyprint → PDF

Run from the repo root (or anywhere, paths are absolute-relative to this file).
"""

from __future__ import annotations

import sys
import re
from pathlib import Path

import markdown
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML


BUILD_DIR = Path(__file__).resolve().parent
REPO_ROOT = BUILD_DIR.parent
MARKDOWN_PATH = REPO_ROOT / "docs" / "superpowers" / "specs" / "2026-04-09-satscratcher-design.md"
FONT_DIR = BUILD_DIR / "fonts"
TEMPLATE_NAME = "template.html.j2"
OUTPUT_PDF = REPO_ROOT / "docs" / "satscratcher-design.pdf"
OUTPUT_HTML_DEBUG = BUILD_DIR / "rendered.html"


def strip_frontmatter(md_source: str) -> tuple[str, str]:
    """Split the top matter (above the first --- separator) from the body.

    The top matter contains the document title and metadata that are already
    on the cover page. Returning it separately lets us use it for <title>
    while keeping it out of the rendered body.
    """
    parts = md_source.split("\n---\n", 1)
    if len(parts) != 2:
        return "", md_source
    return parts[0].strip(), parts[1].strip()


def parse_metadata(frontmatter: str) -> dict[str, str]:
    metadata = {}
    title = frontmatter.splitlines()[0].lstrip("# ").strip() if frontmatter else ""
    if title:
        metadata["title"] = title

    for line in frontmatter.splitlines():
        match = re.match(r"^\*\*([^:]+):\*\*\s*(.+?)\s*$", line)
        if match:
            key = match.group(1).strip().lower().replace(" ", "_")
            metadata[key] = match.group(2).strip()

    return metadata


def render() -> None:
    if not MARKDOWN_PATH.exists():
        sys.exit(f"ERROR: markdown source not found at {MARKDOWN_PATH}")
    if not FONT_DIR.exists():
        sys.exit(f"ERROR: font directory not found at {FONT_DIR}")

    md_source = MARKDOWN_PATH.read_text(encoding="utf-8")
    frontmatter, body_md = strip_frontmatter(md_source)
    metadata = parse_metadata(frontmatter)

    md = markdown.Markdown(
        extensions=[
            "extra",          # tables, fenced code, attr_list, etc.
            "sane_lists",
            "smarty",         # typographic quotes and dashes
            "toc",
        ],
        output_format="html5",
    )
    body_html = md.convert(body_md)

    env = Environment(
        loader=FileSystemLoader(str(BUILD_DIR)),
        autoescape=select_autoescape(enabled_extensions=("html", "j2")),
    )
    template = env.get_template(TEMPLATE_NAME)

    full_html = template.render(
        title=metadata.get("title", "SatScratcher - Design & Business Plan"),
        version=metadata.get("version", "1.0"),
        date=metadata.get("date", ""),
        domain=metadata.get("primary_domain", "satscratcher.shop"),
        repo=metadata.get("repo", "https://github.com/jasonpersinger/satscratcher").replace("https://github.com/", ""),
        body_html=body_html,
        font_dir=f"file://{FONT_DIR}",
    )

    OUTPUT_HTML_DEBUG.write_text(full_html, encoding="utf-8")

    OUTPUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    HTML(string=full_html, base_url=str(BUILD_DIR)).write_pdf(str(OUTPUT_PDF))

    size_kb = OUTPUT_PDF.stat().st_size / 1024
    print(f"OK  markdown  : {MARKDOWN_PATH.relative_to(REPO_ROOT)}")
    print(f"OK  html      : {OUTPUT_HTML_DEBUG.relative_to(REPO_ROOT)}")
    print(f"OK  pdf       : {OUTPUT_PDF.relative_to(REPO_ROOT)}  ({size_kb:.0f} KB)")


if __name__ == "__main__":
    render()
