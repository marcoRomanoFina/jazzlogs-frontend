"use client";

import { useEffect, useState } from "react";
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
import {
  fetchEditorials,
  fetchLatestEditorial,
  fetchRecentEditorials,
  type CatalogueEditorial,
  type EditorialTrackSummary,
  EDITORIAL_VOICE_OPTIONS,
  type EditorialVoice,
  type LatestEditorial,
} from "@/lib/editorials";

const WRITER_PAIRS = [
  { image: 1, names: ["Adam", "Laura"] },
  { image: 2, names: ["James", "Natalie"] },
  { image: 3, names: ["Bob", "Allie"] },
  { image: 4, names: ["Mark", "Alice"] },
] as const;

function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
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

function RecentLogCard({ editorial }: { editorial: EditorialTrackSummary }) {
  return (
    <Link
      href={`/editorial/track?id=${editorial.trackId}`}
      className="relative z-10 flex w-[280px] flex-none flex-col overflow-hidden rounded-2xl border border-[rgba(232,220,192,.15)] bg-[rgba(232,220,192,.03)] no-underline transition-colors hover:border-[#F6D013] hover:bg-[rgba(246,208,19,.05)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#2A261C]">
        {editorial.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={editorial.imageUrl}
            alt={editorial.title}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="truncate font-[family-name:var(--font-dm-sans)] text-[9.5px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.5)]">
          {editorial.trackName} · {editorial.albumName}
        </div>
        <div className="text-balance mt-2.5 font-[family-name:var(--font-fraunces)] text-[19px] leading-[1.1] font-extrabold tracking-[-.03em] text-[#E8DCC0]">
          {editorial.title}
        </div>
        {editorial.dek && (
          <div className="mt-2 line-clamp-3 font-[family-name:var(--font-newsreader)] text-[13px] leading-[1.5] text-[rgba(232,220,192,.62)]">
            {editorial.dek}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 font-[family-name:var(--font-dm-sans)] text-[9px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.45)]">
          <span className="flex items-center gap-2">
            <span className="relative h-7 w-7 overflow-hidden rounded-full bg-[#1C1A14]">
              <Image
                src={`/characters/${editorial.byline.toLowerCase()}.png`}
                alt={editorial.byline}
                fill
                unoptimized
                className="object-cover"
              />
            </span>
            <span>
              {editorial.byline.charAt(0) + editorial.byline.slice(1).toLowerCase()} ·
            </span>
            <span>{formatDate(editorial.createdAt)}</span>
          </span>
          <LikeButton
            variant="inline"
            initialCount={editorial.likeCount}
            initialLiked={editorial.likedByCurrentUser}
            readOnly
          />
        </div>
      </div>
    </Link>
  );
}

export default function ArchivePage() {
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [byline, setByline] = useState<EditorialVoice | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const [featuredTracks, setFeaturedTracks] = useState<
    FeaturedTrack[] | null
  >(null);
  const [recentEditorials, setRecentEditorials] = useState<
    EditorialTrackSummary[] | null
  >(null);
  const [latestEditorial, setLatestEditorial] = useState<
    LatestEditorial | null | undefined
  >(undefined);
  const [grid, setGrid] = useState<Page<CatalogueEditorial> | null>(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search box so we don't fire a request per keystroke. Bails
  // out when qInput already matches the committed q — without this, the
  // very first run (every effect fires once on mount, not just on later
  // changes) would still schedule its timeout, and 300ms after the initial
  // load it'd force gridLoading back to true with nothing left to ever set
  // it back to false (q/page wouldn't actually change, so the grid-fetch
  // effect below never reruns) — The Catalogue would look stuck loading
  // forever until something else (like the filter) happened to refetch it.
  useEffect(() => {
    if (qInput === q) return;
    const timeout = setTimeout(() => {
      setGridLoading(true);
      setQ(qInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [qInput, q]);

  useEffect(() => {
    fetchFeaturedTracks()
      .then(setFeaturedTracks)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        ),
      );
  }, []);

  useEffect(() => {
    fetchRecentEditorials(10)
      .then(setRecentEditorials)
      .catch((err) => {
        setRecentEditorials([]);
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        );
      });
  }, []);

  useEffect(() => {
    fetchLatestEditorial()
      .then(setLatestEditorial)
      .catch((err) => {
        setLatestEditorial(null);
        if (!(err instanceof ApiError && err.status === 404)) {
          setError(
            err instanceof ApiError ? err.message : "Couldn't load the archive.",
          );
        }
      });
  }, []);

  useEffect(() => {
    fetchEditorials({
      q,
      byline: byline === "ALL" ? undefined : byline,
      page,
    })
      .then(setGrid)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load the archive.",
        ),
      )
      .finally(() => setGridLoading(false));
  }, [q, byline, page]);

  // The Last Log is the first data-driven section. Hold the initial render
  // until it resolves (including a valid 404), then let lower sections fill
  // in independently instead of blocking the page behind every request.
  if (latestEditorial === undefined) {
    return (
      <>
        <Navbar align="right" />
        <LoadingNotes
          messages={[
            "Cueing the record…",
            "Dusting off the crates…",
            "Pulling the last log…",
          ]}
        />
      </>
    );
  }

  return (
    <>
      {/* Title hero — hero-archive.png IS the page background here,
          starting from above the Navbar (Navbar/title/dek all render as
          z-10 content layered on top of it, not below it). Bleeds to the
          full viewport width (offset for the Sidebar's current width, same
          trick used on the series/playlists home pages). The container's
          height is derived from that same full-bleed width via the
          image's own aspect ratio (2464x1968 → ×(1968/2464)), so the image
          always renders at its real proportions with nothing cropped off,
          whatever the viewport width happens to be. No dark scrim — the
          plain image only. */}
      <div
        className="relative animate-[jazzlogs-fade-up_.6s_ease-out]"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (1968 / 2464))" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/archive/hero-archive.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="relative z-10 flex h-full flex-col">
          <Navbar align="right" />
          <div className="-ml-5 flex flex-col items-start py-3 text-left sm:-ml-8">
            <div className="font-[family-name:var(--font-fraunces)] text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#F6D013] sm:text-[80px]">
              The Archive.
            </div>
            <div className="mt-5 max-w-[580px] font-[family-name:var(--font-newsreader)] text-[19px] leading-[1.5] text-white">
              Everything we&rsquo;ve listened to so far, all in one place.
              <br />
              Welcome to The Archive.
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 border-[1.5px] border-dashed border-[rgba(232,220,192,.4)] p-5 text-sm text-[rgba(232,220,192,.65)]">
          {error}
        </div>
      )}

      <div className="animate-[jazzlogs-fade-up_.6s_ease-out]">
          {/* The newest editorial gets a full-width feature treatment rather
              than another catalogue card. 404 from /editorials/latest is
              intentionally rendered as no section at all. */}
          {latestEditorial && (
            <section className="mt-14">
              <div className="mb-8 text-center">
                <div className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
                  The Last Log
                </div>
              </div>
              <div className="grid overflow-hidden rounded-2xl border border-[rgba(232,220,192,.15)] bg-[rgba(232,220,192,.03)] md:grid-cols-[1.1fr_1fr]">
                <Link
                  href={`/editorial/track?id=${latestEditorial.trackId}`}
                  className="relative min-h-[320px] overflow-hidden bg-[#2A261C] sm:min-h-[420px]"
                  aria-label={latestEditorial.title}
                >
                  {latestEditorial.principalImageUrl ?? latestEditorial.coverImageUrl ? (
                    // The editorial service supplies a final media URL.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        latestEditorial.principalImageUrl ??
                        latestEditorial.coverImageUrl ??
                        ""
                      }
                      alt={latestEditorial.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlaceholder label="Latest editorial" />
                  )}
                </Link>
                <div className="flex flex-col p-7 sm:p-10">
                  <div className="font-[family-name:var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[.15em] text-[rgba(232,220,192,.5)]">
                    {latestEditorial.trackName} · {latestEditorial.albumName}
                  </div>
                  <div className="mt-3 font-[family-name:var(--font-dm-sans)] text-[15px] font-extrabold tracking-[-.01em] text-[#F6D013]">
                    Log #{latestEditorial.logNumber}
                  </div>
                  <Link
                    href={`/editorial/track?id=${latestEditorial.trackId}`}
                    className="text-balance mt-4 font-[family-name:var(--font-fraunces)] text-[38px] leading-[.96] font-extrabold tracking-[-.045em] text-[#F6D013] no-underline sm:text-[52px]"
                  >
                    {latestEditorial.title}
                  </Link>
                  {latestEditorial.dek && (
                    <p className="mt-5 max-w-[500px] font-[family-name:var(--font-newsreader)] text-[17px] leading-[1.55] text-[rgba(232,220,192,.76)]">
                      {latestEditorial.dek}
                    </p>
                  )}
                  {latestEditorial.hook && (
                    <div className="mt-7 border-y border-[rgba(246,208,19,.65)] py-5">
                      <div className="relative max-h-[178px] overflow-hidden">
                        <div className="font-[family-name:var(--font-newsreader)] text-[21px] leading-[1.3] font-semibold tracking-[-.02em] text-[#E8DCC0] whitespace-pre-line italic">
                          &ldquo;{latestEditorial.hook.trim()}&rdquo;
                        </div>
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-[#1C1A14] to-transparent"
                        />
                      </div>
                      <Link
                        href={`/editorial/track?id=${latestEditorial.trackId}`}
                        className="mt-5 inline-flex rounded-full bg-[#F6D013] px-5 py-3 font-[family-name:var(--font-dm-sans)] text-[11px] font-bold uppercase tracking-[.12em] text-[#1C1A14] no-underline"
                      >
                        Read editorial →
                      </Link>
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                    <div className="flex items-center gap-3">
                      <span className="relative h-10 w-10 overflow-hidden rounded-full bg-[#1C1A14]">
                        <Image
                          src={`/characters/${latestEditorial.byline.toLowerCase()}.png`}
                          alt={latestEditorial.byline}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </span>
                      <span className="font-[family-name:var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[.13em] text-[rgba(232,220,192,.55)]">
                        {latestEditorial.byline.charAt(0) + latestEditorial.byline.slice(1).toLowerCase()} · {formatDate(latestEditorial.createdAt)}
                      </span>
                    </div>
                    <LikeButton
                      variant="inline"
                      initialCount={latestEditorial.likeCount}
                      initialLiked={latestEditorial.likedByCurrentUser}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* banner1-archive.png as a full-bleed section background, same
              treatment as the series/playlists home pages' own banners —
              1680x720 → ×(720/1680), nothing cropped. */}
          <div
            className="relative mt-8 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden"
            style={{ height: "calc((100vw - var(--sidebar-width)) * (720 / 1680))" }}
          >
            <Image
              src="/archive/banner1-archive.png"
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* Featured logs — admin-curated tracks from GET /tracks/featured. */}
          {featuredTracks && (
            <>
              <div className="mt-14 text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
                Featured logs
              </div>
              {featuredTracks.length === 0 ? (
                <div className="mt-9 flex justify-center">
                  <div className="flex max-w-[300px] flex-col gap-2.5 rounded-[3px] bg-[#E8DCC0] p-6 text-center text-[#1C1A14] shadow-[0_14px_28px_rgba(0,0,0,.35)]" style={{ transform: "rotate(-1.4deg)" }}>
                    <div className="font-[family-name:var(--font-fraunces)] text-[18px] leading-[1.15] font-extrabold tracking-[-.02em]">No featured logs yet.</div>
                    <p className="m-0 font-[family-name:var(--font-newsreader)] text-[13.5px] leading-[1.5] font-medium text-[rgba(28,26,20,.75)]">Nothing tagged as Featured just yet — check back later.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {featuredTracks.map((t) => (
                    <Link key={t.id} href={`/editorial/track?id=${t.trackId}`} className="relative z-10 flex flex-col overflow-hidden rounded-2xl border border-[rgba(232,220,192,.15)] bg-[rgba(232,220,192,.03)] no-underline transition-colors hover:border-[#F6D013] hover:bg-[rgba(246,208,19,.05)]">
                      <div className="relative aspect-square w-full overflow-hidden bg-[#2A261C]">
                        {t.coverImageUrl ? (
                          // The editorial service supplies the final media URL.
                          // Rendering it directly avoids an extra optimization hop.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.coverImageUrl}
                            alt={t.title}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ImagePlaceholder />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="font-[family-name:var(--font-dm-sans)] text-[9.5px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.5)]">{t.trackName} · {t.albumName}</div>
                        <div className="text-balance mt-2.5 font-[family-name:var(--font-fraunces)] text-[19px] leading-[1.1] font-extrabold tracking-[-.03em] text-[#E8DCC0]">{t.title}</div>
                        {t.dek && <div className="mt-2 line-clamp-3 font-[family-name:var(--font-newsreader)] text-[13px] leading-[1.5] text-[rgba(232,220,192,.62)]">{t.dek}</div>}
                        <div className="mt-auto flex items-center justify-between gap-3 pt-4 font-[family-name:var(--font-dm-sans)] text-[9px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.45)]">
                          <span className="flex items-center gap-2">
                            {t.byline && (
                              <>
                                <span className="relative h-7 w-7 overflow-hidden rounded-full bg-[#1C1A14]">
                                  <Image
                                    src={`/characters/${t.byline.toLowerCase()}.png`}
                                    alt={t.byline}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </span>
                                <span>
                                  {t.byline.charAt(0) + t.byline.slice(1).toLowerCase()} ·
                                </span>
                              </>
                            )}
                            {formatDate(t.createdAt)}
                          </span>
                          <LikeButton variant="inline" initialCount={t.likeCount} initialLiked={t.likedByCurrentUser} readOnly />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* banner2-archive.png as a full-bleed section background, same
              treatment as banner1-archive.png above — 1680x720 →
              ×(720/1680), nothing cropped. */}
          <div
            className="relative mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden"
            style={{ height: "calc((100vw - var(--sidebar-width)) * (720 / 1680))" }}
          >
            <Image
              src="/archive/banner2-archive.png"
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* The 10 newest editorials across every author, provided already
              sorted newest-first by GET /editorials/recent. */}
          {recentEditorials && recentEditorials.length > 0 && (
            <section className="mt-16">
              <div className="text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
                Recently filled
              </div>
              <div className="mt-9 overflow-x-auto pb-2">
                <div className="flex w-max gap-4 pr-4">
                  {recentEditorials.map((editorial) => (
                    <RecentLogCard key={editorial.id} editorial={editorial} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* banner3-archive.png as a full-bleed section background, same
              treatment as banner1/banner2-archive.png above — 2688x1792 →
              ×(1792/2688), nothing cropped. */}
          <div
            className="relative mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden"
            style={{ height: "calc((100vw - var(--sidebar-width)) * (1792 / 2688))" }}
          >
            <Image
              src="/archive/banner3-archive.png"
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* The eight human voices behind the archive, in four full-size
              pair portraits. */}
          <section className="mt-16">
            <div className="text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
              The Writers
            </div>
            <p className="mx-auto mt-5 max-w-[540px] text-center font-[family-name:var(--font-newsreader)] text-[19px] leading-[1.55] text-[rgba(232,220,192,.75)]">
              Eight sets of ears, one ever-growing archive.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
              {WRITER_PAIRS.map((pair) => (
                <div key={pair.image}>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[#2A261C]">
                    <Image
                      src={`/archive/characters${pair.image}-archive.png`}
                      alt={`${pair.names[0]} and ${pair.names[1]}`}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-14 font-[family-name:var(--font-fraunces)] text-[24px] font-extrabold tracking-[-.03em] text-[#E8DCC0] sm:text-[30px]">
                    {pair.names.map((name) => (
                      <span key={name}>{name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* banner4-archive.png as a full-bleed section background, same
              treatment as banner1/banner2/banner3-archive.png above —
              2960x1648 → ×(1648/2960), nothing cropped. */}
          <div
            className="relative mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden"
            style={{ height: "calc((100vw - var(--sidebar-width)) * (1648 / 2960))" }}
          >
            <Image
              src="/archive/banner4-archive.png"
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* The Catalogue */}
          <div className="mt-14 text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
            The Catalogue
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-between gap-6">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setGridLoading(true);
                  setByline("ALL");
                  setPage(0);
                }}
                className={
                  "rounded-full border px-4 py-2 font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-[.1em] transition-colors " +
                  (byline === "ALL"
                    ? "border-[#F6D013] bg-[#F6D013] text-[#1C1A14]"
                    : "border-[rgba(232,220,192,.25)] text-[rgba(232,220,192,.65)] hover:border-[#F6D013]")
                }
              >
                All
              </button>
              {EDITORIAL_VOICE_OPTIONS.filter((voice) => voice !== "JAZZLOGS").map((voice) => (
                <button
                  key={voice}
                  type="button"
                  onClick={() => {
                    setGridLoading(true);
                    setByline(voice);
                    setPage(0);
                  }}
                  className={
                    "rounded-full border px-4 py-2 font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-[.1em] transition-colors " +
                    (byline === voice
                      ? "border-[#F6D013] bg-[#F6D013] text-[#1C1A14]"
                      : "border-[rgba(232,220,192,.25)] text-[rgba(232,220,192,.65)] hover:border-[#F6D013]")
                  }
                >
                  {voice.charAt(0) + voice.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="flex min-w-[260px] items-center gap-2.5 border-b-[1.5px] border-[rgba(232,220,192,.3)] px-0.5 py-[7px]">
              <span className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[rgba(232,220,192,.45)]">
                ⌕
              </span>
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search the catalogue…"
                className="flex-1 border-none bg-transparent text-[14px] font-medium text-[#E8DCC0] outline-none placeholder:text-[rgba(232,220,192,.4)]"
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
            <div className="mt-6 grid animate-[jazzlogs-fade-up_.5s_ease-out] grid-cols-1 gap-4 border-t-[1.5px] border-[#F6D013] pt-4 lg:grid-cols-2">
              {grid.content.map((e) => {
                return (
                  <div
                    key={e.id}
                    className="relative overflow-hidden rounded-xl border border-[rgba(232,220,192,.15)] bg-[rgba(232,220,192,.03)] transition-colors hover:border-[#F6D013] hover:bg-[rgba(246,208,19,.06)]"
                  >
                    <Link
                      href={`/editorial/track?id=${e.trackId}`}
                      className="absolute inset-0 z-0"
                      aria-label={e.title}
                    />
                    <div className="grid min-h-[172px] grid-cols-[116px_minmax(0,1fr)]">
                      <div className="pointer-events-none relative overflow-hidden bg-[#2A261C]">
                        <Cover
                          e={{ ownerImageUrl: e.editorialCoverUrl, ownerName: e.trackName }}
                        />
                      </div>
                      <div className="pointer-events-none flex min-w-0 flex-col p-4 sm:p-5">
                        <div className="text-balance font-[family-name:var(--font-fraunces)] text-[21px] leading-[.98] font-extrabold tracking-[-.042em] sm:text-[25px]">
                          {e.title}
                        </div>
                        <div className="mt-2 truncate text-[11px] font-semibold text-[rgba(232,220,192,.6)]">
                          {e.trackName} · {e.albumName} · {e.artistName}
                        </div>
                        {e.dek && (
                          <div className="mt-2 line-clamp-2 font-[family-name:var(--font-newsreader)] text-[13px] leading-[1.45] text-[rgba(232,220,192,.64)]">
                            {e.dek}
                          </div>
                        )}
                        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                          <span className="font-[family-name:var(--font-dm-sans)] text-[9px] font-medium uppercase leading-[1.35] tracking-[.1em] text-[rgba(232,220,192,.45)]">
                            {e.byline && <>{e.byline} · </>}
                            {formatDate(e.createdAt)}
                          </span>
                          <LikeButton
                            variant="inline"
                            initialCount={e.likeCount}
                            initialLiked={e.likedByCurrentUser}
                            readOnly
                          />
                        </div>
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

          {/* banner5-archive.png as a full-bleed section background, same
              treatment as the series/playlists home pages' own final
              banner — 3376x1440 → ×(1440/3376), nothing cropped — with a
              "join the team" CTA laid over its top-right corner. No href
              yet — there's no membership/billing page in the app to send
              it to. */}
          <div
            className="relative mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden"
            style={{ height: "calc((100vw - var(--sidebar-width)) * (1440 / 3376))" }}
          >
            <Image
              src="/archive/banner5-archive.png"
              alt=""
              fill
              unoptimized
              className="pointer-events-none object-cover"
            />
            <div className="absolute top-16 left-20 z-10 flex flex-col items-center gap-3 text-center sm:top-24 sm:left-32">
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

      <Footer />
    </>
  );
}
