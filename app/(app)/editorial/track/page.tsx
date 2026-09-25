"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import EmptyState from "@/components/app/EmptyState";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LoadingNotes from "@/components/app/LoadingNotes";
import Pager from "@/components/app/Pager";
import { AverageStars, InteractiveStars } from "@/components/app/StarRating";
import LikeButton from "@/components/app/LikeButton";
import { ApiError, fetchMe } from "@/lib/api";
import {
  fetchTrackDetail,
  markTrackListened,
  unmarkTrackListened,
  rateTrack,
  type TrackDetail,
  type VocabularyTag,
  type EditorialBlock,
} from "@/lib/albums";
import { saveItem, unsaveItem } from "@/lib/savedItems";
import { likeEntity, unlikeEntity } from "@/lib/likes";
import { fetchTrackNotes, createNote, deleteNote, type TrackNote } from "@/lib/notes";
import {
  fetchEditorialsByByline,
  type EditorialTrackSummary,
  type EditorialVoice,
} from "@/lib/editorials";
import { debounceByKey } from "@/lib/debounce";
import { usePageTint } from "@/components/app/SidebarContext";

// No bio field on the API (byline is just an enum code) — hardcoded per
// voice until the real copy is supplied.
const BYLINE_BIOS: Record<EditorialVoice, string> = {
  MARK: "Mark learned piano as a kid on an out-of-tune upright at his grandmother's house, and he still says it taught him more than any teacher ever did: how to find the note that sounds right even when the instrument won't help. These days he plays small bars, the kind where people talk over the music, and he likes them for exactly that reason. That's where he learned to play for whoever's really listening. You'll recognize him by the messy hair, the round glasses slipping down his nose, and the notebook he fills with things he hears in tunes. Nobody else can read his handwriting. He's working on it. Sort of.",
  LAURA: "Bio copy coming soon.",
  ALICE: "Bio copy coming soon.",
  ADAM: "Bio copy coming soon.",
  JAMES: "Bio copy coming soon.",
  ALLIE: "Bio copy coming soon.",
  BOB: "Bio copy coming soon.",
  NATALIE: "Bio copy coming soon.",
  JAZZLOGS: "Bio copy coming soon.",
};

function titleCase(voice: string): string {
  return voice.charAt(0) + voice.slice(1).toLowerCase();
}

// A Java Instant's JSON serialization can carry more than 3 fractional
// second digits (e.g. "...123456Z", microseconds) — the ECMAScript Date
// Time String Format only guarantees parsing exactly 3, so trim to
// milliseconds before handing it to `new Date` rather than trusting every
// engine to tolerate the extra digits.
function formatDate(iso: string): string {
  const trimmed = iso.replace(/(\.\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, "$1$2");
  return new Date(trimmed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// A block's text is one big TEXT field — blank lines the admin left between
// paragraphs when typing it are preserved in the data, but a plain <p> just
// collapses them like any other whitespace. Split on them so multi-paragraph
// block text actually renders as separate paragraphs.
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// The editorial's own body — LEAD gets a dropped first cap, QUOTE gets the
// pull-quote treatment, everything else (PARA) is a plain paragraph.
function EditorialBlockList({ blocks }: { blocks: EditorialBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <div key={i}>
          {b.subhead && (
            <div className="mt-10 mb-5 font-[family-name:var(--font-fraunces)] text-[26px] font-extrabold leading-[1.1] tracking-[-.03em] text-[#E8DCC0]">
              {b.subhead}
            </div>
          )}
          {b.type === "LEAD" ? (
            splitParagraphs(b.text).map((para, pi) => (
              <p
                key={pi}
                className="mb-9 font-[family-name:var(--font-newsreader)] text-[18px] leading-[1.75] text-[#E8DCC0]"
              >
                {pi === 0 ? (
                  <>
                    <span className="float-left mt-1.5 mr-3.5 font-[family-name:var(--font-fraunces)] text-[60px] leading-[.68] font-extrabold tracking-[-.03em] text-[#E8DCC0]">
                      {para.charAt(0)}
                    </span>
                    {para.slice(1)}
                  </>
                ) : (
                  para
                )}
              </p>
            ))
          ) : b.type === "QUOTE" ? (
            <div className="my-9 border-y-[2.5px] border-[var(--accent)] py-8 text-center font-[family-name:var(--font-newsreader)] text-[34px] leading-[1.2] font-semibold tracking-[-.03em] text-[#E8DCC0] italic sm:text-[40px]">
              &ldquo;{b.text}&rdquo;
            </div>
          ) : (
            splitParagraphs(b.text).map((para, pi) => (
              <p
                key={pi}
                className="mb-9 font-[family-name:var(--font-newsreader)] text-[18px] leading-[1.75] text-[rgba(232,220,192,.9)]"
              >
                {para}
              </p>
            ))
          )}
        </div>
      ))}
    </>
  );
}

