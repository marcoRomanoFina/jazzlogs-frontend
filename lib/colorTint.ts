// Shared cover-art color extraction + mixing helpers — originally built for
// the archive page's ambient section tints, reused by any page that wants
// to nudge its own palette toward a specific cover's dominant color.

// Downsampled canvas average — good enough for an ambient tint, not trying
// to find a "dominant" color. Resolves null on any failure (load error, or
// a CORS-tainted canvas if the CDN doesn't send permissive headers) so the
// caller can just skip the effect rather than crash. Routed through our own
// /api/image-proxy first — Spotify's CDN doesn't send permissive CORS
// headers, so reading pixels straight off it taints the canvas every time.
export function extractAverageColor(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        const pixelCount = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        resolve(
          `rgb(${Math.round(r / pixelCount)}, ${Math.round(g / pixelCount)}, ${Math.round(b / pixelCount)})`,
        );
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `/api/image-proxy?url=${encodeURIComponent(src)}`;
  });
}

// "#a86b32" -> "rgb(168, 107, 50)" — the shape brighten/mixWithBase actually
// parse (they pull channels via a plain \d+ match, which a hex string like
// "#a86b32" doesn't survive: "a8" and "6b" aren't all-digit, so it'd only
// ever find 2 of the 3 channels). Returns null on anything that isn't
// exactly #rrggbb — the backend already validates the format on the way in,
// this is just not trusting that blindly on the way back out.
export function hexToRgb(hex: string): string | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return null;
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

// A raw photo-average is often too dark/muddy to read as large text (or, on
// the album page, as an accent color) on a dark background — push it toward
// white by `amount` to get a lighter tint of the same hue instead, still
// one that visibly ties to the cover.
export function brighten(rgb: string, amount: number): string {
  const channels = rgb.match(/\d+/g);
  if (!channels) return rgb;
  const [r, g, b] = channels.map(Number);
  const lighten = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
}

// `base` nudged toward `rgb` by `ratio` — a light wash, not a repaint, so
// whatever's painted this color still reads as "itself" (a card, a whole
// page background) rather than switching wholesale to the cover's color.
export function mixWithBase(
  rgb: string,
  base: [number, number, number],
  ratio: number,
): string {
  const channels = rgb.match(/\d+/g);
  if (!channels) return `rgb(${base[0]}, ${base[1]}, ${base[2]})`;
  const [r, g, b] = channels.map(Number);
  const mix = (c: number, baseC: number) =>
    Math.round(baseC + (c - baseC) * ratio);
  return `rgb(${mix(r, base[0])}, ${mix(g, base[1])}, ${mix(b, base[2])})`;
}
