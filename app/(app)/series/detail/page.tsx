"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";

const CHAPTERS = [
  { title: "The room at Van Gelder's", meta: "Intro · 6 min", note: "Before the music: why one New Jersey living room became the sound of an era." },
  { title: "Moanin' opens the year", meta: "Art Blakey · Moanin' · 9:35", note: "Hard bop announces itself — gospel in the piano, fire in the drums." },
  { title: "Somethin' cooler", meta: "Cannonball Adderley · 8:12", note: "The same band, half the heat. How Blue Note learned to whisper without losing the swing." },
  { title: "The ballad turn", meta: "Blue-note ballads · 7:04", note: "Midway through the year the label slows down. A chapter about space." },
  { title: "Sidewinders & grooves", meta: "Soul-jazz preview · 8:40", note: "The seeds of the boogaloo that would take over the next decade." },
  { title: "Closing the year", meta: "Finale · 9:20", note: "What 1959 changed, and where to go next once the session ends." },
];

export default function SeriesDetailPage() {
  const [done, setDone] = useState(2);
  const total = CHAPTERS.length;
  const pct = Math.round((done / total) * 100);

  return (
    <>
      <Navbar />

      <div className="flex justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <Link href="/series" className="no-underline">
          ← All sessions
        </Link>
        <span>JAZZLOGS SERIES</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-9 pt-11 md:grid-cols-[1fr_360px]">
        <div>
          <div className="text-[48px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[64px]">
            Blue Note, 1959
          </div>
          <div className="mt-4 max-w-[500px] text-[20px] leading-[1.32] font-semibold tracking-[-.02em]">
            The year the label found its sound — followed record by record, the way it happened.
          </div>
          <p className="mt-4 max-w-[520px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.78)]">
            Six chapters, each built around one 1959 session, with a written note before every
            record.
          </p>
          <div className="mt-5 flex gap-6 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.12em] text-[rgba(233,230,223,.62)]">
            <span>6 chapters</span>
            <span>· 58 min</span>
            <span>· Hard bop / Cool</span>
          </div>

          <div className="mt-6 max-w-[440px]">
            <div className="flex justify-between font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.6)]">
              <span>{done} of {total} chapters</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(233,230,223,.18)]">
              <div className="h-1.5 bg-[#1c1b18]" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setDone((d) => Math.min(total, d + 1))}
              className="rounded-full bg-[#d99b10] px-6.5 py-3.5 text-[14px] font-bold text-[#1c1b18]"
            >
              ▸ {done === 0 ? "Start session" : done >= total ? "Replay session" : `Resume chapter ${String(done + 1).padStart(2, "0")}`}
            </button>
            <button
              type="button"
              onClick={() => setDone(0)}
              className="rounded-full border-[1.5px] border-[#d99b10] px-5.5 py-3 text-[14px] font-bold"
            >
              Restart
            </button>
            <LikeButton initialCount={1842} />
          </div>
        </div>
        <div className="aspect-square w-full overflow-hidden rounded-[18px] md:w-[360px]">
          <ImagePlaceholder label="Session cover" />
        </div>
      </div>

      <div className="mt-14 border-b-[1.5px] border-[#d99b10] pb-3">
        <span className="text-[16px] font-extrabold tracking-[-.01em]">Chapters</span>
      </div>

      {CHAPTERS.map((c, i) => {
        const isDone = i < done;
        const isCurrent = i === done;
        const revealed = isDone || isCurrent;
        return (
          <div
            key={c.title}
            className="flex gap-6 border-b border-[rgba(233,230,223,.2)] py-6.5"
            style={{ background: isCurrent ? "rgba(233,230,223,.05)" : "transparent" }}
          >
            <div className="flex w-[52px] flex-none flex-col items-center gap-2">
              <span
                className="font-[family-name:var(--font-dm-mono)] text-[12px]"
                style={{ color: revealed ? "rgba(233,230,223,.6)" : "rgba(233,230,223,.35)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] font-semibold"
                style={{
                  background: isDone ? "#2a2621" : isCurrent ? "#d99b10" : "transparent",
                  color: isDone ? "#d99b10" : isCurrent ? "#1c1b18" : "transparent",
                  border: isDone ? "1.5px solid #2a2621" : isCurrent ? "1.5px solid #d99b10" : "1.5px solid rgba(233,230,223,.3)",
                }}
              >
                {isDone ? "✓" : isCurrent ? "▸" : ""}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              {revealed ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.55)]">
                      Chapter {String(i + 1).padStart(2, "0")}
                    </span>
                    {(isDone || isCurrent) && (
                      <span
                        className="rounded-[5px] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[9.5px] font-bold uppercase tracking-[.12em]"
                        style={{
                          background: isDone ? "transparent" : "#2a2621",
                          color: isDone ? "rgba(233,230,223,.55)" : "#d99b10",
                          border: isDone ? "1.5px solid rgba(233,230,223,.35)" : "none",
                        }}
                      >
                        {isDone ? "Played" : "Up next"}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-[26px] font-extrabold leading-[1.02] tracking-[-.03em]">
                    {c.title}
                  </div>
                  <div className="mt-2.5 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.7)]">
                    {c.meta}
                  </div>
                  <p className="mt-3 max-w-[640px] text-[15px] leading-[1.62] text-[rgba(233,230,223,.82)]">
                    {c.note}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDone((d) => Math.max(d, i + 1))}
                    className="mt-3.5 inline-block rounded-full text-[13px] font-bold"
                    style={{
                      background: isCurrent ? "#d99b10" : "transparent",
                      color: isCurrent ? "#1c1b18" : "#e9e6df",
                      border: isCurrent ? "none" : "1.5px solid #d99b10",
                      padding: isCurrent ? "13px 22px" : "12px 20px",
                    }}
                  >
                    {isDone ? "▸ Play again" : "▸ Play this chapter"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.45)]">
                      Chapter {String(i + 1).padStart(2, "0")} · Not yet explored
                    </div>
                    <div className="mt-2 text-[13.5px] text-[rgba(233,230,223,.5)]">
                      Finish the chapter before to unlock this one.
                    </div>
                  </div>
                  <span className="text-[20px] text-[rgba(233,230,223,.4)]">🔒</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Footer />
    </>
  );
}
