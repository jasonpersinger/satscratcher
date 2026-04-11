#!/usr/bin/env python3
"""Convert a TTF to WOFF2. Usage: convert-font.py <input.ttf> <output.woff2>"""
import sys
from fontTools.ttLib import TTFont
f = TTFont(sys.argv[1])
f.flavor = 'woff2'
f.save(sys.argv[2])
print(f"wrote {sys.argv[2]}")
