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
import { fetchAlbumSpotlight, type AlbumSpotlight } from "@/lib/albums";
import {
  fetchEditorials,
  fetchFeaturedEditorial,
  type EditorialOwnerType,
  type EditorialSummary,
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

function editorialHref(e: { type: EditorialOwnerType }): string {
  return e.type === "ARTIST" ? "/editorial/artist" : "/editorial/album";
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

export default function ArchivePage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const [featured, setFeatured] = useState<EditorialSummary | null | undefined>(
    undefined,
  );
  const [spotlight, setSpotlight] = useState<AlbumSpotlight | null | undefined>(
    undefined,
  );
  const [recentlyFiled, setRecentlyFiled] = useState<EditorialSummary[] | null>(
    null,
  );
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [grid, setGrid] = useState<Page<EditorialSummary> | null>(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchEditorials({ type: "ALBUM", size: 8 })
      .then((p) => setRecentlyFiled(p.content))
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        ),
      );
  }, []);

  // The spotlight is the most recently published ALBUM editorial — not the
  // curated "featured" one (that's a separate, admin-picked flag and could
  // be an older piece). Independent of `featured` entirely: find the latest
  // album editorial, then pull the lean /spotlight teaser for that album
  // (title/dek/byline + which tracks have their own editorial).
  useEffect(() => {
    fetchEditorials({ type: "ALBUM", size: 1 })
      .then((p) => p.content[0]?.ownerId)
      .then((albumId) => (albumId ? fetchAlbumSpotlight(albumId) : null))
      .then(setSpotlight)
      .catch(() => setSpotlight(null));
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

  // A marquee only reads as one with enough cards to make a full, seamless
  // lap — with just a couple, duplicating them still leaves it looking like
  // it's stuttering between two near-empty copies, so fall back to a plain
  // static row instead.
  const enoughForMarquee = (recentlyFiled?.length ?? 0) >= 6;
  const marqueeItems = useMemo(
    () =>
      recentlyFiled && enoughForMarquee
        ? [...recentlyFiled, ...recentlyFiled]
        : (recentlyFiled ?? []),
    [recentlyFiled, enoughForMarquee],
  );

  // OR, not AND — the page should keep showing the loading state as long as
  // ANY of these hasn't resolved yet, not only while none of them have.
  const initialLoading =
    featured === undefined ||
    spotlight === undefined ||
    recentlyFiled === null ||
    grid === null;

  return (
    <>
      <Navbar active="Editorials" />

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
            <>
              <div className="mt-10 mb-4 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
                FEATURED
              </div>
              <div className="relative grid min-h-[440px] grid-cols-1 items-center gap-11 rounded-[18px] bg-[#2a2621] p-11 text-[#e9e6df] md:grid-cols-[1fr_300px]">
                <Link
                  href={editorialHref(featured)}
                  className="absolute inset-0 z-0"
                  aria-label={featured.title}
                />
                <div className="pointer-events-none relative z-[1] flex h-full flex-col justify-between">
                  <div className="flex items-center gap-3.5 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium tracking-[.12em] text-[rgba(233,230,223,.6)]">
                    <span className="text-[#d99b10]">
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
                    <div className="text-balance text-[42px] leading-[.92] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[62px]">
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
                      <div className="relative mt-5 max-h-[130px] max-w-[560px] overflow-hidden border-t border-[rgba(233,230,223,.14)] pt-4">
                        <div className="text-[14px] leading-[1.65] font-normal text-[rgba(233,230,223,.5)] italic">
                          {featured.previewText}
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#2a2621] via-[#2a2621]/70 via-40% to-transparent" />
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
            </>
          )}

          {/* The Last Log — spotlight on the album behind the featured piece */}
          {spotlight && (
            <>
              <div className="mt-19 flex items-baseline justify-between">
                <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
                  THE LAST LOG
                </span>
              </div>
              <div className="mt-4 overflow-hidden rounded-[18px] bg-[#2a2621]">
                <Link href="/editorial/album" className="block no-underline">
                  <div className="relative h-[220px] w-full overflow-hidden sm:h-[320px]">
                    {spotlight.imageUrl ? (
                      <Image
                        src={spotlight.imageUrl}
                        alt={spotlight.name}
                        fill
                        unoptimized
                        className="scale-[1.06] object-cover"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>
                  <div className="p-6 sm:p-11">
                    <div className="flex items-center gap-3 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium tracking-[.14em] text-[rgba(233,230,223,.6)]">
                      <span className="text-[#d99b10]">ALBUM EDITORIAL</span>
                      {spotlight.releaseYear != null && (
                        <>
                          <span>·</span>
                          <span>{spotlight.releaseYear}</span>
                        </>
                      )}
                    </div>
                    <div className="text-balance mt-4 text-[44px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[72px]">
                      {spotlight.editorialTitle ?? spotlight.name}
                    </div>
                    <div className="mt-3 text-[15px] font-semibold text-[rgba(233,230,223,.7)]">
                      {spotlight.artistName}
                    </div>
                    {spotlight.editorialDek && (
                      <div className="mt-4 max-w-[640px] text-[17px] leading-[1.55] text-[rgba(233,230,223,.82)]">
                        {spotlight.editorialDek}
                      </div>
                    )}
                    <div className="mt-[18px]">
                      <LikeButton
                        variant="inline"
                        initialCount={spotlight.editorialLikeCount}
                        initialLiked={spotlight.editorialLikedByCurrentUser}
                        readOnly
                      />
                    </div>
                    <div className="mt-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.5)]">
                      {spotlight.editorialByline
                        ? `${spotlight.editorialByline} · `
                        : ""}
                      {spotlight.postedAt ? formatDate(spotlight.postedAt) : ""}
                    </div>
                  </div>
                </Link>

                {spotlight.tracks.length > 0 && (
                  <div className="border-t border-[rgba(233,230,223,.16)] px-6 pt-5 pb-7 sm:px-11">
                    <div className="pb-1 font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.45)]">
                      Track editorials
                    </div>
                    <div className="-mx-3 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-[36px]">
                      {spotlight.tracks.map((t) => (
                        <Link
                          key={t.id}
                          href="/editorial/album"
                          className="grid grid-cols-[36px_1fr] items-baseline gap-4 border-b border-[rgba(233,230,223,.14)] px-3 py-[18px] no-underline transition-colors hover:bg-[rgba(217,155,16,.08)]"
                        >
                          <span className="font-[family-name:var(--font-dm-mono)] text-[12px] text-[rgba(217,155,16,.85)]">
                            {String(t.trackNumber ?? 0).padStart(2, "0")}
                          </span>
                          <div>
                            <div className="flex items-baseline justify-between gap-3">
                              <div className="text-balance text-[21px] leading-[1.05] font-extrabold tracking-[-.03em]">
                                {t.editorialTitle}
                              </div>
                              <LikeButton
                                variant="inline"
                                initialCount={t.editorialLikeCount}
                                initialLiked={t.editorialLikedByCurrentUser}
                                readOnly
                              />
                            </div>
                            {t.editorialDek && (
                              <div className="mt-1.5 text-[12.5px] leading-[1.45] text-[rgba(233,230,223,.6)]">
                                {t.editorialDek}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Recently filed — auto-scrolling strip */}
          {recentlyFiled && recentlyFiled.length > 0 && (
            <>
              <div className="mt-19 flex items-baseline justify-between">
                <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[rgba(233,230,223,.55)]">
                  Recently filed
                </span>
              </div>
              <div
                className={
                  enoughForMarquee
                    ? "mt-[22px] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_97%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_3%,#000_97%,transparent)]"
                    : "mt-[22px]"
                }
              >
                <div
                  className={
                    "flex gap-5 " +
                    (enoughForMarquee
                      ? "w-max animate-[jazzlogs-marquee_44s_linear_infinite] hover:[animation-play-state:paused]"
                      : "flex-wrap")
                  }
                >
                  {marqueeItems.map((e, i) => (
                    <div
                      key={`${e.id}-${i}`}
                      className="relative w-[320px] flex-none overflow-hidden rounded-2xl border border-[rgba(233,230,223,.22)] transition-colors hover:border-[#d99b10] hover:bg-[rgba(217,155,16,.05)]"
                    >
                      <Link
                        href={editorialHref(e)}
                        className="absolute inset-0 z-0"
                        aria-label={e.title}
                      />
                      <div className="pointer-events-none relative h-[200px] overflow-hidden bg-[#2a2621]">
                        <Cover e={e} />
                      </div>
                      <div className="relative z-[1] flex min-h-[210px] flex-col gap-4 p-6">
                        <div className="pointer-events-none">
                          <div className="text-balance text-[27px] leading-[.98] font-extrabold tracking-[-.04em]">
                            {e.title}
                          </div>
                          <div className="mt-2 text-[13px] font-semibold text-[rgba(233,230,223,.6)]">
                            {e.ownerName}
                            {e.contextName ? ` · ${e.contextName}` : ""}
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
                          <span className="pointer-events-none">
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
          <div className="mt-22 flex items-baseline justify-between">
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
              {grid.content.map((e, i) => {
                const logNumber =
                  grid.totalElements - (grid.number * grid.size + i);
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
                        <span className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium tracking-[.1em] text-[#d99b10]">
                          LOG #{String(logNumber).padStart(3, "0")}
                        </span>
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
