"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import EmptyState from "@/components/app/EmptyState";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import LoadingNotes from "@/components/app/LoadingNotes";
import Pager from "@/components/app/Pager";
import { ApiError, type Page } from "@/lib/api";
import { fetchFeaturedTracks, type FeaturedTrack } from "@/lib/albums";
import { extractAverageColor, brighten, mixWithBase } from "@/lib/colorTint";
import {
  fetchEditorials,
  fetchFeaturedEditorial,
  fetchLastLog,
  fetchRecentAlbumEditorials,
  type CatalogueEditorial,
  type EditorialOwnerType,
  type EditorialSummary,
  type LastLogAlbumEditorial,
  type RecentAlbumEditorial,
} from "@/lib/editorials";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "album", label: "Albums" },
  { key: "artist", label: "Artists" },
  { key: "track", label: "Tracks" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const PAGE_SIZE = 6;

function filterToType(filter: FilterKey): EditorialOwnerType | undefined {
  return filter === "all"
    ? undefined
    : (filter.toUpperCase() as EditorialOwnerType);
}

function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function editorialHref(e: {
  type: EditorialOwnerType;
  ownerId: string;
  contextId: string | null;
}): string {
  if (e.type === "ARTIST") return `/editorial/artist?id=${e.ownerId}`;
  // A track editorial lives inside its album's page, anchored at that
  // track's section — contextId is the containing album's id (ownerId here
  // is the track's own id, which the album page can't do anything with).
  if (e.type === "TRACK" && e.contextId) {
    return `/editorial/album?id=${e.contextId}#track-${e.ownerId}`;
  }
  return `/editorial/album?id=${e.ownerId}`;
}

function Cover({
  e,
  className,
}: {
  e: { ownerImageUrl: string | null; ownerName: string };
  className?: string;
}) {
  if (!e.ownerImageUrl) return <ImagePlaceholder className={className} />;
  return (
    <div
      className={"relative overflow-hidden " + (className ?? "h-full w-full")}
    >
      <Image
        src={e.ownerImageUrl}
        alt={e.ownerName}
        fill
        unoptimized
        // Slight zoom crops out the thin white border some Spotify cover art
        // has baked into the file itself — not something CSS alone can fix.
        className="scale-[1.06] object-cover"
      />
    </div>
  );
}

// The card's own resting color (`#2a2621` → rgb(42, 38, 33)) nudged toward the
// section's tint by `ratio` — a light wash, not a repaint, so the card still
// reads as "the same card" rather than switching to the cover's color.
const CARD_BASE: [number, number, number] = [42, 38, 33];
function mixWithCardBase(rgb: string, ratio: number): string {
  return mixWithBase(rgb, CARD_BASE, ratio);
}

export default function ArchivePage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const [featured, setFeatured] = useState<EditorialSummary | null | undefined>(
    undefined,
  );
  const [lastLog, setLastLog] = useState<
    LastLogAlbumEditorial | null | undefined
  >(undefined);
  const [recentlyFiled, setRecentlyFiled] = useState<
    RecentAlbumEditorial[] | null
  >(null);
  const [featuredTracks, setFeaturedTracks] = useState<
    FeaturedTrack[] | null
  >(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [grid, setGrid] = useState<Page<CatalogueEditorial> | null>(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // OR, not AND — the page should keep showing the loading state as long as
  // ANY of these hasn't resolved yet, not only while none of them have.
  const initialLoading =
    featured === undefined ||
    lastLog === undefined ||
    recentlyFiled === null ||
    featuredTracks === null ||
    grid === null;

  const [featuredColor, setFeaturedColor] = useState<string | null>(null);
  const [spotlightColor, setSpotlightColor] = useState<string | null>(null);

  // Pull the ambient tint color once, off each section's own cover — not
  // re-run on every render, just when the image itself changes.
  useEffect(() => {
    if (!featured?.ownerImageUrl) return;
    let cancelled = false;
    extractAverageColor(featured.ownerImageUrl).then((color) => {
      if (!cancelled) setFeaturedColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [featured?.ownerImageUrl]);

  useEffect(() => {
    if (!lastLog?.imageUrl) return;
    let cancelled = false;
    extractAverageColor(lastLog.imageUrl).then((color) => {
      if (!cancelled) setSpotlightColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [lastLog?.imageUrl]);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGridLoading(true);
      setQ(qInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [qInput]);

  useEffect(() => {
    fetchFeaturedEditorial()
      .then(setFeatured)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        ),
      );
  }, []);

  useEffect(() => {
    fetchEditorials({ size: 1 })
      .then((p) => setTotalCount(p.totalElements))
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        ),
      );
  }, []);

  useEffect(() => {
    fetchRecentAlbumEditorials()
      .then(setRecentlyFiled)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        ),
      );
  }, []);

  useEffect(() => {
    fetchFeaturedTracks()
      .then(setFeaturedTracks)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        ),
      );
  }, []);

  // The last log is the most recently published ALBUM editorial — not the
  // curated "featured" one (that's a separate, admin-picked flag and could
  // be an older piece). Independent of `featured` entirely.
  useEffect(() => {
    fetchLastLog()
      .then(setLastLog)
      .catch(() => setLastLog(null));
  }, []);

  useEffect(() => {
    fetchEditorials({
      type: filterToType(filter),
      q,
      page,
      size: PAGE_SIZE,
      sort: "title,asc",
    })
      .then(setGrid)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        ),
      )
      .finally(() => setGridLoading(false));
  }, [filter, q, page]);

  // Always an infinite carousel, however many editorials came back (capped at
  // 10 by the fetch above) — the items list is duplicated so the strip has a
  // second copy to scroll into once the first one clears the viewport.
  const marqueeItems = useMemo(
    () => (recentlyFiled ? [...recentlyFiled, ...recentlyFiled] : []),
    [recentlyFiled],
  );

  // Always the section's own color once it's known — no scroll-linked
  // blending here, just the (lightened, for legibility) tint itself.
  const featuredTextColor = featuredColor
    ? brighten(featuredColor, 0.55)
    : "#d99b10";
  const spotlightTextColor = spotlightColor
    ? brighten(spotlightColor, 0.55)
    : "#d99b10";

  return (
    <>
      <Navbar />

      <div className="flex justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <span>The full editorial archive</span>
      </div>

      <div className="pt-11 pb-2.5">
        <div className="text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[92px]">
          Editorials.
        </div>
        <div className="mt-5 max-w-[600px] text-[19px] leading-[1.5] text-[rgba(233,230,223,.72)]">
          Every album, artist and track we&rsquo;ve written up — the long-form
          record behind the daily log. {totalCount ?? 0} editorials, and
          counting.
        </div>
      </div>

      {error && (
        <div className="mt-5 border-[1.5px] border-dashed border-[rgba(233,230,223,.4)] p-5 text-sm text-[rgba(233,230,223,.65)]">
          {error}
        </div>
      )}

      {initialLoading ? (
        <LoadingNotes
          messages={[
            "Cueing the record…",
            "Dusting off the crates…",
            "Pulling the last log…",
            "Checking the liner notes…",
            "Cross-referencing the catalog…",
            "Counting off…",
          ]}
        />
      ) : (
        <div className="animate-[jazzlogs-fade-up_.6s_ease-out]">
          {/* Lead */}
          {featured && (
            <div className="relative mt-8 py-12">
              {/* No page-wide ambient wash — just the page's usual dark
                  background out here. The dynamic, per-cover color lives
                  only on the card itself (its background tint and text
                  color below). */}
              <div className="mb-4 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
                FEATURED
              </div>
              <div
                className="relative z-10 grid min-h-[440px] grid-cols-1 items-center gap-11 rounded-[18px] bg-[#2a2621] p-11 text-[#e9e6df] md:grid-cols-[1fr_300px]"
                style={{
                  backgroundColor: featuredColor
                    ? mixWithCardBase(featuredColor, 0.4)
                    : undefined,
                }}
              >
                <Link
                  href={editorialHref(featured)}
                  className="absolute inset-0 z-0"
                  aria-label={featured.title}
                />
                <div className="pointer-events-none relative z-[1] flex h-full flex-col justify-between">
                  <div className="flex items-center gap-3.5 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium tracking-[.12em] text-[rgba(233,230,223,.6)]">
                    <span style={{ color: featuredTextColor }}>
                      {featured.type} EDITORIAL
                    </span>
                    {featured.releaseYear != null && (
                      <>
                        <span>·</span>
                        <span>{featured.releaseYear}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-7">
                    <div
                      className="text-balance text-[42px] leading-[.92] font-extrabold tracking-[-.045em] sm:text-[62px]"
                      style={{ color: featuredTextColor }}
                    >
                      {featured.title}
                    </div>
                    <div className="mt-2.5 text-[15px] font-semibold text-[rgba(233,230,223,.7)]">
                      {featured.ownerName}
                      {featured.contextName ? ` · ${featured.contextName}` : ""}
                    </div>
                    {featured.dek && (
                      <div className="mt-[18px] max-w-[560px] text-[17px] leading-[1.55] text-[rgba(233,230,223,.82)]">
                        {featured.dek}
                      </div>
                    )}
                    {featured.previewText && (
                      <div className="mt-5 max-w-[560px] border-t border-[rgba(233,230,223,.14)] pt-4">
                        <div className="line-clamp-5 text-[14px] leading-[1.65] font-normal text-[rgba(233,230,223,.5)] italic">
                          {featured.previewText}
                        </div>
                      </div>
                    )}
                    <div className="mt-[18px] inline-block">
                      <LikeButton
                        initialCount={featured.likeCount}
                        initialLiked={featured.likedByCurrentUser}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-7 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                    {featured.byline ? `${featured.byline} · ` : ""}
                    {formatDate(featured.createdAt)}
                  </div>
                </div>
                <div className="relative z-[1] h-[300px] w-full overflow-hidden rounded-[14px] md:w-[300px]">
                  <Cover e={featured} />
                </div>
              </div>
            </div>
          )}

          {/* Featured tracks — admin-curated, up to 6 at a time */}
          {featuredTracks && (
            <>
              <div className="mt-8 flex items-baseline justify-between">
                <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
                  FEATURED TRACKS
                </span>
              </div>
              {featuredTracks.length === 0 ? (
                <div className="mt-6 flex justify-center">
                  <div
                    className="flex max-w-[300px] flex-col gap-2.5 rounded-[3px] bg-[#ddc373] p-6 text-center text-[#1c1b18] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
                    style={{ transform: "rotate(-1.4deg)" }}
                  >
                    <div className="text-[18px] leading-[1.15] font-extrabold tracking-[-.02em]">
                      No featured tracks yet.
                    </div>
                    <p className="m-0 text-[13.5px] leading-[1.5] font-medium text-[rgba(28,27,24,.75)]">
                      Nothing tagged as Featured just yet — check back later.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {featuredTracks.map((t) => (
                    <Link
                      key={t.id}
                      href={`/editorial/album?id=${t.albumId}`}
                      className="relative z-10 flex flex-col overflow-hidden rounded-2xl border border-[rgba(233,230,223,.15)] bg-[rgba(233,230,223,.03)] no-underline transition-colors hover:border-[#d99b10] hover:bg-[rgba(217,155,16,.05)]"
                    >
                      <div className="relative h-[180px] w-full overflow-hidden bg-[#2a2621]">
                        <Cover
                          e={{ ownerImageUrl: t.imageUrl, ownerName: t.trackName }}
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.12em] text-[rgba(233,230,223,.5)]">
                          {t.trackName} · {t.albumName}
                        </div>
                        <div className="text-balance mt-2.5 text-[19px] leading-[1.1] font-extrabold tracking-[-.03em] text-[#e9e6df]">
                          {t.title}
                        </div>
                        {t.dek && (
                          <div className="mt-2 line-clamp-3 text-[13px] leading-[1.5] text-[rgba(233,230,223,.62)]">
                            {t.dek}
                          </div>
                        )}
                        <div className="mt-auto flex items-center justify-between gap-3 pt-4 font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.45)]">
                          <span className="flex items-center gap-2">
                            {t.byline ? `${t.byline} · ` : ""}
                            {formatDate(t.createdAt)}
                            {t.logNumber && (
                              <span className="text-[#d99b10]">
                                LOG #{t.logNumber}
                              </span>
                            )}
                          </span>
                          <LikeButton
                            variant="inline"
                            initialCount={t.likeCount}
                            initialLiked={t.likedByCurrentUser}
                            readOnly
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* The Last Log — spotlight on the most recent album editorial */}
          {lastLog && (
            <div className="relative mt-4 py-12">
              {/* No page-wide ambient wash — just the page's usual dark
                  background out here. The dynamic, per-cover color lives
                  only on the card itself (its background tint and text
                  color below). */}
              <div className="flex items-baseline justify-between">
                <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
                  THE LAST LOG
                </span>
              </div>
              <div
                className="relative z-10 mt-4 overflow-hidden rounded-[18px] bg-[#2a2621]"
                style={{
                  backgroundColor: spotlightColor
                    ? mixWithCardBase(spotlightColor, 0.4)
                    : undefined,
                }}
              >
                <div className="relative grid grid-cols-1 items-center gap-11 p-11 md:grid-cols-[1fr_360px]">
                  <Link
                    href={`/editorial/album?id=${lastLog.id}`}
                    className="absolute inset-0 z-0"
                    aria-label={lastLog.title}
                  />
                  <div className="pointer-events-none relative z-[1]">
                    <div className="flex items-center gap-3 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium tracking-[.14em] text-[rgba(233,230,223,.6)]">
                      <span style={{ color: spotlightTextColor }}>
                        ALBUM EDITORIAL
                      </span>
                      {lastLog.releaseYear != null && (
                        <>
                          <span>·</span>
                          <span>{lastLog.releaseYear}</span>
                        </>
                      )}
                    </div>
                    <div
                      className="text-balance mt-4 text-[44px] leading-[.9] font-extrabold tracking-[-.045em] sm:text-[62px]"
                      style={{ color: spotlightTextColor }}
                    >
                      {lastLog.title}
                    </div>
                    <div className="mt-3 text-[15px] font-semibold text-[rgba(233,230,223,.7)]">
                      {lastLog.artistName}
                    </div>
                    {lastLog.dek && (
                      <div className="mt-4 max-w-[560px] text-[17px] leading-[1.55] text-[rgba(233,230,223,.82)]">
                        {lastLog.dek}
                      </div>
                    )}
                    <div className="mt-[18px]">
                      <LikeButton
                        variant="inline"
                        initialCount={lastLog.likeCount}
                        initialLiked={lastLog.likedByCurrentUser}
                        readOnly
                      />
                    </div>
                    <div className="mt-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.5)]">
                      {lastLog.byline ? `${lastLog.byline} · ` : ""}
                      {lastLog.postedAt ? formatDate(lastLog.postedAt) : ""}
                    </div>
                  </div>
                  <div className="relative z-[1] h-[360px] w-full overflow-hidden rounded-[14px] md:w-[360px]">
                    {lastLog.imageUrl ? (
                      <Image
                        src={lastLog.imageUrl}
                        alt={lastLog.title}
                        fill
                        unoptimized
                        className="scale-[1.06] object-cover"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>
                </div>

                {lastLog.tracks.length > 0 && (
                  <div className="px-6 pt-1 pb-7 sm:px-11">
                    <div className="pb-1 font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.2em]" style={{ color: spotlightTextColor }}>
                      Track editorials
                    </div>
                    <div className="-mx-3 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-[36px]">
                      {lastLog.tracks.map((t) => (
                        <Link
                          key={t.id}
                          href={`/editorial/album?id=${lastLog.id}`}
                          className="grid grid-cols-[36px_1fr] items-baseline gap-4 border-b border-[rgba(233,230,223,.18)] px-3 py-[18px] no-underline transition-colors hover:bg-[rgba(233,230,223,.06)]"
                        >
                          <span
                            className="font-[family-name:var(--font-dm-mono)] text-[12px]"
                            style={{ color: spotlightTextColor }}
                          >
                            {String(t.trackNumber ?? 0).padStart(2, "0")}
                          </span>
                          <div>
                            <div className="flex items-baseline justify-between gap-3">
                              <div
                                className="text-balance text-[21px] leading-[1.05] font-extrabold tracking-[-.03em]"
                                style={{ color: spotlightTextColor }}
                              >
                                {t.title}
                              </div>
                              <LikeButton
                                variant="inline"
                                initialCount={t.likeCount}
                                initialLiked={t.likedByCurrentUser}
                                readOnly
                              />
                            </div>
                            {t.dek && (
                              <div className="mt-1.5 text-[12.5px] leading-[1.45] text-[rgba(233,230,223,.6)]">
                                {t.dek}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recently filed — auto-scrolling strip */}
          {recentlyFiled && recentlyFiled.length > 0 && (
            <>
              <div className="mt-8 flex items-baseline justify-between">
                <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
                  Recently filed
                </span>
              </div>
              <div className="mt-[22px] overflow-hidden">
                <div className="flex w-max animate-[jazzlogs-marquee_44s_linear_infinite] gap-5 hover:[animation-play-state:paused]">
                  {marqueeItems.map((e, i) => (
                    <div
                      key={`${e.id}-${i}`}
                      className="relative z-10 w-[320px] flex-none overflow-hidden rounded-2xl border border-[rgba(233,230,223,.22)] transition-colors hover:border-[#d99b10] hover:bg-[rgba(217,155,16,.05)]"
                    >
                      <Link
                        href={`/editorial/album?id=${e.albumId}`}
                        className="absolute inset-0 z-0"
                        aria-label={e.title}
                      />
                      <div className="pointer-events-none relative h-[200px] overflow-hidden bg-[#2a2621]">
                        <Cover
                          e={{ ownerImageUrl: e.imageUrl, ownerName: e.albumName }}
                        />
                      </div>
                      <div className="relative z-[1] flex min-h-[210px] flex-col gap-4 p-6">
                        <div className="pointer-events-none">
                          <div className="text-balance text-[27px] leading-[.98] font-extrabold tracking-[-.04em]">
                            {e.title}
                          </div>
                          <div className="mt-2 text-[13px] font-semibold text-[rgba(233,230,223,.6)]">
                            {e.albumName} · {e.artistName}
                          </div>
                          {e.dek && (
                            <div className="mt-3 text-[13px] leading-[1.5] text-[rgba(233,230,223,.62)]">
                              {e.dek}
                            </div>
                          )}
                        </div>
                        <div className="mt-auto flex items-center justify-between font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.45)]">
                          <span className="pointer-events-none">
                            {e.byline}
                          </span>
                          <span className="pointer-events-none flex items-center gap-3">
                            {e.logNumber && (
                              <span className="text-[#d99b10]">
                                LOG #{e.logNumber}
                              </span>
                            )}
                            <LikeButton
                              variant="inline"
                              initialCount={e.likeCount}
                              initialLiked={e.likedByCurrentUser}
                              readOnly
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* The Catalogue */}
          <div className="mt-10 flex items-baseline justify-between">
            <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
              {filter === "all"
                ? "The catalogue"
                : FILTERS.find((f) => f.key === filter)?.label}
            </span>
          </div>

          <div className="mt-[26px] flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-7">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setGridLoading(true);
                    setFilter(f.key);
                    setPage(0);
                  }}
                  className={
                    "border-b-2 pb-[7px] text-[14px] font-semibold tracking-[-.01em] " +
                    (filter === f.key
                      ? "border-[#d99b10] text-[#d99b10]"
                      : "border-transparent text-[rgba(233,230,223,.5)]")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex min-w-[260px] items-center gap-2.5 border-b-[1.5px] border-[rgba(233,230,223,.3)] px-0.5 py-[7px]">
              <span className="font-[family-name:var(--font-dm-mono)] text-[14px] text-[rgba(233,230,223,.45)]">
                ⌕
              </span>
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search the catalogue…"
                className="flex-1 border-none bg-transparent text-[14px] font-medium text-[#e9e6df] outline-none placeholder:text-[rgba(233,230,223,.4)]"
              />
            </div>
          </div>

          {gridLoading ? (
            <LoadingNotes
              compact
              messages={[
                "Flipping through the crates…",
                "Checking the index card…",
                "Cross-referencing the catalog…",
                "Running down the back catalog…",
              ]}
            />
          ) : grid && grid.content.length > 0 ? (
            <div className="mt-6 animate-[jazzlogs-fade-up_.5s_ease-out] border-t-[1.5px] border-[#d99b10]">
              {grid.content.map((e) => {
                return (
                  <div
                    key={e.id}
                    className="relative border-b border-[rgba(233,230,223,.15)] transition-colors hover:bg-[rgba(217,155,16,.06)]"
                  >
                    <Link
                      href={editorialHref(e)}
                      className="absolute inset-0 z-0"
                      aria-label={e.title}
                    />
                    <div className="grid grid-cols-1 items-center gap-6 p-[18px] sm:grid-cols-[240px_1fr_190px] sm:gap-[34px] sm:p-[26px_14px]">
                      <div className="pointer-events-none relative h-[160px] w-full overflow-hidden rounded-xl bg-[#2a2621] sm:h-[240px] sm:w-[240px]">
                        <Cover e={e} />
                      </div>
                      <div className="pointer-events-none">
                        <div className="text-balance text-[26px] leading-[.96] font-extrabold tracking-[-.042em] sm:text-[34px]">
                          {e.title}
                        </div>
                        <div className="mt-2.5 text-[13px] font-semibold text-[rgba(233,230,223,.6)]">
                          {e.ownerName}
                          {e.contextName ? ` · ${e.contextName}` : ""}
                        </div>
                        {e.dek && (
                          <div className="mt-3 max-w-[580px] text-[14px] leading-[1.55] text-[rgba(233,230,223,.64)]">
                            {e.dek}
                          </div>
                        )}
                      </div>
                      <div className="pointer-events-none flex flex-row flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:text-right">
                        <span className="rounded border border-[rgba(233,230,223,.28)] px-[7px] py-1 font-[family-name:var(--font-dm-mono)] text-[9px] font-medium tracking-[.14em] text-[rgba(233,230,223,.5)]">
                          {e.type}
                        </span>
                        {e.byline && (
                          <span className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.5)]">
                            {e.byline}
                          </span>
                        )}
                        <span className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.4)]">
                          {formatDate(e.createdAt)}
                        </span>
                        {/* null for ARTIST editorials — an artist doesn't
                            belong to one album's catalog number. */}
                        {e.logNumber && (
                          <span className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium tracking-[.1em] text-[#d99b10]">
                            LOG #{e.logNumber}
                          </span>
                        )}
                        <span className="mt-0.5">
                          <LikeButton
                            variant="inline"
                            initialCount={e.likeCount}
                            initialLiked={e.likedByCurrentUser}
                            readOnly
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : grid ? (
            <EmptyState
              className="mt-6"
              title="Nothing filed under that."
              subtitle="No sides cut under this filter yet — try another cut, or ask the agent to lay one down."
            />
          ) : (
            <EmptyState
              className="mt-6"
              title="Dead air."
              subtitle="Nothing's spinning right now — give it a refresh."
            />
          )}

          {grid && grid.content.length > 0 && (
            <Pager
              page={grid.number}
              pageCount={grid.totalPages}
              onChange={(p) => {
                setGridLoading(true);
                setPage(p);
              }}
            />
          )}
        </div>
      )}

      <Footer />
    </>
  );
}
