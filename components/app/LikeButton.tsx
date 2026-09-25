"use client";

import { useState } from "react";

export default function LikeButton({
  initialCount,
  initialLiked = false,
  variant = "pill",
  readOnly = false,
  hideCount = false,
  label = "Like",
  size,
  pillSizeClassName = "px-6 py-[15px] text-[14px]",
  theme = "dark",
  likedColor = "#e0392b",
  onToggle,
}: {
  initialCount: number;
  initialLiked?: boolean;
  variant?: "pill" | "inline";
  readOnly?: boolean;
  // For pages that already show the count elsewhere (e.g. next to the
  // rating block) — keeps this button just a plain toggle, not a second,
  // redundant counter. Applies to every variant, including inline/readOnly.
  hideCount?: boolean;
  // The pill variant's unliked-state text — "Liked" once toggled either
  // way, same as always. Only the pill reads this; inline/readOnly never
  // show a label, just the heart (+ count).
  label?: string;
  // The heart icon's pixel size — defaults to 17 (pill) / 15 (inline and
  // readOnly) when omitted, same as always. On inline/readOnly it also
  // sets the count's font-size to match, so the heart and the number read
  // as the same size; the pill variant's text stays fixed (its size isn't
  // meant to track the heart the same way).
  size?: number;
  // Pill variant only — its padding/font-size classes, swappable wholesale
  // so a page with its own larger button row (e.g. the track page's
  // Listened/Listen later pair) can match scale without fighting Tailwind's
  // class-order-dependent specificity via a partial override.
  pillSizeClassName?: string;
  // The unliked-state color is tuned for the app's dark background by
  // default (a light, low-opacity gray) — barely readable on a light
  // surface like the note cards, so "light" swaps it for a near-black
  // instead. Liked stays the same red either way.
  theme?: "dark" | "light";
  // The classic red everywhere by default — pages with their own dynamic
  // palette (the album editorial's cover-derived tint) can override it so a
  // like reads as "this page's color" instead of a fixed brand red.
  likedColor?: string;
  // Fired immediately after the local optimistic toggle, on every click,
  // with the new liked state — the caller is responsible for persisting it.
  // Rapid repeat clicks would otherwise fire one network request per click
  // with no ordering guarantee, so callers debounce the actual persist call
  // themselves (see lib/debounce.ts's debounceByKey, used the same way for
  // saves) while still updating their mirrored count/liked state on every
  // call so nothing elsewhere on the page lags behind this button's own
  // instant flip.
  onToggle?: (nextLiked: boolean) => void;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const isLiked = readOnly ? initialLiked : liked;
  const count = readOnly
    ? initialCount
    : initialCount + (liked ? 1 : 0) - (initialLiked ? 1 : 0);

  function toggle() {
    const next = !liked;
    setLiked(next);
    onToggle?.(next);
  }
  const color = isLiked
    ? likedColor
    : theme === "light"
      ? "#1C1A14"
      : variant === "pill"
        ? "rgba(232,220,192,.7)"
        : "rgba(232,220,192,.6)";

  const heartSize = size ?? (variant === "pill" ? 17 : 15);
  const heart = (
    <svg
      width={heartSize}
      height={heartSize}
      viewBox="0 0 24 24"
      fill={isLiked ? likedColor : "none"}
      stroke={isLiked ? likedColor : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  // Read-only: just reflects like state/count, no click-to-toggle, and never
  // styled as a pill/button (even in "pill" contexts) — used on pages (e.g.
  // the archive) that show likes but don't let you give one.
  if (readOnly) {
    return (
      <span
        className="flex items-center gap-1.5 text-[14px] font-bold"
        style={{ color, fontSize: size }}
      >
        {heart}
        {!hideCount && count}
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 text-[13px] font-bold"
        style={{ color, fontSize: size }}
      >
        {heart}
        {!hideCount && count}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-2 rounded-full font-bold ${pillSizeClassName}`}
      style={{
        color,
        background: liked
          ? `color-mix(in srgb, ${likedColor} 16%, transparent)`
          : "rgba(232,220,192,.1)",
      }}
    >
      {heart}
      {liked ? "Liked" : label}
      {hideCount ? "" : ` · ${count}`}
    </button>
  );
}
