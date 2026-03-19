from __future__ import annotations

import base64
from collections import deque
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO_DIR = ROOT / "assets" / "logo"
FAVICON_DIR = ROOT / "assets" / "favicons"
SOURCE_LOGO = LOGO_DIR / "source-logo.jpg"


def ensure_source_logo() -> Path:
    if not SOURCE_LOGO.exists():
        raise FileNotFoundError(f"Missing source logo file: {SOURCE_LOGO}")
    return SOURCE_LOGO


def load_source() -> Image.Image:
    return Image.open(ensure_source_logo()).convert("RGBA")


def average_color(pixels: list[tuple[int, int, int, int]]) -> tuple[int, int, int]:
    count = len(pixels)
    return (
        sum(pixel[0] for pixel in pixels) // count,
        sum(pixel[1] for pixel in pixels) // count,
        sum(pixel[2] for pixel in pixels) // count,
    )


def looks_like_background(pixel: tuple[int, int, int, int], background: tuple[int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True
    brightness = (r + g + b) / 3
    spread = max(abs(r - background[0]), abs(g - background[1]), abs(b - background[2]))
    low_chroma = max(r, g, b) - min(r, g, b) < 36
    return brightness > 222 and spread < 58 and low_chroma


def edge_background_mask(image: Image.Image) -> list[bool]:
    width, height = image.size
    pixels = image.load()
    corners = [
        pixels[0, 0],
        pixels[width - 1, 0],
        pixels[0, height - 1],
        pixels[width - 1, height - 1],
    ]
    background = average_color(corners)
    visited = [False] * (width * height)
    queue: deque[tuple[int, int]] = deque()

    def visit(x: int, y: int) -> None:
        index = y * width + x
        if visited[index]:
            return
        if looks_like_background(pixels[x, y], background):
            visited[index] = True
            queue.append((x, y))

    for x in range(width):
        visit(x, 0)
        visit(x, height - 1)
    for y in range(height):
        visit(0, y)
        visit(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                index = ny * width + nx
                if not visited[index] and looks_like_background(pixels[nx, ny], background):
                    visited[index] = True
                    queue.append((nx, ny))

    return visited


def transparent_logo(image: Image.Image) -> Image.Image:
    width, height = image.size
    pixels = image.load()
    bg_mask = edge_background_mask(image)
    transparent = image.copy()
    out = transparent.load()
    for y in range(height):
        for x in range(width):
            if bg_mask[y * width + x]:
                r, g, b, _ = out[x, y]
                out[x, y] = (r, g, b, 0)
    return transparent


def cropped_square(image: Image.Image, padding_ratio: float = 0.05) -> Image.Image:
    bbox = image.getbbox()
    if bbox is None:
        return image
    left, top, right, bottom = bbox
    content_width = right - left
    content_height = bottom - top
    padding = int(max(content_width, content_height) * padding_ratio)
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    cropped = image.crop((left, top, right, bottom))
    side = max(cropped.width, cropped.height)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    x = (side - cropped.width) // 2
    y = (side - cropped.height) // 2
    canvas.paste(cropped, (x, y), cropped)
    return canvas


def cropped_square_with_background(image: Image.Image, alpha_reference: Image.Image, padding_ratio: float = 0.05) -> Image.Image:
    bbox = alpha_reference.getbbox()
    if bbox is None:
        return image
    left, top, right, bottom = bbox
    content_width = right - left
    content_height = bottom - top
    padding = int(max(content_width, content_height) * padding_ratio)
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    cropped = image.crop((left, top, right, bottom))
    side = max(cropped.width, cropped.height)
    canvas = Image.new("RGBA", (side, side), (255, 255, 255, 255))
    x = (side - cropped.width) // 2
    y = (side - cropped.height) // 2
    canvas.paste(cropped, (x, y), cropped)
    return canvas


def raster_svg(image: Image.Image, aria_label: str) -> str:
    width, height = image.size
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="{aria_label}">'
        f'<image href="data:image/png;base64,{encoded}" width="{width}" height="{height}" />'
        f"</svg>\n"
    )


def resized(image: Image.Image, size: int, background: tuple[int, int, int, int] = (0, 0, 0, 0)) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    inset = int(size * 0.08)
    target = image.resize((size - inset * 2, size - inset * 2), Image.Resampling.LANCZOS)
    canvas.paste(target, (inset, inset), target)
    return canvas


def main() -> None:
    LOGO_DIR.mkdir(parents=True, exist_ok=True)
    FAVICON_DIR.mkdir(parents=True, exist_ok=True)

    source = load_source()
    transparent_raw = transparent_logo(source)
    transparent = cropped_square(transparent_raw)
    with_background = cropped_square_with_background(source, transparent_raw)

    transparent.save(LOGO_DIR / "immigrate-to-brazil-logo.png")
    transparent.save(LOGO_DIR / "immigrate-to-brazil-logo-transparent.png")
    with_background.save(LOGO_DIR / "immigrate-to-brazil-logo-with-background.png")
    (LOGO_DIR / "immigrate-to-brazil-logo.svg").write_text(
        raster_svg(transparent, "Immigrate to Brazil logo"),
        encoding="utf-8",
    )

    for size in [16, 32, 180, 192, 512]:
        icon = resized(transparent, size)
        if size in {16, 32}:
            icon.save(FAVICON_DIR / f"favicon-{size}x{size}.png")
        elif size == 180:
            icon.save(FAVICON_DIR / "apple-touch-icon.png")
        elif size == 192:
            icon.save(FAVICON_DIR / "android-chrome-192x192.png")
        elif size == 512:
            icon.save(FAVICON_DIR / "android-chrome-512x512.png")

    resized(transparent, 96).save(FAVICON_DIR / "favicon.png")

    (FAVICON_DIR / "site.webmanifest").write_text(
        """{
  "name": "Immigrate to Brazil",
  "short_name": "ITB",
  "icons": [
    {"src": "/assets/favicons/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/assets/favicons/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png"}
  ],
  "theme_color": "#123B29",
  "background_color": "#FFF5E2",
  "display": "standalone"
}""",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
