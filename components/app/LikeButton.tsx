"use client";

import { useEffect, useRef, useState } from "react";

// How long to wait after the last click before actually telling the caller
// to persist it — rapid double/triple clicks (like → unlike → like) would
// otherwise fire one network request per click with no ordering guarantee,
// so whichever response lands last "wins" server-side regardless of which
// click the user meant to be final. Collapsing them into a single trailing
// call removes the race entirely; the button itself still flips instantly
// on every click, so it never feels laggy.
const TOGGLE_DEBOUNCE_MS = 400;

export default function LikeButton({
  initialCount,
  initialLiked = false,
  variant = "pill",
  readOnly = false,
  hideCount = false,
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
  // redundant counter.
  hideCount?: boolean;
  // The unliked-state color is tuned for the app's dark background by
  // default (a light, low-opacity gray) — barely readable on a light
  // surface like the note cards, so "light" swaps it for a near-black
  // instead. Liked stays the same red either way.
  theme?: "dark" | "light";
  // The classic red everywhere by default — pages with their own dynamic
  // palette (the album editorial's cover-derived tint) can override it so a
  // like reads as "this page's color" instead of a fixed brand red.
  likedColor?: string;
  // Fired after the local optimistic toggle, with the new liked state — the
  // caller is responsible for persisting it (and rolling the UI back on
  // failure), this component only owns the optimistic display state.
  onToggle?: (nextLiked: boolean) => void;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const isLiked = readOnly ? initialLiked : liked;
  const count = readOnly
    ? initialCount
    : initialCount + (liked ? 1 : 0) - (initialLiked ? 1 : 0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds the not-yet-fired call, if any — flushed on unmount instead of
  // just cancelled. Without this, navigating away (or a note card leaving
  // the DOM on a page/re-fetch) within the debounce window silently drops
  // the toggle: the backend never hears about it, but nothing ever errors,
  // so it just looks like "unlike doesn't work" with no trace of why.
  const pendingRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      pendingRef.current?.();
    };
  }, []);

  function toggle() {
    const next = !liked;
    setLiked(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pendingRef.current = () => onToggle?.(next);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      pendingRef.current = null;
      onToggle?.(next);
    }, TOGGLE_DEBOUNCE_MS);
  }
  const color = isLiked
    ? likedColor
    : theme === "light"
      ? "#1c1b18"
      : variant === "pill"
        ? "rgba(233,230,223,.7)"
        : "rgba(233,230,223,.6)";

  const heart = (
    <svg
      width={variant === "pill" ? 17 : 15}
      height={variant === "pill" ? 17 : 15}
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
        style={{ color }}
      >
        {heart}
        {count}
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 text-[13px] font-bold"
        style={{ color }}
      >
        {heart}
        {count}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-2 rounded-full px-6 py-[15px] text-[14px] font-bold"
      style={{
        color,
        background: liked
          ? `color-mix(in srgb, ${likedColor} 16%, transparent)`
          : "rgba(233,230,223,.1)",
      }}
    >
      {heart}
      {liked ? "Liked" : "Like"}
      {hideCount ? "" : ` · ${count}`}
    </button>
  );
}
