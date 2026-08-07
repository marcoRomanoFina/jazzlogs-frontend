"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import Pager from "@/components/app/Pager";
import { MOCK_PLAYLISTS } from "@/lib/mock/catalog";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "MOOD", label: "Moods" },
  { key: "ERA", label: "Eras" },
  { key: "INSTRUMENT", label: "Instruments" },
  { key: "STARTER", label: "Starters" },
] as const;

export default function PlaylistsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 6;

  const featured = MOCK_PLAYLISTS[0];

  const grid = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MOCK_PLAYLISTS.filter((p) => {
      const okType = filter === "all" || p.tag === filter;
      const okQ = !query || p.title.toLowerCase().includes(query) || p.note.toLowerCase().includes(query);
      return okType && okQ;
    });
  }, [filter, q]);

  const pageCount = Math.max(1, Math.ceil(grid.length / perPage));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = grid.slice(currentPage * perPage, currentPage * perPage + perPage);

  return (
    <>
      <Navbar active="Playlists" />

      <div className="pt-11 pb-2.5">
        <div className="text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[80px]">
          Playlists.
        </div>
        <div className="mt-5 max-w-[560px] text-[19px] leading-[1.5] text-[rgba(233,230,223,.72)]">
          Lists built by hand at the JazzLogs desk — not by an algorithm. Sequenced to be played
          start to finish.
        </div>
      </div>

      <div className="mb-4 mt-10 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
        FEATURED
      </div>
      <Link
        href="/playlists/detail"
        className="grid grid-cols-1 items-stretch overflow-hidden rounded-2xl bg-[#2a2621] text-[#e9e6df] no-underline md:grid-cols-[380px_1fr]"
      >
        <div className="aspect-square">
          <ImagePlaceholder label="Cover" />
        </div>
        <div className="flex flex-col justify-between gap-6 p-9">
          <div className="flex justify-between font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium text-[rgba(233,230,223,.6)]">
            <span>EDITOR&rsquo;S PICK</span>
            <span>{featured.count} TRACKS</span>
          </div>
          <div>
            <div className="text-[40px] leading-[.9] font-extrabold tracking-[-.04em] text-[#d99b10] sm:text-[52px]">
              {featured.title}
            </div>
            <div className="mt-4 max-w-[440px] text-[17px] leading-[1.55] text-[rgba(233,230,223,.82)]">
              {featured.note}
            </div>
          </div>
          <div className="flex items-center gap-4.5">
            <span className="rounded-full bg-[#d99b10] px-6 py-3.5 text-[14px] font-bold text-[#1c1b18]">
              Open playlist →
            </span>
            <LikeButton initialCount={featured.likes} />
          </div>
        </div>
      </Link>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t-[1.5px] border-[#d99b10] pt-5">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setFilter(f.key);
                setPage(0);
              }}
              className={
                "rounded-full border-[1.5px] border-[#d99b10] px-4 py-2.5 text-[13px] font-semibold " +
                (filter === f.key ? "bg-[#d99b10] text-[#1c1b18]" : "text-[#e9e6df]")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex min-w-[240px] items-center gap-2.5 rounded-full border-[1.5px] border-[#d99b10] px-3.5 py-2">
          <span className="font-[family-name:var(--font-dm-mono)] text-[13px] text-[rgba(233,230,223,.5)]">
            ⌕
          </span>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search playlists…"
            className="flex-1 border-none bg-transparent text-[14px] font-medium text-[#e9e6df] outline-none placeholder:text-[rgba(233,230,223,.4)]"
          />
        </div>
      </div>

      {pageItems.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((p) => (
              <div
                key={p.id}
                className="relative flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#d99b10]"
              >
                <Link href="/playlists/detail" className="absolute inset-0 z-0" aria-label={p.title} />
                <div className="pointer-events-none relative z-[1] aspect-[16/10]">
                  <ImagePlaceholder label="Cover" />
                </div>
                <div className="pointer-events-none relative z-[1] flex flex-1 flex-col gap-2.5 px-5 py-4.5">
                  <div className="text-[24px] leading-[.98] font-extrabold tracking-[-.03em]">
                    {p.title}
                  </div>
                  <div className="text-[13.5px] leading-[1.45] text-[rgba(233,230,223,.7)]">
                    {p.note}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full border-[1.5px] border-[#d99b10] px-2.5 py-1.5 font-[family-name:var(--font-dm-mono)] text-[10px] font-bold tracking-[.1em] text-[#d99b10]">
                      {p.tag}
                    </span>
                    <span className="rounded-full border-[1.5px] border-[rgba(233,230,223,.25)] px-2.5 py-1.5 font-[family-name:var(--font-dm-mono)] text-[10px] font-bold tracking-[.1em] text-[rgba(233,230,223,.65)]">
                      {p.count} TRACKS
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="pointer-events-auto">
                      <LikeButton initialCount={p.likes} variant="inline" />
                    </span>
                    <span className="rounded-full bg-[#d99b10] px-4.5 py-2.5 text-[12.5px] font-bold text-[#1c1b18]">
                      Open →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pager page={currentPage} pageCount={pageCount} onChange={setPage} />
        </>
      ) : (
        <div className="mt-5 border-[1.5px] border-dashed border-[rgba(233,230,223,.4)] p-14 text-center">
          <div className="text-[26px] font-extrabold tracking-[-.02em]">Nothing here yet.</div>
          <div className="mt-2.5 text-[15px] text-[rgba(233,230,223,.65)]">
            No playlists match that filter — try another, or ask the agent to build one.
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
