"use client";

import { useState } from "react";

export function AverageStars({
  value,
  size = 16,
}: {
  value: number;
  size?: number;
}) {
  return (
    <span className="relative inline-block leading-none">
      <span
        style={{ fontSize: size, letterSpacing: size * 0.18, color: "rgba(233,230,223,.22)" }}
      >
        ★★★★★
      </span>
      <span
        className="absolute top-0 left-0 overflow-hidden whitespace-nowrap"
        style={{
          width: `${(value / 5) * 100}%`,
          fontSize: size,
          letterSpacing: size * 0.18,
          color: "#d99b10",
        }}
      >
        ★★★★★
      </span>
    </span>
  );
}

export function InteractiveStars({
  initial = 0,
  size = 19,
}: {
  initial?: number;
  size?: number;
}) {
  const [rating, setRating] = useState(initial);
  return (
    <div className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setRating((r) => (r === n ? 0 : n))}
          style={{ fontSize: size, color: n <= rating ? "#d99b10" : "rgba(233,230,223,.28)" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
