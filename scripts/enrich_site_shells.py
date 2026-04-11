#!/usr/bin/env python3
"""Legacy site-shell enrichment helper retired for the handwritten-HTML workflow."""

from __future__ import annotations

import sys


MESSAGE = (
    "The legacy site-shell enrichment helper has been retired. "
    "Shared shell changes now belong in the checked-in HTML and partial files."
)


def main() -> int:
    print(MESSAGE, file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
