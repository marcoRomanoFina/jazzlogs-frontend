"use client";

import { useState } from "react";

export default function LikeButton({
  initialCount,
  initialLiked = false,
  variant = "pill",
  readOnly = false,
}: {
  initialCount: number;
  initialLiked?: boolean;
  variant?: "pill" | "inline";
  readOnly?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const isLiked = readOnly ? initialLiked : liked;
  const count = readOnly
    ? initialCount
    : initialCount + (liked ? 1 : 0) - (initialLiked ? 1 : 0);
  const color = isLiked
    ? "#e0392b"
    : variant === "pill"
      ? "rgba(233,230,223,.7)"
      : "rgba(233,230,223,.6)";

  const heart = (
    <svg
      width={variant === "pill" ? 17 : 15}
      height={variant === "pill" ? 17 : 15}
      viewBox="0 0 24 24"
      fill={isLiked ? "#e0392b" : "none"}
      stroke={isLiked ? "#e0392b" : "currentColor"}
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
        onClick={() => setLiked((v) => !v)}
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
      onClick={() => setLiked((v) => !v)}
      className="flex items-center gap-2 rounded-full px-6 py-[15px] text-[14px] font-bold"
      style={{
        color,
        background: liked ? "rgba(224,57,43,.16)" : "rgba(233,230,223,.1)",
      }}
    >
      {heart}
      {liked ? "Liked" : "Like"} · {count}
    </button>
  );
}
