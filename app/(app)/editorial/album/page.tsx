"use client";

import { useState } from "react";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import StickyNote from "@/components/app/StickyNote";
import { AverageStars, InteractiveStars } from "@/components/app/StarRating";
import { MOCK_NOTES, MOCK_REVIEWS } from "@/lib/mock/catalog";

const BLOCKS = [
  { type: "lead", cap: "R", text: "ecorded across two 1959 sessions with almost no rehearsal, Kind of Blue traded chord changes for modes — scales the players could roam inside instead of navigate around. The result feels less composed than overheard." },
  { type: "para", text: "Miles handed the band little more than sketches on the day and rolled tape. Nearly everything you hear is a first pass, and you can feel it — nobody is reaching for the right answer, because there isn't one to reach for." },
  { type: "subhead", text: "The art of playing less" },
  { type: "para", text: "Bill Evans sets the weather with a handful of chords; Coltrane and Cannonball answer in long, unhurried lines. Paul Chambers and Jimmy Cobb keep time so lightly it barely registers as rhythm." },
  { type: "quote", text: "“It was never about speed or flash, so it never aged into a style you can place.”" },
  { type: "para", text: "That's why it still lands. Kind of Blue stays a mood any generation can walk into unannounced: spacious, contemplative, and quietly radical in how little it insists on." },
] as const;

const TRACKS = [
  { no: "01", role: "opener", name: "So What", standout: true, meta: "9:22 · MODAL", moods: ["Cool", "Spacious"], avg: 4.8, ratings: "4,201", lead: "Two chords, sixteen bars — the vamp that opened modal jazz to the world." },
  { no: "02", role: "ballad", name: "Freddie Freeloader", standout: false, meta: "9:46 · BLUES", moods: ["Warm", "Playful"], avg: 4.4, ratings: "2,988", lead: "The most straightforward blues on the record, and Wynton Kelly's only appearance." },
  { no: "03", role: "centerpiece", name: "Blue in Green", standout: true, meta: "5:37 · BALLAD", moods: ["Intimate", "Melancholic"], avg: 4.9, ratings: "3,650", lead: "Evans and Davis trading whispers — the quietest three minutes on the most famous jazz record ever made." },
];

