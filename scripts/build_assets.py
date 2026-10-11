#!/usr/bin/env python3
"""Create the single minified CSS and JavaScript files served by every page.

Requires Node.js/npm and uses pinned clean-css-cli and Terser versions via npx.
Run after editing the source CSS or JavaScript modules.
"""
from __future__ import annotations
import hashlib
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_SOURCES = ('css/bootstrap-lite.css', 'css/site.css', 'css/cities.css')
JS_SOURCES = ('js/search.js', 'js/accessibility.js', 'js/site.js', 'js/city-explorer.js', 'js/partials.js')


def build_bundle(sources: tuple[str, ...], temp_file: Path) -> None:
    temp_file.write_text('\n'.join((ROOT / p).read_text(encoding='utf-8') for p in sources), encoding='utf-8')


def main() -> int:
    with tempfile.TemporaryDirectory(prefix='itb-assets-') as tmp:
        temp = Path(tmp)
        css_input, js_input = temp / 'site.css', temp / 'site.js'
        build_bundle(CSS_SOURCES, css_input)
        build_bundle(JS_SOURCES, js_input)
        subprocess.run(['npx','--yes','clean-css-cli@5.6.3','--output',str(ROOT/'css/site.bundle.css'),str(css_input)], check=True, cwd=ROOT)
        subprocess.run(['npx','--yes','terser@5.44.0',str(js_input),'--compress','--mangle','--format','comments=false','--output',str(ROOT/'js/site.bundle.js')], check=True, cwd=ROOT)
    css_hash = hashlib.sha256((ROOT/'css/site.bundle.css').read_bytes()).hexdigest()[:12]
    js_hash = hashlib.sha256((ROOT/'js/site.bundle.js').read_bytes()).hexdigest()[:12]
    updated = 0
    for page in ROOT.rglob('*.html'):
        if '.git' in page.parts or 'assets' in page.parts:
            continue
        text = page.read_text(encoding='utf-8', errors='ignore')
        revised = re.sub(r'(/css/site\.bundle\.css\?v=)[^"\']+',r'\g<1>'+css_hash,text)
        revised = re.sub(r'(/js/site\.bundle\.js\?v=)[^"\']+',r'\g<1>'+js_hash,revised)
        if revised != text:
            page.write_text(revised,encoding='utf-8')
            updated += 1
    print(f'Built CSS ({(ROOT/"css/site.bundle.css").stat().st_size:,} bytes, {css_hash}) and JS ({(ROOT/"js/site.bundle.js").stat().st_size:,} bytes, {js_hash}); updated cache versions on {updated} pages.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
