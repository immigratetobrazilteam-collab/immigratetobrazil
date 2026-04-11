#!/usr/bin/env python3
"""Legacy About-family rewrite helper retired for the handwritten-HTML workflow."""

from __future__ import annotations

import sys


MESSAGE = (
    "The legacy About-family rewrite helper has been retired. "
    "Edit the checked-in HTML pages directly instead."
)


def main() -> int:
    print(MESSAGE, file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
