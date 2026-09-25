"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useFullBleedContent } from "@/components/app/SidebarContext";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import { AverageStars, InteractiveStars } from "@/components/app/StarRating";
import { ApiError } from "@/lib/api";
import {
  fetchSeriesDetail,
  fetchSeriesChapter,
  completeSeriesChapter,
  type SeriesDetail,
  type SeriesChapterWithAudio,
} from "@/lib/series";
import { markTrackListened, unmarkTrackListened, rateTrack } from "@/lib/albums";
import { saveItem, unsaveItem } from "@/lib/savedItems";
import { createNote } from "@/lib/notes";
import { debounceByKey } from "@/lib/debounce";

function fmt(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

const SPEEDS = [1, 1.25, 1.5, 0.75];

function ChapterPlayerContent() {
  // This page owns a full-height, fullscreen-player layout — it opts out
  // of AppContent's usual centered-column treatment (same as the agent
  // chat) rather than being squeezed into it, but keeps the Sidebar.
  useFullBleedContent();

  const searchParams = useSearchParams();
  const seriesId = searchParams.get("seriesId");
  const chapterId = searchParams.get("chapterId");

  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) return;
    fetchSeriesDetail(seriesId)
      .then(setSeries)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this series."),
      );
  }, [seriesId]);

  // The one endpoint that both has the full chapter content AND a freshly
  // signed audioUrl (1 hour validity) — the chapters[] list on the series
  // detail above never carries audioUrl, to avoid signing one URL per
  // chapter on every series-detail load. undefined while loading; once
  // loaded, audioUrl on it is null if no audio's been uploaded yet (not a
  // 404 case anymore).
  const [chapterData, setChapterData] = useState<SeriesChapterWithAudio | undefined>(undefined);

  useEffect(() => {
    if (!seriesId || !chapterId) return;
    setChapterData(undefined);
    fetchSeriesChapter(seriesId, chapterId)
      .then(setChapterData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this chapter."),
      );
  }, [seriesId, chapterId]);

  const audioUrl = chapterData?.audioUrl ?? null;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(75);
  // Guards against firing the complete call more than once per chapter —
  // "ended" can fire again on a replay.
  const completedRef = useRef(false);
  // "Continue" on a TRACK chapter reveals the real track's info (cover,
  // Spotify link, rating, listened) in place first — it only becomes an
  // actual Link to the next chapter once that's been shown.
  const [trackRevealed, setTrackRevealed] = useState(false);
  // The track shape here has no isSaved field (unlike AlbumTrack), so this
  // starts blank rather than reflecting a real "already on your list"
  // state — same "Listen later" toggle as the album editorial otherwise.
  const [savedOverride, setSavedOverride] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTitleInput, setNoteTitleInput] = useState("");
  const [noteTextInput, setNoteTextInput] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteSubmitted, setNoteSubmitted] = useState(false);

  useEffect(() => {
    completedRef.current = false;
    setPlaying(false);
    setT(0);
    setDur(0);
    setTrackRevealed(false);
    setSavedOverride(false);
    setNoteModalOpen(false);
    setNoteSubmitted(false);
  }, [chapterId]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume, audioUrl]);

  // Autoplay each chapter's audio as soon as it's ready — the browser can
  // still block this without a recent user gesture, in which case it just
  // fails silently and the play button works as a normal manual start.
  // Guarded per chapterId (not just audioUrl) because handleEnded below
  // refetches the chapter to sync its completion state, and that refetch
  // comes back with a freshly re-signed audioUrl for the SAME chapter —
  // without this guard, that url change alone would re-trigger this effect
  // and restart playback right after it just finished.
  const autoplayedChapterRef = useRef<string | null>(null);
  useEffect(() => {
    if (!audioUrl || !chapterId) return;
    if (autoplayedChapterRef.current === chapterId) return;
    autoplayedChapterRef.current = chapterId;
    audioRef.current?.play().catch(() => {});
  }, [audioUrl, chapterId]);

  function handleEnded() {
    setPlaying(false);
    if (completedRef.current || !seriesId || !chapterId) return;
    completedRef.current = true;
    completeSeriesChapter(seriesId, chapterId)
      .then(() => {
        fetchSeriesDetail(seriesId).then(setSeries);
        fetchSeriesChapter(seriesId, chapterId).then(setChapterData);
      })
      .catch(() => {
        completedRef.current = false;
      });
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

  // "Continue" swaps the hero over to the track panel and hides the player
  // bar entirely (there's no chapter narration audio left to control at
  // that point) — stop playback first so it doesn't keep going silently in
  // the background with no visible transport controls left to stop it.
  function handleContinue() {
    audioRef.current?.pause();
    setTrackRevealed(true);
  }

  // Optimistic updates on the current chapter's track, same idiom as the
  // album editorial's track rows — applied straight onto chapterData.track
  // since that's the only place this data lives here (not a separate
  // tracks array).
  function withTrackUpdate(
    apply: (track: NonNullable<SeriesChapterWithAudio["track"]>) => NonNullable<SeriesChapterWithAudio["track"]>,
  ) {
    setChapterData((d) => {
      if (!d || !d.track) return d;
      return { ...d, track: apply(d.track) };
    });
  }

  function handleTrackListen(trackId: string, currentlyListened: boolean) {
    const next = !currentlyListened;
    withTrackUpdate((track) => ({ ...track, hasListened: next }));
    debounceByKey(`listen-track-${trackId}`, () => {
      (next ? markTrackListened : unmarkTrackListened)(trackId).catch(() => {
        withTrackUpdate((track) => ({ ...track, hasListened: currentlyListened }));
      });
    });
  }

  function handleTrackRate(trackId: string, rating: number) {
    const previousRating = chapterData?.track?.myRating ?? null;
    withTrackUpdate((track) => ({ ...track, myRating: rating }));
    debounceByKey(`rate-track-${trackId}`, () => {
      rateTrack(trackId, rating).catch(() => {
        withTrackUpdate((track) => ({ ...track, myRating: previousRating }));
      });
    });
  }

  function handleTrackSaveToggle(trackId: string, currentlySaved: boolean) {
    const next = !currentlySaved;
    setSavedOverride(next);
    debounceByKey(`save-track-${trackId}`, () => {
      (next ? saveItem : unsaveItem)("TRACK", trackId).catch(() => {
        setSavedOverride(currentlySaved);
      });
    });
  }

  async function handleWriteNote(trackId: string) {
    const title = noteTitleInput.trim();
    const text = noteTextInput.trim();
    if (!title || !text) return;
    setNoteSubmitting(true);
    try {
      await createNote(trackId, title, text, null);
      setNoteModalOpen(false);
      setNoteTitleInput("");
      setNoteTextInput("");
      setNoteSubmitted(true);
    } catch {
      // Leave the draft (and the modal open) in place so the user can retry.
    } finally {
      setNoteSubmitting(false);
    }
  }

  if (!seriesId || !chapterId) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 bg-[#1C1A14] px-6 text-center text-[#E8DCC0]">
        <div className="font-[family-name:var(--font-fraunces)] text-[34px] font-extrabold tracking-[-.035em] text-[#F6D013]">
          No chapter selected
        </div>
        <div className="text-[15px] text-[rgba(232,220,192,.6)]">
          Open this page from a chapter in a series.
        </div>
        <Link href="/series" className="mt-2 text-[14px] font-bold text-[#F6D013] no-underline">
          ← Back to series
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 bg-[#1C1A14] px-6 text-center text-[#E8DCC0]">
        <div className="font-[family-name:var(--font-fraunces)] text-[34px] font-extrabold tracking-[-.035em] text-[#F6D013]">
          Couldn&rsquo;t load this
        </div>
        <div className="text-[15px] text-[rgba(232,220,192,.6)]">{error}</div>
        <Link href={`/series/detail?id=${seriesId}`} className="mt-2 text-[14px] font-bold text-[#F6D013] no-underline">
          ← Back to series
        </Link>
      </div>
    );
  }

  if (!series || !chapterData) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[#1C1A14] text-[#E8DCC0]">
        Loading…
      </div>
    );
  }

  const index = series.chapters.findIndex((c) => c.id === chapterId);
  const chapter = chapterData;

  if (index === -1) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 bg-[#1C1A14] px-6 text-center text-[#E8DCC0]">
        <div className="font-[family-name:var(--font-fraunces)] text-[34px] font-extrabold tracking-[-.035em] text-[#F6D013]">
          Chapter not found
        </div>
        <Link href={`/series/detail?id=${seriesId}`} className="mt-2 text-[14px] font-bold text-[#F6D013] no-underline">
          ← Back to {series.title}
        </Link>
      </div>
    );
  }

  const prevChapter = index > 0 ? series.chapters[index - 1] : null;
  const nextChapter = index < series.chapters.length - 1 ? series.chapters[index + 1] : null;
  // On the last chapter there's no next one to advance to — the forward
  // button sends you back to the series page instead, so every chapter
  // still ends on some forward action, not a dead end.
  const advanceHref = nextChapter
    ? `/chapter-player?seriesId=${seriesId}&chapterId=${nextChapter.id}`
    : `/series/detail?id=${seriesId}`;
  const advanceLabel = nextChapter ? "Next chapter →" : "Finish series →";
  const duration = dur || chapter.audioDurationSeconds || 0;
  const pct = duration ? (t / duration) * 100 : 0;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#1C1A14] text-[#E8DCC0]">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
          onEnded={handleEnded}
        />
      )}

      {/* Hero — the chapter image AS the background (not a stacked section):
          a full-bleed layer that fills the entire remaining viewport
          height (flex-1 inside the h-full/overflow-hidden page — the page
          never scrolls), with the title/note overlaid on top of it (z-10).
          The image extends all the way down behind the player bar below
          (that bar is transparent with a dark filter over it, not opaque),
          rather than stopping above it. Bleeds past the Sidebar's current
          width, same trick used elsewhere for full-bleed washes. No image
          → falls back to the plain dark page background, title still
          renders normally. */}
      {/* Keyed by chapterId so the fade-in replays on every chapter change,
          not just the page's first mount — a fresh key means React
          remounts this element, and a CSS animation on a freshly-mounted
          element always plays from the start. */}
      <div key={chapterId} className="relative flex-1 animate-[jazzlogs-fade-up_.45s_ease-out]">
        {chapter.imageUrl && (
          <>
            <div className="absolute inset-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={chapter.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
            {/* Subtle scrim — darkest where the title/note sit (top-right),
                fading to nothing toward the rest of the image, so the text
                stays readable no matter how light or busy the photo is
                there, without flattening the whole hero into a dark box. */}
            <div className="pointer-events-none absolute inset-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 bg-gradient-to-bl from-black/75 via-black/25 to-transparent" />
            {/* Once the track panel is revealed, darken the whole image
                further (not just the top-right gradient above) so the
                panel — now over the photo itself, not just the corner the
                scrim was tuned for — stays legible too. */}
            <div
              className={
                "pointer-events-none absolute inset-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 bg-black transition-opacity duration-500 " +
                (trackRevealed ? "opacity-40" : "opacity-0")
              }
            />
          </>
        )}
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-6 px-6 py-12 sm:px-14">
            <Link
              href={`/series/detail?id=${seriesId}`}
              className="max-w-[160px] flex-none truncate rounded-full bg-[#F6D013] px-5 py-2.5 text-[13px] font-bold text-[#1C1A14] no-underline sm:max-w-[260px]"
            >
              ← {series.title}
            </Link>
            {!trackRevealed && (
              <div className="max-w-[560px] text-right">
                <div className="font-[family-name:var(--font-fraunces)] text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#F6D013] sm:text-[80px]">
                  {chapter.title ?? chapter.track?.name ?? `Chapter ${index + 1}`}
                </div>
                {chapter.note && (
                  <div className="mt-5 text-[18px] leading-[1.5] font-medium tracking-[-.01em] text-[rgba(232,220,192,.82)]">
                    {chapter.note}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Second row, below the title/dek — the track panel
              (cover/Spotify-link/rating/listened, same treatment as a
              track row on the album editorial page) once "Continue" is
              pressed on a TRACK chapter, plus "Your notes" on the other
              side once that happens too. */}
          <div className="flex flex-1 items-center justify-center gap-6 px-6 sm:px-14">
            <div className="max-w-[820px]">
              {trackRevealed && chapter.track && (
                <div className="flex animate-[jazzlogs-fade-up_.9s_ease-out] items-start gap-12">
                  <div className="w-[380px] flex-none">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#2A261C]">
                      {chapter.track.imageUrl ? (
                        <Image
                          src={chapter.track.imageUrl}
                          alt={chapter.track.name}
                          fill
                          unoptimized
                          // Slight zoom crops out the thin white border some
                          // Spotify cover art has baked into the file itself —
                          // same treatment as the album editorial's own Cover.
                          className="scale-[1.06] object-cover"
                        />
                      ) : (
                        <ImagePlaceholder label="Cover" />
                      )}
                    </div>
                    {chapter.track.spotifyUrl && (
                      <a
                        href={chapter.track.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex items-center justify-center gap-2.5 rounded-full bg-black px-6 py-3.5 text-[14px] font-bold text-[#E8DCC0] no-underline"
                      >
                        <svg width="19" height="19" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="12" fill="#1DB954" />
                          <path
                            d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.4.55.25.85z"
                            fill="#000000"
                          />
                        </svg>
                        Listen on Spotify
                      </a>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-[family-name:var(--font-fraunces)] text-[52px] leading-[1.0] font-extrabold tracking-[-.03em] text-[#F6D013]">
                      {chapter.track.name}
                    </div>
                    <div className="mt-3 text-[18px] font-semibold text-[rgba(232,220,192,.75)]">
                      {chapter.track.artistName} · {chapter.track.albumName}
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                      <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.55)]">
                        JazzLogs rating
                      </span>
                      <AverageStars
                        value={chapter.track.avgRating ?? 0}
                        size={26}
                        fillColor="#F6D013"
                        emptyColor="rgba(232,220,192,.4)"
                      />
                      <span className="text-[18px] font-bold">
                        {chapter.track.avgRating ? chapter.track.avgRating.toFixed(1) : "—"}
                      </span>
                    </div>
                    <div className="mt-3.5 flex items-center gap-3">
                      <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.55)]">
                        You
                      </span>
                      <InteractiveStars
                        size={26}
                        initial={chapter.track.myRating ?? 0}
                        fillColor="#F6D013"
                        emptyColor="rgba(232,220,192,.4)"
                        onRate={(n) => handleTrackRate(chapter.track!.id, n)}
                      />
                    </div>
                    <div className="mt-6 flex flex-nowrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTrackListen(chapter.track!.id, chapter.track!.hasListened)}
                        className="flex-none whitespace-nowrap rounded-full px-5 py-3 text-[13px] font-bold"
                        style={{
                          background: chapter.track.hasListened ? "#F6D013" : "#2A261C",
                          color: chapter.track.hasListened ? "#1C1A14" : "rgba(232,220,192,.8)",
                        }}
                      >
                        ✓ Listened
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTrackSaveToggle(chapter.track!.id, savedOverride)}
                        className="flex-none whitespace-nowrap rounded-full px-5 py-3 text-[13px] font-bold"
                        style={{
                          background: savedOverride ? "#F6D013" : "#2A261C",
                          color: savedOverride ? "#1C1A14" : "rgba(232,220,192,.8)",
                        }}
                      >
                        {savedOverride ? "On your list" : "Listen later"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteModalOpen(true)}
                        className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F6D013] px-4 py-3 text-[13px] font-bold text-[#1C1A14]"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                        Write a note
                      </button>
                    </div>
                    {noteSubmitted && (
                      <div className="mt-3 text-[13px] font-semibold text-[#F6D013]">
                        Note posted.
                      </div>
                    )}
                    {chapter.track.moods.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {chapter.track.moods.map((tag) => (
                          <span
                            key={tag.code}
                            className="rounded-full border-[1.5px] border-[#F6D013] px-3 py-1.5 text-[13px] font-semibold"
                            style={{ background: "#2A261C" }}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Previous/Next chapter — moved off the (transparent) player
              bar below and onto the bottom of the background image itself,
              so the bar underneath stays just the transport controls.
              Enough bottom padding to clear the bar's own height, so it
              never overlaps these. "Continue" on a TRACK chapter reveals
              the track panel above first (in place, no navigation) — only
              becomes a real link to the next chapter once that's shown. */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-6 pb-[150px] sm:px-14">
            {prevChapter || trackRevealed ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {prevChapter && (
                  <Link
                    href={`/chapter-player?seriesId=${seriesId}&chapterId=${prevChapter.id}`}
                    className="rounded-full bg-[#F6D013] px-5 py-2.5 text-[13px] font-bold text-[#1C1A14] no-underline"
                  >
                    ← Previous chapter
                  </Link>
                )}
                {trackRevealed && (
                  <button
                    type="button"
                    onClick={() => setTrackRevealed(false)}
                    className="rounded-full bg-[#F6D013] px-5 py-2.5 text-[13px] font-bold text-[#1C1A14]"
                  >
                    ← Back to chapter
                  </button>
                )}
              </div>
            ) : (
              // Keeps the forward button pushed to the right via
              // justify-between even with nothing to balance it on the
              // left — a lone flex child under justify-between lands at
              // the start, not the end, without this.
              <span />
            )}
            {chapter.track && !trackRevealed ? (
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-full bg-[#F6D013] px-5 py-2.5 text-[13px] font-bold text-[#1C1A14]"
              >
                Continue →
              </button>
            ) : (
              <Link
                href={advanceHref}
                onClick={() => {
                  // "Finish series" is the only advance action that isn't
                  // also a "Continue"/"Next chapter" the ended-audio handler
                  // already marks complete on its own — mark this last
                  // chapter done on the way out instead of leaving it stuck
                  // on whatever status it had before.
                  if (!nextChapter) completeSeriesChapter(seriesId, chapterId!);
                }}
                className="rounded-full bg-[#F6D013] px-5 py-2.5 text-[13px] font-bold text-[#1C1A14] no-underline"
              >
                {advanceLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Player bar — just the transport controls now (navigation buttons
          moved up onto the bottom of the background image itself). Pinned
          to the bottom of this (already full-viewport, non-scrolling)
          page, always visible. Absolute, not fixed: fixed's containing
          block would be the real viewport, ignoring the Sidebar's
          padding-left and re-bleeding the bar's "left-4" content out from
          under the Sidebar; absolute inside this relative root resolves
          against the page's own (already sidebar-offset) box instead.
          Transparent with a plain dark filter (no blur) over it, since the
          hero image extends all the way down behind it. */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-black/45 text-[#E8DCC0]">
        {/* jazzlogs wordmark — pinned to the bar's far left edge, outside
            the centered max-w-[1000px] column the transport controls live
            in, and much bigger than the rest of the bar's text. */}
        <Link
          href="/home"
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 font-[family-name:var(--font-fraunces)] text-[32px] font-extrabold tracking-[-.03em] text-[#F6D013] no-underline sm:left-8 sm:text-[44px]"
        >
          jazzlogs.
        </Link>
        {/* Transport controls — invisible (not unmounted) once "Continue"
            reveals the track: there's no more chapter narration audio to
            control at that point, but this div is what gives the bar its
            real height (the jazzlogs Link above is absolutely positioned,
            so on its own it contributes none) — unmounting it collapsed
            the bar to 0 height and threw the logo's "top: 50%" position
            off along with it. invisible keeps the layout box (and the
            logo's position) exactly as it was, just hides the controls. */}
        <div className={"mx-auto max-w-[1000px] px-6 py-5 sm:px-14" + (trackRevealed ? " invisible" : "")}>
          <div className="flex items-center gap-4">
            <span className="w-[42px] font-[family-name:var(--font-dm-sans)] text-[11px] text-[rgba(232,220,192,.6)]">
              {fmt(t)}
            </span>
            <div
              className="relative flex h-3.5 flex-1 cursor-pointer items-center"
              onClick={(e) => {
                if (!audioRef.current || !duration) return;
                const r = e.currentTarget.getBoundingClientRect();
                const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
                audioRef.current.currentTime = frac * duration;
                setT(frac * duration);
              }}
            >
              <div className="absolute left-0 right-0 h-[3px] bg-[rgba(232,220,192,.22)]" />
              <div className="absolute left-0 h-[3px] bg-[#F6D013]" style={{ width: `${pct}%` }} />
              <div
                className="absolute h-3 w-3 -translate-x-1/2 rounded-full bg-[#F6D013]"
                style={{ left: `${pct}%` }}
              />
            </div>
            <span className="w-[42px] text-right font-[family-name:var(--font-dm-sans)] text-[11px] text-[rgba(232,220,192,.6)]">
              {fmt(duration)}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-3 items-center gap-5">
            <div />

            <div className="flex items-center justify-center gap-5.5">
              <button
                type="button"
                onClick={() => audioRef.current && (audioRef.current.currentTime = 0)}
                className="text-[rgba(232,220,192,.75)]"
              >
                ↺
              </button>
              <button
                type="button"
                onClick={togglePlay}
                disabled={!audioUrl}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F6D013] text-[16px] font-semibold text-[#1C1A14] disabled:opacity-40"
              >
                {playing ? "❚❚" : "▸"}
              </button>
              <button
                type="button"
                onClick={() => audioRef.current && duration && (audioRef.current.currentTime = duration)}
                className="text-[rgba(232,220,192,.75)]"
              >
                ↻
              </button>
            </div>

            <div className="flex items-center justify-end gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #F6D013 ${volume}%, rgba(232,220,192,.22) ${volume}%)`,
                }}
                className="hidden h-[3px] w-[84px] cursor-pointer appearance-none rounded-full sm:block [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#F6D013] [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-0 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F6D013]"
              />
              <button
                type="button"
                onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
                className="rounded-full border-[1.5px] border-[rgba(232,220,192,.35)] px-3.5 py-2 font-[family-name:var(--font-dm-sans)] text-[12px] font-bold"
              >
                {speed}×
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Write-a-note modal — same sticky-note treatment as the one on
          playlists/detail and the album editorial. */}
      {noteModalOpen && chapter.track && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,.6)" }}
          onClick={() => setNoteModalOpen(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-[4px] bg-[#D89A63] p-8 text-[#1C1A14] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-[.14em] text-[rgba(28,26,20,.55)]">
                New note · {chapter.track.name}
              </div>
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                aria-label="Close"
                className="text-[22px] leading-none font-bold text-[rgba(28,26,20,.45)]"
              >
                ×
              </button>
            </div>

            <input
              autoFocus
              value={noteTitleInput}
              onChange={(e) => setNoteTitleInput(e.target.value.slice(0, 120))}
              maxLength={120}
              placeholder="Give it a title…"
              className="mt-4 w-full border-b-2 border-[rgba(28,26,20,.25)] bg-transparent pb-2 text-[21px] font-extrabold tracking-[-.02em] outline-none placeholder:text-[rgba(28,26,20,.35)]"
            />

            <textarea
              value={noteTextInput}
              onChange={(e) => setNoteTextInput(e.target.value.slice(0, 5000))}
              maxLength={5000}
              placeholder="What caught your ear?"
              rows={4}
              className="mt-4 w-full resize-none rounded-lg border border-[rgba(28,26,20,.2)] bg-[rgba(255,255,255,.35)] p-3 text-[15px] leading-[1.5] font-medium text-[#1C1A14] outline-none placeholder:text-[rgba(28,26,20,.4)]"
            />

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="text-[13px] font-bold text-[rgba(28,26,20,.55)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleWriteNote(chapter.track!.id)}
                disabled={noteSubmitting || !noteTitleInput.trim() || !noteTextInput.trim()}
                className="rounded-full bg-[#1C1A14] px-6 py-3 text-[13px] font-bold text-[#D89A63] disabled:opacity-40"
              >
                {noteSubmitting ? "Posting…" : "Post note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChapterPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 items-center justify-center bg-[#1C1A14] text-[#E8DCC0]">
          Loading…
        </div>
      }
    >
      <ChapterPlayerContent />
    </Suspense>
  );
}
