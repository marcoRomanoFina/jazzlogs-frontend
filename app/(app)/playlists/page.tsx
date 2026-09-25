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
import { type Page } from "@/lib/api";
import {
  fetchFeaturedPlaylist,
  fetchJourneyPlaylist,
  fetchJourneyPlaylists,
  fetchStandardPlaylists,
  type FeaturedPlaylist,
  type JourneyPlaylist,
  type PlaylistSummary,
} from "@/lib/playlists";
import { extractAverageColor, brighten, mixWithBase } from "@/lib/colorTint";

function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

// A whole playlist's runtime reads better as "1h 12m" than a track's own
// mm:ss — there's no dedicated duration helper for that shape yet.
function formatPlaylistDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
      className={
        "relative overflow-hidden bg-black/20 " + (className ?? "h-full w-full")
      }
    >
      <Image
        src={e.ownerImageUrl}
        alt={e.ownerName}
        fill
        unoptimized
        // Contain, not cover — the whole cover should show, uncropped, even
        // if that means letterboxing against the container's own bg-black/20
        // for a cover that isn't perfectly square.
        className="object-contain"
      />
    </div>
  );
}

// The card's own resting color (`#2A261C` → rgb(42, 38, 28)) nudged toward the
// section's tint by `ratio` — a light wash, not a repaint, so the card still
// reads as "the same card" rather than switching to the cover's color.
const CARD_BASE: [number, number, number] = [42, 38, 28];
function mixWithCardBase(rgb: string, ratio: number): string {
  return mixWithBase(rgb, CARD_BASE, ratio);
}

