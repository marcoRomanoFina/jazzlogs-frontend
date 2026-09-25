"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import LoadingNotes from "@/components/app/LoadingNotes";
import Pager from "@/components/app/Pager";
import type { Page } from "@/lib/api";
import {
  fetchOnboardingSeries,
  fetchFeaturedSeries,
  fetchSeries,
  fetchSeriesCatalogue,
  type SeriesSummary,
  type SeriesVoice,
  type FeaturedSeries,
} from "@/lib/series";

// The catalogue's own filter — mirrors GET /series/catalogue's voice param
// (omit it for "all"), not the mock tag types the grid used to filter by.
const VOICE_FILTERS = [
  { key: "all", label: "All" },
  { key: "MARK", label: "Mark" },
  { key: "LAURA", label: "Laura" },
  { key: "ALICE", label: "Alice" },
  { key: "ADAM", label: "Adam" },
  { key: "JAMES", label: "James" },
  { key: "ALLIE", label: "Allie" },
  { key: "BOB", label: "Bob" },
  { key: "NATALIE", label: "Natalie" },
] as const;

// One portrait per narrator, filename `{file}-narrator.png` under
// public/series/narrators/ — all eight are real SeriesVoice values now.
// The ALLIE voice's portrait file is still named "ellie" (predates the
// ALLIE spelling landing in the backend enum), so the file/name pair below
// intentionally don't match for that one entry.
const NARRATORS = [
  { file: "mark", name: "Mark" },
  { file: "laura", name: "Laura" },
  { file: "alice", name: "Alice" },
  { file: "adam", name: "Adam" },
  { file: "james", name: "James" },
  { file: "ellie", name: "Allie" },
  { file: "bob", name: "Bob" },
  { file: "natalie", name: "Natalie" },
] as const;

