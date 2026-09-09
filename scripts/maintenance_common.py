#!/usr/bin/env python3
"""Common helpers for the website maintenance scripts.

This module is the stable shared import path for maintenance commands. The
implementation currently re-exports the helpers in maintenance_lib.py so older
scripts and newer command names share one code path.
"""

from maintenance_lib import *  # noqa: F401,F403
