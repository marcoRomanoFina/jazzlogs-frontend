"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import { AverageStars, InteractiveStars } from "@/components/app/StarRating";

const BLOCKS = [
  { type: "lead", cap: "F", text: "ew musicians ever changed as fast, or as publicly, as John Coltrane. He practiced with a monk's discipline and played with a preacher's urgency." },
  { type: "para", text: "He arrived as a sideman with a habit and a sound still forming. He left as the most influential voice of his generation, having rebuilt his tone, his technique, and eventually his entire idea of what music was for." },
  { type: "subhead", text: "From sideman to seeker" },
  { type: "para", text: "The apprenticeship with Miles Davis taught him restraint; the detour through Thelonious Monk taught him architecture. The “sheets of sound” poured out of him faster than critics could name them." },
  { type: "quote", text: "“He was chasing something the rest of us could only hear the edges of.”" },
  { type: "para", text: "A Love Supreme in 1965 reframed everything that came before it as prelude. What began as technique became devotion; what began as jazz became prayer." },
] as const;

const RECORDS = [
  { name: "Blue Train", year: "1957", label: "Blue Note", avg: 4.6, ratings: "2,014", note: "The last record he made as a leader for hire, and the most straightforwardly enjoyable." },
  { name: "Giant Steps", year: "1960", label: "Atlantic", avg: 4.7, ratings: "2,488", note: "The technical everest — a set of chord changes so demanding they became a rite of passage." },
  { name: "A Love Supreme", year: "1965", label: "Impulse!", avg: 4.9, ratings: "3,641", note: "The summit. Four movements from acknowledgement to psalm — the record that turned his craft into devotion." },
  { name: "Ascension", year: "1966", label: "Impulse!", avg: 4.1, ratings: "1,106", note: "The plunge into free jazz — forty minutes of collective fire that split his audience." },
];