// One card in the Journeys/Playlists catalogue strips below.
function PlaylistCard({ p }: { p: PlaylistSummary }) {
  return (
    <Link
      href={`/playlists/detail?id=${p.id}`}
      className="relative z-10 flex flex-col overflow-hidden rounded-2xl border border-[rgba(232,220,192,.15)] bg-[rgba(232,220,192,.03)] no-underline transition-colors hover:border-[#F6D013] hover:bg-[rgba(246,208,19,.05)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#2A261C]">
        <Cover e={{ ownerImageUrl: p.coverImageUrl, ownerName: p.title }} />
        <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-[#2A261C] px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[9.5px] font-bold uppercase tracking-[.12em] text-[#F6D013]">
          {p.byline}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="text-balance font-[family-name:var(--font-fraunces)] text-[20px] leading-[1.1] font-extrabold tracking-[-.03em] text-[#E8DCC0]">
          {p.title}
        </div>
        {p.tagline && (
          <div className="line-clamp-2 font-[family-name:var(--font-newsreader)] text-[13px] leading-[1.5] text-[rgba(232,220,192,.65)]">
            {p.tagline}
          </div>
        )}
        {p.styleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.styleTags.slice(0, 3).map((tag) => (
              <span
                key={tag.code}
                className="rounded-full border-[1.5px] border-[#F6D013] px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[9px] font-bold uppercase tracking-[.1em] text-[#F6D013]"
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2 font-[family-name:var(--font-dm-sans)] text-[9px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.45)]">
          <span>
            {p.trackCount} {p.trackCount === 1 ? "track" : "tracks"}
          </span>
          <LikeButton
            variant="inline"
            initialCount={p.likeCount}
            initialLiked={p.likedByCurrentUser}
            readOnly
          />
        </div>
      </div>
    </Link>
  );
}

export default function PlaylistsPage() {
  // Admin-curated, at most one at a time — a 404 (mapped to null by
  // fetchFeaturedPlaylist itself) just means the block below stays hidden,
  // falling back to nothing rather than the mock card.
  const [featuredPlaylist, setFeaturedPlaylist] = useState<
    FeaturedPlaylist | null | undefined
  >(undefined);
  const [playlistColor, setPlaylistColor] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedPlaylist()
      .then(setFeaturedPlaylist)
      .catch(() => setFeaturedPlaylist(null));
  }, []);

  useEffect(() => {
    if (!featuredPlaylist?.coverImageUrl) return;
    let cancelled = false;
    extractAverageColor(featuredPlaylist.coverImageUrl).then((color) => {
      if (!cancelled) setPlaylistColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [featuredPlaylist?.coverImageUrl]);

  const playlistTextColor = playlistColor
    ? brighten(playlistColor, 0.55)
    : "#F6D013";

  // The most recently published JOURNEY playlist — purely derived server-
  // side (publish a newer one and it swaps in automatically), so there's no
  // admin action to wire here, just the read. 404 (mapped to null) means no
  // JOURNEY has ever been published yet.
  const [journeyPlaylist, setJourneyPlaylist] = useState<
    JourneyPlaylist | null | undefined
  >(undefined);
  const [journeyColor, setJourneyColor] = useState<string | null>(null);

  useEffect(() => {
    fetchJourneyPlaylist()
      .then(setJourneyPlaylist)
      .catch(() => setJourneyPlaylist(null));
  }, []);

  useEffect(() => {
    if (!journeyPlaylist?.coverImageUrl) return;
    let cancelled = false;
    extractAverageColor(journeyPlaylist.coverImageUrl).then((color) => {
      if (!cancelled) setJourneyColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [journeyPlaylist?.coverImageUrl]);

  const journeyTextColor = journeyColor
    ? brighten(journeyColor, 0.55)
    : "#F6D013";

  // The playlist version of "The Catalogue" — no filters, fixed order,
  // just two independently-paginated strips (journeys, then standard).
  const [journeysGrid, setJourneysGrid] = useState<Page<PlaylistSummary> | null>(
    null,
  );
  const [journeysPage, setJourneysPage] = useState(0);
  const [standardGrid, setStandardGrid] = useState<
    Page<PlaylistSummary> | null
  >(null);
  const [standardPage, setStandardPage] = useState(0);

  useEffect(() => {
    fetchJourneyPlaylists(journeysPage).then(setJourneysGrid);
  }, [journeysPage]);

  useEffect(() => {
    fetchStandardPlaylists(standardPage).then(setStandardGrid);
  }, [standardPage]);

  // Gates the whole page (and its entrance fade-in) behind every section's
  // first load, same treatment as the series home page — once true it
  // stays true, so a later page change on either grid below doesn't
  // re-trigger the loading screen.
  const [pageReady, setPageReady] = useState(false);
  useEffect(() => {
    if (
      !pageReady &&
      featuredPlaylist !== undefined &&
      journeyPlaylist !== undefined &&
      journeysGrid !== null &&
      standardGrid !== null
    ) {
      setPageReady(true);
    }
  }, [featuredPlaylist, journeyPlaylist, journeysGrid, standardGrid, pageReady]);

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
      {/* Entrance transition for the whole page, same treatment as the
          series home page — held back until pageReady above so it plays
          once, against the fully-loaded page. */}
      <div className="animate-[jazzlogs-fade-up_.6s_ease-out]">
      {/* Title hero — hero-playlist.png IS the page background here,
          starting from above the Navbar (Navbar/title/dek all render as
          z-10 content layered on top of it, not below it). Bleeds to the
          full viewport width (offset for the Sidebar's current width, same
          trick used on the series home page). The container's height is
          derived from that same full-bleed width via the image's own
          aspect ratio (2464x1968 → ×(1968/2464)), so the image always
          renders at its real proportions with nothing cropped off,
          whatever the viewport width happens to be. No dark scrim — the
          plain image only. */}
      <div
        className="relative"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (1968 / 2464))" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/playlists/hero-playlist.png"
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
              Playlists.
            </div>
            <div className="ml-auto mt-5 max-w-[580px] font-[family-name:var(--font-newsreader)] text-[19px] leading-[1.5] text-white">
              Curated together at the JazzLogs desk —
              <br />
              each record placed with intention, each
              <br />
              sequence made to be heard from start to finish.
            </div>
          </div>
        </div>
      </div>

      {/* Featured playlist — admin-curated, at most one at a time. Hidden
          entirely (not even the label) if nothing's featured right now. */}
      {featuredPlaylist && (
        <div className="mt-14">
          <div className="mb-9 text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
            Featured
          </div>
          <div
            className="relative z-10 overflow-hidden rounded-[18px] bg-[#2A261C] text-[#E8DCC0]"
            style={{
              backgroundColor: playlistColor
                ? mixWithCardBase(playlistColor, 0.4)
                : undefined,
            }}
          >
            <div className="relative grid min-h-[520px] grid-cols-1 items-center gap-11 p-11 md:grid-cols-[520px_1fr]">
              {/* Square, at every breakpoint (no md:h-full override) — a
                  square Spotify cover under object-contain then fills this
                  edge to edge with zero letterboxing. */}
              <div className="relative z-[1] aspect-square w-full overflow-hidden rounded-[14px] md:w-[520px]">
                <Cover
                  e={{
                    ownerImageUrl: featuredPlaylist.coverImageUrl,
                    ownerName: featuredPlaylist.title,
                  }}
                />
              </div>
              <div className="relative z-[1] flex h-full flex-col justify-between">
                <div className="flex items-center justify-between font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium tracking-[.12em] text-[rgba(232,220,192,.6)]">
                  <div className="flex items-center gap-3.5">
                    <span>
                      {featuredPlaylist.trackCount}{" "}
                      {featuredPlaylist.trackCount === 1 ? "track" : "tracks"}
                    </span>
                    {featuredPlaylist.durationMs > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          {formatPlaylistDuration(featuredPlaylist.durationMs)}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="uppercase tracking-[.1em] text-[rgba(232,220,192,.55)]">
                    Updated {formatDate(featuredPlaylist.updatedAt)}
                  </span>
                </div>
                <div className="mt-3">
                  <div
                    className="text-balance font-[family-name:var(--font-fraunces)] text-[42px] leading-[.92] font-extrabold tracking-[-.045em] sm:text-[62px]"
                    style={{ color: playlistTextColor }}
                  >
                    {featuredPlaylist.title}
                  </div>
                  {featuredPlaylist.tagline && (
                    <div className="mt-4 max-w-[560px] font-[family-name:var(--font-newsreader)] text-[26px] leading-[1.3] font-semibold text-[rgba(232,220,192,.85)]">
                      {featuredPlaylist.tagline}
                    </div>
                  )}
                </div>
                {featuredPlaylist.tracks.length > 0 && (
                  <div className="mt-6 flex flex-col gap-3 border-t border-[rgba(232,220,192,.15)] pt-5">
                    {featuredPlaylist.tracks.slice(0, 5).map((t) => (
                      <div
                        key={t.trackId}
                        className="flex min-h-[44px] items-center gap-4"
                      >
                        <span className="flex-none font-[family-name:var(--font-dm-sans)] text-[12px] text-[rgba(232,220,192,.45)]">
                          {String(t.position + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <div className="line-clamp-1 text-[14px] font-bold">
                            {t.title ?? t.trackName}
                          </div>
                          {t.curatorNote && (
                            <div className="mt-0.5 line-clamp-1 text-[13px] text-[rgba(232,220,192,.65)]">
                              {t.curatorNote}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {featuredPlaylist.trackCount > 5 && (
                      <div className="font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[.1em] text-[rgba(232,220,192,.5)]">
                        +{featuredPlaylist.trackCount - 5} more tracks
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-7 flex items-center justify-between gap-4">
                  <Link
                    href={`/playlists/detail?id=${featuredPlaylist.id}`}
                    className="inline-block w-fit whitespace-nowrap rounded-full bg-[#F6D013] px-6 py-3 text-[13px] font-bold text-[#1C1A14] no-underline"
                  >
                    Open playlist →
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.6)]">
                      Curated by {featuredPlaylist.byline}
                    </span>
                    <div className="relative h-16 w-16 flex-none overflow-hidden rounded-full bg-[#1C1A14] sm:h-20 sm:w-20">
                      <Image
                        src={`/characters/${featuredPlaylist.byline.toLowerCase()}.png`}
                        alt={featuredPlaylist.byline}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-5">
                  {featuredPlaylist.styleTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {featuredPlaylist.styleTags.map((tag) => (
                        <span
                          key={tag.code}
                          className="rounded-full border-[1.5px] border-[#F6D013] px-2.5 py-1.5 text-[11px] font-semibold"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <LikeButton
                    initialCount={featuredPlaylist.likeCount}
                    initialLiked={featuredPlaylist.likedByCurrentUser}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* banner1-playlist.png as a full-bleed section background, same
          treatment as the series home page's banners — 3376x1440 →
          ×(1440/3376), nothing cropped. */}
      <div
        className="relative mt-14"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (1440 / 3376))" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/playlists/banner1-playlist.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>

      {/* The Journey — the most recently published JOURNEY playlist, purely
          derived server-side (no admin action here, just the read). Hidden
          entirely if none has ever been published. No tracklist — unlike
          Featured above, GET /playlists/journey doesn't return tracks. */}
      {journeyPlaylist && (
        <div className="mt-14">
          <div className="mb-9 text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
            The Journey
          </div>
          <div
            className="relative z-10 overflow-hidden rounded-[18px] bg-[#2A261C] text-[#E8DCC0]"
            style={{
              backgroundColor: journeyColor
                ? mixWithCardBase(journeyColor, 0.4)
                : undefined,
            }}
          >
            <div className="relative grid min-h-[520px] grid-cols-1 items-center gap-11 p-11 md:grid-cols-[520px_1fr]">
              <div className="relative z-[1] aspect-square w-full overflow-hidden rounded-[14px] md:w-[520px]">
                <Cover
                  e={{
                    ownerImageUrl: journeyPlaylist.coverImageUrl,
                    ownerName: journeyPlaylist.title,
                  }}
                />
              </div>
              <div className="relative z-[1] flex h-full flex-col justify-between">
                <div className="flex items-center justify-between font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium tracking-[.12em] text-[rgba(232,220,192,.6)]">
                  <div className="flex items-center gap-3.5">
                    <span>
                      {journeyPlaylist.trackCount}{" "}
                      {journeyPlaylist.trackCount === 1 ? "track" : "tracks"}
                    </span>
                    {journeyPlaylist.durationMs > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          {formatPlaylistDuration(journeyPlaylist.durationMs)}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="uppercase tracking-[.1em] text-[rgba(232,220,192,.55)]">
                    Updated {formatDate(journeyPlaylist.updatedAt)}
                  </span>
                </div>
                <div className="mt-3">
                  <div
                    className="text-balance font-[family-name:var(--font-fraunces)] text-[42px] leading-[.92] font-extrabold tracking-[-.045em] sm:text-[62px]"
                    style={{ color: journeyTextColor }}
                  >
                    {journeyPlaylist.title}
                  </div>
                  {journeyPlaylist.tagline && (
                    <div className="mt-4 max-w-[560px] font-[family-name:var(--font-newsreader)] text-[26px] leading-[1.3] font-semibold text-[rgba(232,220,192,.85)]">
                      {journeyPlaylist.tagline}
                    </div>
                  )}
                </div>
                <div className="mt-7 flex items-center justify-between gap-4">
                  <Link
                    href={`/playlists/detail?id=${journeyPlaylist.id}`}
                    className="inline-block w-fit whitespace-nowrap rounded-full bg-[#F6D013] px-6 py-3 text-[13px] font-bold text-[#1C1A14] no-underline"
                  >
                    Open playlist →
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.6)]">
                      Curated by {journeyPlaylist.byline}
                    </span>
                    <div className="relative h-16 w-16 flex-none overflow-hidden rounded-full bg-[#1C1A14] sm:h-20 sm:w-20">
                      <Image
                        src={`/characters/${journeyPlaylist.byline.toLowerCase()}.png`}
                        alt={journeyPlaylist.byline}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-5">
                  {journeyPlaylist.styleTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {journeyPlaylist.styleTags.map((tag) => (
                        <span
                          key={tag.code}
                          className="rounded-full border-[1.5px] border-[#F6D013] px-2.5 py-1.5 text-[11px] font-semibold"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <LikeButton
                    initialCount={journeyPlaylist.likeCount}
                    initialLiked={journeyPlaylist.likedByCurrentUser}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* banner2-playlist.jpeg as a full-bleed section background, same
          treatment as banner1-playlist.png above — 2944x1648 →
          ×(1648/2944), nothing cropped. */}
      <div
        className="relative mt-14"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (1648 / 2944))" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/playlists/banner2-playlist.jpeg"
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>

      {/* Journeys — the playlist version of "The Catalogue": no filters,
          fixed order (createdAt desc). Admins also see drafts here. */}
      <div className="mt-14 border-t-[1.5px] border-[#F6D013] pt-9 text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
        Journeys
      </div>
      {journeysGrid && journeysGrid.content.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {journeysGrid.content.map((p) => (
              <PlaylistCard key={p.id} p={p} />
            ))}
          </div>
          <Pager
            page={journeysGrid.number}
            pageCount={journeysGrid.totalPages}
            onChange={setJourneysPage}
          />
        </>
      ) : (
        journeysGrid !== null && (
          <div className="mt-6 flex justify-center">
            <div
              className="flex max-w-[300px] flex-col gap-2.5 rounded-[3px] bg-[#E8DCC0] p-6 text-center text-[#1C1A14] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
              style={{ transform: "rotate(-1.4deg)" }}
            >
              <div className="font-[family-name:var(--font-fraunces)] text-[18px] leading-[1.15] font-extrabold tracking-[-.02em]">
                No journeys yet.
              </div>
              <p className="m-0 font-[family-name:var(--font-newsreader)] text-[13.5px] leading-[1.5] font-medium text-[rgba(28,26,20,.75)]">
                Nothing published as a Journey yet — check back later.
              </p>
            </div>
          </div>
        )
      )}

      {/* Standard playlists — same idea, own endpoint/pagination. */}
      <div className="mt-14 border-t-[1.5px] border-[#F6D013] pt-9 text-center font-[family-name:var(--font-fraunces)] text-[40px] leading-[.92] font-extrabold tracking-[-.04em] text-[#E8DCC0] sm:text-[56px]">
        Playlists
      </div>
      {standardGrid && standardGrid.content.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {standardGrid.content.map((p) => (
              <PlaylistCard key={p.id} p={p} />
            ))}
          </div>
          <Pager
            page={standardGrid.number}
            pageCount={standardGrid.totalPages}
            onChange={setStandardPage}
          />
        </>
      ) : (
        standardGrid !== null && (
          <div className="mt-6 flex justify-center">
            <div
              className="flex max-w-[300px] flex-col gap-2.5 rounded-[3px] bg-[#E8DCC0] p-6 text-center text-[#1C1A14] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
              style={{ transform: "rotate(-1.4deg)" }}
            >
              <div className="font-[family-name:var(--font-fraunces)] text-[18px] leading-[1.15] font-extrabold tracking-[-.02em]">
                Nothing here yet.
              </div>
              <p className="m-0 font-[family-name:var(--font-newsreader)] text-[13.5px] leading-[1.5] font-medium text-[rgba(28,26,20,.75)]">
                No playlists published yet — check back later.
              </p>
            </div>
          </div>
        )
      )}

      {/* banner3-playlist.png as a full-bleed section background, same
          treatment as banner1/banner2-playlist.jpeg above — 3376x1440 →
          ×(1440/3376), nothing cropped — with a "join the team" CTA laid
          over its top-left corner, same as the series home page's banner3
          (mirrored to the left here). No href yet — there's no
          membership/billing page in the app to send it to. */}
      <div
        className="relative mt-14"
        style={{ height: "calc((100vw - var(--sidebar-width)) * (1440 / 3376))" }}
      >
        <div className="absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          <Image
            src="/playlists/banner3-playlist.png"
            alt=""
            fill
            unoptimized
            className="pointer-events-none object-cover"
          />
          <div className="absolute top-6 left-20 z-10 flex flex-col items-center gap-3 text-center sm:top-12 sm:left-32">
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
