"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import { AverageStars } from "@/components/app/StarRating";

const TRACKS = [
  { title: "Naima", meta: "John Coltrane · Giant Steps · 1960", dur: "4:21", avg: 4.7, ratings: "1,842", note: "Coltrane's love letter to his wife — all restraint and ache." },
  { title: "Blue in Green", meta: "Miles Davis · Kind of Blue · 1959", dur: "5:37", avg: 4.8, ratings: "2,106", note: "Evans and Davis trading whispers. The quietest three minutes on the most famous jazz record ever made." },
  { title: "My Funny Valentine", meta: "Chet Baker · Chet Baker Sings · 1954", dur: "2:22", avg: 4.5, ratings: "1,204", note: "The frailest voice in jazz, and the whole point of it." },
  { title: "Peace Piece", meta: "Bill Evans · Everybody Digs Bill Evans · 1958", dur: "6:41", avg: 4.6, ratings: "1,560", note: "One repeating figure in the left hand, endlessly turned over in the right." },
  { title: "'Round Midnight", meta: "Thelonious Monk · Monk's Music · 1957", dur: "5:52", avg: 4.4, ratings: "1,388", note: "The definitive after-hours theme." },
];

export default function PlaylistDetailPage() {
  const [listened, setListened] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Navbar />

      <div className="flex justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <Link href="/playlists" className="no-underline">
          ← All playlists
        </Link>
        <span>Updated Jul 8, 2026</span>
      </div>

      <div className="mt-11 grid grid-cols-1 items-start gap-9 md:grid-cols-[360px_1fr]">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-2xl md:w-[360px]">
            <ImagePlaceholder label="Playlist cover" />
          </div>
          <div className="mt-4.5 flex justify-center">
            <a
              href="#"
              className="rounded-full bg-black px-6 py-3.5 text-[14px] font-bold text-[#e9e6df] no-underline"
            >
              Listen on Spotify
            </a>
          </div>
        </div>
        <div>
          <div className="text-[48px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[64px]">
            Rainy-day ballads
          </div>
          <div className="mt-5 max-w-[500px] text-[22px] leading-[1.3] font-semibold tracking-[-.02em]">
            For the hours when the light goes grey and you&rsquo;d rather not talk.
          </div>
          <p className="mt-4 max-w-[540px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.75)]">
            Eight slow ones, sequenced to fall like weather — from Coltrane&rsquo;s ache through
            Evans&rsquo; hush to Rollins&rsquo; late-afternoon calm.
          </p>
          <div className="mt-5 flex gap-5 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.12em] text-[rgba(233,230,223,.62)]">
            <span>8 tracks</span>
            <span>· 36 min</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              className="flex items-center gap-2 rounded-full px-6 py-[15px] text-[14px] font-bold"
              style={{
                background: saved ? "#d99b10" : "rgba(233,230,223,.1)",
                color: saved ? "#1c1b18" : "rgba(233,230,223,.6)",
              }}
            >
              {saved ? "On your list" : "Listen later"}
            </button>
            <LikeButton initialCount={5204} />
          </div>
        </div>
      </div>

      <div className="mt-14 border-b-[1.5px] border-[#d99b10] pb-3" />

      {TRACKS.map((t, i) => {
        const isOn = !!listened[i];
        return (
          <div key={t.title} className="border-b border-[rgba(233,230,223,.2)] py-6">
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-[132px_1fr]">
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
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <span className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.5)]">
                    JazzLogs rating
                  </span>
                  <AverageStars value={t.avg} size={15} />
                  <span className="text-[16px] font-extrabold tracking-[-.02em]">{t.avg}</span>
                  <span className="font-[family-name:var(--font-dm-mono)] text-[9.5px] text-[rgba(233,230,223,.55)]">
                    {t.ratings} ratings
                  </span>
                  <span className="ml-auto font-[family-name:var(--font-dm-mono)] text-[12px] text-[rgba(233,230,223,.6)]">
                    {t.dur}
                  </span>
                </div>
                <p className="mt-3 max-w-[620px] text-[14.5px] leading-[1.6] text-[rgba(233,230,223,.8)]">
                  {t.note}
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2.5">
                  <Link
                    href="/editorial/album"
                    className="rounded-full bg-[#d99b10] px-4.5 py-2.5 text-[12.5px] font-bold text-[#1c1b18] no-underline"
                  >
                    Read editorial →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setListened((s) => ({ ...s, [i]: !s[i] }))}
                    className="rounded-full px-4.5 py-2.5 text-[12.5px] font-bold"
                    style={{
                      background: isOn ? "#2f6fed" : "rgba(233,230,223,.1)",
                      color: isOn ? "#fff" : "rgba(233,230,223,.6)",
                    }}
                  >
                    ✓ Listened
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
