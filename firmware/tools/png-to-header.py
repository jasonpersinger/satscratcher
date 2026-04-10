#!/usr/bin/env python3
"""Convert an RGB/RGBA PNG into a C RGB565 array for TFT displays."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def rgb565(r: int, g: int, b: int) -> int:
    return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)


def convert(input_path: Path, symbol: str) -> str:
    image = Image.open(input_path).convert("RGB")
    width, height = image.size
    values = [rgb565(*pixel) for pixel in image.getdata()]
    rows = []
    for i in range(0, len(values), 12):
      rows.append("  " + ", ".join(f"0x{v:04X}" for v in values[i:i + 12]))

    return "\n".join([
        "#pragma once",
        "#include <stdint.h>",
        "",
        f"const uint16_t {symbol}_width = {width};",
        f"const uint16_t {symbol}_height = {height};",
        f"const uint16_t {symbol}[] = {{",
        ",\n".join(rows),
        "};",
        "",
    ])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--symbol", default="satscratcher_image")
    args = parser.parse_args()
    args.output.write_text(convert(args.input, args.symbol), encoding="utf-8")


if __name__ == "__main__":
    main()
