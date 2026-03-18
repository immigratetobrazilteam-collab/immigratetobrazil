from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
LOGO_DIR = ROOT / "assets" / "logo"
FAVICON_DIR = ROOT / "assets" / "favicons"

GREEN = "#006400"
GOLD = "#D4AF37"
BEIGE = "#C9A96E"
WHITE = "#F8F6F1"
CHARCOAL = "#1B1D18"


def draw_logo(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    margin = size * 0.08
    draw.rounded_rectangle(
        (margin, margin, size - margin, size - margin),
        radius=int(size * 0.18),
        fill=CHARCOAL,
        outline=GOLD,
        width=max(2, size // 64),
    )
    brazil = [
        (0.34, 0.16),
        (0.57, 0.14),
        (0.71, 0.26),
        (0.84, 0.29),
        (0.81, 0.43),
        (0.89, 0.55),
        (0.73, 0.69),
        (0.72, 0.82),
        (0.58, 0.88),
        (0.44, 0.77),
        (0.34, 0.81),
        (0.18, 0.66),
        (0.24, 0.49),
        (0.15, 0.32),
        (0.25, 0.23),
    ]
    draw.polygon([(x * size, y * size) for x, y in brazil], fill=GREEN)
    draw.line(
        [(0.24 * size, 0.62 * size), (0.73 * size, 0.34 * size)],
        fill=GOLD,
        width=max(3, size // 32),
    )
    draw.ellipse(
        (0.51 * size, 0.31 * size, 0.61 * size, 0.41 * size),
        fill=WHITE,
        outline=GOLD,
        width=max(1, size // 128),
    )
    return image


def write_svg(path: Path) -> None:
    path.write_text(
        f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Immigrate to Brazil logo">
  <rect x="24" y="24" width="464" height="464" rx="92" fill="{CHARCOAL}" stroke="{GOLD}" stroke-width="12"/>
  <path fill="{GREEN}" d="M177 81l116-8 72 60 66 18-13 72 44 61-77 70-6 69-71 31-70-54-51 17-78-73 27-82-41-66 42-42 40-13z"/>
  <path d="M126 320c82-42 162-85 250-147" stroke="{GOLD}" stroke-width="20" stroke-linecap="round"/>
  <circle cx="285" cy="182" r="23" fill="{WHITE}" stroke="{GOLD}" stroke-width="8"/>
</svg>""",
        encoding="utf-8",
    )


def main() -> None:
    LOGO_DIR.mkdir(parents=True, exist_ok=True)
    FAVICON_DIR.mkdir(parents=True, exist_ok=True)

    svg_path = LOGO_DIR / "immigrate-to-brazil-logo.svg"
    write_svg(svg_path)

    for size in [16, 32, 180, 192, 512]:
      image = draw_logo(size)
      if size in {16, 32}:
          image.save(FAVICON_DIR / f"favicon-{size}x{size}.png")
      elif size == 180:
          image.save(FAVICON_DIR / "apple-touch-icon.png")
      elif size == 192:
          image.save(FAVICON_DIR / "android-chrome-192x192.png")
      elif size == 512:
          image.save(FAVICON_DIR / "android-chrome-512x512.png")

    draw_logo(96).save(FAVICON_DIR / "favicon.png")
    draw_logo(512).save(LOGO_DIR / "immigrate-to-brazil-logo.png")

    (FAVICON_DIR / "site.webmanifest").write_text(
        """{
  "name": "Immigrate to Brazil",
  "short_name": "ITB",
  "icons": [
    {"src": "/assets/favicons/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/assets/favicons/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png"}
  ],
  "theme_color": "#006400",
  "background_color": "#1B1D18",
  "display": "standalone"
}""",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
