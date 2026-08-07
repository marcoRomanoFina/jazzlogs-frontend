import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import StickyNote from "@/components/app/StickyNote";
import { AverageStars } from "@/components/app/StarRating";
import { MOCK_ALBUMS, MOCK_NOTES, MOCK_PLAYLISTS, MOCK_REVIEWS } from "@/lib/mock/catalog";

const STATS = [
  { value: 28, label: "Listen later · albums" },
  { value: 14, label: "Listen later · tracks" },
  { value: 47, label: "Reviews written" },
  { value: 128, label: "Notes written" },
  { value: 6, label: "Your playlists" },
];

export default function LogsPage() {
  return (
    <>
      <Navbar />

      <div className="pt-11 pb-2.5">
        <div className="text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[80px]">
          Your logs.
        </div>
        <div className="mt-5 max-w-[600px] text-[19px] leading-[1.5] text-[rgba(233,230,223,.72)]">
          Your personal desk — the records you&rsquo;ve saved, the reviews you&rsquo;ve filed, the
          lists you&rsquo;ve built and the sessions you&rsquo;ve kept.
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-5">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#2a2621] p-6">
            <div className="text-[38px] font-extrabold tracking-[-.03em] text-[#d99b10]">
              {s.value}
            </div>
            <div className="mt-2.5 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.12em] text-[rgba(233,230,223,.65)]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Listen later panel */}
      <div className="mt-10 rounded-[24px] border-[1.5px] border-[rgba(217,155,16,.4)] p-8 sm:p-10">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-[#d99b10] text-[15px] font-bold text-[#d99b10]">
            ✓
          </span>
          <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.22em] text-[#d99b10]">
            Set aside for later
          </span>
        </div>
        <div className="mt-4 text-[48px] leading-[.9] font-extrabold tracking-[-.045em] sm:text-[60px]">
          Listen later
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/listen-later"
            className="rounded-full bg-[#d99b10] px-5 py-3 text-[13px] font-bold text-[#1c1b18] no-underline"
          >
            Browse all →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MOCK_ALBUMS.slice(0, 4).map((a) => (
            <Link key={a.id} href="/editorial/album" className="block no-underline">
              <div className="aspect-square overflow-hidden rounded-2xl bg-[#2a2621]">
                <ImagePlaceholder label="Cover" />
              </div>
              <div className="pt-2.5">
                <div className="truncate text-[18px] font-extrabold tracking-[-.02em]">
                  {a.title}
                </div>
                <div className="mt-1.5 text-[12px] font-semibold text-[rgba(233,230,223,.6)]">
                  {a.artist}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-14 flex flex-wrap items-end justify-between gap-8 border-t-2 border-[#d99b10] pt-6">
        <div>
          <div className="text-[36px] leading-[.95] font-extrabold tracking-[-.035em] text-[#d99b10] sm:text-[44px]">
            Reviews you&rsquo;ve written
          </div>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.72)]">
            The records you sat with long enough to have something to say.
          </p>
        </div>
        <Link
          href="/reviews"
          className="whitespace-nowrap rounded-full bg-[#d99b10] px-5.5 py-3.5 text-[13px] font-bold text-[#1c1b18] no-underline"
        >
          Browse all reviews →
        </Link>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {MOCK_REVIEWS.slice(0, 2).map((r) => (
          <div key={r.title} className="rounded-2xl bg-[rgba(233,230,223,.05)] p-7">
            <div className="flex flex-wrap items-center gap-3.5">
              <span className="text-[18px] font-extrabold tracking-[-.02em]">{r.title}</span>
              <span className="text-[12px] font-medium text-[rgba(233,230,223,.6)]">
                {r.artist}
              </span>
              <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.5)]">
                {r.date}
              </span>
              <AverageStars value={r.stars} size={15} />
            </div>
            <p className="mt-3 text-[15.5px] leading-[1.62] text-[rgba(233,230,223,.9)]">
              {r.body}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[rgba(233,230,223,.14)] pt-5">
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
        ))}
      </div>

      {/* Notes */}
      <div className="mt-14 flex flex-wrap items-end justify-between gap-8 border-t-2 border-[#d99b10] pt-6">
        <div>
          <div className="text-[36px] leading-[.95] font-extrabold tracking-[-.035em] text-[#d99b10] sm:text-[44px]">
            Notes you&rsquo;ve flagged
          </div>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.72)]">
            The exact moments worth remembering — timestamps pinned to the track they came from.
          </p>
        </div>
        <Link
          href="/notes"
          className="whitespace-nowrap rounded-full bg-[#d99b10] px-5.5 py-3.5 text-[13px] font-bold text-[#1c1b18] no-underline"
        >
          Browse all →
        </Link>
      </div>
      <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {MOCK_NOTES.slice(0, 3).map((n, i) => (
          <StickyNote key={n.title} note={{ ...n, rotate: [-1.4, 1.2, -0.8][i] }} />
        ))}
      </div>

      {/* Playlists */}
      <div className="mt-14 flex flex-wrap items-end justify-between gap-8 border-t-2 border-[#d99b10] pt-6">
        <div>
          <div className="text-[36px] leading-[.95] font-extrabold tracking-[-.035em] text-[#d99b10] sm:text-[44px]">
            Playlists you&rsquo;ve built
          </div>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.72)]">
            Your own sequences — moods, evenings, and deep-dives sequenced track by track.
          </p>
        </div>
        <Link
          href="/playlists"
          className="whitespace-nowrap rounded-full bg-[#d99b10] px-5.5 py-3.5 text-[13px] font-bold text-[#1c1b18] no-underline"
        >
          Browse all →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MOCK_PLAYLISTS.map((p) => (
          <div
            key={p.id}
            className="relative flex min-h-[200px] flex-col justify-between rounded-2xl bg-[rgba(233,230,223,.05)] p-6 hover:bg-[rgba(217,155,16,.1)]"
          >
            <Link href="/playlists/summary" className="absolute inset-0 z-0" aria-label={p.title} />
            <span className="pointer-events-none relative z-[1] font-[family-name:var(--font-dm-mono)] text-[10px] font-medium tracking-[.1em] text-[rgba(233,230,223,.55)]">
              {p.count} TRACKS
            </span>
            <div className="pointer-events-none relative z-[1]">
              <div className="text-[26px] leading-[.98] font-extrabold tracking-[-.03em]">
                {p.title}
              </div>
              <div className="mt-2.5 text-[14px] leading-[1.5] text-[rgba(233,230,223,.72)]">
                {p.note}
              </div>
            </div>
            <div className="relative z-[1] flex items-center justify-between border-t border-[rgba(233,230,223,.14)] pt-3.5">
              <span className="pointer-events-auto">
                <LikeButton initialCount={p.likes} variant="inline" />
              </span>
              <span className="pointer-events-none flex items-center gap-1.5 text-[12px] font-bold text-[#d99b10]">
                Open →
              </span>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
}
