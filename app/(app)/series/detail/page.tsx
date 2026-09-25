"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import EmptyState from "@/components/app/EmptyState";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import LoadingNotes from "@/components/app/LoadingNotes";
import { ApiError } from "@/lib/api";
import {
  fetchSeriesDetail,
  fetchSeriesCatalogue,
  type SeriesDetail,
  type SeriesSummary,
} from "@/lib/series";
import { likeEntity, unlikeEntity } from "@/lib/likes";
import { debounceByKey } from "@/lib/debounce";

function titleCase(voice: string): string {
  return voice.charAt(0) + voice.slice(1).toLowerCase();
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function SeriesDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Unknown aspect ratio (admin-uploaded, unlike the fixed-pixel static
  // banners elsewhere) — measured off the real file once it loads, so the
  // container's height can match it exactly and object-cover never crops
  // anything. Until then, a reasonable default avoids a huge jump.
  const [principalRatio, setPrincipalRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchSeriesDetail(id)
      .then(setSeries)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this series."),
      );
  }, [id]);

  // "More about {narrator}" — other series read by the same voice, via the
  // catalogue's own voice filter (GET /series/catalogue?voice=...). Waits
  // on `series` since the voice isn't known until the detail loads.
  const [moreByVoice, setMoreByVoice] = useState<SeriesSummary[] | null>(null);

  useEffect(() => {
    if (!series) return;
    fetchSeriesCatalogue(0, 7, series.voice)
      .then((page) =>
        setMoreByVoice(page.content.filter((s) => s.id !== series.id).slice(0, 6)),
      )
      .catch(() => setMoreByVoice([]));
  }, [series?.voice, series?.id]);

  if (!id) {
    return (
      <>
        <Navbar />
        <EmptyState title="No series selected" subtitle="Open this page from a series on the series page." />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <EmptyState title="Couldn't load this" subtitle={error} />
        <Footer />
      </>
    );
  }

  if (!series) {
    return (
      <>
        <Navbar />
        <LoadingNotes />
      </>
    );
  }

  const totalChapters = series.chapters.length;
  const doneChapters = series.chapters.filter((c) => c.status === "DONE").length;
  const currentChapter = series.chapters.find((c) => c.status === "CURRENT");
  const pct = totalChapters ? Math.round((doneChapters / totalChapters) * 100) : 0;
  const startLabel =
    doneChapters === 0
      ? "Start session"
      : doneChapters >= totalChapters
        ? "Replay session"
        : `Resume chapter ${String((currentChapter?.position ?? doneChapters) + 1).padStart(2, "0")}`;
  // CURRENT is unset once every chapter is DONE (a full replay) — fall back
  // to the first chapter in that case, same as starting fresh.
  const startChapterId = currentChapter?.id ?? series.chapters[0]?.id;

  function handleLikeToggle(next: boolean) {
    // LikeButton now calls this on every click, instantly (no internal
    // debounce), so the count/heart never lags behind the user's tap. Only
    // the actual network call is debounced (by entity id), coalescing rapid
    // repeat clicks into a single trailing request — same pattern as
    // handleSaveToggle below.
    setSeries(
      (s) =>
        s && {
          ...s,
          likedByCurrentUser: next,
          likeCount: s.likeCount + (next ? 1 : -1),
        },
    );
    debounceByKey(`like-series-${series!.id}`, () => {
      (next ? likeEntity : unlikeEntity)("SERIES", series!.id).catch(() => {
        setSeries(
          (s) =>
            s && {
              ...s,
              likedByCurrentUser: !next,
              likeCount: s.likeCount + (next ? -1 : 1),
            },
        );
      });
    });
  }

  return (
    <>
      {/* Entrance transition for the whole page (hero included, unlike
          archive.tsx which only fades in the content below its static
          title hero) — the hero here is the dominant visual and per-series
          dynamic content (not a fixed banner), so leaving it out made the
          fade-in barely noticeable. Keyed by the series id so it replays
          navigating from one series' detail page straight to another, not
          just on first mount. */}
      <div key={id} className="animate-[jazzlogs-fade-up_.6s_ease-out]">
      {/* Principal image — same structure as the title hero on the series
          home page: an unshifted outer box (so Navbar below stays in the
          normal centered column, not bled full-width itself) whose height
          is set from the image's own measured ratio, with a nested
          full-bleed layer (absolute + w-screen) just for the image. The
          ratio is unknown ahead of time (admin-uploaded, unlike the
          fixed-pixel static banners elsewhere), so it's measured off the
          real file on load — once known, the container matches it exactly
          and object-cover never crops anything. Falls back to a plain
          placeholder block until the admin uploads one (principalImageUrl
          is null until then). */}
      <div
        className="relative"
        style={{
          height: `calc((100vw - var(--sidebar-width)) * ${principalRatio ?? 0.5})`,
        }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          {series.principalImageUrl ? (
            <Image
              src={series.principalImageUrl}
              alt={series.title}
              fill
              unoptimized
              className="object-cover"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth > 0) {
                  setPrincipalRatio(img.naturalHeight / img.naturalWidth);
                }
              }}
            />
          ) : (
            <ImagePlaceholder label="Principal image" />
          )}
        </div>
        <div className="relative z-10 flex h-full flex-col">
          <Navbar />
        </div>
      </div>

      {/* Presenting the series — title/dek/description plus the real
          per-chapter progress (each chapter's status is computed
          server-side against the current viewer's listens, same as the
          detail's Chapters list below will use), and the real cover. */}
      <div className="grid grid-cols-1 items-start gap-9 pt-11 md:grid-cols-[1fr_360px]">
        <div>
          <div className="font-[family-name:var(--font-fraunces)] text-[48px] leading-[.9] font-extrabold tracking-[-.05em] text-[#F6D013] sm:text-[64px]">
            {series.title}
          </div>
          {series.dek && (
            <div className="mt-4 max-w-[500px] font-[family-name:var(--font-newsreader)] text-[20px] leading-[1.32] font-semibold tracking-[-.02em]">
              {series.dek}
            </div>
          )}
          {series.description && (
            <p className="mt-4 max-w-[520px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.78)]">
              {series.description}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.62)]">
            <span>{totalChapters} {totalChapters === 1 ? "chapter" : "chapters"}</span>
            <span>· Narrated by {series.voice}</span>
            <span>· {series.totalListenings} {series.totalListenings === 1 ? "listen" : "listens"}</span>
          </div>

          {totalChapters > 0 && (
            <div className="mt-6 max-w-[440px]">
              <div className="flex justify-between font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.6)]">
                <span>{doneChapters} of {totalChapters} chapters</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(232,220,192,.18)]">
                <div className="h-1.5 bg-[#F6D013]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {startChapterId && (
              <Link
                href={`/chapter-player?seriesId=${series.id}&chapterId=${startChapterId}`}
                className="rounded-full bg-[#F6D013] px-6.5 py-3.5 text-[14px] font-bold text-[#1C1A14] no-underline"
              >
                ▸ {startLabel}
              </Link>
            )}
            <LikeButton
              initialCount={series.likeCount}
              initialLiked={series.likedByCurrentUser}
              label="Like series"
              hideCount
              onToggle={handleLikeToggle}
            />
            <LikeButton
              initialCount={series.likeCount}
              initialLiked={series.likedByCurrentUser}
              readOnly
              size={17}
            />
          </div>
        </div>
        <div className="relative aspect-square w-full overflow-hidden rounded-[18px] md:w-[360px]">
          {series.coverImageUrl ? (
            <Image
              src={series.coverImageUrl}
              alt={series.title}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder label="Session cover" />
          )}
        </div>
      </div>

      {/* Chapters — status (DONE/CURRENT/LOCKED) comes straight from the
          backend, computed against the current viewer's listens (same
          fields the progress bar above already reads), so there's no local
          "done" simulation like the old mock had. */}
      {totalChapters > 0 && (
        <>
          <div className="mt-14 border-b-[1.5px] border-[#F6D013] pb-3">
            <span className="font-[family-name:var(--font-fraunces)] text-[16px] font-extrabold tracking-[-.01em]">
              Chapters
            </span>
          </div>

          <div className="mt-6.5 flex flex-col gap-6">
            {series.chapters.map((c, i) => {
              const isDone = c.status === "DONE";
              const isCurrent = c.status === "CURRENT";
              const duration = formatDuration(c.audioDurationSeconds);
              const metaParts = [c.track?.name, duration].filter(Boolean);
              return (
                <div key={c.id}>
                {i > 0 && <div className="mb-6 border-t-[1.5px] border-[#F6D013]" />}
                <div
                  className="overflow-hidden rounded-2xl border-[1.5px]"
                  style={{
                    borderColor: isCurrent ? "#F6D013" : "rgba(232,220,192,.2)",
                    background: isCurrent ? "rgba(232,220,192,.05)" : "transparent",
                  }}
                >
                  {c.landscapeImageUrl && (
                    <div className="relative aspect-[21/9] w-full overflow-hidden">
                      <Image
                        src={c.landscapeImageUrl}
                        alt={c.title ?? c.track?.name ?? `Chapter ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-6 p-6.5">
                    <div className="flex w-[52px] flex-none flex-col items-center gap-2">
                      <span className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[rgba(232,220,192,.6)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] font-semibold"
                        style={{
                          background: isDone ? "#2A261C" : isCurrent ? "#F6D013" : "transparent",
                          color: isDone ? "#F6D013" : isCurrent ? "#1C1A14" : "transparent",
                          border: isDone
                            ? "1.5px solid #2A261C"
                            : isCurrent
                              ? "1.5px solid #F6D013"
                              : "1.5px solid rgba(232,220,192,.3)",
                        }}
                      >
                        {isDone ? "✓" : isCurrent ? "▸" : ""}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-[family-name:var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.55)]">
                          Chapter {String(i + 1).padStart(2, "0")}
                        </span>
                        {(isDone || isCurrent) && (
                          <span
                            className="rounded-[5px] px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[9.5px] font-bold uppercase tracking-[.12em]"
                            style={{
                              background: isDone ? "transparent" : "#2A261C",
                              color: isDone ? "rgba(232,220,192,.55)" : "#F6D013",
                              border: isDone ? "1.5px solid rgba(232,220,192,.35)" : "none",
                            }}
                          >
                            {isDone ? "Played" : "Up next"}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 font-[family-name:var(--font-fraunces)] text-[26px] font-extrabold leading-[1.02] tracking-[-.03em]">
                        {c.title ?? c.track?.name ?? `Chapter ${i + 1}`}
                      </div>
                      {metaParts.length > 0 && (
                        <div className="mt-2.5 font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.7)]">
                          {metaParts.join(" · ")}
                        </div>
                      )}
                      {c.note && (
                        <p className="mt-3 max-w-[640px] font-[family-name:var(--font-newsreader)] text-[15px] leading-[1.62] text-[rgba(232,220,192,.82)]">
                          {c.note}
                        </p>
                      )}
                      <Link
                        href={`/chapter-player?seriesId=${series.id}&chapterId=${c.id}`}
                        className="mt-3.5 inline-block rounded-full text-[13px] font-bold no-underline"
                        style={{
                          background: isCurrent ? "#F6D013" : "transparent",
                          color: isCurrent ? "#1C1A14" : "#E8DCC0",
                          border: isCurrent ? "none" : "1.5px solid #F6D013",
                          padding: isCurrent ? "13px 22px" : "12px 20px",
                        }}
                      >
                        {isDone ? "▸ Play again" : "▸ Play this chapter"}
                      </Link>
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Banner image — full-bleed, same viewport-bleed trick as the other
          full-bleed sections on the series home page. Unlike the principal
          image above, nothing is overlaid on top of it, so there's no
          Navbar-alignment concern with shifting the whole element: a plain
          normal-flow <img> sized w-full h-auto shows it at its own real
          aspect ratio (unknown ahead of time — admin-uploaded), nothing
          cropped. Hidden entirely until the admin uploads one
          (bannerImageUrl is null until then). */}
      {series.bannerImageUrl && (
        <div className="relative mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={series.bannerImageUrl}
            alt=""
            className="block w-full h-auto"
          />
        </div>
      )}

      {/* About the narrator — the full character illustration from
          public/characters/ (square source art, unlike the small circular
          crop used on the series home page), not fetched from the API —
          voice is just an enum code, there's no bio text to show alongside
          it. */}
      <div className="mt-14 flex flex-col items-center gap-6 rounded-2xl bg-[#2A261C] p-9 text-center sm:flex-row sm:text-left">
        <div className="relative aspect-square w-[220px] flex-none overflow-hidden rounded-2xl">
          <Image
            src={`/characters/${series.voice.toLowerCase()}.png`}
            alt={series.voice}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div>
          <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.6)]">
            About the narrator
          </span>
          <div className="mt-2 font-[family-name:var(--font-fraunces)] text-[36px] leading-[.92] font-extrabold tracking-[-.04em] text-[#F6D013]">
            {titleCase(series.voice)}
          </div>
          <p className="mt-3 max-w-[480px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.78)]">
            {titleCase(series.voice)} narrates this series — one of eight voices behind JazzLogs Series, each with their own read on the music.
          </p>
        </div>
      </div>

      {/* More about {narrator} — other series read by the same voice, from
          GET /series/catalogue?voice=... (the current series filtered out
          client-side). Hidden entirely once we know there's nothing else
          (empty array); nothing rendered while still loading (null). */}
      {moreByVoice && moreByVoice.length > 0 && (
        <div className="mt-14">
          <div className="font-[family-name:var(--font-fraunces)] text-[32px] leading-[.92] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[40px]">
            More about {titleCase(series.voice)}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moreByVoice.map((s) => (
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
                  <div className="mt-1 text-[12px] font-bold">Start series →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer image — full-bleed, same treatment as the banner image
          above (plain normal-flow <img>, unknown aspect ratio), plus the
          same "become a member" CTA laid over its top-right corner as the
          series home page's own final banner (series are paid content).
          Hidden entirely until the admin uploads one (footerImageUrl is
          null until then). */}
      {series.footerImageUrl && (
        <div className="relative mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={series.footerImageUrl}
            alt=""
            className="block w-full h-auto"
          />
          <div className="absolute top-1/2 right-8 z-10 flex -translate-y-1/2 flex-col items-center gap-3 text-center sm:right-16">
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
      )}
      </div>

      <Footer />
    </>
  );
}

export default function SeriesDetailPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <LoadingNotes />
        </>
      }
    >
      <SeriesDetailContent />
    </Suspense>
  );
}
