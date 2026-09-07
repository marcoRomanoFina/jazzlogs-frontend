"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import EmptyState from "@/components/app/EmptyState";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import Pager from "@/components/app/Pager";
import LoadingNotes from "@/components/app/LoadingNotes";
import { AverageStars, InteractiveStars } from "@/components/app/StarRating";
import { ApiError, fetchMe, type Page } from "@/lib/api";
import {
  fetchAlbumHeader,
  fetchAlbumTracks,
  markTrackListened,
  unmarkTrackListened,
  rateTrack,
  type AlbumHeader,
  type AlbumTrack,
  type VocabularyTag,
  type TrackPerformer,
} from "@/lib/albums";
import { likeEntity, unlikeEntity } from "@/lib/likes";
import { saveItem, unsaveItem } from "@/lib/savedItems";
import {
  fetchAlbumReviews,
  createReview,
  updateReview,
  deleteReview,
  type AlbumReview,
} from "@/lib/reviews";
import {
  fetchTrackNotes,
  createNote,
  deleteNote,
  type TrackNote,
} from "@/lib/notes";
import { debounceByKey } from "@/lib/debounce";
import {
  extractAverageColor,
  brighten,
  mixWithBase,
  hexToRgb,
} from "@/lib/colorTint";
import { usePageTint } from "@/components/app/SidebarContext";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
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

// Three discrete tiers on the backend (LOW/MEDIUM/HIGH) — a literal 1/3,
// 2/3, 3/3 meter, not stretched onto more segments than there are tiers.
const LEVEL_METER_SEGMENTS = 3;
const NOTES_PER_PAGE = 6;
// Fixed at 6 server-side.
const REVIEWS_PER_PAGE = 6;

// The app's base dark background (`#1c1b18` → rgb(28, 27, 24)) — nudged
// toward the album cover's own color, same idea as the archive page's
// "Featured" card, but for this whole page's background instead of one
// card's.
const PAGE_BASE: [number, number, number] = [28, 27, 24];
const PAGE_TINT_RATIO = 0.10;
// How far toward white the cover color gets pushed for use as this page's
// accent (replacing the flat amber everywhere) — enough to read clearly
// against the tinted dark background above.
const ACCENT_BRIGHTEN_AMOUNT = 0.10;
// Sticky notes get their own tuning, independent of the accent above —
// tinted toward the cover but not left fully pure/saturated (dark text on
// top of it needs some white mixed in to stay readable). Mine stays closer
// to the cover's own tone; everyone else's mixes further toward white.
const NOTE_MINE_BRIGHTEN = 0.25;
const NOTE_OTHERS_BRIGHTEN = 0.5;
// Large but controllable — matches CreateNoteRequest's @Size caps on the
// backend, enforced here too so the user sees the limit as they type instead
// of finding out on submit.
const NOTE_TITLE_MAX = 120;
const NOTE_TEXT_MAX = 5000;
const REVIEW_TEXT_MAX = 5000;

function levelSegments(level: string | null): number {
  if (level === "HIGH") return 3;
  if (level === "MEDIUM") return 2;
  if (level === "LOW") return 1;
  return 0;
}

function levelLabel(level: string | null): string {
  if (level === "HIGH") return "High";
  if (level === "MEDIUM") return "Medium";
  if (level === "LOW") return "Low";
  return "—";
}

function Meter({ label, level }: { label: string; level: string | null }) {
  const filled = levelSegments(level);
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[14px] font-semibold">{label}</span>
        <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.08em] text-[rgba(233,230,223,.55)]">
          {levelLabel(level)}
        </span>
      </div>
      <div className="flex gap-[5px]">
        {Array.from({ length: LEVEL_METER_SEGMENTS }, (_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1"
            style={{
              background: i < filled ? "var(--accent)" : "rgba(233,230,223,.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// A single label/value row inside a track's field notes box — same look as
// the album-level "Field notes" rows above, just factored out since the
// per-track box repeats this shape several times.
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-5 border-b border-[rgba(233,230,223,.18)] py-3.5 last:border-b-0">
      <span className="w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
        {label}
      </span>
      <span className="text-[15px] font-semibold capitalize">{value}</span>
    </div>
  );
}

// Same row shape, but for a list of VocabularyTags (contexts/rhythms/
// featuredInstruments) instead of one plain value — renders nothing if the
// track doesn't have any for that field.
function TagRow({ label, tags }: { label: string; tags: VocabularyTag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex items-start gap-5 border-b border-[rgba(233,230,223,.18)] py-3.5 last:border-b-0">
      <span className="mt-1 w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
        {label}
      </span>
      <span className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.code}
            className="rounded-full border-[1.5px] border-[var(--accent)] px-2.5 py-1.5 text-[12px] font-semibold"
          >
            {tag.label}
          </span>
        ))}
      </span>
    </div>
  );
}

