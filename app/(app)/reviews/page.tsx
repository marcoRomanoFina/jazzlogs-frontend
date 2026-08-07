"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import Pager from "@/components/app/Pager";
import LikeButton from "@/components/app/LikeButton";
import { AverageStars } from "@/components/app/StarRating";
import { MOCK_REVIEWS } from "@/lib/mock/catalog";

const EXTRA_REVIEWS = [
  { title: "Speak No Evil", artist: "Wayne Shorter", stars: 5, date: "MAY 28, 2026", likes: 18, body: "Shorter writing in riddles and the band answering in full sentences. Every head sounds like it was carved, not written.", standouts: ["Witch Hunt", "Speak No Evil"] },
  { title: "Mingus Ah Um", artist: "Charles Mingus", stars: 5, date: "MAY 14, 2026", likes: 22, body: "History and grief and swing all crammed into one band. “Goodbye Pork Pie Hat” is the most tender thing on the shelf.", standouts: ["Better Git It in Your Soul", "Goodbye Pork Pie Hat"] },
  { title: "Maiden Voyage", artist: "Herbie Hancock", stars: 4, date: "APR 30, 2026", likes: 14, body: "Water music. The title track floats and never resolves in a hurry — the calmest record I own that never gets boring.", standouts: ["Maiden Voyage", "Dolphin Dance"] },
  { title: "Blue Train", artist: "John Coltrane", stars: 5, date: "APR 12, 2026", likes: 17, body: "Coltrane as bandleader, and you can hear the ambition. Everything is going somewhere; nothing sits still for long.", standouts: ["Blue Train", "Moment's Notice"] },
];

const ALL = [...MOCK_REVIEWS, ...EXTRA_REVIEWS];
const FILTERS = ["All", "5 stars", "4 stars", "Most liked"] as const;

export default function ReviewsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [page, setPage] = useState(0);
  const perPage = 5;

  const list = useMemo(() => {
    let copy = [...ALL];
    if (filter === "5 stars") copy = copy.filter((r) => r.stars === 5);
    else if (filter === "4 stars") copy = copy.filter((r) => r.stars === 4);
    else if (filter === "Most liked") copy.sort((a, b) => b.likes - a.likes);
    return copy;
  }, [filter]);

  const pageCount = Math.max(1, Math.ceil(list.length / perPage));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = list.slice(currentPage * perPage, currentPage * perPage + perPage);

  return (
    <>
      <Navbar />

      <div className="pt-10">
        <Link
          href="/logs"
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-[rgba(233,230,223,.6)] no-underline"
        >
          ← Back to logs
        </Link>
        <div className="mt-5 grid grid-cols-1 items-end gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <div className="text-[52px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[76px]">
              Reviews.
            </div>
            <p className="mt-5 max-w-[600px] text-[18px] leading-[1.5] text-[rgba(233,230,223,.72)]">
              Every record you sat with long enough to have something to say — full write-ups,
              the standout tracks, and the moments you flagged.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[48px] font-extrabold tracking-[-.04em] text-[#d99b10]">
              {ALL.length}
            </div>
            <div className="mt-2 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.6)]">
              reviews filed
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2.5 border-t-2 border-[#d99b10] pt-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setPage(0);
            }}
            className={
              "rounded-full px-4.5 py-2.5 text-[12px] font-bold " +
              (filter === f ? "bg-[#d99b10] text-[#1c1b18]" : "bg-[rgba(233,230,223,.08)] text-[rgba(233,230,223,.72)]")
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {pageItems.map((r) => (
          <div
            key={r.title + r.date}
            className="flex items-start gap-6 rounded-2xl bg-[rgba(233,230,223,.05)] p-7"
          >
            <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-xl bg-[#1c1b18]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d99b10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3.5">
                <span className="text-[20px] font-extrabold tracking-[-.02em]">{r.title}</span>
                <span className="text-[13px] font-medium text-[rgba(233,230,223,.6)]">
                  {r.artist}
                </span>
                <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.5)]">
                  {r.date}
                </span>
                <AverageStars value={r.stars} size={16} />
              </div>
              <p className="mt-3.5 text-[15.5px] leading-[1.62] text-[rgba(233,230,223,.9)]">
                {r.body}
              </p>
              <div className="mt-5 border-t border-[rgba(233,230,223,.14)] pt-5">
                <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.5)]">
                  Standout tracks
                </div>
                <div className="mt-3.5 flex flex-wrap gap-2.5">
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
            </div>
            <LikeButton initialCount={r.likes} variant="inline" />
          </div>
        ))}
      </div>

      <Pager page={currentPage} pageCount={pageCount} onChange={setPage} />

      <Footer />
    </>
  );
}
