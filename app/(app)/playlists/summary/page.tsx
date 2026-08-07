"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import { AverageStars } from "@/components/app/StarRating";

const TRACKS = [
  { title: "Naima", meta: "John Coltrane · Giant Steps · 1960", dur: "4:21", avg: 4.7, note: "Where the whole list started. All restraint and ache, built on two held chords that never quite resolve." },
  { title: "Blue in Green", meta: "Miles Davis · Kind of Blue · 1959", dur: "5:37", avg: 4.8, note: "Evans and Davis trading whispers. Kept it second so the mood settles before it deepens." },
  { title: "My Funny Valentine", meta: "Chet Baker · Chet Baker Sings · 1954", dur: "2:22", avg: 4.5, note: "The frailest voice in jazz. Short on purpose — a breath between the longer ones." },
  { title: "Peace Piece", meta: "Bill Evans · Everybody Digs Bill Evans · 1958", dur: "6:41", avg: 4.6, note: "The centre of the list. One repeating figure turned over and over — improvisation as meditation." },
];

export default function PlaylistSummaryPage() {
  const [isPublic, setIsPublic] = useState(false);

  return (
    <>
      <Navbar active="Playlists" />

      <div className="flex justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <Link href="/logs" className="no-underline">
          ← Your logs
        </Link>
        <span>Your playlist · Updated Jul 8, 2026</span>
      </div>

      <div className="relative mt-11 flex flex-col items-center text-center">
        <span
          className="rounded-full px-3.5 py-1.5 font-[family-name:var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[.1em]"
          style={{ background: isPublic ? "#d99b10" : "rgba(28,27,24,.75)", color: isPublic ? "#1c1b18" : "#e9e6df" }}
        >
          {isPublic ? "Public" : "Private"}
        </span>
        <div className="mt-5 text-[52px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[76px]">
          Rainy-day ballads
        </div>
        <div className="mt-5 flex gap-5 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.12em] text-[rgba(233,230,223,.62)]">
          <span>{TRACKS.length} tracks</span>
          <span>· Created Mar 4, 2026</span>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic((v) => !v)}
          className="mt-5 rounded-full px-5.5 py-3 text-[13px] font-bold"
          style={{
            background: isPublic ? "#d99b10" : "rgba(233,230,223,.1)",
            color: isPublic ? "#1c1b18" : "rgba(233,230,223,.8)",
          }}
        >
          {isPublic ? "Make private" : "Make public"}
        </button>
      </div>

      <p className="mx-auto mt-11 max-w-[720px] text-[20px] leading-[1.65] text-[rgba(233,230,223,.85)]">
        Started this the first wet week of March and kept adding to it. Eight ballads sequenced
        to fall like weather — from Coltrane&rsquo;s ache through Evans&rsquo; hush to
        Rollins&rsquo; late-afternoon calm.
      </p>

      <div className="mt-14 border-t-2 border-[#d99b10]" />

      {TRACKS.map((t, i) => (
        <div key={t.title} className="border-b border-[rgba(233,230,223,.2)] py-6">
          <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-[34px_132px_1fr]">
            <span className="pt-1.5 font-[family-name:var(--font-dm-mono)] text-[20px] font-extrabold tracking-[-.02em] text-[rgba(233,230,223,.4)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="aspect-square w-full overflow-hidden rounded-2xl sm:w-[132px]">
              <ImagePlaceholder label="Cover" />
            </div>
            <div>
              <div className="text-[24px] leading-[1.02] font-extrabold tracking-[-.03em] sm:text-[27px]">
                {t.title}
              </div>
              <div className="mt-2 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.7)]">
                {t.meta}
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.5)]">
                  JazzLogs rating
                </span>
                <AverageStars value={t.avg} size={15} />
                <span className="text-[16px] font-extrabold tracking-[-.02em]">{t.avg}</span>
                <span className="ml-auto font-[family-name:var(--font-dm-mono)] text-[12px] text-[rgba(233,230,223,.6)]">
                  {t.dur}
                </span>
              </div>
              <div className="mt-4 max-w-[640px] border-l-[3px] border-[#d99b10] pl-4.5 text-[18px] leading-[1.55] text-[#e9e6df]">
                {t.note}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-11 grid grid-cols-1 items-center gap-8 rounded-2xl bg-[#2a2621] p-9 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[#d99b10]">
            Want a variation?
          </div>
          <div className="mt-3 text-[28px] font-extrabold leading-[1.05] tracking-[-.03em]">
            Ask the agent to reshape this list around your mood.
          </div>
        </div>
        <Link
          href="/agent"
          className="whitespace-nowrap rounded-full bg-[#d99b10] px-7 py-[17px] text-[15px] font-bold text-[#1c1b18] no-underline"
        >
          Open the agent →
        </Link>
      </div>

      <Footer />
    </>
  );
}
