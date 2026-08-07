"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import Pager from "@/components/app/Pager";
import StickyNote from "@/components/app/StickyNote";
import { MOCK_NOTES } from "@/lib/mock/catalog";

const EXTRA_NOTES = [
  { ts: "0:40", album: "SPEAK NO EVIL", track: "WITCH HUNT", title: "Hancock knows", text: "Comping like he already knows the ending. Every chord lands a half-second ahead of the thought.", date: "MAY 28", likes: 6 },
  { ts: "1:05", album: "MAIDEN VOYAGE", track: "MAIDEN VOYAGE", title: "Suspended", text: "That suspended chord doing all the work. Nothing resolves and nothing needs to.", date: "APR 30", likes: 9 },
  { ts: "3:33", album: "BLUE TRAIN", track: "BLUE TRAIN", title: "The riff", text: "The riff that refuses to leave your head. I've hummed it for three days straight.", date: "APR 12", likes: 7 },
];

const ALL = [...MOCK_NOTES, ...EXTRA_NOTES];
const ROTATIONS = [-1.6, 1.4, -0.8, 1.8, -1.2, 0.9, -1.4, 1.1, -0.6];
const FILTERS = ["All", "Most liked", "Recent"] as const;

export default function NotesPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [page, setPage] = useState(0);
  const perPage = 9;

  const list = useMemo(() => {
    const copy = [...ALL];
    if (filter === "Most liked") copy.sort((a, b) => b.likes - a.likes);
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
              Notes.
            </div>
            <p className="mt-5 max-w-[600px] text-[18px] leading-[1.5] text-[rgba(233,230,223,.72)]">
              The exact moments worth remembering — timestamps you flagged mid-listen, each
              pinned to the track it came from.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[48px] font-extrabold tracking-[-.04em] text-[#d99b10]">
              {ALL.length}
            </div>
            <div className="mt-2 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.6)]">
              notes flagged
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

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((n, i) => (
          <StickyNote key={n.title + n.ts} note={{ ...n, rotate: ROTATIONS[i % ROTATIONS.length] }} />
        ))}
      </div>

      <Pager page={currentPage} pageCount={pageCount} onChange={setPage} />

      <Footer />
    </>
  );
}
