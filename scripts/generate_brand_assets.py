from __future__ import annotations

import base64
from collections import deque
from io import BytesIO
from pathlib import Path
from statistics import median

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


def background_color(image: Image.Image) -> tuple[int, int, int]:
    pixels = image.load()
    width, height = image.size
    corners = [
        pixels[0, 0],
        pixels[width - 1, 0],
        pixels[0, height - 1],
        pixels[width - 1, height - 1],
    ]
    return average_color(corners)


def background_metrics(
    pixel: tuple[int, int, int, int],
    background: tuple[int, int, int],
) -> tuple[float, int, bool]:
    r, g, b, a = pixel
    if a == 0:
        return 255.0, 0, True
    brightness = (r + g + b) / 3
    spread = max(abs(r - background[0]), abs(g - background[1]), abs(b - background[2]))
    low_chroma = max(r, g, b) - min(r, g, b) < 36
    return brightness, spread, low_chroma


def looks_like_background(pixel: tuple[int, int, int, int], background: tuple[int, int, int]) -> bool:
    brightness, spread, low_chroma = background_metrics(pixel, background)
    return brightness > 205 and spread < 38 and low_chroma


def edge_background_mask(image: Image.Image) -> list[bool]:
    width, height = image.size
    pixels = image.load()
    background = background_color(image)
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


def neighbor_has_background(mask: list[bool], width: int, height: int, x: int, y: int) -> bool:
    for nx, ny in (
        (x - 1, y),
        (x + 1, y),
        (x, y - 1),
        (x, y + 1),
        (x - 1, y - 1),
        (x + 1, y - 1),
        (x - 1, y + 1),
        (x + 1, y + 1),
    ):
        if 0 <= nx < width and 0 <= ny < height and mask[ny * width + nx]:
            return True
    return False


def edge_alpha(pixel: tuple[int, int, int, int], background: tuple[int, int, int]) -> int | None:
    brightness, spread, low_chroma = background_metrics(pixel, background)
    if not low_chroma or brightness < 180:
        return None
    if spread <= 18:
        return 0
    if spread >= 58:
        return None
    return int((spread - 18) / (58 - 18) * 255)


def decontaminate_matte(
    pixel: tuple[int, int, int, int],
    background: tuple[int, int, int],
    alpha: int,
) -> tuple[int, int, int, int]:
    if alpha <= 0:
        return (0, 0, 0, 0)
    if alpha >= 255:
        return pixel

    def recover(channel: int, matte: int) -> int:
        recovered = (channel * 255 - matte * (255 - alpha)) / alpha
        return max(0, min(255, round(recovered)))

    r, g, b, _ = pixel
    return (
        recover(r, background[0]),
        recover(g, background[1]),
        recover(b, background[2]),
        alpha,
    )


def transparent_logo(image: Image.Image) -> Image.Image:
    width, height = image.size
    pixels = image.load()
    background = background_color(image)
    bg_mask = edge_background_mask(image)
    transparent = image.copy()
    out = transparent.load()
    for y in range(height):
        for x in range(width):
            if bg_mask[y * width + x]:
                out[x, y] = (0, 0, 0, 0)
                continue
            if not neighbor_has_background(bg_mask, width, height, x, y):
                continue
            alpha = edge_alpha(pixels[x, y], background)
            if alpha is None:
                continue
            out[x, y] = decontaminate_matte(pixels[x, y], background, alpha)
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


def logo_border_candidate(pixel: tuple[int, int, int, int], background: tuple[int, int, int]) -> bool:
    brightness, spread, _ = background_metrics(pixel, background)
    return brightness < 170 or spread > 90


def estimate_circle_radius(image: Image.Image, background: tuple[int, int, int]) -> float:
    pixels = image.load()
    center_x = image.width // 2
    center_y = image.height // 2
    radii: list[int] = []

    for offset in range(-8, 9, 2):
        x = max(0, min(image.width - 1, center_x + offset))
        for y in range(image.height):
            if logo_border_candidate(pixels[x, y], background):
                radii.append(center_y - y)
                break

    for offset in range(-8, 9, 2):
        y = max(0, min(image.height - 1, center_y + offset))
        for x in range(image.width):
            if logo_border_candidate(pixels[x, y], background):
                radii.append(center_x - x)
                break

    if not radii:
        return min(image.width, image.height) / 2
    return float(median(radii))


def clip_to_circle(image: Image.Image, radius: float, feather: float = 1.5) -> Image.Image:
    clipped = image.copy()
    pixels = clipped.load()
    center_x = (image.width - 1) / 2
    center_y = (image.height - 1) / 2

    for y in range(image.height):
        for x in range(image.width):
            distance = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
            if distance >= radius + feather:
                pixels[x, y] = (0, 0, 0, 0)
                continue
            if distance <= radius - feather:
                continue
            r, g, b, a = pixels[x, y]
            alpha_scale = max(0.0, min(1.0, (radius + feather - distance) / (feather * 2)))
            pixels[x, y] = (r, g, b, round(a * alpha_scale))

    return clipped


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
    source_background = background_color(source)
    transparent_raw = transparent_logo(source)
    transparent_raw = clip_to_circle(transparent_raw, estimate_circle_radius(source, source_background))
    transparent = cropped_square(transparent_raw)
    with_background = cropped_square_with_background(transparent_raw, transparent_raw)

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
    resized(transparent, 48).save(ROOT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

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