function PerformerRow({ performers }: { performers: TrackPerformer[] }) {
  if (performers.length === 0) return null;
  return (
    <div className="py-3.5">
      <span className="mb-2 block font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
        Performers
      </span>
      <div className="flex flex-col gap-1.5">
        {performers.map((p, i) => (
          <div key={i} className="text-[14px]">
            <span className="font-semibold">{p.artistName}</span>
            <span className="text-[rgba(233,230,223,.55)]">
              {" — "}
              {p.role.toLowerCase()}
              {p.instrument ? ` (${p.instrument.toLowerCase()})` : ""}
              {p.primaryCredit ? " · primary" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Native share sheet where available, clipboard copy (with a quick "Copied"
// confirmation) everywhere else — no backend involved either way.
function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled the native sheet, or it isn't actually usable here
        // — fall through to clipboard copy either way.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
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
      className="flex h-[50px] w-[50px] flex-none items-center justify-center rounded-full text-[rgba(233,230,223,.75)]"
      style={{ background: "rgba(233,230,223,.1)" }}
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

// The notes a reviewer left on this album's tracks, shown alongside their
// review — they're part of the same read: rating + written review + the
// track-by-track notes they made along the way. Full TrackNotes (not a lean
// summary), so each one is clickable and opens in the same viewingNote
// modal as the per-track note feed. `limit` caps how many show before
// collapsing to a "+N more" count (the compact list-card view); pass
// nothing to show all of them (the full viewingReview modal).
function ReviewNotesList({
  notes,
  limit,
  getTrackName,
  onNoteClick,
}: {
  notes: TrackNote[];
  limit?: number;
  getTrackName: (trackId: string) => string;
  onNoteClick: (note: TrackNote) => void;
}) {
  if (notes.length === 0) return null;
  const shown = limit ? notes.slice(0, limit) : notes;
  const hiddenCount = notes.length - shown.length;
  return (
    <div className="mt-4 border-t border-[rgba(233,230,223,.1)] pt-4">
      <div className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.45)]">
        Also noted
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        {shown.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={(e) => {
              // These notes live inside a review card that's itself
              // clickable (opens viewingReview) — without this, clicking a
              // note would also trigger the card underneath it.
              e.stopPropagation();
              onNoteClick(n);
            }}
            className="-mx-2 flex min-w-0 items-baseline gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] leading-[1.4] transition-colors hover:bg-[rgba(233,230,223,.08)]"
          >
            {n.timestampSeconds != null && (
              <span className="flex-none font-[family-name:var(--font-dm-mono)] text-[11px] font-bold text-[var(--accent)]">
                {formatDuration(n.timestampSeconds * 1000)}
              </span>
            )}
            <span className="min-w-0 truncate">
              <span className="font-bold text-[rgba(233,230,223,.85)]">
                {n.title}
              </span>
              <span className="text-[rgba(233,230,223,.5)]">
                {" "}
                · {getTrackName(n.trackId)}
              </span>
            </span>
          </button>
        ))}
        {hiddenCount > 0 && (
          <span className="px-2 text-[12px] font-semibold text-[rgba(233,230,223,.45)]">
            +{hiddenCount} more
          </span>
        )}
      </div>
    </div>
  );
}

// Same sticky-note card as the per-track note grid (tilted, yellow, click to
// open in full) — used once a review is actually opened (viewingReview),
// instead of ReviewNotesList's compact row-per-note preview above. Keeping
// the two separate: the review card in the list stays a lightweight teaser
// (a couple of rows), the opened review shows notes the way notes always
// look everywhere else in the app.
function ReviewStickyNotes({
  notes,
  myUserId,
  getTrackName,
  onNoteClick,
  onLikeToggle,
  mineColor = "#e0ab1c",
  othersColor = "#ddc373",
  likedColor = "#e0392b",
}: {
  notes: TrackNote[];
  myUserId: string | null;
  getTrackName: (trackId: string) => string;
  onNoteClick: (note: TrackNote) => void;
  onLikeToggle: (trackId: string, noteId: string, next: boolean) => void;
  // Cover-tinted when the album page has a color to give (mine closer to
  // the cover's own tone, others a paler wash of it) — flat amber shades
  // otherwise, same as before.
  mineColor?: string;
  othersColor?: string;
  likedColor?: string;
}) {
  if (notes.length === 0) return null;
  return (
    <div className="mt-5 border-t border-[rgba(233,230,223,.1)] pt-5">
      <div className="mb-3 font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.45)]">
        Also noted
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {notes.map((n, i) => {
          // Defensive, not just tidy: if this ever came from a stale
          // backend still on the old lean ReviewNoteDto shape, n.text would
          // be undefined and `.length` would crash the whole modal instead
          // of just rendering an empty note body.
          const text = n.text ?? "";
          const isLong = text.length > 220;
          const isMine = n.userId === myUserId;
          return (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => onNoteClick(n)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onNoteClick(n);
              }}
              className="flex min-h-[160px] min-w-0 cursor-pointer flex-col gap-3 rounded-[3px] p-6 text-[#1c1b18] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
              style={{
                background: isMine ? mineColor : othersColor,
                transform: `rotate(${[-1.4, 1.2, -0.6][i % 3]}deg)`,
              }}
            >
              <div className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-bold uppercase tracking-[.12em] text-[rgba(28,27,24,.5)]">
                {getTrackName(n.trackId)}
              </div>
              {n.timestampSeconds != null && (
                <span className="font-[family-name:var(--font-dm-mono)] text-[12px] font-bold text-[#8a5c00]">
                  ▶ {formatDuration(n.timestampSeconds * 1000)}
                </span>
              )}
              <div className="text-[20px] leading-[1.15] font-extrabold tracking-[-.02em] break-words">
                {n.title}
              </div>
              <p
                className={
                  "m-0 text-[15px] leading-[1.5] font-medium break-words " +
                  (isLong ? "line-clamp-5" : "")
                }
              >
                {text}
              </p>
              {isLong && (
                <span className="text-[12px] font-bold text-[#8a5c00] underline underline-offset-[3px]">
                  Read the full note →
                </span>
              )}
              <div
                className="mt-auto flex items-center justify-between gap-3 border-t border-[rgba(28,27,24,.16)] pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] font-semibold text-[rgba(28,27,24,.6)]">
                  — {n.userName ?? "Someone"} · {formatDate(n.createdAt)}
                </span>
                <LikeButton
                  variant="inline"
                  theme="light"
                  likedColor={likedColor}
                  initialCount={n.likeCount}
                  initialLiked={n.likedByCurrentUser}
                  onToggle={(next) => onLikeToggle(n.trackId, n.id, next)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AlbumEditorialPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <LoadingNotes />
        </>
      }
    >
      <AlbumEditorialContent />
    </Suspense>
  );
}

function AlbumEditorialContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [album, setAlbum] = useState<AlbumHeader | null>(null);
  // Fetched separately from the header (see fetchAlbumTracks) — null means
  // "still loading", not "no tracks"; [] is the real empty state.
  const [tracks, setTracks] = useState<AlbumTrack[] | null>(null);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [coverColor, setCoverColor] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  // The reviewPage currently being browsed.
  const [reviews, setReviews] = useState<Page<AlbumReview> | null>(null);
  // Page 0's content, cached separately from `reviews` above so it survives
  // paging away from page 0 — GET /albums/{id}/reviews/me is gone; mine (if
  // it exists) is always content[0] of page 0, so this is how "do I
  // already have a review" gets determined now.
  const [page0Content, setPage0Content] = useState<AlbumReview[] | null>(
    null,
  );
  const myReview =
    page0Content && page0Content[0]?.userId === myUserId
      ? page0Content[0]
      : null;
  const [notesByTrack, setNotesByTrack] = useState<Record<string, TrackNote[]>>(
    {},
  );
  // The current page's total note count for each track — pagination is
  // server-side, so this (not notesByTrack[id].length) drives the pager.
  const [noteTotalsByTrack, setNoteTotalsByTrack] = useState<
    Record<string, number>
  >({});
  const [noteSubmitting, setNoteSubmitting] = useState<Record<string, boolean>>(
    {},
  );
  // The "write a note" modal — one at a time, so a single set of draft
  // fields (not a per-track map) is enough; opening it resets them.
  const [noteModalTrackId, setNoteModalTrackId] = useState<string | null>(
    null,
  );
  const [noteTitleInput, setNoteTitleInput] = useState("");
  const [noteTextInput, setNoteTextInput] = useState("");
  const [noteTimestampInput, setNoteTimestampInput] = useState("");

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

  const [reviewText, setReviewText] = useState("");
  const [reviewStandouts, setReviewStandouts] = useState<string[]>([]);
  const [reviewRatingInput, setReviewRatingInput] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  // A small "are you sure?" dialog, stacked above whichever of the note or
  // review modals is open — shared between "Delete note" and "Delete
  // review" instead of two separate confirm flows.
  const [confirmDelete, setConfirmDelete] = useState<
    { type: "note"; note: TrackNote } | { type: "review" } | null
  >(null);

  function openReviewModal() {
    setReviewRatingInput(myReview?.rating ?? 0);
    setReviewText(myReview?.text ?? "");
    setReviewStandouts(myReview?.standoutTracks.map((t) => t.id) ?? []);
    setReviewModalOpen(true);
    setConfirmDelete(null);
  }

  function closeReviewModal() {
    setReviewModalOpen(false);
    setConfirmDelete(null);
  }

  useEffect(() => {
    if (!reviewModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      // Let the confirm dialog's own Escape handler take this keypress when
      // it's the one on top — otherwise one Escape would close both at once.
      if (confirmDelete) return;
      if (e.key === "Escape") closeReviewModal();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reviewModalOpen, confirmDelete]);

  // The clicked note, full-screen over a dimmed backdrop — same treatment as
  // writing one, just read-only.
  const [viewingNote, setViewingNote] = useState<{
    note: TrackNote;
    trackName: string;
  } | null>(null);

  useEffect(() => {
    if (!viewingNote) return;
    function onKeyDown(e: KeyboardEvent) {
      if (confirmDelete) return;
      if (e.key === "Escape") {
        setViewingNote(null);
        setConfirmDelete(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewingNote, confirmDelete]);

  useEffect(() => {
    if (!confirmDelete) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmDelete(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmDelete]);

  // The clicked review, full-screen over a dimmed backdrop — same "click the
  // card to read it in full" treatment as viewingNote above.
  const [viewingReview, setViewingReview] = useState<AlbumReview | null>(
    null,
  );

  useEffect(() => {
    if (!viewingReview) return;
    function onKeyDown(e: KeyboardEvent) {
      // A note opened from this review's "Also noted" list stacks on top
      // (see viewingNote's z-[55] below) — let its own Escape handler take
      // this keypress first, same guard as confirmDelete elsewhere.
      if (viewingNote) return;
      if (e.key === "Escape") setViewingReview(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewingReview, viewingNote]);

  // Any of the four modals (write a note, view a note, view a review,
  // review) covers the page behind a fixed backdrop — without this the page
  // itself can still scroll underneath it, which reads as broken since the
  // backdrop doesn't move with it.
  useEffect(() => {
    const anyModalOpen =
      Boolean(noteModalTrackId) ||
      reviewModalOpen ||
      Boolean(viewingNote) ||
      Boolean(viewingReview);
    if (!anyModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [noteModalTrackId, reviewModalOpen, viewingNote, viewingReview]);

  const [notePage, setNotePage] = useState<Record<string, number>>({});
  const [reviewPage, setReviewPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // The header — everything above the fold. Independent of, and in
  // parallel with, the tracks fetch below: this is the light call, so it's
  // what should paint first.
  useEffect(() => {
    if (!id) return;
    fetchAlbumHeader(id)
      .then(setAlbum)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load this editorial.",
        ),
      );
  }, [id]);

  // Only sampled when the admin hasn't curated a color for this album (see
  // album.coverColor below) — no point spending a network round-trip + a
  // canvas read once there's a real one to use instead. Pulled once the
  // header lands (not re-run on every later `album` update from optimistic
  // toggles elsewhere) — same ambient-tint idea as the archive page's
  // "Featured" card, just driving this whole page's palette instead of one
  // card's.
  useEffect(() => {
    if (!album?.imageUrl || album.coverColor) return;
    let cancelled = false;
    extractAverageColor(album.imageUrl).then((color) => {
      if (!cancelled) setCoverColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [album?.imageUrl, album?.coverColor]);

  // The admin-curated color wins when set (converted from its #rrggbb hex
  // to the "rgb(r, g, b)" shape brighten/mixWithBase expect); the sampled
  // average is the fallback for whatever hasn't been curated yet.
  const resolvedCoverColor = album?.coverColor
    ? hexToRgb(album.coverColor)
    : coverColor;

  // Static once known — no scroll-linked blending, just the tint itself.
  // Fall back to the page's usual flat charcoal / the old flat amber until
  // (or if) a cover color resolves.
  const pageBg = resolvedCoverColor
    ? mixWithBase(resolvedCoverColor, PAGE_BASE, PAGE_TINT_RATIO)
    : "#1c1b18";
  const accent = resolvedCoverColor
    ? brighten(resolvedCoverColor, ACCENT_BRIGHTEN_AMOUNT)
    : "#d99b10";
  // Sticky notes — see NOTE_MINE_BRIGHTEN/NOTE_OTHERS_BRIGHTEN above. Same
  // two-tier idea as the flat amber shades this replaces.
  const noteColorMine = resolvedCoverColor
    ? brighten(resolvedCoverColor, NOTE_MINE_BRIGHTEN)
    : "#e0ab1c";
  const noteColorOthers = resolvedCoverColor
    ? brighten(resolvedCoverColor, NOTE_OTHERS_BRIGHTEN)
    : "#ddc373";
  // Broadcast the same tint up to the shared shell (Sidebar + Navbar), not
  // just this page's own content — reverts automatically on unmount (see
  // usePageTint), so navigating away never leaves another page tinted.
  const pageTint = useMemo(
    () => ({ background: pageBg, accent }),
    [pageBg, accent],
  );
  usePageTint(pageTint);

  // The expensive part (several Neo4j round-trips per track) — fetched on
  // its own so it never holds up the header above. Once the tracks land,
  // chain straight into one page-0 notes request per track (there's no
  // batched "every note on every track of this album" endpoint, unlike
  // myNotes, and album track counts here are small enough that this is
  // fine) — each request is still just one page's worth, not the whole
  // feed, since a track's total note count is unbounded unlike its track
  // count.
  useEffect(() => {
    if (!id) return;
    fetchAlbumTracks(id)
      .then((ts) => {
        setTracks(ts);
        return Promise.all(
          ts.map((t) =>
            fetchTrackNotes(t.id, 0, NOTES_PER_PAGE).then(
              (p) => [t.id, p] as const,
            ),
          ),
        );
      })
      .then((pairs) => {
        setNotesByTrack(
          Object.fromEntries(pairs.map(([tid, p]) => [tid, p.content])),
        );
        setNoteTotalsByTrack(
          Object.fromEntries(pairs.map(([tid, p]) => [tid, p.totalElements])),
        );
        // Clears out a previous id's failure, if any — e.g. navigating from
        // an album whose tracks 500'd to one that loads fine.
        setTracksError(null);
      })
      .catch((err) => {
        setTracksError(
          err instanceof ApiError ? err.message : "Couldn't load the tracks.",
        );
        setTracks((ts) => ts ?? []);
      });
  }, [id]);

  // Needed to sort/highlight "your own" notes ahead of everyone else's —
  // fetched once, independent of which track's notes are being viewed.
  useEffect(() => {
    fetchMe()
      .then((me) => setMyUserId(me.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchAlbumReviews(id, reviewPage, REVIEWS_PER_PAGE)
      .then((p) => {
        // Defensive: a backend still on the old un-paginated shape would
        // resolve with a plain array here instead of a Page, and p.content
        // would be undefined — every render reading it would then crash
        // the whole page instead of just leaving this section empty. Never
        // let that reach state; the header and tracks above have nothing
        // to do with reviews and shouldn't go down with them.
        if (!p || !Array.isArray(p.content)) return;
        setReviews(p);
        if (reviewPage === 0) setPage0Content(p.content);
      })
      .catch(() => {});
  }, [id, reviewPage]);

  // Shared by the pager's page-change and by a just-posted note (which jumps
  // back to page 0 so the new note — sorted to the front, being the user's
  // own — is immediately visible).
  async function loadNotesPage(trackId: string, page: number) {
    const p = await fetchTrackNotes(trackId, page, NOTES_PER_PAGE);
    setNotesByTrack((n) => ({ ...n, [trackId]: p.content }));
    setNoteTotalsByTrack((t) => ({ ...t, [trackId]: p.totalElements }));
  }

  if (!id) {
    return (
      <>
        <Navbar />
        <EmptyState
          title="No album selected"
          subtitle="Open this page from an album in the archive."
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

  if (!album) {
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

  const editorial = album.editorial;

  function handleEditorialLikeToggle(next: boolean) {
    if (!editorial) return;
    setAlbum(
      (a) =>
        a &&
        a.editorial && {
          ...a,
          editorial: {
            ...a.editorial,
            likedByCurrentUser: next,
            likeCount: a.editorial.likeCount + (next ? 1 : -1),
          },
        },
    );
    (next ? likeEntity : unlikeEntity)("EDITORIAL", editorial.id).catch(() => {
      // Roll back the optimistic count/flag on failure.
      setAlbum(
        (a) =>
          a &&
          a.editorial && {
            ...a,
            editorial: {
              ...a.editorial,
              likedByCurrentUser: !next,
              likeCount: a.editorial.likeCount + (next ? -1 : 1),
            },
          },
      );
    });
  }

  function handleSaveToggle() {
    const next = !album!.isSaved;
    setAlbum((a) => a && { ...a, isSaved: next });
    debounceByKey(`save-album-${album!.id}`, () => {
      (next ? saveItem("ALBUM", album!.id) : unsaveItem("ALBUM", album!.id)).catch(
        () => {
          setAlbum((a) => a && { ...a, isSaved: !next });
        },
      );
    });
  }

  // Fully optimistic — create/updateReview do several sequential DB
  // round-trips server-side (user/album/listen-check/standout-tracks/save/
  // notes), which adds up to real, felt latency for something that should
  // feel instant. So: build the review locally, show it and close the
  // modal immediately, and let the actual save happen in the background —
  // rolling back only if it turns out to have failed.
  //
  // Mine always lives at content[0] of page 0 (see page0Content above) —
  // that's what gets pinned/replaced here, and mirrored into `reviews` too
  // when that's the page currently being browsed. Not attempting to keep
  // totalElements/totalPages perfectly in sync on a brand-new review (it's
  // off by one until the next real fetch) — a rare enough case that it
  // isn't worth the bookkeeping.
  function handleWriteReview() {
    if (!reviewRatingInput || !album) return;
    const isEdit = myReview !== null;
    const rating = reviewRatingInput;
    const text = reviewText || null;
    const standoutIds = reviewStandouts;
    const standoutTracks = (tracks ?? [])
      .filter((t) => standoutIds.includes(t.id))
      .map((t) => ({ id: t.id, name: t.name }));

    const previousPage0 = page0Content;
    const previousReviews = reviews;
    const now = new Date().toISOString();
    const optimisticReview: AlbumReview = myReview
      ? { ...myReview, rating, text, standoutTracks, updatedAt: now }
      : {
          id: `optimistic-${now}`,
          albumId: album.id,
          userId: myUserId ?? "",
          userName: "",
          rating,
          text,
          likeCount: 0,
          likedByCurrentUser: false,
          standoutTracks,
          // No review existed yet, so there's no server copy of "notes on
          // this album" to carry over — but the tracks fetch already has
          // them (tracks[].myNotes), same TrackNote shape the real
          // ReviewDto's notes are drawn from server-side, so the optimistic
          // copy can still show them instead of blanking out until the real
          // response lands.
          notes: (tracks ?? []).flatMap((t) => t.myNotes),
          createdAt: now,
          updatedAt: now,
        };

    const pinToFront = (list: AlbumReview[]) => [
      optimisticReview,
      ...list.filter(
        (r) => r.id !== optimisticReview.id && r.userId !== myUserId,
      ),
    ];
    setPage0Content((c) => pinToFront(c ?? []));
    if (reviewPage === 0) {
      setReviews((rs) => rs && { ...rs, content: pinToFront(rs.content) });
    }
    closeReviewModal();

    (isEdit
      ? updateReview(album.id, rating, text, standoutIds)
      : createReview(album.id, rating, text, standoutIds)
    )
      .then((updated) => {
        const reconcile = (list: AlbumReview[]) =>
          list.map((r) =>
            r.id === optimisticReview.id || r.userId === updated.userId
              ? updated
              : r,
          );
        setPage0Content((c) => c && reconcile(c));
        if (reviewPage === 0) {
          setReviews((rs) => rs && { ...rs, content: reconcile(rs.content) });
        }
        // The JazzLogs rating block (avgRating) intentionally doesn't
        // live-refresh here — it stays as it was until the next real page
        // load, rather than jumping on its own right after you submit.
      })
      .catch(() => {
        setPage0Content(previousPage0);
        setReviews(previousReviews);
      });
  }

  function handleDeleteReview() {
    if (!album) return;
    const previousPage0 = page0Content;
    const previousReviews = reviews;

    setPage0Content((c) => c && c.filter((r) => r.userId !== myUserId));
    if (reviewPage === 0) {
      setReviews(
        (rs) =>
          rs && { ...rs, content: rs.content.filter((r) => r.userId !== myUserId) },
      );
    }
    setReviewText("");
    setReviewStandouts([]);
    setReviewRatingInput(0);
    closeReviewModal();

    deleteReview(album.id).catch(() => {
      setPage0Content(previousPage0);
      setReviews(previousReviews);
    });
  }

  function handleReviewLikeToggle(reviewId: string, next: boolean) {
    (next ? likeEntity : unlikeEntity)("REVIEW", reviewId).catch(() => {});
  }

  // ReviewDto.notes carries trackId, not a track name — this app's own
  // track list is the source of truth for that, so look it up locally
  // instead of the backend repeating it on every note.
  function getTrackName(trackId: string): string {
    return tracks?.find((t) => t.id === trackId)?.name ?? "";
  }

  // Opens a note surfaced inside a review's "Also noted" list in the same
  // viewingNote modal the per-track note feed uses — same component, same
  // shape (ReviewDto.notes is now a full TrackNote, not a lean summary).
  function openReviewNote(note: TrackNote) {
    setViewingNote({ note, trackName: getTrackName(note.trackId) });
  }

  function toggleReviewStandout(trackId: string) {
    setReviewStandouts((ids) =>
      ids.includes(trackId)
        ? ids.filter((id) => id !== trackId)
        : [...ids, trackId],
    );
  }

  async function handleWriteNote(trackId: string) {
    const title = noteTitleInput.trim();
    const text = noteTextInput.trim();
    if (!title || !text) return;
    const timestampSeconds = parseTimestampInput(noteTimestampInput);
    setNoteSubmitting((s) => ({ ...s, [trackId]: true }));
    try {
      await createNote(trackId, title, text, timestampSeconds);
      // Re-fetch page 0 from the server instead of splicing the new note into
      // the locally-held page — it's sorted to the front (yours first), so
      // page 0 is exactly where it'll land, and this keeps the total count
      // correct without trusting a hand-rolled insert to match server order.
      setNotePage((np) => ({ ...np, [trackId]: 0 }));
      await loadNotesPage(trackId, 0);
      closeNoteModal();
    } catch {
      // Leave the draft (and the modal open) in place so the user can retry.
    } finally {
      setNoteSubmitting((s) => ({ ...s, [trackId]: false }));
    }
  }

  function handleNoteLikeToggle(
    trackId: string,
    noteId: string,
    next: boolean,
  ) {
    (next ? likeEntity : unlikeEntity)("NOTE", noteId).catch(() => {});
  }

  function handleDeleteNote(note: TrackNote) {
    const trackId = note.trackId;
    const previousNotes = notesByTrack[trackId] ?? [];
    const previousTotal = noteTotalsByTrack[trackId] ?? previousNotes.length;

    setNotesByTrack((n) => ({
      ...n,
      [trackId]: (n[trackId] ?? []).filter((x) => x.id !== note.id),
    }));
    setNoteTotalsByTrack((t) => ({
      ...t,
      [trackId]: Math.max(0, (t[trackId] ?? previousTotal) - 1),
    }));
    setViewingNote(null);
    setConfirmDelete(null);

    deleteNote(note.id).catch(() => {
      setNotesByTrack((n) => ({ ...n, [trackId]: previousNotes }));
      setNoteTotalsByTrack((t) => ({ ...t, [trackId]: previousTotal }));
    });
  }

  // The album header's "Listened" state isn't set directly anymore — it's
  // derived from every track being listened, same as the backend
  // (ListenService.syncAlbumCompletionState). Recomputed here from the
  // (now separately-fetched) tracks array after every optimistic track
  // toggle so the progress indicator / "fully listened" transition feels
  // instant, without waiting for a full refetch. Reads `tracks` directly
  // (not via setTracks's updater) since this is a synchronous handler, not
  // an effect — same idiom handleTrackRate already used below for
  // `previousRating`.
  function applyTrackListened(trackId: string, listened: boolean) {
    if (!tracks) return;
    const updated = tracks.map((t) =>
      t.id === trackId ? { ...t, hasListened: listened } : t,
    );
    setTracks(updated);
    const listenedTrackCount = updated.filter((t) => t.hasListened).length;
    setAlbum(
      (a) =>
        a && {
          ...a,
          listenedTrackCount,
          hasListened: updated.length > 0 && listenedTrackCount === updated.length,
        },
    );
  }

  function handleTrackListen(trackId: string, currentlyListened: boolean) {
    const next = !currentlyListened;
    applyTrackListened(trackId, next);
    debounceByKey(`listen-track-${trackId}`, () => {
      (next ? markTrackListened : unmarkTrackListened)(trackId).catch(() => {
        applyTrackListened(trackId, currentlyListened);
      });
    });
  }

  function handleTrackSaveToggle(trackId: string, currentlySaved: boolean) {
    const next = !currentlySaved;
    setTracks(
      (ts) =>
        ts &&
        ts.map((t) => (t.id === trackId ? { ...t, isSaved: next } : t)),
    );
    debounceByKey(`save-track-${trackId}`, () => {
      (next ? saveItem("TRACK", trackId) : unsaveItem("TRACK", trackId)).catch(
        () => {
          setTracks(
            (ts) =>
              ts &&
              ts.map((t) =>
                t.id === trackId ? { ...t, isSaved: currentlySaved } : t,
              ),
          );
        },
      );
    });
  }

  function handleTrackRate(trackId: string, rating: number) {
    const previousRating =
      tracks?.find((t) => t.id === trackId)?.myRating ?? null;
    setTracks(
      (ts) =>
        ts &&
        ts.map((t) => (t.id === trackId ? { ...t, myRating: rating } : t)),
    );
    debounceByKey(`rate-track-${trackId}`, () => {
      rateTrack(trackId, rating).catch(() => {
        setTracks(
          (ts) =>
            ts &&
            ts.map((t) =>
              t.id === trackId ? { ...t, myRating: previousRating } : t,
            ),
        );
      });
    });
  }

  return (
    <>
      <Navbar />

      <div
        className="relative animate-[jazzlogs-fade-up_.6s_ease-out]"
        style={{ "--accent": accent } as React.CSSProperties}
      >
        {/* The actual page background, not just this column — bleeds full
            viewport width (offset for the Sidebar's current width, same
            trick the archive page uses) and exactly this content's height.
            The real content right below is explicitly `relative z-10` over
            it, rather than relying on a negative z-index here — this outer
            wrapper's own fade-in animation can make it establish its own
            stacking context, and a positioned sibling with no z-index isn't
            guaranteed to land behind it in that case. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2"
          style={{ backgroundColor: pageBg }}
        />
        <div className="relative z-10">
        <div className="flex justify-between border-y border-[var(--accent)] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
          <Link href="/archive" className="no-underline">
            ← Editorials · Albums
          </Link>
          <span>Album editorial</span>
          {album.postedAt && <span>Posted {formatDate(album.postedAt)}</span>}
        </div>

        {/* Article head */}
        <div className="grid grid-cols-1 items-center gap-9 pt-11 pb-6 md:grid-cols-[1fr_360px]">
          <div>
            <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.24em] text-[rgba(233,230,223,.6)]">
              {album.logNumber ? `Log #${album.logNumber} · ` : ""}Album
              editorial
            </div>
            <div className="mt-5 text-[52px] leading-[.9] font-extrabold tracking-[-.05em] text-[var(--accent)] sm:text-[72px]">
              {editorial?.title ?? album.name}
            </div>
            <div className="mt-4 text-[19px] font-semibold tracking-[-.01em] text-[rgba(233,230,223,.75)]">
              {album.artistName}
              {album.releaseYear ? ` · ${album.releaseYear}` : ""}
              {album.label ? ` · ${album.label}` : ""}
            </div>
            {editorial?.dek && (
              <div className="mt-5 max-w-[500px] text-[20px] leading-[1.42] font-medium tracking-[-.015em]">
                {editorial.dek}
              </div>
            )}
            {editorial?.byline && (
              <div className="mt-5 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.55)]">
                By {editorial.byline}
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {album.hasListened ? (
                <div
                  className="rounded-full px-6 py-[15px] text-[14px] font-bold"
                  style={{ background: accent, color: "#1c1b18" }}
                >
                  ✓ Listened
                </div>
              ) : (
                <div
                  className="rounded-full px-6 py-[15px] text-[14px] font-bold"
                  style={{
                    background: "rgba(233,230,223,.1)",
                    color: "rgba(233,230,223,.6)",
                  }}
                >
                  {album.listenedTrackCount}/{album.totalTracks ?? tracks?.length ?? 0} tracks listened
                </div>
              )}
              {editorial && (
                <LikeButton
                  initialCount={editorial.likeCount}
                  initialLiked={editorial.likedByCurrentUser}
                  hideCount
                  likedColor={accent}
                  onToggle={handleEditorialLikeToggle}
                />
              )}
              <button
                type="button"
                onClick={openReviewModal}
                className="flex items-center gap-2 rounded-full px-6 py-[15px] text-[14px] font-bold"
                style={{ background: "var(--accent)", color: "#1c1b18" }}
              >
                <svg
                  width="16"
                  height="16"
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
                {myReview ? "Edit your review" : "Write a review"}
              </button>
              <button
                type="button"
                onClick={handleSaveToggle}
                className="rounded-full px-6 py-[15px] text-[14px] font-bold"
                style={{
                  background: album.isSaved
                    ? "var(--accent)"
                    : "rgba(233,230,223,.1)",
                  color: album.isSaved ? "#1c1b18" : "rgba(233,230,223,.6)",
                }}
              >
                {album.isSaved ? "On your list" : "Listen later"}
              </button>
              {typeof window !== "undefined" && (
                <ShareButton url={window.location.href} />
              )}
            </div>

            <div className="mt-7">
              <div className="flex flex-wrap gap-8">
                <div>
                  <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.18em] text-[rgba(233,230,223,.55)]">
                    JazzLogs rating
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <AverageStars value={album.avgRating ?? 0} size={24} fillColor={accent} />
                    <span className="text-[26px] font-extrabold tracking-[-.02em]">
                      {album.avgRating ? album.avgRating.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>
                {myReview && (
                  <div>
                    <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.55)]">
                      Your rating
                    </div>
                    {/* Read-only here — the rating only changes as part of
                        the review itself (see the modal), not as its own
                        quick action, so there's one place that sets it, not
                        two. A custom tooltip (not the native title attr) on
                        hover is the only hint of that, since the stars
                        themselves no longer look interactive. */}
                    <div className="mt-3 flex items-center gap-4">
                      <span className="group relative inline-flex cursor-default">
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2.5 w-max max-w-[190px] -translate-x-1/2 rounded-lg border border-[var(--accent)] bg-[#1c1b18] px-3 py-2 text-center text-[11.5px] leading-snug font-medium text-[#e9e6df] opacity-0 shadow-[0_10px_24px_rgba(0,0,0,.45)] transition-opacity duration-150 group-hover:opacity-100">
                          Edit your review to change it
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--accent)]" />
                        </div>
                        <AverageStars value={myReview.rating} size={24} fillColor={accent} />
                      </span>
                      <span className="text-[26px] font-extrabold tracking-[-.02em]">
                        {myReview.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-baseline gap-7">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[28px] font-extrabold tracking-[-.03em] text-[var(--accent)]">
                    {album.listenCount.toLocaleString()}
                  </span>
                  <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.6)]">
                    Listenings
                  </span>
                </div>
                {editorial && (
                  <div
                    className="flex items-center gap-2 text-[28px] font-extrabold tracking-[-.03em]"
                    style={{ color: accent }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={accent}
                      stroke={accent}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {editorial.likeCount}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <Cover
              imageUrl={album.imageUrl}
              alt={album.name}
              className="aspect-square w-full rounded-[18px] md:w-[360px]"
            />
            {album.spotifyUrl && (
              <a
                href={album.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex items-center justify-center gap-2.5 rounded-full bg-black px-6 py-[15px] text-[14px] font-bold text-[#e9e6df]"
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

        {/* Body */}
        {editorial && editorial.blocks.length > 0 && (
          <div className="mx-auto mt-11 max-w-[680px]">
            {editorial.blocks.map((b, i) => (
              <div key={i}>
                {b.subhead && (
                  <div className="mt-10 mb-5 text-[26px] font-extrabold leading-[1.1] tracking-[-.03em]">
                    {b.subhead}
                  </div>
                )}
                {b.type === "LEAD" ? (
                  splitParagraphs(b.text).map((para, pi) => (
                    <p key={pi} className="mb-9 text-[18px] leading-[1.75]">
                      {pi === 0 ? (
                        <>
                          <span className="float-left mt-1.5 mr-3.5 text-[60px] leading-[.68] font-extrabold tracking-[-.03em]">
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
                  <div className="my-9 border-y-[2.5px] border-[var(--accent)] py-8 text-[34px] leading-[1.2] font-semibold tracking-[-.03em] sm:text-[40px]">
                    “{b.text}”
                  </div>
                ) : (
                  splitParagraphs(b.text).map((para, pi) => (
                    <p
                      key={pi}
                      className="mb-9 text-[18px] leading-[1.75] text-[rgba(233,230,223,.9)]"
                    >
                      {para}
                    </p>
                  ))
                )}
              </div>
            ))}
          </div>
        )}

        {/* Field notes */}
        <div className="mt-14 overflow-hidden rounded-2xl border-[1.5px] border-[var(--accent)]">
          <div className="border-b-[1.5px] border-[var(--accent)] px-6 py-4">
            <span className="text-[16px] font-extrabold tracking-[-.01em]">
              Field notes
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col justify-between border-b border-[var(--accent)] p-6 sm:border-r sm:border-b-0">
              <div className="flex gap-5 border-b border-[rgba(233,230,223,.18)] py-3.5">
                <span className="w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                  Released
                </span>
                <span className="text-[15px] font-semibold">
                  {album.releaseYear ?? "—"}
                  {album.label ? ` · ${album.label}` : ""}
                </span>
              </div>
              {album.vocalProfile && (
                <div className="flex gap-5 border-b border-[rgba(233,230,223,.18)] py-3.5">
                  <span className="w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                    Vocal profile
                  </span>
                  <span className="text-[15px] font-semibold capitalize">
                    {album.vocalProfile.toLowerCase()}
                  </span>
                </div>
              )}
              {album.moods.length > 0 && (
                <div className="flex items-start gap-5 border-b border-[rgba(233,230,223,.18)] py-3.5">
                  <span className="mt-1 w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                    Moods
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {album.moods.map((m) => (
                      <span
                        key={m}
                        className="rounded-full border-[1.5px] border-[var(--accent)] px-2.5 py-1.5 text-[12px] font-semibold"
                      >
                        {m}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {album.contexts.length > 0 && (
                <div className="flex items-start gap-5 py-3.5">
                  <span className="mt-1 w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                    Listen when
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {album.contexts.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border-[1.5px] border-[var(--accent)] px-2.5 py-1.5 text-[12px] font-semibold"
                      >
                        {c}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="mb-4 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.5)]">
                The feel
              </div>
              <Meter label="Energy" level={album.energy} />
              <Meter label="Mood intensity" level={album.moodIntensity} />
              <Meter label="Accessibility" level={album.accessibility} />

              {album.personnel.length > 0 && (
                <>
                  <div className="mt-5 mb-3 border-t border-[rgba(233,230,223,.18)] pt-5 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.5)]">
                    Personnel
                  </div>
                  {album.personnel.map((p) => (
                    <div
                      key={p.artistId}
                      className="flex items-baseline justify-between py-1.5"
                    >
                      <span className="text-[15px] font-bold tracking-[-.01em]">
                        {p.artistName}
                      </span>
                      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-[rgba(233,230,223,.6)]">
                        {p.role}
                        {p.instruments.length > 0
                          ? ` · ${p.instruments.join(", ")}`
                          : ""}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-8 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,#2a2621)] p-9 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[var(--accent)]">
              Go deeper
            </div>
            <div className="mt-3 text-[30px] font-extrabold leading-[1.05] tracking-[-.03em]">
              Ask the agent where to go next with {album.name}.
            </div>
          </div>
          <Link
            href="/agent"
            className="rounded-full bg-[var(--accent)] px-7 py-[17px] text-[15px] font-bold whitespace-nowrap text-[#1c1b18] no-underline"
          >
            Open the agent →
          </Link>
        </div>

        {/* Track by track — fetched separately from the header above, so it
            can still be loading (or have failed) well after everything
            above the fold has already painted. */}
        {tracks === null ? (
          <div className="mt-18">
            <LoadingNotes
              compact
              messages={["Pulling the track list…", "Checking the liner notes…"]}
            />
          </div>
        ) : tracksError ? (
          <div className="mt-18 border-t-[1.5px] border-[var(--accent)] pt-6 text-[14px] text-[rgba(233,230,223,.6)]">
            {tracksError}
          </div>
        ) : (
          tracks.length > 0 && (
          <>
            <div className="mt-18 flex items-baseline justify-between border-b-[1.5px] border-[var(--accent)] pb-3">
              <span className="text-[16px] font-extrabold tracking-[-.01em]">
                Track by track
              </span>
            </div>
            {tracks.map((t) => {
              const duration = formatDuration(t.durationMs);
              return (
                <div
                  key={t.id}
                  id={`track-${t.id}`}
                  className="scroll-mt-20 border-t-[2.5px] border-[var(--accent)] py-12"
                >
                  <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
                    <div className="w-full flex-none sm:w-[240px]">
                      <Cover
                        imageUrl={t.imageUrl}
                        alt={t.name}
                        className="aspect-square w-full rounded-[14px]"
                      />
                      {t.spotifyUrl && (
                        <a
                          href={t.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 flex items-center justify-center gap-2.5 rounded-full bg-black px-6 py-[15px] text-[14px] font-bold text-[#e9e6df]"
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-[family-name:var(--font-dm-mono)] text-[12px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.55)]">
                          Track {String(t.trackNumber ?? 0).padStart(2, "0")}
                          {duration ? ` · ${duration}` : ""}
                        </span>
                        {t.standout && (
                          <span className="rounded-[5px] bg-[#2a2621] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[9.5px] font-bold uppercase tracking-[.12em] text-[var(--accent)]">
                            Standout
                          </span>
                        )}
                      </div>
                      <div className="mt-3 text-[52px] leading-[.9] font-extrabold tracking-[-.05em] text-[var(--accent)] sm:text-[72px]">
                        {t.editorial?.title ?? t.name}
                      </div>
                      {t.editorial?.dek && (
                        <p className="mt-3 max-w-[640px] text-[20px] leading-[1.42] font-medium tracking-[-.015em]">
                          {t.editorial.dek}
                        </p>
                      )}
                      {t.moods.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {t.moods.map((m) => (
                            <span
                              key={m.code}
                              className="rounded-full border-[1.5px] border-[var(--accent)] px-2.5 py-1.5 text-[12px] font-semibold"
                            >
                              {m.label}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <AverageStars value={t.avgRating ?? 0} size={24} fillColor={accent} />
                        <span className="text-[26px] font-extrabold tracking-[-.02em]">
                          {t.avgRating ? t.avgRating.toFixed(1) : "—"}
                        </span>
                        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[rgba(233,230,223,.6)]">
                          {t.ratingCount}{" "}
                          {t.ratingCount === 1 ? "rating" : "ratings"}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-[rgba(233,230,223,.35)]" />
                        <span className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.55)]">
                          You
                        </span>
                        <InteractiveStars
                          size={24}
                          initial={t.myRating ?? 0}
                          fillColor={accent}
                          onRate={(n) => handleTrackRate(t.id, n)}
                        />
                      </div>
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleTrackListen(t.id, t.hasListened)}
                          className="rounded-full px-6 py-[15px] text-[14px] font-bold"
                          style={{
                            background: t.hasListened
                              ? accent
                              : "rgba(233,230,223,.1)",
                            color: t.hasListened
                              ? "#1c1b18"
                              : "rgba(233,230,223,.6)",
                          }}
                        >
                          ✓ Listened
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTrackSaveToggle(t.id, t.isSaved)}
                          className="rounded-full px-6 py-[15px] text-[14px] font-bold"
                          style={{
                            background: t.isSaved
                              ? "var(--accent)"
                              : "rgba(233,230,223,.1)",
                            color: t.isSaved
                              ? "#1c1b18"
                              : "rgba(233,230,223,.6)",
                          }}
                        >
                          {t.isSaved ? "On your list" : "Listen later"}
                        </button>
                        {typeof window !== "undefined" && (
                          <ShareButton
                            url={`${window.location.origin}${window.location.pathname}?id=${album.id}#track-${t.id}`}
                          />
                        )}
                      </div>
                      {t.editorial?.blocks.map((b, i) => (
                        <div key={i} className="mt-4 max-w-[640px]">
                          {b.subhead && (
                            <div className="mb-2 text-[20px] font-extrabold tracking-[-.02em]">
                              {b.subhead}
                            </div>
                          )}
                          {b.type === "QUOTE" ? (
                            <div className="border-y-[1.5px] border-[var(--accent)] py-5 text-[24px] leading-[1.3] font-semibold tracking-[-.025em]">
                              “{b.text}”
                            </div>
                          ) : (
                            splitParagraphs(b.text).map((para, pi) => (
                              <p
                                key={pi}
                                className="mb-3 text-[18px] leading-[1.75] text-[rgba(233,230,223,.9)] last:mb-0"
                              >
                                {para}
                              </p>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Track field notes — everything else the tracks endpoint
                      gives us per-track that isn't shown anywhere else on
                      the page yet. Same horizontal, two-column layout as the
                      album-level "Field notes" box above. */}
                  {(t.vocalProfile ||
                    t.tempoFeel ||
                    t.compositionType ||
                    t.energy ||
                    t.moodIntensity ||
                    t.accessibility ||
                    t.contexts.length > 0 ||
                    t.rhythms.length > 0 ||
                    t.featuredInstruments.length > 0 ||
                    t.performers.length > 0) && (
                    <div className="mt-10 overflow-hidden rounded-2xl border-[1.5px] border-[var(--accent)]">
                      <div className="border-b-[1.5px] border-[var(--accent)] px-6 py-4">
                        <span className="text-[16px] font-extrabold tracking-[-.01em]">
                          Track field notes
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="flex flex-col border-b border-[var(--accent)] p-6 sm:border-r sm:border-b-0">
                          {t.vocalProfile && (
                            <FieldRow
                              label="Vocal profile"
                              value={t.vocalProfile.toLowerCase()}
                            />
                          )}
                          {t.tempoFeel && (
                            <FieldRow
                              label="Tempo feel"
                              value={t.tempoFeel.toLowerCase()}
                            />
                          )}
                          {t.compositionType && (
                            <FieldRow
                              label="Composition"
                              value={t.compositionType.toLowerCase()}
                            />
                          )}
                          <TagRow label="Listen when" tags={t.contexts} />
                          <TagRow label="Rhythms" tags={t.rhythms} />
                          <TagRow
                            label="Featured instruments"
                            tags={t.featuredInstruments}
                          />
                          <PerformerRow performers={t.performers} />
                        </div>
                        <div className="flex flex-col p-6">
                          {(t.energy || t.moodIntensity || t.accessibility) && (
                            <>
                              <div className="mb-4 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.5)]">
                                The feel
                              </div>
                              <Meter label="Energy" level={t.energy} />
                              <Meter
                                label="Mood intensity"
                                level={t.moodIntensity}
                              />
                              <Meter
                                label="Accessibility"
                                level={t.accessibility}
                              />
                            </>
                          )}
                          {/* Fills whatever room is left in this column
                              once the left one (usually taller, with the
                              tag rows and performer credits) sets the row's
                              height — a brand stamp centered in that leftover
                              space rather than dead space. */}
                          <div className="flex flex-1 items-center justify-center py-6">
                            <span className="text-4xl font-extrabold tracking-[-.03em] text-[var(--accent)]">
                              jazzlogs.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Track notes — full width, not squeezed into the info column */}
                  <div className="mt-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="text-[28px] font-extrabold tracking-[-.02em] text-[var(--accent)]">
                        Track notes
                      </div>
                      <button
                        type="button"
                        onClick={() => openNoteModal(t.id)}
                        className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-[13px] font-bold text-[#1c1b18]"
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
                    {(() => {
                      // Already just this one page's worth, already ordered
                      // mine-first-then-everyone-else by the backend query —
                      // nothing left to sort or slice client-side.
                      const pagedNotes = notesByTrack[t.id] ?? [];
                      const page = notePage[t.id] ?? 0;
                      const pageCount = Math.max(
                        1,
                        Math.ceil(
                          (noteTotalsByTrack[t.id] ?? pagedNotes.length) /
                            NOTES_PER_PAGE,
                        ),
                      );
                      return (
                        <>
                          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {pagedNotes.map((note, ni) => {
                              // The grid card always stays the same size —
                              // long notes clip here and only grow when
                              // clicked open (see the viewingNote modal below).
                              const isLong = note.text.length > 220;
                              const isMine = note.userId === myUserId;
                              return (
                                <div
                                  key={note.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() =>
                                    setViewingNote({ note, trackName: t.name })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      setViewingNote({
                                        note,
                                        trackName: t.name,
                                      });
                                    }
                                  }}
                                  className="flex min-h-[180px] min-w-0 cursor-pointer flex-col gap-3 rounded-[3px] p-6 text-[#1c1b18] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
                                  style={{
                                    background: isMine
                                      ? noteColorMine
                                      : noteColorOthers,
                                    transform: `rotate(${[-1.4, 1.2, -0.6][ni % 3]}deg)`,
                                  }}
                                >
                                  <div className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-bold uppercase tracking-[.12em] text-[rgba(28,27,24,.5)]">
                                    {album.name} · {t.name}
                                  </div>
                                  {note.timestampSeconds != null && (
                                    <span className="font-[family-name:var(--font-dm-mono)] text-[12px] font-bold text-[#8a5c00]">
                                      ▶{" "}
                                      {formatDuration(
                                        note.timestampSeconds * 1000,
                                      )}
                                    </span>
                                  )}
                                  <div className="text-[20px] leading-[1.15] font-extrabold tracking-[-.02em] break-words">
                                    {note.title}
                                  </div>
                                  <p
                                    className={
                                      "m-0 text-[15px] leading-[1.5] font-medium break-words " +
                                      (isLong ? "line-clamp-5" : "")
                                    }
                                  >
                                    {note.text}
                                  </p>
                                  {isLong && (
                                    <span className="text-[12px] font-bold text-[#8a5c00] underline underline-offset-[3px]">
                                      Read the full note →
                                    </span>
                                  )}
                                  <div
                                    className="mt-auto flex items-center justify-between gap-3 border-t border-[rgba(28,27,24,.16)] pt-3"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="text-[11px] font-semibold text-[rgba(28,27,24,.6)]">
                                      — {note.userName ?? "Someone"} ·{" "}
                                      {formatDate(note.createdAt)}
                                    </span>
                                    <LikeButton
                                      variant="inline"
                                      theme="light"
                                      likedColor={accent}
                                      initialCount={note.likeCount}
                                      initialLiked={note.likedByCurrentUser}
                                      onToggle={(next) =>
                                        handleNoteLikeToggle(
                                          t.id,
                                          note.id,
                                          next,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              );
                            })}
                            {pagedNotes.length === 0 && (
                              <div
                                className="col-span-full mx-auto flex min-h-[180px] w-full max-w-[300px] flex-col items-center justify-center gap-3 rounded-[3px] p-6 text-center text-[#1c1b18] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
                                style={{
                                  background: noteColorOthers,
                                  transform: "rotate(-1.4deg)",
                                }}
                              >
                                <div className="text-[20px] font-extrabold tracking-[-.02em]">
                                  No notes yet
                                </div>
                                <p className="text-[13px] leading-[1.5] font-medium text-[rgba(28,27,24,.7)]">
                                  Be the first to drop one on this track.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => openNoteModal(t.id)}
                                  className="text-[12px] font-bold text-[#8a5c00] underline underline-offset-[3px]"
                                >
                                  Write the first note →
                                </button>
                              </div>
                            )}
                          </div>
                          <Pager
                            page={page}
                            pageCount={pageCount}
                            onChange={(p) => {
                              setNotePage((np) => ({ ...np, [t.id]: p }));
                              loadNotesPage(t.id, p).catch(() => {});
                            }}
                          />
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </>
          )
        )}

        {/* JazzLogs reviews */}
        <div className="mx-auto mt-16 max-w-[940px]">
          <div className="flex flex-wrap items-end justify-between gap-8 border-b-[1.5px] border-[var(--accent)] pb-6">
            <div>
              <div className="text-[46px] leading-[.9] font-extrabold tracking-[-.045em] text-[var(--accent)] sm:text-[56px]">
                JazzLogs reviews
              </div>
              <p className="mt-4 max-w-[620px] text-[17px] leading-[1.6] text-[rgba(233,230,223,.75)]">
                Full write-ups filed by listeners who sat with the whole record.
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-3.5">
                <AverageStars value={album.avgRating ?? 0} size={22} fillColor={accent} />
                <div className="text-[52px] leading-[.82] font-extrabold tracking-[-.05em]">
                  {album.avgRating ? album.avgRating.toFixed(1) : "—"}
                </div>
              </div>
              <div className="mt-2.5 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.6)]">
                FROM {album.reviewCount.toLocaleString()}{" "}
                {album.reviewCount === 1 ? "RATING" : "RATINGS"}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={openReviewModal}
              className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-[14px] font-bold text-[#1c1b18]"
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
              {myReview ? "Edit your review" : "Write a review"}
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            {reviews && reviews.content.length > 0
              ? reviews.content.map((r) => {
                    // The card always stays the same size — long reviews
                    // clip here and only grow when clicked open (see the
                    // viewingReview modal below), same as the notes above.
                    const isLong = (r.text ?? "").length > 320;
                    return (
                      <div
                        key={r.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setViewingReview(r)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setViewingReview(r);
                          }
                        }}
                        className="flex cursor-pointer items-start gap-6 rounded-2xl bg-[rgba(233,230,223,.05)] p-7 transition-colors hover:bg-[rgba(233,230,223,.08)]"
                      >
                        <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-[#1c1b18]">
                          <svg width="25" height="25" viewBox="0 0 24 24">
                            <circle cx="12" cy="8.2" r="4" fill="var(--accent)" />
                            <path
                              d="M4 20.5c0-4.2 3.8-6.4 8-6.4s8 2.2 8 6.4"
                              fill="var(--accent)"
                            />
                          </svg>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[18px] font-extrabold tracking-[-.02em]">
                              {r.userName ?? "Someone"}
                            </span>
                            <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.5)]">
                              {formatDate(r.createdAt)}
                            </span>
                            <AverageStars value={r.rating} size={15} fillColor={accent} />
                          </div>
                          {r.text && (
                            <p
                              className={
                                "mt-3 break-words text-[15.5px] leading-[1.62] text-[rgba(233,230,223,.9)] " +
                                (isLong ? "line-clamp-3" : "")
                              }
                            >
                              {r.text}
                            </p>
                          )}
                          {isLong && (
                            <span className="mt-1 inline-block text-[13px] font-bold text-[rgba(233,230,223,.55)]">
                              Read the full review →
                            </span>
                          )}
                          {r.standoutTracks.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2.5">
                              {r.standoutTracks.map((st) => (
                                <span
                                  key={st.id}
                                  className="rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] px-5 py-3 text-[16px] font-extrabold text-[var(--accent)]"
                                >
                                  {st.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <ReviewNotesList
                            notes={r.notes}
                            limit={2}
                            getTrackName={getTrackName}
                            onNoteClick={openReviewNote}
                          />
                        </div>
                        <span onClick={(e) => e.stopPropagation()}>
                          <LikeButton
                            initialCount={r.likeCount}
                            initialLiked={r.likedByCurrentUser}
                            variant="inline"
                            likedColor={accent}
                            onToggle={(next) =>
                              handleReviewLikeToggle(r.id, next)
                            }
                          />
                        </span>
                      </div>
                    );
                  })
              : reviews !== null && (
                  <p className="text-sm text-[rgba(233,230,223,.5)]">
                    No reviews yet — be the first to write one.
                  </p>
                )}
          </div>
          {reviews && reviews.content.length > 0 && (
            <Pager
              page={reviews.number}
              pageCount={reviews.totalPages}
              onChange={setReviewPage}
            />
          )}
        </div>

        <Footer />
        </div>
      </div>

      {noteModalTrackId &&
        (() => {
          const track = tracks?.find((t) => t.id === noteModalTrackId);
          if (!track) return null;
          const submitting = noteSubmitting[track.id] ?? false;
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
                className="w-full max-w-[480px] rounded-[4px] p-8 text-[#1c1b18] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
                style={{
                  background: noteColorMine,
                  animation:
                    "jazzlogs-note-pop .4s cubic-bezier(.34,1.56,.64,1)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[.14em] text-[rgba(28,27,24,.55)]">
                    New note · {track.name}
                  </div>
                  <button
                    type="button"
                    onClick={closeNoteModal}
                    aria-label="Close"
                    className="text-[22px] leading-none font-bold text-[rgba(28,27,24,.45)]"
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
                  className="mt-4 w-full border-b-2 border-[rgba(28,27,24,.25)] bg-transparent pb-2 text-[21px] font-extrabold tracking-[-.02em] outline-none placeholder:text-[rgba(28,27,24,.35)]"
                />
                <div className="mt-1 text-right font-[family-name:var(--font-dm-mono)] text-[10px] font-medium text-[rgba(28,27,24,.45)]">
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
                  className="mt-4 w-full resize-none rounded-lg border border-[rgba(28,27,24,.2)] bg-[rgba(255,255,255,.35)] p-3 text-[15px] leading-[1.5] font-medium text-[#1c1b18] outline-none placeholder:text-[rgba(28,27,24,.4)]"
                />
                <div className="mt-1 text-right font-[family-name:var(--font-dm-mono)] text-[10px] font-medium text-[rgba(28,27,24,.45)]">
                  {noteTextInput.length}/{NOTE_TEXT_MAX}
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block font-[family-name:var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[.12em] text-[rgba(28,27,24,.55)]">
                    Timestamp (optional)
                  </label>
                  <input
                    value={noteTimestampInput}
                    onChange={(e) => setNoteTimestampInput(e.target.value)}
                    placeholder="e.g. 2:47"
                    className="w-full rounded-lg border border-[rgba(28,27,24,.2)] bg-[rgba(255,255,255,.35)] px-3 py-2 text-[14px] font-bold text-[#1c1b18] outline-none placeholder:text-[rgba(28,27,24,.4)]"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={closeNoteModal}
                    className="text-[13px] font-bold text-[rgba(28,27,24,.55)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWriteNote(track.id)}
                    disabled={
                      submitting ||
                      !noteTitleInput.trim() ||
                      !noteTextInput.trim()
                    }
                    className="rounded-full bg-[#1c1b18] px-6 py-3 text-[13px] font-bold disabled:opacity-40"
                    style={{ color: noteColorMine }}
                  >
                    {submitting ? "Posting…" : "Post note"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {viewingNote && (
        // z-[55] (above the review/other z-50 modals, below confirmDelete's
        // z-[60]) — a note can now be opened by clicking it inside the
        // viewingReview modal's "Also noted" list, and needs to stack above
        // that modal rather than land behind it.
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
              className="flex max-h-[70vh] w-full min-w-0 flex-col gap-3 overflow-hidden rounded-[3px] p-8 text-[#1c1b18] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
              style={{
                background:
                  viewingNote.note.userId === myUserId
                    ? noteColorMine
                    : noteColorOthers,
                animation:
                  "jazzlogs-note-pop .4s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[.12em] text-[rgba(28,27,24,.5)]">
                  {album.name} · {viewingNote.trackName}
                </div>
                <button
                  type="button"
                  onClick={() => setViewingNote(null)}
                  aria-label="Close"
                  className="text-[22px] leading-none font-bold text-[rgba(28,27,24,.45)]"
                >
                  ×
                </button>
              </div>
              {viewingNote.note.timestampSeconds != null && (
                <span className="font-[family-name:var(--font-dm-mono)] text-[12px] font-bold text-[#8a5c00]">
                  ▶ {formatDuration(viewingNote.note.timestampSeconds * 1000)}
                </span>
              )}
              <div className="text-center text-[24px] leading-[1.15] font-extrabold tracking-[-.02em] break-words">
                {viewingNote.note.title}
              </div>
              {/* Only the note body scrolls — header/title above and the
                  user/date/like footer below stay put. */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <p className="m-0 break-words text-[16px] leading-[1.6] font-medium">
                  {viewingNote.note.text}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-[rgba(28,27,24,.16)] pt-3">
                <span className="text-[12px] font-semibold text-[rgba(28,27,24,.6)]">
                  — {viewingNote.note.userName ?? "Someone"} ·{" "}
                  {formatDate(viewingNote.note.createdAt)}
                </span>
                <LikeButton
                  variant="inline"
                  theme="light"
                  likedColor={accent}
                  initialCount={viewingNote.note.likeCount}
                  initialLiked={viewingNote.note.likedByCurrentUser}
                  onToggle={(next) =>
                    handleNoteLikeToggle(
                      viewingNote.note.trackId,
                      viewingNote.note.id,
                      next,
                    )
                  }
                />
              </div>
            </div>
            {viewingNote.note.userId === myUserId && (
              <button
                type="button"
                onClick={() =>
                  setConfirmDelete({ type: "note", note: viewingNote.note })
                }
                className="rounded-full bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] px-6 py-3 text-[13px] font-bold text-[#e9e6df] hover:bg-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
              >
                Delete note
              </button>
            )}
          </div>
        </div>
      )}

      {viewingReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,.6)",
            animation: "jazzlogs-backdrop-fade .2s ease-out",
          }}
          onClick={() => setViewingReview(null)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-[860px] min-w-0 flex-col gap-4 rounded-2xl border border-[rgba(233,230,223,.15)] bg-[#2a2621] p-8 text-[#e9e6df] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
            style={{ animation: "jazzlogs-modal-pop .25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-[#1c1b18]">
                  <svg width="25" height="25" viewBox="0 0 24 24">
                    <circle cx="12" cy="8.2" r="4" fill="var(--accent)" />
                    <path
                      d="M4 20.5c0-4.2 3.8-6.4 8-6.4s8 2.2 8 6.4"
                      fill="var(--accent)"
                    />
                  </svg>
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[18px] font-extrabold tracking-[-.02em]">
                      {viewingReview.userName ?? "Someone"}
                    </span>
                    <AverageStars value={viewingReview.rating} size={15} fillColor={accent} />
                  </div>
                  <div className="mt-1 font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.5)]">
                    {formatDate(viewingReview.createdAt)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReview(null)}
                aria-label="Close"
                className="text-[22px] leading-none font-bold text-[rgba(233,230,223,.45)]"
              >
                ×
              </button>
            </div>
            {(viewingReview.text ||
              viewingReview.standoutTracks.length > 0 ||
              viewingReview.notes.length > 0) && (
              <div className="min-h-0 flex-1 overflow-y-auto">
                {viewingReview.text && (
                  <p className="m-0 break-words text-[15.5px] leading-[1.62] text-[rgba(233,230,223,.9)]">
                    {viewingReview.text}
                  </p>
                )}
                {viewingReview.standoutTracks.length > 0 && (
                  <div
                    className={
                      viewingReview.text
                        ? "mt-5 border-t border-[rgba(233,230,223,.1)] pt-5"
                        : ""
                    }
                  >
                    <div className="mb-3 font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.45)]">
                      Standout tracks
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {viewingReview.standoutTracks.map((st) => (
                        <span
                          key={st.id}
                          className="rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] px-5 py-3 text-[16px] font-extrabold text-[var(--accent)]"
                        >
                          {st.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <ReviewStickyNotes
                  notes={viewingReview.notes}
                  myUserId={myUserId}
                  getTrackName={getTrackName}
                  onNoteClick={openReviewNote}
                  onLikeToggle={handleNoteLikeToggle}
                  mineColor={noteColorMine}
                  othersColor={noteColorOthers}
                  likedColor={accent}
                />
              </div>
            )}
            <div className="flex items-center justify-end border-t border-[rgba(233,230,223,.12)] pt-4">
              <LikeButton
                initialCount={viewingReview.likeCount}
                initialLiked={viewingReview.likedByCurrentUser}
                variant="inline"
                likedColor={accent}
                onToggle={(next) =>
                  handleReviewLikeToggle(viewingReview.id, next)
                }
              />
            </div>
          </div>
        </div>
      )}

      {reviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,.6)",
            animation: "jazzlogs-backdrop-fade .2s ease-out",
          }}
          onClick={closeReviewModal}
        >
          <div
            className="w-full max-w-[540px] rounded-2xl border border-[rgba(233,230,223,.15)] bg-[#2a2621] p-8 text-[#e9e6df] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
            style={{ animation: "jazzlogs-modal-pop .25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[34px] leading-[1] font-extrabold tracking-[-.03em] text-[var(--accent)]">
                  {myReview ? "Edit your review" : "Write a review"}
                </div>
                <div className="mt-2 text-[13px] text-[rgba(233,230,223,.55)]">
                  {album.name}
                </div>
              </div>
              <button
                type="button"
                onClick={closeReviewModal}
                aria-label="Close"
                className="text-[22px] leading-none font-bold text-[rgba(233,230,223,.45)]"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-2 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.55)]">
                Your rating
              </div>
              <div className="flex items-center justify-between">
                <InteractiveStars
                  key={reviewModalOpen ? "open" : "closed"}
                  size={28}
                  initial={reviewRatingInput}
                  fillColor={accent}
                  onRate={setReviewRatingInput}
                />
                <span className="text-[42px] leading-none font-extrabold tracking-[-.02em]">
                  {reviewRatingInput ? reviewRatingInput.toFixed(1) : "—"}
                </span>
              </div>
            </div>

            <textarea
              autoFocus
              value={reviewText}
              onChange={(e) =>
                setReviewText(e.target.value.slice(0, REVIEW_TEXT_MAX))
              }
              maxLength={REVIEW_TEXT_MAX}
              rows={5}
              placeholder="What did you make of it?"
              className="mt-5 w-full resize-none rounded-lg border border-[rgba(233,230,223,.25)] bg-transparent p-3 text-[15px] text-[#e9e6df] outline-none placeholder:text-[rgba(233,230,223,.4)]"
            />
            <div className="mt-1 text-right font-[family-name:var(--font-dm-mono)] text-[10px] font-medium text-[rgba(233,230,223,.45)]">
              {reviewText.length}/{REVIEW_TEXT_MAX}
            </div>

            {tracks && tracks.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.5)]">
                  Standout tracks
                </div>
                <div className="flex flex-wrap gap-2">
                  {tracks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleReviewStandout(t.id)}
                      className="rounded-full px-4 py-2 text-[13.5px] font-bold"
                      style={{
                        background: reviewStandouts.includes(t.id)
                          ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                          : "rgba(233,230,223,.06)",
                        color: reviewStandouts.includes(t.id)
                          ? "var(--accent)"
                          : "rgba(233,230,223,.6)",
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              {myReview ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete({ type: "review" })}
                  className="text-[13px] font-semibold text-[rgba(233,230,223,.5)]"
                >
                  Delete review
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="text-[13px] font-bold text-[rgba(233,230,223,.55)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWriteReview}
                  disabled={!reviewRatingInput}
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-[13px] font-bold text-[#1c1b18] disabled:opacity-40"
                >
                  {myReview ? "Update review" : "Post review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Are you sure?" — stacked above whichever of the note/review
          modals triggered it (z-[60], one above their z-50), its own
          backdrop + Escape handling, matching how the other modals look. */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,.6)",
            animation: "jazzlogs-backdrop-fade .2s ease-out",
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl border border-[rgba(217,60,60,.35)] bg-[#2a2621] p-7 text-[#e9e6df] shadow-[0_30px_70px_rgba(0,0,0,.55)]"
            style={{ animation: "jazzlogs-modal-pop .25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[20px] font-extrabold tracking-[-.02em]">
              {confirmDelete.type === "note"
                ? "Delete this note?"
                : "Delete this review?"}
            </div>
            <p className="mt-2 text-[14px] leading-[1.5] text-[rgba(233,230,223,.65)]">
              This can&rsquo;t be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full px-5 py-[11px] text-[13px] font-bold text-[rgba(233,230,223,.7)] hover:bg-[rgba(233,230,223,.08)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete.type === "note") {
                    handleDeleteNote(confirmDelete.note);
                  } else {
                    handleDeleteReview();
                  }
                }}
                className="rounded-full border border-[rgba(217,60,60,.4)] bg-[rgba(217,60,60,.18)] px-5 py-[11px] text-[13px] font-bold text-[#e9a3a3] hover:bg-[rgba(217,60,60,.3)]"
              >
                {confirmDelete.type === "note"
                  ? "Delete note"
                  : "Delete review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