export default function ArtistEditorialPage() {
  const [following, setFollowing] = useState(false);

  return (
    <>
      <Navbar active="Editorials" />

      <div className="flex justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <span>← Editorials · Artists</span>
        <span>Updated Mar 3, 2026</span>
      </div>

      <div className="grid grid-cols-1 items-center gap-9 pt-11 pb-6 md:grid-cols-[1fr_360px]">
        <div>
          <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.24em] text-[rgba(233,230,223,.6)]">
            Artist editorial · The titans
          </div>
          <div className="mt-5 text-[52px] leading-[.88] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[72px]">
            John Coltrane
          </div>
          <div className="mt-4 text-[18px] font-semibold tracking-[-.01em] text-[rgba(233,230,223,.75)]">
            Tenor &amp; soprano saxophone · 1926–1967
          </div>
          <div className="mt-5 max-w-[500px] text-[19px] leading-[1.42] font-medium tracking-[-.015em]">
            In barely a decade he moved from sideman to seeker — and dragged the whole music
            forward with him.
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setFollowing((v) => !v)}
              className="rounded-full px-6 py-[15px] text-[14px] font-bold"
              style={{
                background: following ? "#2f6fed" : "rgba(233,230,223,.1)",
                color: following ? "#fff" : "rgba(233,230,223,.6)",
              }}
            >
              {following ? "Following" : "Follow"}
            </button>
            <Link
              href="/agent"
              className="rounded-full bg-[#d99b10] px-6 py-[15px] text-[14px] font-bold text-[#1c1b18] no-underline"
            >
              Ask the agent →
            </Link>
            <LikeButton initialCount={4287} />
          </div>
          <div className="mt-7">
            <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.18em] text-[rgba(233,230,223,.55)]">
              Your rating · avg. across this catalogue
            </div>
            <div className="mt-3 flex items-center gap-4">
              <AverageStars value={4.6} size={22} />
              <span className="text-[24px] font-extrabold tracking-[-.02em]">4.6</span>
            </div>
          </div>
        </div>
        <div className="aspect-square w-full overflow-hidden rounded-[18px] md:w-[360px]">
          <ImagePlaceholder label="Artist photo" />
        </div>
      </div>

      <div className="mx-auto mt-11 max-w-[680px]">
        {BLOCKS.map((b, i) => {
          if (b.type === "lead")
            return (
              <p key={i} className="mb-6 text-[18px] leading-[1.75]">
                <span className="float-left mr-3.5 mt-1.5 text-[60px] leading-[.68] font-extrabold tracking-[-.03em]">
                  {b.cap}
                </span>
                {b.text}
              </p>
            );
          if (b.type === "subhead")
            return (
              <div key={i} className="my-3.5 text-[26px] font-extrabold leading-[1.1] tracking-[-.03em]">
                {b.text}
              </div>
            );
          if (b.type === "quote")
            return (
              <div
                key={i}
                className="my-4 border-y-[2.5px] border-[#d99b10] py-6 text-[26px] font-semibold leading-[1.24] tracking-[-.025em]"
              >
                {b.text}
              </div>
            );
          return (
            <p key={i} className="mb-6 text-[18px] leading-[1.75] text-[rgba(233,230,223,.9)]">
              {b.text}
            </p>
          );
        })}
      </div>

      {/* Field notes */}
      <div className="mt-6 overflow-hidden rounded-2xl border-[1.5px] border-[#d99b10]">
        <div className="border-b-[1.5px] border-[#d99b10] px-6 py-4">
          <span className="text-[16px] font-extrabold tracking-[-.01em]">Field notes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="border-b sm:border-r sm:border-b-0 border-[#d99b10] p-6">
            {[
              ["Active", "1945–1967"],
              ["Born", "Hamlet, North Carolina · 1926"],
              ["Tier", "Titan — canon"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex gap-5 border-b border-[rgba(233,230,223,.18)] py-3.5 last:border-b-0"
              >
                <span className="w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                  {label}
                </span>
                <span className="text-[15px] font-semibold">{value}</span>
              </div>
            ))}
          </div>
          <div className="p-6">
            <div className="mb-4 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.5)]">
              Played with
            </div>
            {[
              ["Miles Davis", "BANDLEADER"],
              ["Thelonious Monk", "PIANO"],
              ["McCoy Tyner", "PIANO"],
              ["Jimmy Garrison", "BASS"],
              ["Elvin Jones", "DRUMS"],
            ].map(([name, role]) => (
              <div key={name} className="flex items-baseline justify-between py-1.5">
                <span className="text-[15px] font-bold tracking-[-.01em]">{name}</span>
                <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-[rgba(233,230,223,.6)]">
                  {role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Essential listening */}
      <div className="mt-16 mb-2 text-[46px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[60px]">
        Essential listening
      </div>
      <p className="max-w-[620px] text-[17px] leading-[1.6] text-[rgba(233,230,223,.75)]">
        Five records that map the arc — from the confident hard bop of his sideman years to the
        searching fire of the end.
      </p>

      {RECORDS.map((r, i) => (
        <div key={r.name} className={i === 0 ? "pt-9 pb-9" : "border-t-[2.5px] border-[#d99b10] py-9"}>
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
            <div className="aspect-square w-full flex-none overflow-hidden rounded-[14px] sm:w-[168px]">
              <ImagePlaceholder label="Cover" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-[family-name:var(--font-dm-mono)] text-[12px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.55)]">
                {r.year} · {r.label}
              </span>
              <Link
                href="/editorial/album"
                className="mt-3 block text-[36px] leading-[1] font-extrabold tracking-[-.035em] no-underline sm:text-[40px]"
              >
                {r.name}
              </Link>
              <div className="mt-3.5 flex flex-wrap items-center gap-3">
                <span className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.5)]">
                  JazzLogs rating
                </span>
                <AverageStars value={r.avg} size={17} />
                <span className="text-[17px] font-extrabold tracking-[-.02em]">{r.avg}</span>
                <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.55)]">
                  {r.ratings} ratings
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-2.5">
                <span className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.5)]">
                  Your rating
                </span>
                <InteractiveStars size={17} />
              </div>
              <p className="mt-4 max-w-[640px] text-[16.5px] leading-[1.7] text-[rgba(233,230,223,.88)]">
                {r.note}
              </p>
              <Link
                href="/editorial/album"
                className="mt-5 inline-block rounded-full bg-[#d99b10] px-6 py-3.5 text-[14px] font-bold text-[#1c1b18] no-underline"
              >
                Album editorial →
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-14 grid grid-cols-1 items-center gap-8 rounded-2xl bg-[#2a2621] p-9 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[#d99b10]">
            Go deeper
          </div>
          <div className="mt-3 text-[30px] font-extrabold leading-[1.05] tracking-[-.03em]">
            Ask the agent where to go next with Coltrane.
          </div>
        </div>
        <Link
          href="/agent"
          className="rounded-full bg-[#d99b10] px-7 py-[17px] text-[15px] font-bold whitespace-nowrap text-[#1c1b18] no-underline"
        >
          Open the agent →
        </Link>
      </div>

      <Footer />
    </>
  );
}
