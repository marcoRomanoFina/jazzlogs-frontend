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
import { AverageStars, InteractiveStars } from "@/components/app/StarRating";
import { ApiError } from "@/lib/api";
import {
  fetchPlaylistDetail,
  type PlaylistDetail,
  type PlaylistDetailTrack,
} from "@/lib/playlists";
import { likeEntity, unlikeEntity } from "@/lib/likes";
import { saveItem, unsaveItem } from "@/lib/savedItems";
import { markTrackListened, unmarkTrackListened, rateTrack } from "@/lib/albums";
import { createNote, deleteNote, type TrackNote } from "@/lib/notes";
import { debounceByKey } from "@/lib/debounce";

const NOTE_TITLE_MAX = 120;
const NOTE_TEXT_MAX = 5000;

function parseTimestampInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":").map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (parts.length === 1) return Math.round(parts[0]);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function titleCase(voice: string): string {
  return voice.charAt(0) + voice.slice(1).toLowerCase();
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

function formatPlaylistDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatTrackDuration(ms: number | null): string {
  if (!ms) return "";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Cover({
  imageUrl,
  alt,
  className,
  zoom,
}: {
  imageUrl: string | null;
  alt: string;
  className: string;
  // Slight zoom crops out the thin white border some Spotify cover art has
  // baked into the file itself — same trick as album editorial's track
  // covers, not applied to the main playlist cover above.
  zoom?: boolean;
}) {
  if (!imageUrl) return <ImagePlaceholder label="Cover" className={className} />;
  return (
    <div className={"relative overflow-hidden " + className}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        unoptimized
        className={zoom ? "scale-[1.06] object-cover" : "object-cover"}
      />
    </div>
  );
}

// One row in the tracklist. There's no way to tell from this row alone
// whether the album actually has an editorial (this DTO doesn't carry an
// albumEditorialId) — the link always shows, pointing at albumId, and the
// album page's own "No editorial yet." empty state covers the case where
// there isn't one.
function TrackRow({
  track,
  onListenToggle,
  onRate,
  onOpenNoteModal,
  onViewNote,
}: {
  track: PlaylistDetailTrack;
  onListenToggle: (trackId: string, currentlyListened: boolean) => void;
  onRate: (trackId: string, rating: number) => void;
  onOpenNoteModal: (trackId: string) => void;
  onViewNote: (note: TrackNote, trackName: string) => void;
}) {
  return (
    <div
      id={`track-${track.trackId}`}
      className="scroll-mt-20 border-b border-[rgba(232,220,192,.2)] py-6"
    >
      <div className="grid grid-cols-1 items-start gap-7 sm:grid-cols-[260px_1fr]">
        <div className="w-full sm:w-[260px]">
          <Cover
            imageUrl={track.albumImageUrl}
            alt={track.trackName}
            className="aspect-square w-full rounded-2xl"
            zoom
          />
          {track.spotifyUrl && (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-black px-4 py-[13px] text-[13px] font-bold text-[#E8DCC0]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
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
        <div>
          <div className="font-[family-name:var(--font-fraunces)] text-[24px] leading-[1.02] font-extrabold tracking-[-.03em] sm:text-[27px]">
            {track.trackName}
          </div>
          {/* Only when the curator actually renamed it for this playlist —
              the real name is already the headline above. */}
          {track.title && (
            <div className="mt-1 text-[13px] font-medium text-[rgba(232,220,192,.5)]">
              {track.title}
            </div>
          )}
          <div className="mt-2 font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.7)]">
            {track.artistName} · {track.albumName}
          </div>
          <div className="mt-3 font-[family-name:var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(232,220,192,.55)]">
            JazzLogs rating
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <AverageStars value={track.avgRating ?? 0} size={15} />
            <span className="text-[16px] font-extrabold tracking-[-.02em]">
              {track.avgRating ? track.avgRating.toFixed(1) : "—"}
            </span>
            {track.ratingCount > 0 && (
              <span className="font-[family-name:var(--font-dm-sans)] text-[9.5px] text-[rgba(232,220,192,.55)]">
                {track.ratingCount} {track.ratingCount === 1 ? "rating" : "ratings"}
              </span>
            )}
            {track.durationMs != null && (
              <span className="ml-auto font-[family-name:var(--font-dm-sans)] text-[12px] text-[rgba(232,220,192,.6)]">
                {formatTrackDuration(track.durationMs)}
              </span>
            )}
          </div>
          <div className="mt-3 font-[family-name:var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(232,220,192,.55)]">
            Your rating
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <InteractiveStars
              size={17}
              initial={track.myRating ?? 0}
              fillColor="#F6D013"
              onRate={(n) => onRate(track.trackId, n)}
            />
          </div>
          {track.curatorNote && (
            <p className="mt-3 max-w-[620px] font-[family-name:var(--font-newsreader)] text-[14.5px] leading-[1.6] text-[rgba(232,220,192,.8)]">
              {track.curatorNote}
            </p>
          )}
          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <Link
              href={`/editorial/track?id=${track.trackId}`}
              className="inline-block rounded-full bg-[#F6D013] px-4.5 py-2.5 text-[12.5px] font-bold text-[#1C1A14] no-underline"
            >
              Read editorial →
            </Link>
            <button
              type="button"
              onClick={() => onOpenNoteModal(track.trackId)}
              className="flex items-center gap-2 rounded-full bg-[#F6D013] px-4.5 py-2.5 text-[12.5px] font-bold text-[#1C1A14]"
            >
              <svg
                width="14"
                height="14"
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
            <button
              type="button"
              onClick={() =>
                onListenToggle(track.trackId, track.listenedByCurrentUser)
              }
              className="rounded-full px-4.5 py-2.5 text-[12.5px] font-bold"
              style={{
                background: track.listenedByCurrentUser
                  ? "#2f6fed"
                  : "rgba(232,220,192,.1)",
                color: track.listenedByCurrentUser
                  ? "#fff"
                  : "rgba(232,220,192,.6)",
              }}
            >
              ✓ Listened
            </button>
          </div>
        </div>
      </div>

      {/* Track notes — my own only (myNotes), full width, not squeezed into
          the info column above. Same sticky-note treatment as album
          editorial's track notes, minus the community feed/pagination —
          there's nothing here but what I wrote myself. Hidden entirely when
          there are none; the button that opens the same modal lives in the
          row above regardless. */}
      {track.myNotes.length > 0 && (
        <div className="mt-8">
          <div className="font-[family-name:var(--font-fraunces)] text-[20px] font-extrabold tracking-[-.02em] text-[#F6D013]">
            Your last notes
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {track.myNotes.map((note, ni) => {
              const isLong = note.text.length > 220;
              return (
                <div
                  key={note.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onViewNote(note, track.trackName)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onViewNote(note, track.trackName);
                    }
                  }}
                  className="flex min-h-[160px] min-w-0 cursor-pointer flex-col gap-3 rounded-[3px] bg-[color-mix(in_srgb,#F6D013_55%,white)] p-6 text-[#1C1A14] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
                  style={{ transform: `rotate(${[-1.4, 1.2, -0.6][ni % 3]}deg)` }}
                >
                  {note.timestampSeconds != null && (
                    <span className="font-[family-name:var(--font-dm-sans)] text-[12px] font-bold text-[#8A4A1C]">
                      ▶ {formatTrackDuration(note.timestampSeconds * 1000)}
                    </span>
                  )}
                  <div className="font-[family-name:var(--font-fraunces)] text-[20px] leading-[1.15] font-extrabold tracking-[-.02em] break-words">
                    {note.title}
                  </div>
                  <p
                    className={
                      "m-0 font-[family-name:var(--font-newsreader)] text-[15px] leading-[1.5] font-medium break-words " +
                      (isLong ? "line-clamp-5" : "")
                    }
                  >
                    {note.text}
                  </p>
                  {isLong && (
                    <span className="text-[12px] font-bold text-[#8A4A1C] underline underline-offset-[3px]">
                      Read the full note →
                    </span>
                  )}
                  <div className="mt-auto text-[11px] font-semibold text-[rgba(28,26,20,.6)]">
                    {formatDate(note.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PlaylistDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Unknown aspect ratio (admin-uploaded, unlike the fixed-pixel static
  // banners elsewhere) — measured off the real file once it loads, same
  // trick series/detail.tsx uses for its own principal image.
  const [principalRatio, setPrincipalRatio] = useState<number | null>(null);

  // The "write a note" modal — one at a time, so a single set of draft
  // fields (not a per-track map) is enough; opening it resets them.
  const [noteModalTrackId, setNoteModalTrackId] = useState<string | null>(
    null,
  );
  const [noteTitleInput, setNoteTitleInput] = useState("");
  const [noteTextInput, setNoteTextInput] = useState("");
  const [noteTimestampInput, setNoteTimestampInput] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  // The clicked note, full-screen over a dimmed backdrop — same treatment as
  // writing one, just read-only (plus a delete option, since it's always
  // mine — myNotes never holds anyone else's).
  const [viewingNote, setViewingNote] = useState<{
    note: TrackNote;
    trackName: string;
  } | null>(null);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<TrackNote | null>(
    null,
  );

  useEffect(() => {
    if (!id) return;
    fetchPlaylistDetail(id)
      .then(setPlaylist)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this playlist."),
      );
  }, [id]);

  function openNoteModal(trackId: string) {
    setNoteModalTrackId(trackId);
    setNoteTitleInput("");
    setNoteTextInput("");
    setNoteTimestampInput("");
  }

  function closeNoteModal() {
    setNoteModalTrackId(null);
  }

  useEffect(() => {
    if (!noteModalTrackId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeNoteModal();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [noteModalTrackId]);

  useEffect(() => {
    if (!viewingNote) return;
    function onKeyDown(e: KeyboardEvent) {
      if (confirmDeleteNote) return;
      if (e.key === "Escape") {
        setViewingNote(null);
        setConfirmDeleteNote(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewingNote, confirmDeleteNote]);

  useEffect(() => {
    if (!confirmDeleteNote) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmDeleteNote(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmDeleteNote]);

  // Any of the three note modals covers the page behind a fixed backdrop —
  // without this the page itself can still scroll underneath it.
  useEffect(() => {
    const anyModalOpen =
      Boolean(noteModalTrackId) || Boolean(viewingNote) || Boolean(confirmDeleteNote);
    if (!anyModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [noteModalTrackId, viewingNote, confirmDeleteNote]);

  if (!id) {
    return (
      <>
        <Navbar />
        <EmptyState title="No playlist selected" subtitle="Open this page from a playlist in the archive." />
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

  if (!playlist) {
    return (
      <>
        <Navbar />
        <LoadingNotes />
      </>
    );
  }

  function handleLikeToggle(next: boolean) {
    // LikeButton calls this on every click, instantly — the count/flag
    // update right away, but the actual network call is debounced (by
    // playlist id) so rapid repeat clicks collapse into one trailing
    // request.
    setPlaylist(
      (p) =>
        p && {
          ...p,
          likedByCurrentUser: next,
          likeCount: p.likeCount + (next ? 1 : -1),
        },
    );
    debounceByKey(`like-playlist-${playlist!.id}`, () => {
      (next ? likeEntity : unlikeEntity)("PLAYLIST", playlist!.id).catch(() => {
        // Roll back the optimistic count/flag on failure.
        setPlaylist(
          (p) =>
            p && {
              ...p,
              likedByCurrentUser: !next,
              likeCount: p.likeCount + (next ? -1 : 1),
            },
        );
      });
    });
  }

  function handleSaveToggle() {
    const next = !playlist!.savedByCurrentUser;
    setPlaylist((p) => p && { ...p, savedByCurrentUser: next });
    (next ? saveItem : unsaveItem)("PLAYLIST", playlist!.id).catch(() =>
      setPlaylist((p) => p && { ...p, savedByCurrentUser: !next }),
    );
  }

  function handleTrackListenToggle(trackId: string, currentlyListened: boolean) {
    const next = !currentlyListened;
    setPlaylist(
      (p) =>
        p && {
          ...p,
          tracks: p.tracks.map((t) =>
            t.trackId === trackId ? { ...t, listenedByCurrentUser: next } : t,
          ),
        },
    );
    (next ? markTrackListened : unmarkTrackListened)(trackId).catch(() => {
      setPlaylist(
        (p) =>
          p && {
            ...p,
            tracks: p.tracks.map((t) =>
              t.trackId === trackId
                ? { ...t, listenedByCurrentUser: currentlyListened }
                : t,
            ),
          },
      );
    });
  }

  function handleTrackRate(trackId: string, rating: number) {
    const previousRating =
      playlist?.tracks.find((t) => t.trackId === trackId)?.myRating ?? null;
    setPlaylist(
      (p) =>
        p && {
          ...p,
          tracks: p.tracks.map((t) =>
            t.trackId === trackId ? { ...t, myRating: rating } : t,
          ),
        },
    );
    debounceByKey(`rate-track-${trackId}`, () => {
      rateTrack(trackId, rating).catch(() => {
        setPlaylist(
          (p) =>
            p && {
              ...p,
              tracks: p.tracks.map((t) =>
                t.trackId === trackId
                  ? { ...t, myRating: previousRating }
                  : t,
              ),
            },
        );
      });
    });
  }

  async function handleWriteNote(trackId: string) {
    const title = noteTitleInput.trim();
    const text = noteTextInput.trim();
    if (!title || !text) return;
    const timestampSeconds = parseTimestampInput(noteTimestampInput);
    setNoteSubmitting(true);
    try {
      const note = await createNote(trackId, title, text, timestampSeconds);
      setPlaylist(
        (p) =>
          p && {
            ...p,
            tracks: p.tracks.map((t) =>
              t.trackId === trackId
                ? { ...t, myNotes: [note, ...t.myNotes] }
                : t,
            ),
          },
      );
      closeNoteModal();
    } catch {
      // Leave the draft (and the modal open) in place so the user can retry.
    } finally {
      setNoteSubmitting(false);
    }
  }

  function handleDeleteNote(note: TrackNote) {
    const trackId = note.trackId;
    setPlaylist(
      (p) =>
        p && {
          ...p,
          tracks: p.tracks.map((t) =>
            t.trackId === trackId
              ? { ...t, myNotes: t.myNotes.filter((n) => n.id !== note.id) }
              : t,
          ),
        },
    );
    setViewingNote(null);
    setConfirmDeleteNote(null);

    deleteNote(note.id).catch(() => {
      setPlaylist(
        (p) =>
          p && {
            ...p,
            tracks: p.tracks.map((t) =>
              t.trackId === trackId
                ? { ...t, myNotes: [note, ...t.myNotes] }
                : t,
            ),
          },
      );
    });
  }

  return (
    <>
      {/* Entrance transition for the whole page (principal image included),
          same treatment as series/detail.tsx. Keyed by the playlist id so
          it replays navigating from one playlist's detail page straight to
          another, not just on first mount. */}
      <div key={id} className="animate-[jazzlogs-fade-up_.6s_ease-out]">
      {/* Principal image — same structure as series/detail.tsx's own: an
          unshifted outer box (so Navbar below stays in the normal centered
          column, not bled full-width itself) whose height is set from the
          image's own measured ratio, with a nested full-bleed layer
          (absolute + w-screen) just for the image. Falls back to a plain
          placeholder block until the admin uploads one (principalImageUrl
          is null until then). */}
      <div
        className="relative"
        style={{
          height: `calc((100vw - var(--sidebar-width)) * ${principalRatio ?? 0.5})`,
        }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          {playlist.principalImageUrl ? (
            <Image
              src={playlist.principalImageUrl}
              alt={playlist.title}
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

      <div className="mt-8 flex justify-between border-y border-[#F6D013] py-3 font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <Link href="/playlists" className="no-underline">
          ← All playlists
        </Link>
        <span>Updated {formatDate(playlist.updatedAt)}</span>
      </div>

      <div className="mt-11 grid grid-cols-1 items-start gap-9 md:grid-cols-[1fr_420px]">
        <div>
          <div className="font-[family-name:var(--font-fraunces)] text-[48px] leading-[.9] font-extrabold tracking-[-.05em] text-[#F6D013] sm:text-[64px]">
            {playlist.title}
          </div>
          {playlist.tagline && (
            <div className="mt-5 max-w-[500px] font-[family-name:var(--font-newsreader)] text-[22px] leading-[1.3] font-semibold tracking-[-.02em]">
              {playlist.tagline}
            </div>
          )}
          {playlist.description && (
            <p className="mt-7 max-w-[540px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.8] text-[rgba(232,220,192,.75)]">
              {playlist.description}
            </p>
          )}
          <div className="mt-6 flex gap-5 font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.62)]">
            <span>
              {playlist.trackCount} {playlist.trackCount === 1 ? "track" : "tracks"}
            </span>
            {playlist.durationMs > 0 && (
              <span>· {formatPlaylistDuration(playlist.durationMs)}</span>
            )}
            <span>· Curated by {titleCase(playlist.byline)}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <LikeButton
              initialCount={playlist.likeCount}
              initialLiked={playlist.likedByCurrentUser}
              hideCount
              onToggle={handleLikeToggle}
            />
            <button
              type="button"
              onClick={handleSaveToggle}
              className="rounded-full px-6 py-[15px] text-[14px] font-bold"
              style={{
                background: playlist.savedByCurrentUser
                  ? "#F6D013"
                  : "rgba(232,220,192,.1)",
                color: playlist.savedByCurrentUser
                  ? "#1C1A14"
                  : "rgba(232,220,192,.6)",
              }}
            >
              {playlist.savedByCurrentUser ? "On your list" : "Listen later"}
            </button>
            <div className="flex items-center gap-2 text-[28px] font-extrabold tracking-[-.03em] text-[#F6D013]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#F6D013"
                stroke="#F6D013"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {playlist.likeCount}
            </div>
          </div>
          {playlist.styleTags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {playlist.styleTags.map((tag) => (
                <span
                  key={tag.code}
                  className="rounded-full border-[1.5px] border-[#F6D013] px-2.5 py-1.5 text-[11px] font-semibold"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <Cover
            imageUrl={playlist.coverImageUrl}
            alt={playlist.title}
            className="aspect-square w-full rounded-2xl md:w-[420px]"
          />
          {playlist.spotifyUrl && (
            <a
              href={playlist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-2.5 rounded-full bg-black px-6 py-[15px] text-[14px] font-bold text-[#E8DCC0]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
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
      </div>

      <div className="mt-14 border-b-[1.5px] border-[#F6D013] pb-3" />

      {playlist.tracks.map((track) => (
        <TrackRow
          key={track.trackId}
          track={track}
          onListenToggle={handleTrackListenToggle}
          onRate={handleTrackRate}
          onOpenNoteModal={openNoteModal}
          onViewNote={(note, trackName) => setViewingNote({ note, trackName })}
        />
      ))}

      {/* Banner image — full-bleed, same viewport-bleed trick as the
          principal image above. Nothing overlaid on top of it, so a plain
          normal-flow <img> sized w-full h-auto shows it at its own real
          aspect ratio (unknown ahead of time — admin-uploaded), nothing
          cropped. Hidden entirely until the admin uploads one
          (bannerImageUrl is null until then). */}
      {playlist.bannerImageUrl && (
        <div className="relative mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={playlist.bannerImageUrl}
            alt=""
            className="block w-full h-auto"
          />
        </div>
      )}

      {/* About the curator — same treatment as series/detail.tsx's own
          "About the narrator" block: the full character illustration from
          public/characters/, not fetched from the API (byline is just an
          enum code, there's no bio text to show alongside it). */}
      <div className="mt-14 flex flex-col items-center gap-6 rounded-2xl bg-[#2A261C] p-9 text-center sm:flex-row sm:text-left">
        <div className="relative aspect-square w-[220px] flex-none overflow-hidden rounded-2xl">
          <Image
            src={`/characters/${playlist.byline.toLowerCase()}.png`}
            alt={playlist.byline}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div>
          <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.6)]">
            About the curator
          </span>
          <div className="mt-2 font-[family-name:var(--font-fraunces)] text-[36px] leading-[.92] font-extrabold tracking-[-.04em] text-[#F6D013]">
            {titleCase(playlist.byline)}
          </div>
          <p className="mt-3 max-w-[480px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.78)]">
            {titleCase(playlist.byline)} curated this playlist — one of eight voices behind JazzLogs, each with their own ear for the music.
          </p>
        </div>
      </div>

      {/* Footer image — full-bleed, same treatment as the banner image
          above (plain normal-flow <img>, unknown aspect ratio), plus the
          same "become a member" CTA laid over its top-right corner as
          series/detail.tsx's own footer image. Hidden entirely until the
          admin uploads one (footerImageUrl is null until then). */}
      {playlist.footerImageUrl && (
        <div className="relative mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={playlist.footerImageUrl}
            alt=""
            className="block w-full h-auto"
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
      )}
      </div>

      {noteModalTrackId &&
        (() => {
          const track = playlist.tracks.find(
            (t) => t.trackId === noteModalTrackId,
          );
          if (!track) return null;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              style={{
                background: "rgba(0,0,0,.6)",
                animation: "jazzlogs-backdrop-fade .2s ease-out",
              }}
              onClick={closeNoteModal}
            >
              <div
                className="w-full max-w-[480px] rounded-[4px] bg-[#D89A63] p-8 text-[#1C1A14] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
                style={{
                  animation: "jazzlogs-note-pop .4s cubic-bezier(.34,1.56,.64,1)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-[.14em] text-[rgba(28,26,20,.55)]">
                    New note · {track.trackName}
                  </div>
                  <button
                    type="button"
                    onClick={closeNoteModal}
                    aria-label="Close"
                    className="text-[22px] leading-none font-bold text-[rgba(28,26,20,.45)]"
                  >
                    ×
                  </button>
                </div>

                <input
                  autoFocus
                  value={noteTitleInput}
                  onChange={(e) =>
                    setNoteTitleInput(e.target.value.slice(0, NOTE_TITLE_MAX))
                  }
                  maxLength={NOTE_TITLE_MAX}
                  placeholder="Give it a title…"
                  className="mt-4 w-full border-b-2 border-[rgba(28,26,20,.25)] bg-transparent pb-2 text-[21px] font-extrabold tracking-[-.02em] outline-none placeholder:text-[rgba(28,26,20,.35)]"
                />
                <div className="mt-1 text-right font-[family-name:var(--font-dm-sans)] text-[10px] font-medium text-[rgba(28,26,20,.45)]">
                  {noteTitleInput.length}/{NOTE_TITLE_MAX}
                </div>

                <textarea
                  value={noteTextInput}
                  onChange={(e) =>
                    setNoteTextInput(e.target.value.slice(0, NOTE_TEXT_MAX))
                  }
                  maxLength={NOTE_TEXT_MAX}
                  placeholder="What caught your ear?"
                  rows={4}
                  className="mt-4 w-full resize-none rounded-lg border border-[rgba(28,26,20,.2)] bg-[rgba(255,255,255,.35)] p-3 text-[15px] leading-[1.5] font-medium text-[#1C1A14] outline-none placeholder:text-[rgba(28,26,20,.4)]"
                />
                <div className="mt-1 text-right font-[family-name:var(--font-dm-sans)] text-[10px] font-medium text-[rgba(28,26,20,.45)]">
                  {noteTextInput.length}/{NOTE_TEXT_MAX}
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-[.12em] text-[rgba(28,26,20,.55)]">
                    Timestamp (optional)
                  </label>
                  <input
                    value={noteTimestampInput}
                    onChange={(e) => setNoteTimestampInput(e.target.value)}
                    placeholder="e.g. 2:47"
                    className="w-full rounded-lg border border-[rgba(28,26,20,.2)] bg-[rgba(255,255,255,.35)] px-3 py-2 text-[14px] font-bold text-[#1C1A14] outline-none placeholder:text-[rgba(28,26,20,.4)]"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={closeNoteModal}
                    className="text-[13px] font-bold text-[rgba(28,26,20,.55)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWriteNote(track.trackId)}
                    disabled={
                      noteSubmitting ||
                      !noteTitleInput.trim() ||
                      !noteTextInput.trim()
                    }
                    className="rounded-full bg-[#1C1A14] px-6 py-3 text-[13px] font-bold text-[#D89A63] disabled:opacity-40"
                  >
                    {noteSubmitting ? "Posting…" : "Post note"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {viewingNote && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,.6)",
            animation: "jazzlogs-backdrop-fade .2s ease-out",
          }}
          onClick={() => setViewingNote(null)}
        >
          <div
            className="flex w-full max-w-[760px] flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex max-h-[70vh] w-full min-w-0 flex-col gap-3 overflow-hidden rounded-[3px] bg-[#D89A63] p-8 text-[#1C1A14] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
              style={{
                animation: "jazzlogs-note-pop .4s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-[.12em] text-[rgba(28,26,20,.5)]">
                  {playlist.title} · {viewingNote.trackName}
                </div>
                <button
                  type="button"
                  onClick={() => setViewingNote(null)}
                  aria-label="Close"
                  className="text-[22px] leading-none font-bold text-[rgba(28,26,20,.45)]"
                >
                  ×
                </button>
              </div>
              {viewingNote.note.timestampSeconds != null && (
                <span className="font-[family-name:var(--font-dm-sans)] text-[12px] font-bold text-[#8A4A1C]">
                  ▶ {formatTrackDuration(viewingNote.note.timestampSeconds * 1000)}
                </span>
              )}
              <div className="text-center font-[family-name:var(--font-fraunces)] text-[24px] leading-[1.15] font-extrabold tracking-[-.02em] break-words">
                {viewingNote.note.title}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <p className="m-0 break-words font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] font-medium">
                  {viewingNote.note.text}
                </p>
              </div>
              <div className="mt-2 border-t border-[rgba(28,26,20,.16)] pt-3 text-[12px] font-semibold text-[rgba(28,26,20,.6)]">
                {formatDate(viewingNote.note.createdAt)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmDeleteNote(viewingNote.note)}
              className="rounded-full bg-[color-mix(in_srgb,#F6D013_30%,transparent)] px-6 py-3 text-[13px] font-bold text-[#E8DCC0] hover:bg-[color-mix(in_srgb,#F6D013_45%,transparent)]"
            >
              Delete note
            </button>
          </div>
        </div>
      )}

      {confirmDeleteNote && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,.6)",
            animation: "jazzlogs-backdrop-fade .2s ease-out",
          }}
          onClick={() => setConfirmDeleteNote(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl border border-[rgba(217,60,60,.35)] bg-[#2A261C] p-7 text-[#E8DCC0] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
            style={{ animation: "jazzlogs-modal-pop .25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[20px] font-extrabold tracking-[-.02em]">
              Delete this note?
            </div>
            <p className="mt-2 text-[14px] leading-[1.5] text-[rgba(232,220,192,.65)]">
              This can&rsquo;t be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteNote(null)}
                className="rounded-full px-5 py-[11px] text-[13px] font-bold text-[rgba(232,220,192,.7)] hover:bg-[rgba(232,220,192,.08)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteNote(confirmDeleteNote)}
                className="rounded-full border border-[rgba(217,60,60,.4)] bg-[rgba(217,60,60,.18)] px-5 py-[11px] text-[13px] font-bold text-[#e9a3a3] hover:bg-[rgba(217,60,60,.3)]"
              >
                Delete note
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function PlaylistDetailPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <LoadingNotes />
        </>
      }
    >
      <PlaylistDetailContent />
    </Suspense>
  );
}
