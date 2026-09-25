"use client";

import { useEffect, useState } from "react";

const NOTES = ["♩", "♪", "♫", "♬"];

const DEFAULT_MESSAGES = [
  "Cueing the record…",
  "Dusting off the crates…",
  "Counting off…",
  "Checking the liner notes…",
  "Tuning up…",
  "Threading the tape…",
];

export default function LoadingNotes({
  messages = DEFAULT_MESSAGES,
  compact = false,
  className = "",
}: {
  messages?: string[];
  compact?: boolean;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  // Rotates like an agent's background-task status line — a sense that
  // something is actually happening, not just a frozen spinner.
  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-4 " +
        (compact ? "py-8" : "py-20") +
        " " +
        className
      }
    >
      <div
        className={
          "relative flex items-end gap-3.5 " + (compact ? "h-9" : "h-14")
        }
      >
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col gap-[4px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-px w-full bg-[rgba(232,220,192,.15)]" />
          ))}
        </div>
        {NOTES.map((note, i) => (
          <span
            key={i}
            className={
              "relative animate-[jazzlogs-note-bounce_1.1s_ease-in-out_infinite] text-[#F6D013] " +
              (compact ? "text-[18px]" : "text-[28px]")
            }
            style={{ animationDelay: `${i * 0.14}s` }}
          >
            {note}
          </span>
        ))}
      </div>
      <div
        key={index}
        className="animate-[jazzlogs-fade-up_.3s_ease-out] font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(232,220,192,.5)]"
      >
        {messages[index]}
      </div>
    </div>
  );
}
