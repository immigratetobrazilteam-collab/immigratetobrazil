#!/usr/bin/env python3
"""Audit and optionally optimize image assets referenced by the site."""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

from maintenance_common import ROOT, ensure_dirs, parse_all_html, public_asset_exists, rel, write_json_if_changed, write_text_if_changed

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
LARGE_IMAGE_BYTES = 750_000


def referenced_images() -> set[Path]:
    images = set()
    for doc in parse_all_html(include_partials=True):
        for image in doc.images:
            for attr in ("src",):
                value = image.get(attr, "")
                clean = value.split("?", 1)[0].split("#", 1)[0]
                if clean.startswith("/"):
                    images.add(ROOT / clean.lstrip("/"))
            srcset = image.get("srcset", "")
            for part in srcset.split(","):
                clean = part.strip().split(" ", 1)[0].split("?", 1)[0]
                if clean.startswith("/"):
                    images.add(ROOT / clean.lstrip("/"))
    return images


def image_size(path: Path) -> tuple[int | None, int | None]:
    try:
        from PIL import Image

        with Image.open(path) as im:
            return im.size
    except Exception:
        return None, None


def optimize(path: Path, quality: int) -> bool:
    try:
        from PIL import Image

        original = path.read_bytes()
        with Image.open(path) as im:
            save_kwargs = {}
            if path.suffix.lower() in {".jpg", ".jpeg", ".webp"}:
                save_kwargs["quality"] = quality
                save_kwargs["optimize"] = True
            elif path.suffix.lower() == ".png":
                save_kwargs["optimize"] = True
            else:
                return False
            im.save(path, **save_kwargs)
        if len(path.read_bytes()) >= len(original):
            path.write_bytes(original)
            return False
        return True
    except Exception:
        return False


def audit_images(apply: bool, quality: int) -> dict[str, object]:
    refs = referenced_images()
    by_hash: dict[str, list[str]] = {}
    items = []
    optimized = []
    for path in sorted(refs):
        exists = path.exists()
        size = path.stat().st_size if exists else 0
        width, height = image_size(path) if exists and path.suffix.lower() in IMAGE_SUFFIXES else (None, None)
        item = {"file": rel(path) if exists else str(path), "exists": exists, "bytes": size, "width": width, "height": height, "large": size > LARGE_IMAGE_BYTES}
        if exists and path.suffix.lower() in IMAGE_SUFFIXES:
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            by_hash.setdefault(digest, []).append(rel(path))
            if apply and size > LARGE_IMAGE_BYTES and optimize(path, quality):
                optimized.append(rel(path))
                item["optimized"] = True
        items.append(item)
    duplicates = [paths for paths in by_hash.values() if len(paths) > 1]
    return {"referenced_count": len(refs), "large_count": sum(1 for i in items if i["large"]), "missing_count": sum(1 for i in items if not i["exists"]), "duplicates": duplicates, "optimized": optimized, "images": items}


def markdown(data: dict[str, object]) -> str:
    lines = [
        "# Image Audit",
        "",
        f"- Referenced images: {data['referenced_count']}",
        f"- Large images: {data['large_count']}",
        f"- Missing images: {data['missing_count']}",
        f"- Duplicate groups: {len(data['duplicates'])}",
        f"- Optimized this run: {len(data['optimized'])}",
        "",
    ]
    for item in data["images"]:
        if item["large"] or not item["exists"]:
            lines.append(f"- `{item['file']}`: {item['bytes']} bytes, {item['width']}x{item['height']}, exists={item['exists']}")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Optimize large PNG/JPEG/WebP images in place.")
    parser.add_argument("--audit-only", action="store_true", help="Audit without optimizing. Default behavior.")
    parser.add_argument("--quality", type=int, default=82, help="JPEG/WebP quality when --apply is used.")
    args = parser.parse_args()
    ensure_dirs()
    data = audit_images(apply=args.apply and not args.audit_only, quality=args.quality)
    write_json_if_changed(ROOT / "reports" / "images.json", data)
    write_text_if_changed(ROOT / "reports" / "images.md", markdown(data))
    print(f"Images checked: {data['referenced_count']}; large: {data['large_count']}; missing: {data['missing_count']}; optimized: {len(data['optimized'])}.")
    return 1 if data["missing_count"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
