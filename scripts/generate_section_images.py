#!/usr/bin/env python3
"""Legacy section-image generator retired for the handwritten-HTML workflow."""

from __future__ import annotations

import sys


MESSAGE = (
    "The legacy section-image generator has been retired. "
    "English pages are now maintained directly in the checked-in HTML files, "
    "and the existing section-image manifests/assets remain the source of truth "
    "until an HTML-driven replacement is introduced."
)


def main() -> int:
    print(MESSAGE, file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
