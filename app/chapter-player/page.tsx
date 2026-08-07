"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { archivo, dmMono } from "@/lib/fonts";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function ChapterPlayerPage() {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(96);
  const dur = 331;
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(75);

  useEffect(() => {
    const id = setInterval(() => {
      if (playing) setT((v) => Math.min(dur, v + speed));
    }, 1000);
    return () => clearInterval(id);
  }, [playing, speed]);

  const speeds = [1, 1.25, 1.5, 0.75];
  const pct = (t / dur) * 100;

  return (
    <div
      className={`${archivo.variable} ${dmMono.variable} flex min-h-screen flex-col bg-[#1c1b18] font-[family-name:var(--font-archivo)] text-[#e9e6df]`}
    >
      <div className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-6 sm:px-14">
        <div className="flex items-center justify-between border-b border-[#d99b10] py-6">
          <Link href="/series/detail" className="text-[13px] font-semibold no-underline">
            ← Blue Note, 1959
          </Link>
          <Link href="/home" className="text-[18px] font-extrabold tracking-[-.03em] text-[#d99b10] no-underline">
            jazzlogs.
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center py-12">
          <div className="text-center">
            <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.24em] text-[rgba(233,230,223,.6)]">
              Chapter 02 · Narration
            </div>
            <div className="mt-6 text-[48px] leading-[.92] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[68px]">
              Moanin&rsquo; opens the year
            </div>
          </div>

          <div className="mt-13 grid grid-cols-1 items-center gap-9 md:grid-cols-[300px_1fr]">
            <div className="flex flex-col items-center gap-4">
              <div className="aspect-square w-full max-w-[300px] overflow-hidden rounded-2xl">
                <ImagePlaceholder label="Track cover" />
              </div>
              <a
                href="#"
                className="flex items-center gap-2.5 rounded-full bg-black px-6 py-3.5 text-[14px] font-bold text-[#e9e6df] no-underline"
              >
                Listen on Spotify
              </a>
            </div>
            <div>
              <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.24em] text-[rgba(233,230,223,.6)]">
                Now the track
              </div>
              <div className="mt-4 text-[42px] leading-[.92] font-extrabold tracking-[-.045em] sm:text-[56px]">
                Moanin&rsquo;
              </div>
              <div className="mt-4 flex items-center gap-3.5">
                <span className="text-[15px] font-semibold">Art Blakey — Moanin&rsquo;</span>
                <span className="h-1 w-1 rounded-full bg-[rgba(233,230,223,.5)]" />
                <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.6)]">
                  Blue Note · 1959
                </span>
              </div>
              <div className="mt-4 max-w-[500px] text-[18px] leading-[1.5] font-medium tracking-[-.01em] text-[rgba(233,230,223,.82)]">
                Hard bop announces itself — gospel in the piano, fire in the drums, and the
                template the rest of 1959 answers to.
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href="#"
                  className="rounded-full bg-[#d99b10] px-6 py-3.5 text-[14px] font-bold text-[#1c1b18] no-underline"
                >
                  ← Previous chapter
                </Link>
                <Link
                  href="#"
                  className="rounded-full bg-[#d99b10] px-6 py-3.5 text-[14px] font-bold text-[#1c1b18] no-underline"
                >
                  Next chapter →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player bar */}
      <div className="bg-[#2a2621] text-[#e9e6df]">
        <div className="mx-auto max-w-[1000px] px-6 py-5 sm:px-14">
          <div className="flex items-center gap-4">
            <span className="w-[42px] font-[family-name:var(--font-dm-mono)] text-[11px] text-[rgba(233,230,223,.6)]">
              {fmt(t)}
            </span>
            <div
              className="relative flex h-3.5 flex-1 cursor-pointer items-center"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
                setT(Math.round(frac * dur));
              }}
            >
              <div className="absolute left-0 right-0 h-[3px] bg-[rgba(233,230,223,.22)]" />
              <div className="absolute left-0 h-[3px] bg-[#d99b10]" style={{ width: `${pct}%` }} />
              <div
                className="absolute h-3 w-3 -translate-x-1/2 rounded-full bg-[#d99b10]"
                style={{ left: `${pct}%` }}
              />
            </div>
            <span className="w-[42px] text-right font-[family-name:var(--font-dm-mono)] text-[11px] text-[rgba(233,230,223,.6)]">
              {fmt(dur)}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-3 items-center gap-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-[15px] items-end gap-[2.5px]">
                {[0, 0.15, 0.3, 0.45].map((delay) => (
                  <span
                    key={delay}
                    className="inline-block w-[3px] bg-[#d99b10]"
                    style={{
                      height: "100%",
                      transformOrigin: "bottom",
                      animation: playing ? `eq .9s ease-in-out ${delay}s infinite` : "none",
                      transform: playing ? "none" : "scaleY(.35)",
                      opacity: playing ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
              <span className="hidden font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.6)] sm:inline">
                JazzLogs narration
              </span>
            </div>

            <div className="flex items-center justify-center gap-5.5">
              <button type="button" onClick={() => setT(0)} className="text-[rgba(233,230,223,.75)]">
                ↺
              </button>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#d99b10] text-[16px] font-semibold text-[#1c1b18]"
              >
                {playing ? "❚❚" : "▸"}
              </button>
              <button type="button" onClick={() => setT(dur)} className="text-[rgba(233,230,223,.75)]">
                ↻
              </button>
            </div>

            <div className="flex items-center justify-end gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="hidden w-[84px] accent-[#d99b10] sm:block"
              />
              <button
                type="button"
                onClick={() => setSpeed((s) => speeds[(speeds.indexOf(s) + 1) % speeds.length])}
                className="rounded-full border-[1.5px] border-[rgba(233,230,223,.35)] px-3.5 py-2 font-[family-name:var(--font-dm-mono)] text-[12px] font-bold"
              >
                {speed}×
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
    </div>
  );
}