export default function AlbumEditorialPage() {
  const [listened, setListened] = useState(false);

  return (
    <>
      <Navbar active="Editorials" />

      <div className="flex justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <span>← Editorials · Albums</span>
        <span>Posted Jan 2, 2024</span>
      </div>

      {/* Article head */}
      <div className="grid grid-cols-1 items-center gap-9 pt-11 pb-6 md:grid-cols-[1fr_360px]">
        <div>
          <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.24em] text-[rgba(233,230,223,.6)]">
            Log #001 · Album editorial
          </div>
          <div className="mt-5 text-[52px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[72px]">
            Kind of Blue
          </div>
          <div className="mt-4 text-[19px] font-semibold tracking-[-.01em] text-[rgba(233,230,223,.75)]">
            Miles Davis · 1959 · Columbia Records
          </div>
          <div className="mt-5 max-w-[500px] text-[20px] leading-[1.42] font-medium tracking-[-.015em]">
            The record that taught jazz to breathe — two sessions, almost no rehearsal, and a
            mood any generation can still walk straight into.
          </div>
          <div className="mt-5 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.55)]">
            By the JazzLogs desk · 4 min read
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setListened((v) => !v)}
              className="rounded-full px-6 py-[15px] text-[14px] font-bold"
              style={{
                background: listened ? "#2f6fed" : "rgba(233,230,223,.1)",
                color: listened ? "#fff" : "rgba(233,230,223,.6)",
              }}
            >
              ✓ Listened
            </button>
            <LikeButton initialCount={4287} />
          </div>

          <div className="mt-7">
            <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.18em] text-[rgba(233,230,223,.55)]">
              JazzLogs rating
            </div>
            <div className="mt-3 flex items-center gap-4">
              <AverageStars value={4.6} size={24} />
              <span className="text-[26px] font-extrabold tracking-[-.02em]">4.6</span>
              <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[rgba(233,230,223,.6)]">
                avg. of 2,148 ratings
              </span>
            </div>
            <div className="mt-4">
              <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.55)]">
                Your rating
              </div>
              <div className="mt-3">
                <InteractiveStars />
              </div>
            </div>
          </div>
        </div>
        <div className="aspect-square w-full overflow-hidden rounded-[18px] md:w-[360px]">
          <ImagePlaceholder label="Album cover" />
        </div>
      </div>

      {/* Body */}
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
              ["Released", "1959 · Columbia Records"],
              ["Vocal profile", "Instrumental"],
              ["Tier", "Cornerstone — start here"],
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
            <div className="flex gap-5 py-3.5">
              <span className="w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                Styles
              </span>
              <span className="flex flex-wrap gap-1.5">
                {["Modal", "Cool jazz"].map((s) => (
                  <span key={s} className="rounded-full border-[1.5px] border-[#d99b10] px-2.5 py-1.5 text-[12px] font-semibold">
                    {s}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.5)]">
              Personnel
            </div>
            {[
              ["Miles Davis", "TRUMPET"],
              ["John Coltrane", "TENOR SAX"],
              ["Cannonball Adderley", "ALTO SAX"],
              ["Bill Evans", "PIANO"],
              ["Paul Chambers", "BASS"],
              ["Jimmy Cobb", "DRUMS"],
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

      {/* Track by track */}
      <div className="mt-14 flex items-baseline justify-between border-b-[1.5px] border-[#d99b10] pb-3">
        <span className="text-[16px] font-extrabold tracking-[-.01em]">Track by track</span>
      </div>
      {TRACKS.map((t) => (
        <div key={t.no} className="border-t-[2.5px] border-[#d99b10] py-9">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
            <div className="aspect-square w-full flex-none overflow-hidden rounded-[14px] sm:w-[168px]">
              <ImagePlaceholder label="Cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-[family-name:var(--font-dm-mono)] text-[12px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.55)]">
                  Track {t.no} · {t.role}
                </span>
                {t.standout && (
                  <span className="rounded-[5px] bg-[#2a2621] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[9.5px] font-bold uppercase tracking-[.12em] text-[#d99b10]">
                    Standout
                  </span>
                )}
              </div>
              <div className="mt-3 text-[36px] leading-[.98] font-extrabold tracking-[-.04em] sm:text-[44px]">
                {t.name}
              </div>
              <div className="mt-3.5 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.08em] text-[rgba(233,230,223,.65)]">
                {t.meta}
              </div>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {t.moods.map((m) => (
                  <span key={m} className="rounded-full border-[1.5px] border-[#d99b10] px-2.5 py-1.5 text-[12px] font-semibold">
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3.5">
                <AverageStars value={t.avg} size={16} />
                <span className="text-[16px] font-extrabold tracking-[-.02em]">{t.avg}</span>
                <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.55)]">
                  {t.ratings} ratings
                </span>
                <span className="h-1 w-1 rounded-full bg-[rgba(233,230,223,.35)]" />
                <span className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.5)]">
                  You
                </span>
                <InteractiveStars size={17} />
              </div>
              <p className="mt-4 max-w-[640px] text-[15.5px] leading-[1.7] text-[rgba(233,230,223,.9)]">
                {t.lead}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Track notes */}
      <div className="mt-14 mb-2 text-[26px] font-extrabold tracking-[-.02em] text-[#d99b10]">
        Track notes
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {MOCK_NOTES.slice(0, 3).map((n, i) => (
          <StickyNote
            key={n.title}
            note={{ ...n, name: "You", rotate: [-1.4, 1.2, -0.6][i] }}
          />
        ))}
      </div>

      {/* Reviews */}
      <div className="mx-auto mt-16 max-w-[940px]">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b-[1.5px] border-[#d99b10] pb-6">
          <div>
            <div className="text-[46px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[56px]">
              JazzLogs reviews
            </div>
            <p className="mt-4 max-w-[620px] text-[17px] leading-[1.6] text-[rgba(233,230,223,.75)]">
              Full write-ups filed by listeners who sat with the whole record.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-3.5">
              <AverageStars value={4.6} size={22} />
              <div className="text-[52px] leading-[.82] font-extrabold tracking-[-.05em]">4.6</div>
            </div>
            <div className="mt-2.5 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.6)]">
              FROM 2,148 RATINGS · 312 REVIEWS
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {MOCK_REVIEWS.map((r) => (
            <div
              key={r.title + r.date}
              className="flex items-start gap-6 rounded-2xl bg-[rgba(233,230,223,.05)] p-7"
            >
              <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-[#1c1b18]">
                <svg width="25" height="25" viewBox="0 0 24 24">
                  <circle cx="12" cy="8.2" r="4" fill="#d99b10" />
                  <path d="M4 20.5c0-4.2 3.8-6.4 8-6.4s8 2.2 8 6.4" fill="#d99b10" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[18px] font-extrabold tracking-[-.02em]">{r.title}</span>
                  <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.5)]">
                    {r.date}
                  </span>
                  <AverageStars value={r.stars} size={15} />
                </div>
                <p className="mt-3 text-[15.5px] leading-[1.62] text-[rgba(233,230,223,.9)]">
                  {r.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {r.standouts.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[rgba(217,155,16,.18)] px-5 py-3 text-[16px] font-extrabold text-[#d99b10]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <LikeButton initialCount={r.likes} variant="inline" />
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
