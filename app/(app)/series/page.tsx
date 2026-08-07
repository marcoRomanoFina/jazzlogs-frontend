"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import Pager from "@/components/app/Pager";
import { MOCK_SERIES } from "@/lib/mock/catalog";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "STARTER", label: "Starters" },
  { key: "ERA", label: "Eras" },
  { key: "ARTIST", label: "Artists" },
  { key: "MOOD", label: "Moods" },
] as const;

export default function SeriesPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 6;

  const grid = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MOCK_SERIES.filter((s) => {
      const okType = filter === "all" || s.tag === filter;
      const okQ = !query || s.title.toLowerCase().includes(query) || s.note.toLowerCase().includes(query);
      return okType && okQ;
    });
  }, [filter, q]);

  const pageCount = Math.max(1, Math.ceil(grid.length / perPage));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = grid.slice(currentPage * perPage, currentPage * perPage + perPage);

  return (
    <>
      <Navbar active="Series" />

      <div className="flex justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <span>Guided listening · hand-made</span>
      </div>

      <div className="max-w-[760px] py-11">
        <div className="text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[80px]">
          JazzLogs
          <br />
          Series.
        </div>
        <div className="mt-5 max-w-[580px] text-[19px] leading-[1.5] text-[rgba(233,230,223,.72)]">
          Curated jazz, built by hand into chapters. Not a playlist and not a lecture — a guided
          listen you move through like a series, one episode at a time.
        </div>
      </div>

      <div className="mb-4 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
        Featured session
      </div>
      <Link
        href="/series/detail"
        className="grid grid-cols-1 items-stretch overflow-hidden rounded-2xl bg-[#2a2621] text-[#e9e6df] no-underline md:grid-cols-[360px_1fr]"
      >
        <div className="min-h-[240px] md:min-h-[360px]">
          <ImagePlaceholder label="Session cover" />
        </div>
        <div className="flex flex-col justify-center p-9">
          <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.6)]">
            6 chapters · 58 min
          </span>
          <div className="mt-5 text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#d99b10] sm:text-[52px]">
            Blue Note, 1959
          </div>
          <div className="mt-4 max-w-[520px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.82)]">
            The year the label found its sound. Six chapters walk you from the first hard-bop
            sessions to the ballads that closed the year.
          </div>
          <span className="mt-6 inline-block self-start rounded-full bg-[#d99b10] px-6 py-3.5 text-[14px] font-bold text-[#1c1b18]">
            ▸ Start series
          </span>
        </div>
      </Link>

      <div className="mt-11 flex flex-wrap items-center justify-between gap-5 border-t-[1.5px] border-[#d99b10] pt-5">
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
            placeholder="Search series…"
            className="flex-1 border-none bg-transparent text-[14px] font-medium text-[#e9e6df] outline-none placeholder:text-[rgba(233,230,223,.4)]"
          />
        </div>
      </div>

      {pageItems.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((s) => (
              <Link
                key={s.id}
                href="/series/detail"
                className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#d99b10] no-underline"
              >
                <div className="relative aspect-[16/10]">
                  <ImagePlaceholder label="Cover" />
                  <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-[#2a2621] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[9.5px] font-bold uppercase tracking-[.12em] text-[#d99b10]">
                    {s.chapters} chapters
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 px-5 py-4.5">
                  <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                    {s.tag} · {s.duration}
                  </div>
                  <div className="text-[24px] leading-[.98] font-extrabold tracking-[-.03em]">
                    {s.title}
                  </div>
                  <div className="flex-1 text-[13.5px] leading-[1.45] text-[rgba(233,230,223,.72)]">
                    {s.note}
                  </div>
                  <div className="mt-1 text-[12px] font-bold">Start series →</div>
                </div>
              </Link>
            ))}
          </div>
          <Pager page={currentPage} pageCount={pageCount} onChange={setPage} />
        </>
      ) : (
        <div className="mt-5 border-[1.5px] border-dashed border-[rgba(233,230,223,.4)] p-14 text-center">
          <div className="text-[26px] font-extrabold tracking-[-.02em]">
            No sessions here yet.
          </div>
          <div className="mt-2.5 text-[15px] text-[rgba(233,230,223,.65)]">
            Nothing matches that filter — try another, or browse the full series.
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