export default function SeriesPage() {
  const [voiceFilter, setVoiceFilter] = useState<(typeof VOICE_FILTERS)[number]["key"]>("all");
  const [page, setPage] = useState(0);

  // Always the one fixed onboarding/tour series ("Let Me Show You Around")
  // — undefined while loading, null if it doesn't exist yet (or is still
  // DRAFT and we're not an admin), in which case the section just hides.
  const [onboardingSeries, setOnboardingSeries] = useState<
    SeriesSummary | null | undefined
  >(undefined);

  useEffect(() => {
    fetchOnboardingSeries().then(setOnboardingSeries);
  }, []);

  // At most one series featured at a time — same 404→null, "just hide the
  // section" treatment as onboardingSeries above.
  const [featuredSeries, setFeaturedSeries] = useState<
    FeaturedSeries | null | undefined
  >(undefined);

  useEffect(() => {
    fetchFeaturedSeries().then(setFeaturedSeries);
  }, []);

  // The catalogue's total row count, used only for the section's dek copy
  // ("N series and counting") — fetched once from the plain list endpoint
  // (size=1, we only want totalElements), same trick archive.tsx uses for
  // its editorial count.
  const [seriesTotal, setSeriesTotal] = useState<number | null>(null);

  useEffect(() => {
    fetchSeries(0, 1).then((p) => setSeriesTotal(p.totalElements));
  }, []);

  // The Catalogue — GET /series/catalogue, optionally narrowed to one
  // narrator. Refetches on filter or page change.
  const [catalogue, setCatalogue] = useState<Page<SeriesSummary> | null>(null);
  const [catalogueLoading, setCatalogueLoading] = useState(true);

  useEffect(() => {
    setCatalogueLoading(true);
    fetchSeriesCatalogue(
      page,
      12,
      voiceFilter === "all" ? undefined : (voiceFilter as SeriesVoice),
    )
      .then(setCatalogue)
      .finally(() => setCatalogueLoading(false));
  }, [voiceFilter, page]);

  // Gates the whole page (and its entrance fade-in) behind every section's
  // first load, so nothing pops in piecemeal above the fold — once true it
  // stays true, so a later filter/page change on the catalogue doesn't
  // re-trigger the loading screen.
  const [pageReady, setPageReady] = useState(false);
  useEffect(() => {
    if (
      !pageReady &&
      onboardingSeries !== undefined &&
      featuredSeries !== undefined &&
      seriesTotal !== null &&
      catalogue !== null
    ) {
      setPageReady(true);
    }
  }, [onboardingSeries, featuredSeries, seriesTotal, catalogue, pageReady]);

  if (!pageReady) {
    return (
      <>
        <Navbar />
        <LoadingNotes />
      </>
    );
  }

  return (
    <>
      {/* Entrance transition for the whole page, same treatment as
          series/detail.tsx — held back until pageReady above so it plays
          once, against the fully-loaded page. */}
      <div className="animate-[jazzlogs-fade-up_.6s_ease-out]">
      {/* Title hero — title-series.png IS the page background here, starting
          from above the Navbar (Navbar/dateline/title all render as z-10
          content layered on top of it, not below it). Bleeds to the full
          viewport width (offset for the Sidebar's current width, same
          trick used elsewhere for full-bleed washes). The container's
          height is derived from that same full-bleed width via the
          image's own aspect ratio (1200x960 → ×0.8), so the image always
          renders at its real proportions with nothing cropped off,
          whatever the viewport width happens to be. No dark scrim — the
          plain image only. */}
      <div
        className="relative"
        style={{ height: "calc((100vw - var(--sidebar-width)) * 0.8)" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/series/title-series.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="relative z-10 flex h-full flex-col">
          <Navbar />
          <div className="-mr-5 flex flex-col items-end py-3 text-right sm:-mr-8">
            <div className="font-[family-name:var(--font-fraunces)] text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#F6D013] sm:text-[80px]">
              JazzLogs
              <br />
              Series.
            </div>
            <div className="ml-auto mt-5 max-w-[580px] font-[family-name:var(--font-newsreader)] text-[19px] leading-[1.5] text-white">
              Curated jazz, shaped into stories.
              <br />
              One chapter, one listen,
              <br />
              one new way into the music.
            </div>
          </div>
        </div>
      </div>

      {/* Start here — the one fixed onboarding/tour series, from GET
          /series/onboarding. Hidden entirely once we know there's nothing
          to show (null); nothing rendered while still loading
          (undefined). The cover is the whole point of this card — big and
          square, not squeezed into a side thumbnail like the catalogue
          grid below. */}
      {onboardingSeries && (
        <div className="mt-14">
          <div className="mb-5 text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
            Start here
          </div>
          <Link
            href={`/series/detail?id=${onboardingSeries.id}`}
            className="grid grid-cols-1 items-center gap-9 overflow-hidden rounded-2xl bg-[#2A261C] p-9 text-[#E8DCC0] no-underline md:grid-cols-[440px_1fr]"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:w-[440px]">
              {onboardingSeries.coverImageUrl ? (
                <Image
                  src={onboardingSeries.coverImageUrl}
                  alt={onboardingSeries.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder label="Session cover" />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[52px]">
                {onboardingSeries.title}
              </div>
              {onboardingSeries.dek && (
                <div className="mt-4 max-w-[520px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.82)]">
                  {onboardingSeries.dek}
                </div>
              )}
              {onboardingSeries.styleTags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {onboardingSeries.styleTags.map((tag) => (
                    <span
                      key={tag.code}
                      className="rounded-full border-[1.5px] border-[#F6D013] px-2.5 py-1.5 text-[11px] font-semibold"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-7 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="inline-block self-start rounded-full bg-[#F6D013] px-8 py-4.5 text-[16px] font-bold text-[#1C1A14]">
                    ▸ Start series
                  </span>
                  <div className="scale-[1.6] origin-left">
                    <LikeButton variant="inline" initialCount={onboardingSeries.likeCount} readOnly />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.6)]">
                    Narrated by {onboardingSeries.voice}
                  </span>
                  <div className="relative h-16 w-16 flex-none overflow-hidden rounded-full bg-[#1C1A14] sm:h-20 sm:w-20">
                    <Image
                      src={`/characters/${onboardingSeries.voice.toLowerCase()}.png`}
                      alt={onboardingSeries.voice}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* start-here-series.png as a plain section background, no text on
          top of it — same full-bleed treatment as the title hero above
          (bleeds to the full viewport width, height derived from that
          width via the image's own aspect ratio — 1680x720 → ×(720/1680) —
          so nothing gets cropped). */}
      <div
        className="relative mt-14"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (720 / 1680))" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/series/start-here-series.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>

      {/* Featured — the one admin-curated series, from GET /series/featured.
          Hidden entirely once we know there's nothing to show (null);
          nothing rendered while still loading (undefined). Its chapters
          list is deliberately lean (title/note only, no id/audio/status) —
          just enough for a preview, not the real tracklist. */}
      {featuredSeries && (
        <div className="mt-14">
          <div className="mb-9 text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
            Featured
          </div>
          <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-2xl bg-[#2A261C] text-[#E8DCC0] md:grid-cols-[440px_1fr]">
            <Link
              href={`/series/detail?id=${featuredSeries.id}`}
              className="relative min-h-[300px] no-underline md:min-h-full"
            >
              {featuredSeries.coverImageUrl ? (
                <Image
                  src={featuredSeries.coverImageUrl}
                  alt={featuredSeries.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder label="Session cover" />
              )}
            </Link>
            <div className="flex flex-col justify-center p-9">
              <Link
                href={`/series/detail?id=${featuredSeries.id}`}
                className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#F6D013] no-underline sm:text-[52px]"
              >
                {featuredSeries.title}
              </Link>
              {featuredSeries.dek && (
                <div className="mt-4 max-w-[520px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.82)]">
                  {featuredSeries.dek}
                </div>
              )}
              {featuredSeries.styleTags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {featuredSeries.styleTags.map((tag) => (
                    <span
                      key={tag.code}
                      className="rounded-full border-[1.5px] border-[#F6D013] px-2.5 py-1.5 text-[11px] font-semibold"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
              {featuredSeries.chapters.length > 0 && (
                <div className="mt-6 flex flex-col gap-3 border-t border-[rgba(232,220,192,.15)] pt-5">
                  {featuredSeries.chapters.map((c, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="flex-none font-[family-name:var(--font-dm-sans)] text-[12px] text-[rgba(232,220,192,.45)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        {c.title && (
                          <div className="text-[14px] font-bold">{c.title}</div>
                        )}
                        {c.note && (
                          <div className="mt-0.5 text-[13px] text-[rgba(232,220,192,.65)]">
                            {c.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-7 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/series/detail?id=${featuredSeries.id}`}
                    className="inline-block self-start rounded-full bg-[#F6D013] px-8 py-4.5 text-[16px] font-bold text-[#1C1A14] no-underline"
                  >
                    ▸ Start series
                  </Link>
                  <div className="scale-[1.6] origin-left">
                    <LikeButton variant="inline" initialCount={featuredSeries.likeCount} readOnly />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.6)]">
                    Narrated by {featuredSeries.voice}
                  </span>
                  <div className="relative h-16 w-16 flex-none overflow-hidden rounded-full bg-[#1C1A14] sm:h-20 sm:w-20">
                    <Image
                      src={`/characters/${featuredSeries.voice.toLowerCase()}.png`}
                      alt={featuredSeries.voice}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* banner-series.png as a plain section background, same full-bleed
          treatment as the others — 2944x1648 → ×(1648/2944), nothing
          cropped. */}
      <div
        className="relative mt-14"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (1648 / 2944))" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/series/banner-series.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>

      {/* Meet the narrators — one portrait + name per voice, 4 to a row
          (wraps to a second row of 4 for the 8 we have). */}
      <div className="mt-14">
        <div className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[56px]">
          Meet the narrators
        </div>
        <div className="mt-4 max-w-[560px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.75)]">
          Eight voices, each with their own read on the music — pick the series by the story
          you want, or the narrator you want to hear it from.
        </div>
        <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
          {NARRATORS.map((n) => (
            <div key={n.name} className="flex flex-col items-center text-center">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src={`/series/narrators/${n.file}-narrator.png`}
                  alt={n.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="mt-3 font-[family-name:var(--font-fraunces)] text-[20px] font-extrabold tracking-[-.02em] text-[#E8DCC0]">
                {n.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* banner2-series.png as a plain section background, same full-bleed
          treatment as banner-series.png above — 2944x1648 →
          ×(1648/2944), nothing cropped. */}
      <div
        className="relative mt-14"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (1648 / 2944))" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/series/banner2-series.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>

      {/* The Catalogue — GET /series/catalogue, every series (optionally one
          narrator's), same title+dek treatment as the sections above. */}
      <div className="mt-14 border-t-[1.5px] border-[#F6D013] pt-9">
        <div className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[56px]">
          The Catalogue
        </div>
        <div className="mt-4 max-w-[560px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.75)]">
          Every series we&rsquo;ve made, browsable by narrator.{" "}
          {seriesTotal ?? 0} series, and counting.
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {VOICE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setVoiceFilter(f.key);
              setPage(0);
            }}
            className={
              "rounded-full border-[1.5px] border-[#F6D013] px-4 py-2.5 text-[13px] font-semibold " +
              (voiceFilter === f.key ? "bg-[#F6D013] text-[#1C1A14]" : "text-[#E8DCC0]")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {catalogueLoading ? (
        <LoadingNotes
          compact
          messages={[
            "Cueing the next chapter…",
            "Checking the liner notes…",
            "Tuning up…",
          ]}
        />
      ) : catalogue && catalogue.content.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.content.map((s) => (
              <Link
                key={s.id}
                href={`/series/detail?id=${s.id}`}
                className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#F6D013] no-underline"
              >
                <div className="relative aspect-[16/10]">
                  {s.coverImageUrl ? (
                    <Image
                      src={s.coverImageUrl}
                      alt={s.title}
                      fill
                      unoptimized
                      className="object-cover object-top"
                    />
                  ) : (
                    <ImagePlaceholder label="Cover" />
                  )}
                  <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-[#2A261C] px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[9.5px] font-bold uppercase tracking-[.12em] text-[#F6D013]">
                    {s.voice}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 px-5 py-4.5">
                  <div className="font-[family-name:var(--font-fraunces)] text-[24px] leading-[.98] font-extrabold tracking-[-.03em]">
                    {s.title}
                  </div>
                  {s.dek && (
                    <div className="flex-1 font-[family-name:var(--font-newsreader)] text-[13.5px] leading-[1.45] text-[rgba(232,220,192,.72)]">
                      {s.dek}
                    </div>
                  )}
                  {s.styleTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {s.styleTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.code}
                          className="rounded-full border-[1.5px] border-[#F6D013] px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[9px] font-bold uppercase tracking-[.1em] text-[#F6D013]"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-1 text-[12px] font-bold">Start series →</div>
                </div>
              </Link>
            ))}
          </div>
          <Pager
            page={catalogue.number}
            pageCount={catalogue.totalPages}
            onChange={setPage}
          />
        </>
      ) : (
        <div className="mt-5 border-[1.5px] border-dashed border-[rgba(232,220,192,.4)] p-14 text-center">
          <div className="font-[family-name:var(--font-fraunces)] text-[26px] font-extrabold tracking-[-.02em]">
            No sessions here yet.
          </div>
          <div className="mt-2.5 text-[15px] text-[rgba(232,220,192,.65)]">
            Nothing matches that filter — try another narrator, or browse them all.
          </div>
        </div>
      )}

      {/* banner3-series.png as a full-bleed section background, same
          treatment as the others — 3376x1440 → ×(1440/3376), nothing
          cropped — with a "become a member" CTA laid over its top-right
          corner, since series are paid content. No href yet — there's no
          membership/billing page in the app to send it to. */}
      <div
        className="relative mt-14"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (1440 / 3376))" }}
      >
        <div className="absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/series/banner3-series.png"
            alt=""
            fill
            unoptimized
            className="pointer-events-none object-cover"
          />
          <div className="absolute top-6 right-8 z-10 flex flex-col items-center gap-3 text-center sm:top-12 sm:right-16">
            <span className="font-[family-name:var(--font-fraunces)] text-[28px] leading-[.92] font-extrabold tracking-[-.04em] text-[#F6D013] drop-shadow-[0_2px_6px_rgba(0,0,0,.55)] sm:text-[40px]">
              Join the team
            </span>
            <button
              type="button"
              className="rounded-full bg-[#F6D013] px-5 py-2.5 text-[12.5px] font-bold text-[#1C1A14] sm:px-6 sm:py-3.5 sm:text-[14px]"
            >
              Become a member
            </button>
          </div>
        </div>
      </div>
      </div>

      <Footer />
    </>
  );
}
