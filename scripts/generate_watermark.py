"""Generate a subtle, transparent GCH watermark tile for website backgrounds."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "images" / "logo.jpg"
OUTPUT_PATH = ROOT / "images" / "gch-watermark-bg.png"

# High-resolution tile (4x the CSS display size for crisp retina backgrounds)
TILE_W = 2048
TILE_H = 1365

# Layout — wide, airy staggered grid
COL_SPACING = 720
ROW_SPACING = 520
LOGO_WIDTH = 240
OPACITY = 0.12  # 12% — visible on tinted sections, still subtle


def remove_white_background(img: Image.Image, threshold: int = 238) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (255, 255, 255, 0)

    return img


def apply_soft_blue_grey_tone(img: Image.Image, opacity: float) -> Image.Image:
    """Flatten logo colours into a soft, faded blue-grey watermark tone."""
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue

            luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
            tone = luminance / 255.0

            # Soft industrial blue-grey palette
            nr = int(140 + tone * 45)
            ng = int(155 + tone * 50)
            nb = int(175 + tone * 55)
            na = int(a * opacity)

            pixels[x, y] = (nr, ng, nb, na)

    return img


def trim_transparent_border(img: Image.Image, padding: int = 8) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img

    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    return img.crop((left, top, right, bottom))


def scale_logo(img: Image.Image, target_width: int) -> Image.Image:
    ratio = target_width / img.width
    target_height = max(1, int(img.height * ratio))
    return img.resize((target_width, target_height), Image.Resampling.LANCZOS)


def build_positions() -> list[tuple[int, int]]:
    """Staggered brick layout with generous spacing."""
    positions: list[tuple[int, int]] = []
    half_col = COL_SPACING // 2
    rows = (TILE_H // ROW_SPACING) + 2
    cols = (TILE_W // COL_SPACING) + 2

    for row in range(rows):
        y = ROW_SPACING // 2 + row * ROW_SPACING
        x_offset = half_col if row % 2 else 0

        for col in range(cols):
            x = x_offset + COL_SPACING // 2 + col * COL_SPACING
            positions.append((x, y))

    return positions


def paste_seamless(canvas: Image.Image, logo: Image.Image, positions: list[tuple[int, int]]) -> None:
    tile_w, tile_h = canvas.size

    for x, y in positions:
        px = x - logo.width // 2
        py = y - logo.height // 2

        for dx in (-tile_w, 0, tile_w):
            for dy in (-tile_h, 0, tile_h):
                canvas.paste(logo, (px + dx, py + dy), logo)


def main() -> None:
    logo = Image.open(LOGO_PATH)
    logo = remove_white_background(logo)
    logo = trim_transparent_border(logo)
    logo = scale_logo(logo, LOGO_WIDTH)
    logo = apply_soft_blue_grey_tone(logo, OPACITY)

    canvas = Image.new("RGBA", (TILE_W, TILE_H), (0, 0, 0, 0))
    paste_seamless(canvas, logo, build_positions())
    canvas.save(OUTPUT_PATH, "PNG", optimize=True)

    print(f"Saved watermark tile: {OUTPUT_PATH}")
    print(f"Dimensions: {TILE_W}x{TILE_H}px | Logo width: {LOGO_WIDTH}px | Opacity: {OPACITY * 100:.1f}%")


if __name__ == "__main__":
    main()
