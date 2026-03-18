from __future__ import annotations

import sys
from pathlib import Path
from PIL import Image

MAX_WIDTH = 2200
WEBP_QUALITY = 84


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: convert_to_webp.py <src> <dest>", file=sys.stderr)
        return 1
    src = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    dest.parent.mkdir(parents=True, exist_ok=True)
    temp_dest = dest.with_suffix(".tmp.webp") if src.resolve() == dest.resolve() else dest
    with Image.open(src) as image:
        converted = image.convert("RGB")
        width, height = converted.size
        if width > MAX_WIDTH:
            ratio = MAX_WIDTH / float(width)
            converted = converted.resize((MAX_WIDTH, int(height * ratio)))
        converted.save(temp_dest, "WEBP", quality=WEBP_QUALITY, method=6)
    if temp_dest != dest:
        temp_dest.replace(dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