// Native share sheet where available, clipboard copy (with a quick "Copied"
// confirmation) everywhere else — no backend involved either way.
function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url: window.location.href });
        return;
      } catch {
        // User cancelled the native sheet, or it isn't actually usable here
        // — fall through to clipboard copy either way.
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Nothing else we can do without clipboard permission.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share"
      className="flex h-[50px] w-[50px] flex-none items-center justify-center rounded-full text-[rgba(232,220,192,.75)]"
      style={{ background: "rgba(232,220,192,.1)" }}
    >
      {copied ? (
        <span className="text-[10.5px] font-bold">Copied</span>
      ) : (
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
    </button>
  );
}

function SpotifyMark({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path
        d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.4.55.25.85z"
        fill="#000000"
      />
    </svg>
  );
}

function Cover({
  imageUrl,
  alt,
  className,
}: {
  imageUrl: string | null;
  alt: string;
  className: string;
}) {
  if (!imageUrl) return <ImagePlaceholder className={className} />;
  return (
    <div className={"relative overflow-hidden " + className}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        unoptimized
        // Slight zoom crops out the thin white border some Spotify cover art
        // has baked into the file itself — not something CSS alone can fix.
        className="scale-[1.06] object-cover"
      />
    </div>
  );
}

function formatDuration(ms: number | null): string {
  if (!ms) return "";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Accepts "2:47", "1:02:47", or a bare "167" — whatever's fastest to type
// while looking at a player. Returns null (not zero) for blank/unparseable
// input so a skipped timestamp field doesn't silently become "0:00".
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

// One "listen on Spotify" row — a big cover, the name (+ a line of
// metadata under it), and its own Spotify link. Track/album/artist all
// render through this same shape, just pointed at different data, so the
// three stack as one uniform block instead of three different treatments.
function ListenRow({
  kind,
  imageUrl,
  alt,
  title,
  subtitle,
  spotifyUrl,
  spotifyLabel,
}: {
  kind: "Track" | "Album" | "Artist";
  imageUrl: string | null;
  alt: string;
  title: string;
  subtitle?: string | null;
  spotifyUrl: string | null;
  spotifyLabel: string;
}) {
  return (
    <div className="flex min-h-[150px] flex-1 items-center gap-6 overflow-hidden rounded-2xl border-[1.5px] border-[rgba(232,220,192,.18)] p-4">
      <div className="aspect-square h-full min-h-[120px] flex-none overflow-hidden rounded-xl">
        <Cover imageUrl={imageUrl} alt={alt} className="h-full w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-[family-name:var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(232,220,192,.5)]">
          {kind}
        </span>
        <div className="mt-1 truncate text-[20px] font-bold text-[rgba(232,220,192,.92)]">
          {title}
        </div>
        {subtitle && (
          <div className="mt-1 text-[13px] font-medium text-[rgba(232,220,192,.55)]">
            {subtitle}
          </div>
        )}
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-[15px] text-[14px] font-bold text-[#E8DCC0]"
          >
            <SpotifyMark />
            {spotifyLabel}
          </a>
        )}
      </div>
    </div>
  );
}

// One row of a tag category — label on the left, pills on the right,
// same shape as a little table (renders nothing if this track has none).
function TagRow({ label, tags }: { label: string; tags: VocabularyTag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2.5 border-b border-[rgba(232,220,192,.15)] py-4.5 last:border-b-0">
      <span className="w-[170px] flex-none font-[family-name:var(--font-dm-sans)] text-[11.5px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.55)]">
        {label}
      </span>
      <span className="flex flex-1 flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.code}
            className="rounded-full border-[1.5px] border-[var(--accent)] px-3 py-1.5 text-[13px] font-semibold"
          >
            {tag.label}
          </span>
        ))}
      </span>
    </div>
  );
}

export default function TrackEditorialPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <LoadingNotes />
        </>
      }
    >
      <TrackEditorialContent />
    </Suspense>
  );
}

function TrackEditorialContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [detail, setDetail] = useState<TrackDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Unknown aspect ratio (admin-uploaded, unlike a fixed-pixel static asset)
  // — measured off the real file once it loads, same trick series/detail.tsx
  // uses for its own principal image.
  const [principalRatio, setPrincipalRatio] = useState<number | null>(null);
  const [secondaryRatio, setSecondaryRatio] = useState<number | null>(null);
  const [bannerRatio, setBannerRatio] = useState<number | null>(null);
  const [footerRatio, setFooterRatio] = useState<number | null>(null);

  const NOTES_PER_PAGE = 6;
  const [notes, setNotes] = useState<TrackNote[] | null>(null);
  const [noteTotal, setNoteTotal] = useState(0);
  const [notePage, setNotePage] = useState(0);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTitleInput, setNoteTitleInput] = useState("");
  const [noteTextInput, setNoteTextInput] = useState("");
  const [noteTimestampInput, setNoteTimestampInput] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [viewingNote, setViewingNote] = useState<TrackNote | null>(null);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<TrackNote | null>(
    null,
  );
  const [moreByAuthor, setMoreByAuthor] = useState<
    EditorialTrackSummary[] | null
  >(null);

  useEffect(() => {
    if (!id) return;
    fetchTrackDetail(id)
      .then(setDetail)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load this track.",
        ),
      );
  }, [id]);

  useEffect(() => {
    fetchMe()
      .then((me) => setMyUserId(me.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!noteModalOpen && !viewingNote && !confirmDeleteNote) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (confirmDeleteNote) setConfirmDeleteNote(null);
      else if (viewingNote) setViewingNote(null);
      else setNoteModalOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [noteModalOpen, viewingNote, confirmDeleteNote]);

  useEffect(() => {
    const anyModalOpen = noteModalOpen || Boolean(viewingNote);
    if (!anyModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [noteModalOpen, viewingNote]);

  async function loadNotesPage(trackId: string, page: number) {
    const p = await fetchTrackNotes(trackId, page, NOTES_PER_PAGE);
    setNotes(p.content);
    setNoteTotal(p.totalElements);
    setNotePage(page);
  }

  useEffect(() => {
    if (!id) return;
    fetchTrackNotes(id, 0, NOTES_PER_PAGE)
      .then((page) => {
        setNotes(page.content);
        setNoteTotal(page.totalElements);
        setNotePage(0);
      })
      .catch(() => setNotes((notes) => notes ?? []));
  }, [id]);

  // "More about #byline" — pull 5 so there's still 4 left over on the (very
  // likely) chance this same track's own editorial comes back in the list.
  const byline = detail?.track.editorial?.byline;
  useEffect(() => {
    if (!byline || !id) return;
    fetchEditorialsByByline(byline, 5)
      .then((list) =>
        setMoreByAuthor(list.filter((e) => e.trackId !== id).slice(0, 4)),
      )
      .catch(() => setMoreByAuthor([]));
  }, [byline, id]);

  const pageBg = "#1C1A14";
  const accent = "#F6D013";
  const noteColorMine = accent;
  const noteColorOthers = "#FBF0C8";
  const pageTint = useMemo(
    () => ({ background: pageBg, accent }),
    [pageBg, accent],
  );
  usePageTint(pageTint);

  if (!id) {
    return (
      <>
        <Navbar />
        <EmptyState
          title="No track selected"
          subtitle="Open this page from a track in the archive."
        />
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

  if (!detail) {
    return (
      <>
        <Navbar />
        <LoadingNotes
          messages={[
            "Cueing the record…",
            "Pulling the sleeve notes…",
            "Checking the liner notes…",
          ]}
        />
      </>
    );
  }

  const { track } = detail;
  const principalImageUrl = track.editorial?.principalImageUrl ?? null;
  const duration = formatDuration(track.durationMs);

  function handleListen() {
    const next = !track.hasListened;
    setDetail((d) => d && { ...d, track: { ...d.track, hasListened: next } });
    debounceByKey(`listen-track-${track.id}`, () => {
      (next ? markTrackListened : unmarkTrackListened)(track.id).catch(() => {
        setDetail(
          (d) => d && { ...d, track: { ...d.track, hasListened: !next } },
        );
      });
    });
  }

  function handleSaveToggle() {
    const next = !track.isSaved;
    setDetail((d) => d && { ...d, track: { ...d.track, isSaved: next } });
    debounceByKey(`save-track-${track.id}`, () => {
      (next ? saveItem("TRACK", track.id) : unsaveItem("TRACK", track.id)).catch(
        () => {
          setDetail(
            (d) => d && { ...d, track: { ...d.track, isSaved: !next } },
          );
        },
      );
    });
  }

  function handleRate(rating: number) {
    const previousRating = track.myRating;
    setDetail((d) => d && { ...d, track: { ...d.track, myRating: rating } });
    debounceByKey(`rate-track-${track.id}`, () => {
      rateTrack(track.id, rating).catch(() => {
        setDetail(
          (d) => d && { ...d, track: { ...d.track, myRating: previousRating } },
        );
      });
    });
  }

  function handleEditorialLikeToggle(next: boolean) {
    const previousEditorial = track.editorial;
    if (!previousEditorial) return;
    // Mirrored into state (unlike the other toggles' plain LikeButton
    // usage) so the bigger like-count line below can reflect it too —
    // LikeButton only exposes its own internal count via hideCount off.
    setDetail(
      (d) =>
        d && {
          ...d,
          track: {
            ...d.track,
            editorial: {
              ...previousEditorial,
              likedByCurrentUser: next,
              likeCount: previousEditorial.likeCount + (next ? 1 : -1),
            },
          },
        },
    );
    // The editorial has no id of its own on TrackEditorialDto — it's 1:1
    // with the track (same as every other /tracks/{id}/editorial/* route),
    // so the track's own id is what identifies it as an EDITORIAL like.
    debounceByKey(`like-editorial-${track.id}`, () => {
      (next ? likeEntity : unlikeEntity)("EDITORIAL", track.id).catch(() => {
        setDetail(
          (d) => d && { ...d, track: { ...d.track, editorial: previousEditorial } },
        );
      });
    });
  }

  function openNoteModal() {
    setNoteModalOpen(true);
    setNoteTitleInput("");
    setNoteTextInput("");
    setNoteTimestampInput("");
  }

  function closeNoteModal() {
    setNoteModalOpen(false);
  }

  async function handleWriteNote() {
    if (!id) return;
    const title = noteTitleInput.trim();
    const text = noteTextInput.trim();
    if (!title || !text) return;
    const timestampSeconds = parseTimestampInput(noteTimestampInput);
    setNoteSubmitting(true);
    try {
      await createNote(id, title, text, timestampSeconds);
      // Re-fetch page 0 instead of splicing the new note in locally — it's
      // sorted to the front (yours first), so page 0 is exactly where it'll
      // land, and this keeps the total count correct without trusting a
      // hand-rolled insert to match the server's order.
      await loadNotesPage(id, 0);
      closeNoteModal();
    } catch {
      // Leave the draft (and the modal open) in place so the user can retry.
    } finally {
      setNoteSubmitting(false);
    }
  }

  function handleDeleteNote(note: TrackNote) {
    const previousNotes = notes ?? [];
    const previousTotal = noteTotal;
    setNotes((n) => (n ?? []).filter((x) => x.id !== note.id));
    setNoteTotal((t) => Math.max(0, t - 1));
    setViewingNote(null);
    setConfirmDeleteNote(null);
    deleteNote(note.id).catch(() => {
      setNotes(previousNotes);
      setNoteTotal(previousTotal);
    });
  }

  function handleNoteLikeToggle(noteId: string, next: boolean) {
    debounceByKey(`like-note-${noteId}`, () => {
      (next ? likeEntity : unlikeEntity)("NOTE", noteId).catch(() => {});
    });
  }

  return (
    <>
      <div
        className="relative animate-[jazzlogs-fade-up_.6s_ease-out]"
        style={{ "--accent": accent } as React.CSSProperties}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2"
          style={{ backgroundColor: pageBg }}
        />

        {/* Principal image — full-bleed hero, first thing on the page. The
            ratio is unknown ahead of time (admin-uploaded, unlike the
            fixed-pixel static banners elsewhere), so it's measured off the
            real file on load — once known, the container matches it exactly
            and object-cover never crops anything. Falls back to a plain
            placeholder block until the admin uploads one
            (principalImageUrl is null until then). */}
        <div
          className="relative"
          style={{
            height: `calc((100vw - var(--sidebar-width)) * ${principalRatio ?? 0.5})`,
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden">
            {principalImageUrl ? (
              <Image
                src={principalImageUrl}
                alt={track.editorial?.title ?? track.name}
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
            {/* pageTint's own solid strip would otherwise paint over the
                top of this image (see Navbar's showTint doc) — off here so
                the hero renders underneath the wordmark instead of behind
                an opaque bar. */}
            <Navbar showTint={false} />
            <div className="mt-4 mr-8 ml-auto text-right sm:mr-12">
              <div className="font-[family-name:var(--font-fraunces)] text-[34px] font-extrabold tracking-[-.03em] text-[var(--accent)] drop-shadow-[0_2px_6px_rgba(0,0,0,.55)] sm:text-[46px]">
                {track.name}
              </div>
              <div className="mt-1 font-[family-name:var(--font-fraunces)] text-[16px] font-extrabold tracking-[-.02em] text-[var(--accent)] drop-shadow-[0_2px_6px_rgba(0,0,0,.55)] sm:text-[20px]">
                {detail.artistName}
              </div>
            </div>
          </div>
        </div>

        {/* Track section — a masthead for the entry itself, not a
            per-track row lifted from a tracklist. */}
        <div className="relative z-10 pt-12 pb-8">
          {/* Title beside the editorial's own cover image — the one big
              image alongside the copy (distinct from the hero above, which
              is the principal image). Stacks on mobile, side by side from
              md up. */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_480px]">
            <div className="flex h-full flex-col">
              <div>
                <div className="font-[family-name:var(--font-fraunces)] text-[48px] leading-[.92] font-extrabold tracking-[-.045em] text-[var(--accent)] sm:text-[68px]">
                  {track.editorial?.title ?? track.name}
                </div>

                {track.editorial?.dek && (
                  <p className="mt-4 max-w-[640px] font-[family-name:var(--font-newsreader)] text-[19px] leading-[1.5] font-medium tracking-[-.015em] text-[rgba(232,220,192,.9)]">
                    {track.editorial.dek}
                  </p>
                )}

                {/* Byline — same treatment as playlists' "Curated by" strip:
                    the character portrait from public/characters/, not
                    fetched from the API (byline is just an enum code,
                    there's no bio to show alongside it here). */}
                {track.editorial && (
                  <div className="mt-5 flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full bg-[#1C1A14]">
                      <Image
                        src={`/characters/${track.editorial.byline.toLowerCase()}.png`}
                        alt={track.editorial.byline}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.6)]">
                        By {titleCase(track.editorial.byline)}
                      </span>
                      {track.editorial.createdAt && (
                        <span className="mt-1 font-[family-name:var(--font-dm-sans)] text-[13px] font-medium text-[rgba(232,220,192,.55)]">
                          {formatDate(track.editorial.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {track.editorial && (
                  <div className="mt-3 font-[family-name:var(--font-dm-sans)] text-[20px] font-extrabold tracking-[-.01em] text-[var(--accent)]">
                    Log #{track.editorial.logNumber}
                  </div>
                )}
              </div>

              <div className="mt-12">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleListen}
                    className="rounded-full px-7 py-4 text-[15px] font-bold"
                    style={{
                      background: track.hasListened ? accent : "rgba(232,220,192,.1)",
                      color: track.hasListened ? "#1C1A14" : "rgba(232,220,192,.6)",
                    }}
                  >
                    ✓ Listened
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToggle}
                    className="rounded-full px-7 py-4 text-[15px] font-bold"
                    style={{
                      background: track.isSaved ? "var(--accent)" : "rgba(232,220,192,.1)",
                      color: track.isSaved ? "#1C1A14" : "rgba(232,220,192,.6)",
                    }}
                  >
                    {track.isSaved ? "On your list" : "Listen later"}
                  </button>
                  <ShareButton />
                  {track.editorial && (
                    <>
                      <LikeButton
                        likedColor={accent}
                        label="Like"
                        hideCount
                        size={18}
                        pillSizeClassName="px-7 py-4 text-[15px]"
                        initialCount={track.editorial.likeCount}
                        initialLiked={track.editorial.likedByCurrentUser}
                        onToggle={handleEditorialLikeToggle}
                      />
                      <div className="flex items-center gap-1.5 text-[19px] font-extrabold tracking-[-.02em] text-[#e0392b]">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="#e0392b"
                          stroke="#e0392b"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {track.editorial.likeCount}
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <AverageStars value={track.avgRating ?? 0} size={23} fillColor={accent} />
                  <span className="text-[21px] font-extrabold tracking-[-.02em]">
                    {track.avgRating ? track.avgRating.toFixed(1) : "—"}
                  </span>
                  <span className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[rgba(232,220,192,.6)]">
                    {track.ratingCount} {track.ratingCount === 1 ? "rating" : "ratings"}
                  </span>
                  <span className="h-1 w-1 flex-none rounded-full bg-[rgba(232,220,192,.35)]" />
                  <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.16em] text-[rgba(232,220,192,.55)]">
                    Your rating
                  </span>
                  <InteractiveStars
                    size={23}
                    initial={track.myRating ?? 0}
                    fillColor={accent}
                    onRate={handleRate}
                  />
                </div>

                <div className="mt-8 text-center font-[family-name:var(--font-fraunces)] text-[44px] font-extrabold tracking-[-.03em] text-[var(--accent)]">
                  jazzlogs.
                </div>
              </div>
            </div>

            <div className="aspect-square w-full overflow-hidden rounded-2xl md:w-[480px]">
              <Cover
                imageUrl={track.editorial?.coverImageUrl ?? null}
                alt={track.editorial?.title ?? track.name}
                className="h-full w-full"
              />
            </div>
          </div>

          {/* Tags + listen rows — a second section below the masthead
              (which ends at the action buttons above), split from it by a
              rule same as the old rating strip's border. */}
          <div className="mt-10 border-t border-[rgba(232,220,192,.15)] pt-8">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {(track.moods.length > 0 ||
                track.contexts.length > 0 ||
                track.rhythms.length > 0 ||
                track.featuredInstruments.length > 0) && (
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border-[1.5px] border-[rgba(232,220,192,.18)] px-6">
                  <TagRow label="Moods" tags={track.moods} />
                  <TagRow label="Contexts" tags={track.contexts} />
                  <TagRow label="Rhythms" tags={track.rhythms} />
                  <TagRow label="Featured instruments" tags={track.featuredInstruments} />
                </div>
              )}

              {/* Track / Album / Artist, stacked as three uniform "listen
                  on Spotify" rows, each its own cover + name + link — big
                  enough to fill this column's full height (matched to the
                  tags table's height via the grid's own stretch) rather
                  than leaving blank space under a couple of small rows. */}
              <div className="flex h-full flex-col gap-5">
                <ListenRow
                  kind="Track"
                  imageUrl={detail.albumImageUrl}
                  alt={track.name}
                  title={track.name}
                  subtitle={duration || null}
                  spotifyUrl={track.spotifyUrl}
                  spotifyLabel={`Listen ${track.name} on Spotify`}
                />
                <ListenRow
                  kind="Album"
                  imageUrl={detail.albumImageUrl}
                  alt={detail.albumName}
                  title={detail.albumName}
                  subtitle={detail.albumReleaseYear ? String(detail.albumReleaseYear) : null}
                  spotifyUrl={detail.albumSpotifyUrl}
                  spotifyLabel={`Listen ${detail.albumName} on Spotify`}
                />
                <ListenRow
                  kind="Artist"
                  imageUrl={detail.artistImageUrl}
                  alt={detail.artistName}
                  title={detail.artistName}
                  spotifyUrl={detail.artistSpotifyUrl}
                  spotifyLabel={`Listen ${detail.artistName} on Spotify`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary image — full-bleed, same treatment as the principal
            image up top (unknown aspect ratio, measured off the real file
            on load). Only renders once an admin has actually uploaded one;
            unlike the principal image there's no placeholder fallback,
            since this is bonus content further down the page, not the
            hero. */}
        {track.editorial?.secondaryImageUrl && (
          <div
            className="relative z-10 mt-10 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden"
            style={{
              height: `calc((100vw - var(--sidebar-width)) * ${secondaryRatio ?? 0.5})`,
            }}
          >
            <Image
              src={track.editorial.secondaryImageUrl}
              alt={track.editorial.title ?? track.name}
              fill
              unoptimized
              className="object-cover"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth > 0) {
                  setSecondaryRatio(img.naturalHeight / img.naturalWidth);
                }
              }}
            />
          </div>
        )}

        {/* The editorial itself — everything up top was orientation
            (who/what/where to listen), this is the actual write-up. */}
        {track.editorial && track.editorial.blocks.length > 0 && (
          <div className="relative z-10 mx-auto mt-14 max-w-[680px]">
            <EditorialBlockList blocks={track.editorial.blocks} />
          </div>
        )}

        {/* Banner image — full-bleed, same treatment as the principal and
            secondary images (unknown aspect ratio, measured off the real
            file on load). Closes out the editorial, same spot a banner
            sits on the archive/series/playlists pages. */}
        {track.editorial?.bannerImageUrl && (
          <div
            className="relative z-10 mt-14 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden"
            style={{
              height: `calc((100vw - var(--sidebar-width)) * ${bannerRatio ?? 0.4})`,
            }}
          >
            <Image
              src={track.editorial.bannerImageUrl}
              alt={track.editorial.title ?? track.name}
              fill
              unoptimized
              className="object-cover"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth > 0) {
                  setBannerRatio(img.naturalHeight / img.naturalWidth);
                }
              }}
            />
          </div>
        )}

        {/* Track notes — the community feed for this one track, not a
            per-track loop item anymore. */}
        <div className="relative z-10 mx-auto mt-16 max-w-[900px]">
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <span className="font-[family-name:var(--font-fraunces)] text-[28px] font-extrabold tracking-[-.02em] text-[var(--accent)]">
              Track notes
            </span>
            <button
              type="button"
              onClick={openNoteModal}
              className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-[13px] font-bold text-[#1C1A14]"
            >
              <svg
                width="15"
                height="15"
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

          {notes === null ? (
            <div className="mt-10">
              <LoadingNotes compact />
            </div>
          ) : (
            <>
              <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {notes.map((note, ni) => {
                  const isLong = note.text.length > 220;
                  const isMine = note.userId === myUserId;
                  return (
                    <div
                      key={note.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setViewingNote(note)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setViewingNote(note);
                      }}
                      className="flex min-h-[180px] min-w-0 cursor-pointer flex-col gap-3 rounded-[3px] p-6 text-[#1C1A14] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
                      style={{
                        background: isMine ? noteColorMine : noteColorOthers,
                        transform: `rotate(${[-1.4, 1.2, -0.6][ni % 3]}deg)`,
                      }}
                    >
                      {note.timestampSeconds != null && (
                        <span className="font-[family-name:var(--font-dm-sans)] text-[12px] font-bold text-[#8A4A1C]">
                          ▶ {formatDuration(note.timestampSeconds * 1000)}
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
                      <div
                        className="mt-auto flex items-center justify-between gap-3 border-t border-[rgba(28,26,20,.16)] pt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[11px] font-semibold text-[rgba(28,26,20,.6)]">
                          — {note.userName ?? "Someone"} · {formatDate(note.createdAt)}
                        </span>
                        <LikeButton
                          variant="inline"
                          theme="light"
                          initialCount={note.likeCount}
                          initialLiked={note.likedByCurrentUser}
                          onToggle={(next) => handleNoteLikeToggle(note.id, next)}
                        />
                      </div>
                    </div>
                  );
                })}
                {notes.length === 0 && (
                  <div
                    className="col-span-full mx-auto flex min-h-[180px] w-full max-w-[300px] flex-col items-center justify-center gap-3 rounded-[3px] p-6 text-center text-[#1C1A14] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
                    style={{ background: noteColorOthers, transform: "rotate(-1.4deg)" }}
                  >
                    <div className="text-[20px] font-extrabold tracking-[-.02em]">
                      No notes yet
                    </div>
                    <p className="text-[13px] leading-[1.5] font-medium text-[rgba(28,26,20,.7)]">
                      Be the first to drop one on this track.
                    </p>
                    <button
                      type="button"
                      onClick={openNoteModal}
                      className="text-[12px] font-bold text-[#8A4A1C] underline underline-offset-[3px]"
                    >
                      Write the first note →
                    </button>
                  </div>
                )}
              </div>
              <Pager
                page={notePage}
                pageCount={Math.max(1, Math.ceil(noteTotal / NOTES_PER_PAGE))}
                onChange={(p) => {
                  if (id) loadNotesPage(id, p).catch(() => {});
                }}
              />
            </>
          )}
        </div>

        {/* About the author — big character portrait + a hardcoded mini
            bio per byline (no bio field on the API, this is app-wide
            flavor copy). */}
        {track.editorial && (
          <div className="relative z-10 mx-auto mt-16 max-w-[900px]">
            <div className="flex flex-col items-center gap-8 pt-10 sm:flex-row sm:items-start">
              <div className="relative h-40 w-40 flex-none overflow-hidden rounded-full bg-[#1C1A14]">
                <Image
                  src={`/characters/${track.editorial.byline.toLowerCase()}.png`}
                  alt={track.editorial.byline}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.16em] text-[rgba(232,220,192,.55)]">
                  About the author
                </span>
                <div className="mt-2 font-[family-name:var(--font-fraunces)] text-[32px] leading-[1.05] font-extrabold tracking-[-.03em] text-[var(--accent)]">
                  {titleCase(track.editorial.byline)}
                </div>
                <p className="mt-3 max-w-[560px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.75)]">
                  {BYLINE_BIOS[track.editorial.byline]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* More about #byline — up to 4 other editorials by the same
            voice, fetched with n=5 so there's still 4 left over once this
            track's own editorial (very likely to be in that list) is
            filtered out. */}
        {track.editorial && moreByAuthor && moreByAuthor.length > 0 && (
          <div className="relative z-10 mx-auto mt-16 max-w-[900px]">
            <div className="border-t-[1.5px] border-[var(--accent)] pt-6">
              <span className="text-[22px] font-extrabold tracking-[-.02em] text-[var(--accent)]">
                More about #{titleCase(track.editorial.byline)}
              </span>
            </div>
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {moreByAuthor.map((e) => (
                <Link
                  key={e.id}
                  href={`/editorial/track?id=${e.trackId}`}
                  className="relative z-10 flex flex-col overflow-hidden rounded-2xl border border-[rgba(232,220,192,.15)] bg-[rgba(232,220,192,.03)] no-underline transition-colors hover:border-[var(--accent)] hover:bg-[rgba(246,208,19,.05)] sm:flex-row"
                >
                  <div className="relative h-[160px] w-full flex-none overflow-hidden bg-[#2A261C] sm:h-auto sm:w-[140px]">
                    <Cover imageUrl={e.imageUrl} alt={e.trackName} className="h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="font-[family-name:var(--font-dm-sans)] text-[9.5px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.5)]">
                      {e.trackName} · {e.albumName}
                    </div>
                    <div className="text-balance mt-2.5 font-[family-name:var(--font-fraunces)] text-[18px] leading-[1.1] font-extrabold tracking-[-.03em] text-[#E8DCC0]">
                      {e.title}
                    </div>
                    {e.dek && (
                      <div className="mt-2 line-clamp-2 font-[family-name:var(--font-newsreader)] text-[13px] leading-[1.5] text-[rgba(232,220,192,.62)]">
                        {e.dek}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4 font-[family-name:var(--font-dm-sans)] text-[9px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.45)]">
                      <span>{formatDate(e.createdAt)}</span>
                      <LikeButton
                        variant="inline"
                        initialCount={e.likeCount}
                        initialLiked={e.likedByCurrentUser}
                        readOnly
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer banner — full-bleed, same treatment as the principal/
            secondary/banner images (unknown aspect ratio, measured off the
            real file on load). The fifth and last image slot, closing out
            the page right before the app's own Footer. */}
        {track.editorial?.footerImageUrl && (
          <div
            className="relative z-10 mt-16 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2 overflow-hidden"
            style={{
              height: `calc((100vw - var(--sidebar-width)) * ${footerRatio ?? 0.4})`,
            }}
          >
            <Image
              src={track.editorial.footerImageUrl}
              alt={track.editorial.title ?? track.name}
              fill
              unoptimized
              className="object-cover"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth > 0) {
                  setFooterRatio(img.naturalHeight / img.naturalWidth);
                }
              }}
            />
            <div className="absolute top-14 right-[10%] z-10 flex flex-col items-center gap-3 text-center">
              <span className="font-[family-name:var(--font-fraunces)] text-[28px] leading-[.92] font-extrabold tracking-[-.04em] text-[var(--accent)] drop-shadow-[0_2px_6px_rgba(0,0,0,.55)] sm:text-[40px]">
                Join the journey
              </span>
              <button
                type="button"
                className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-[12.5px] font-bold text-[#1C1A14] sm:px-6 sm:py-3.5 sm:text-[14px]"
              >
                Become a member
              </button>
            </div>
          </div>
        )}
      </div>

      {noteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,.6)" }}
          onClick={closeNoteModal}
        >
          <div
            className="w-full max-w-[480px] rounded-[4px] p-8 text-[#1C1A14] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
            style={{ background: noteColorMine }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-[.14em] text-[rgba(28,26,20,.55)]">
                New note · {track.name}
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
                onClick={handleWriteNote}
                disabled={noteSubmitting || !noteTitleInput.trim() || !noteTextInput.trim()}
                className="rounded-full bg-[#1C1A14] px-6 py-3 text-[13px] font-bold disabled:opacity-40"
                style={{ color: noteColorMine }}
              >
                {noteSubmitting ? "Posting…" : "Post note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingNote && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,.6)" }}
          onClick={() => setViewingNote(null)}
        >
          <div
            className="flex w-full max-w-[760px] flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex max-h-[70vh] w-full min-w-0 flex-col gap-3 overflow-hidden rounded-[3px] p-8 text-[#1C1A14] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
              style={{
                background: viewingNote.userId === myUserId ? noteColorMine : noteColorOthers,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="font-[family-name:var(--font-dm-sans)] text-[10px] font-bold uppercase tracking-[.12em] text-[rgba(28,26,20,.5)]">
                  {track.name}
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
              {viewingNote.timestampSeconds != null && (
                <span className="font-[family-name:var(--font-dm-sans)] text-[12px] font-bold text-[#8A4A1C]">
                  ▶ {formatDuration(viewingNote.timestampSeconds * 1000)}
                </span>
              )}
              <div className="text-center font-[family-name:var(--font-fraunces)] text-[24px] leading-[1.15] font-extrabold tracking-[-.02em] break-words">
                {viewingNote.title}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <p className="m-0 break-words font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] font-medium">
                  {viewingNote.text}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-[rgba(28,26,20,.16)] pt-3">
                <span className="text-[12px] font-semibold text-[rgba(28,26,20,.6)]">
                  — {viewingNote.userName ?? "Someone"} · {formatDate(viewingNote.createdAt)}
                </span>
                <LikeButton
                  variant="inline"
                  theme="light"
                  initialCount={viewingNote.likeCount}
                  initialLiked={viewingNote.likedByCurrentUser}
                  onToggle={(next) => handleNoteLikeToggle(viewingNote.id, next)}
                />
              </div>
            </div>
            {viewingNote.userId === myUserId && (
              <button
                type="button"
                onClick={() => setConfirmDeleteNote(viewingNote)}
                className="rounded-full bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] px-6 py-3 text-[13px] font-bold text-[#E8DCC0] hover:bg-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
              >
                Delete note
              </button>
            )}
          </div>
        </div>
      )}

      {confirmDeleteNote && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,.6)" }}
          onClick={() => setConfirmDeleteNote(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl border border-[rgba(217,60,60,.35)] bg-[#2A261C] p-7 text-[#E8DCC0] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
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
