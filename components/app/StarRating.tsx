"use client";

import { useState } from "react";

// Clipping the *whole* 5-character "★★★★★" string by a % of its total width
// (the old approach) doesn't land at the visual middle of one star — letter-
// spacing between glyphs throws the cut point off, so a "half star" visibly
// lands somewhere other than half of a star. Clipping each star in its own
// fixed-width box, one at a time, keeps the cut exactly where it says it is
// regardless of spacing between stars.
function starFill(value: number, index: number): number {
  return Math.max(0, Math.min(1, value - (index - 1)));
}

function StarRow({
  value,
  size,
  fillColor = "#F6D013",
  emptyColor = "rgba(232,220,192,.22)",
}: {
  value: number;
  size: number;
  fillColor?: string;
  emptyColor?: string;
}) {
  return (
    <span
      className="inline-flex"
      style={{ gap: Math.round(size * 0.12) }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="relative inline-block"
          style={{ width: size, height: size, fontSize: size, lineHeight: 1 }}
        >
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ color: emptyColor }}
          >
            ★
          </span>
          <span
            aria-hidden
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${starFill(value, i) * 100}%`, color: fillColor }}
          >
            ★
          </span>
        </span>
      ))}
    </span>
  );
}

export function AverageStars({
  value,
  size = 16,
  fillColor,
  emptyColor,
}: {
  value: number;
  size?: number;
  fillColor?: string;
  emptyColor?: string;
}) {
  return (
    <StarRow value={value} size={size} fillColor={fillColor} emptyColor={emptyColor} />
  );
}

export function InteractiveStars({
  initial = 0,
  size = 19,
  disabled = false,
  title,
  fillColor,
  emptyColor,
  onRate,
}: {
  initial?: number;
  size?: number;
  disabled?: boolean;
  title?: string;
  fillColor?: string;
  emptyColor?: string;
  // Called with the chosen rating (1-5, half steps) — there's no "clear a
  // rating" endpoint, so clicking a star always sets it, never toggles it off.
  onRate?: (rating: number) => void;
}) {
  const [rating, setRating] = useState(initial);
  // Live preview while the pointer is over a half — falls back to the
  // committed rating once it leaves, same as any star-picker.
  const [hover, setHover] = useState<number | null>(null);
  const displayRating = hover ?? rating;
  const gap = Math.round(size * 0.12);

  function pick(n: number) {
    if (disabled) return;
    setRating(n);
    onRate?.(n);
  }

  return (
    <div
      className="relative inline-block leading-none"
      title={title}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <StarRow value={displayRating} size={size} fillColor={fillColor} emptyColor={emptyColor} />
      {/* Two click targets per star (left half / right half), positioned
          over the row above at the exact same widths/gap — clicking the
          left half of star N picks N-0.5, the right half picks N whole. */}
      <div
        className="absolute inset-0 flex"
        style={{ gap }}
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex" style={{ width: size }}>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Rate ${n - 0.5} out of 5`}
              className="h-full flex-1"
              style={{ cursor: disabled ? "default" : "pointer" }}
              onClick={() => pick(n - 0.5)}
              onMouseEnter={() => setHover(n - 0.5)}
            />
            <button
              type="button"
              disabled={disabled}
              aria-label={`Rate ${n} out of 5`}
              className="h-full flex-1"
              style={{ cursor: disabled ? "default" : "pointer" }}
              onClick={() => pick(n)}
              onMouseEnter={() => setHover(n)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
