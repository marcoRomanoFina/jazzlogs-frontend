import { apiFetch, ApiError, type Page } from "@/lib/api";
import type { VocabularyTag } from "@/lib/albums";

export type SeriesStatus = "DRAFT" | "PUBLISHED";
// The narrator reading the series — required on create/update, no default.
export type SeriesVoice =
  | "MARK"
  | "LAURA"
  | "ALICE"
  | "ADAM"
  | "JAMES"
  | "ALLIE"
  | "BOB"
  | "NATALIE";
export type ChapterType = "INTRO" | "TRACK" | "OUTRO";
// Computed per request relative to the current user's listens — never
// persisted, never present on the admin-only create/update paths.
export type ChapterStatus = "DONE" | "CURRENT" | "LOCKED";

// SeriesSummaryDto's shape — GET /series's listing rows. No description or
// chapters here; that's SeriesDetailDto's job (GET /series/{id}).
export interface SeriesSummary {
  id: string;
  title: string;
  dek: string | null;
  coverImageUrl: string | null;
  status: SeriesStatus;
  voice: SeriesVoice;
  likeCount: number;
  styleTags: VocabularyTag[];
  moodTags: VocabularyTag[];
  contextTags: VocabularyTag[];
  // A fourth tag type alongside the three above — same InstrumentVocabulary
  // codes tracks/playlists already use.
  featuredInstruments: VocabularyTag[];
  createdAt: string;
}

// GET /series — paginated. Non-admins only see PUBLISHED rows; admins see
// drafts too (same split as Playlist).
export function fetchSeries(page = 0, size = 20): Promise<Page<SeriesSummary>> {
  return apiFetch<Page<SeriesSummary>>(`/series?page=${page}&size=${size}`);
}

// GET /series/catalogue — the one endpoint for both "all series" and "all
// series by one narrator": omit voice for the former, pass it for the
// latter. No separate per-voice endpoints. Defaults to size 12,
// createdAt desc (newest first) when no sort is given — same paginated
// shape as fetchPlaylistCatalogue.
export function fetchSeriesCatalogue(
  page = 0,
  size = 12,
  voice?: SeriesVoice,
): Promise<Page<SeriesSummary>> {
  const voiceParam = voice ? `&voice=${voice}` : "";
  return apiFetch<Page<SeriesSummary>>(
    `/series/catalogue?page=${page}&size=${size}${voiceParam}`,
  );
}

// GET /series/onboarding — always resolves to the one fixed onboarding/tour
// series ("Let Me Show You Around"), no id or title lookup needed on our
// end. Same lean shape as a GET /series row (no chapters). 404 (mapped to
// null) if that series doesn't exist yet, or exists but is still DRAFT and
// the caller isn't an admin.
export async function fetchOnboardingSeries(): Promise<SeriesSummary | null> {
  try {
    return await apiFetch<SeriesSummary>("/series/onboarding");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// A chapter as it appears inside GET /series/featured only — deliberately
// lean, just title/note in order. No id, position, audio, images or
// listen-status here; that's SeriesChapterDetail's job (GET /series/{id}).
export interface FeaturedSeriesChapter {
  title: string | null;
  note: string | null;
}

// GET /series/featured's own shape — NOT the same as SeriesSummary (unlike
// Playlist, where /featured dropped its tracklist and became a plain
// summary). This one was deliberately asked to keep a lean chapters list, so
// it's its own type rather than SeriesSummary + chapters.
export interface FeaturedSeries {
  id: string;
  title: string;
  dek: string | null;
  coverImageUrl: string | null;
  status: SeriesStatus;
  voice: SeriesVoice;
  likeCount: number;
  styleTags: VocabularyTag[];
  moodTags: VocabularyTag[];
  contextTags: VocabularyTag[];
  featuredInstruments: VocabularyTag[];
  chapters: FeaturedSeriesChapter[];
  createdAt: string;
}

// GET /series/featured — at most one series featured at a time, same
// mechanism as Playlist's own featured slot. 404 (mapped to null) when
// nothing's featured right now — not exceptional, same treatment as
// fetchFeaturedPlaylist.
export async function fetchFeaturedSeries(): Promise<FeaturedSeries | null> {
  try {
    return await apiFetch<FeaturedSeries>("/series/featured");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// The full track behind a TRACK chapter — myRating/hasListened are the
// requesting user's own (null/false if no user resolved). No myNotes here —
// the user's notes on this track are only via the dedicated tracks endpoint
// (GET /tracks/{id}/notes, see lib/notes.ts's fetchTrackNotes), not bundled
// onto this shape. moods/contexts/rhythms/featuredInstruments use the same
// vocabularies as the rest of the app (MoodVocabulary/ContextVocabulary/
// RhythmVocabulary/InstrumentVocabulary). No performers or editorial here
// though — lighter than AlbumTrack in lib/albums.ts. Only ever populated by
// fetchSeriesChapter below (the single-chapter endpoint); everywhere else a
// chapter appears (the chapters[] list on fetchSeriesDetail, and
// addSeriesChapter/updateSeriesChapter's responses) track is always null,
// even for TRACK-type chapters — ask fetchSeriesChapter per chapter if you
// need this there too.
export interface SeriesChapterTrack {
  id: string;
  name: string;
  durationMs: number | null;
  spotifyUrl: string | null;
  imageUrl: string | null;
  albumId: string;
  albumName: string;
  artistId: string;
  artistName: string;
  avgRating: number | null;
  ratingCount: number;
  myRating: number | null;
  hasListened: boolean;
  moods: VocabularyTag[];
  contexts: VocabularyTag[];
  rhythms: VocabularyTag[];
  featuredInstruments: VocabularyTag[];
}

// One chapter inside GET /series/{id} — matches SeriesChapterDetailDto
// exactly. track is null for INTRO/OUTRO chapters (there's no track behind
// them) — see SeriesChapterTrack above for when it's null despite being a
// TRACK chapter too. status is computed relative to the current viewer's
// listens, not persisted — DONE/CURRENT/LOCKED gate playback order.
export interface SeriesChapterDetail {
  id: string;
  position: number;
  type: ChapterType;
  track: SeriesChapterTrack | null;
  title: string | null;
  note: string | null;
  // audioObjectKey/audioContentType/audioFileSizeBytes reflect the file
  // actually uploaded via uploadSeriesChapterAudio below — never something
  // the client sent directly, and not settable through
  // addSeriesChapter/updateSeriesChapter's own input. The audio bucket isn't
  // public like the image ones, so audioObjectKey alone isn't a playable URL
  // — use fetchSeriesChapter below to get one (its own audioUrl field),
  // don't build it here. Not present on this list shape at all (GET
  // /series/{id}) — only fetchSeriesChapter's single-chapter shape has it,
  // to avoid signing a URL per chapter on every series-detail load.
  audioObjectKey: string | null;
  // The one audio field addSeriesChapter/updateSeriesChapter CAN set — there's
  // no way to derive it automatically from the uploaded file, so it stays
  // null unless the caller knows it upfront.
  audioDurationSeconds: number | null;
  audioContentType: string | null;
  audioFileSizeBytes: number | null;
  status: ChapterStatus;
  // Two independent uploads (uploadSeriesChapterCover/
  // uploadSeriesChapterLandscapeCover below) — not the same image in two
  // sizes. Either can be null until its own upload happens; re-uploading one
  // never touches the other.
  imageUrl: string | null;
  landscapeImageUrl: string | null;
}

// GET /series/{id}'s own shape — full detail plus the ordered chapter list.
// totalListenings is computed on-demand (COUNT across every chapter's
// listens, all users) — never denormalized, same criteria as Album's avg
// rating.
export interface SeriesDetail {
  id: string;
  title: string;
  dek: string | null;
  description: string | null;
  coverImageUrl: string | null;
  // Three more, detail-page-only — null until uploaded via
  // uploadSeriesPrincipalImage/uploadSeriesBannerImage/
  // uploadSeriesFooterImage below. Not present on SeriesSummary or
  // FeaturedSeries — those keep showing coverImageUrl only.
  principalImageUrl: string | null;
  bannerImageUrl: string | null;
  footerImageUrl: string | null;
  status: SeriesStatus;
  voice: SeriesVoice;
  likeCount: number;
  likedByCurrentUser: boolean;
  totalListenings: number;
  styleTags: VocabularyTag[];
  moodTags: VocabularyTag[];
  contextTags: VocabularyTag[];
  featuredInstruments: VocabularyTag[];
  chapters: SeriesChapterDetail[];
  createdAt: string;
  updatedAt: string;
}

export function fetchSeriesDetail(id: string): Promise<SeriesDetail> {
  return apiFetch<SeriesDetail>(`/series/${id}`);
}

// Body shared by createSeries and updateSeriesMetadata — metadata only,
// chapters are managed via their own granular endpoints. No `status` here on
// purpose — every series starts DRAFT; see publishSeries/unpublishSeries
// below for the only way to flip it. No `coverImageUrl` either — the cover
// goes by upload only (uploadSeriesCover below), never a hand-typed URL.
// *Codes are all optional — omit one (or send []) to leave that tag type
// unset. IMPORTANT: on update, omitting/emptying a *Codes field does NOT
// clear tags the series already had — same limitation as Playlist, there's
// no way to explicitly wipe tags today, only replace them with others.
export interface SeriesMetadataInput {
  title: string;
  dek: string | null;
  description: string | null;
  voice: SeriesVoice;
  styleCodes?: string[];
  moodCodes?: string[];
  contextCodes?: string[];
  instrumentCodes?: string[];
}

// Admin only. Metadata only — the series has no chapters yet after this.
// Returns the full SeriesDetailDto (chapters: [] on a fresh series). 409 if
// another series already has this exact title — same uniqueness rule as
// Playlist; the error message names the repeated title.
export function createSeries(input: SeriesMetadataInput): Promise<SeriesDetail> {
  return apiFetch<SeriesDetail>("/series", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Admin only. Same body as createSeries — a full replace of the existing
// metadata, not a partial patch. Never touches status or chapters. Same 409
// on a duplicate title as createSeries above.
export function updateSeriesMetadata(
  id: string,
  input: SeriesMetadataInput,
): Promise<SeriesDetail> {
  return apiFetch<SeriesDetail>(`/series/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// Admin only. Publishes the series — the only way it goes live, since
// createSeries/updateSeriesMetadata can't set `status` at all. 204 No Content.
export async function publishSeries(id: string): Promise<void> {
  await apiFetch(`/series/${id}/publish`, { method: "POST" });
}

// Admin only. Back to draft — a no-op if it already was one. If this series
// happened to be THE featured one, the backend un-features it too (a
// featured series can't be a draft), same behavior as Playlist. 204 No
// Content.
export async function unpublishSeries(id: string): Promise<void> {
  await apiFetch(`/series/${id}/publish`, { method: "DELETE" });
}

// Admin only. Marks this series as THE featured one, un-featuring whichever
// was featured before — no DELETE needed first. 409 if the series isn't
// published yet (publish it first). 204 No Content.
export async function setSeriesFeatured(id: string): Promise<void> {
  await apiFetch(`/series/${id}/featured`, { method: "POST" });
}

// Admin only. Un-features this series — a no-op if it wasn't featured.
export async function clearSeriesFeatured(id: string): Promise<void> {
  await apiFetch(`/series/${id}/featured`, { method: "DELETE" });
}

// Admin only, multipart/form-data. Uploads the cover to MinIO and saves the
// URL — re-uploading replaces the previous one in place, same mechanism as
// uploadPlaylistCover. jpeg/png/webp only. 204 No Content — re-fetch the
// series (GET /series/{id}, coverImageUrl) to see the new URL; it isn't
// returned here.
export async function uploadSeriesCover(id: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/series/${id}/cover`, {
    method: "PUT",
    body: formData,
  });
}

// Admin only, multipart/form-data. Three independent detail-page-only
// images — each replaces its own previous upload in place, same mechanism
// as uploadSeriesCover, and re-uploading one never touches the other two.
// 204 No Content — re-fetch the series (GET /series/{id}) to see the new
// URL; not present on SeriesSummary/FeaturedSeries.
export async function uploadSeriesPrincipalImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/series/${id}/principal-image`, {
    method: "PUT",
    body: formData,
  });
}

export async function uploadSeriesBannerImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/series/${id}/banner-image`, {
    method: "PUT",
    body: formData,
  });
}

export async function uploadSeriesFooterImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/series/${id}/footer-image`, {
    method: "PUT",
    body: formData,
  });
}

// Admin only, multipart/form-data. The chapter's own square/portrait image —
// independent from uploadSeriesChapterLandscapeCover below, not a second
// size of the same upload. 204 No Content — re-fetch the series (GET
// /series/{id}, chapters[].imageUrl) to see the new URL.
export async function uploadSeriesChapterCover(
  seriesId: string,
  chapterId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/series/${seriesId}/chapters/${chapterId}/cover`, {
    method: "PUT",
    body: formData,
  });
}

// Admin only, multipart/form-data. The chapter's landscape/hero image —
// independent from uploadSeriesChapterCover above. 204 No Content —
// re-fetch the series (GET /series/{id}, chapters[].landscapeImageUrl) to
// see the new URL.
export async function uploadSeriesChapterLandscapeCover(
  seriesId: string,
  chapterId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(
    `/series/${seriesId}/chapters/${chapterId}/landscape-cover`,
    {
      method: "PUT",
      body: formData,
    },
  );
}

// Body shared by addSeriesChapter and updateSeriesChapter — no
// audioObjectKey/audioContentType/audioFileSizeBytes here anymore; those
// three are only ever set by uploadSeriesChapterAudio below, from the real
// file. trackId is required for INTRO and TRACK, and must be null/omitted
// for OUTRO — every chapter needs a track except the series' closing outro.
// A 400 names which of the two rules was violated.
export interface SeriesChapterInput {
  type: ChapterType;
  trackId: string | null;
  title: string | null;
  note: string | null;
  audioDurationSeconds: number | null;
}

// Admin only. Appends one chapter to the series — position is calculated
// server-side, same idea as addPlaylistTrack.
export function addSeriesChapter(
  seriesId: string,
  input: SeriesChapterInput,
): Promise<SeriesChapterDetail> {
  return apiFetch<SeriesChapterDetail>(`/series/${seriesId}/chapters`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Admin only. Same body as addSeriesChapter — a full replace of that
// chapter's editorial fields, not a partial patch. Never touches position,
// audio file fields or either image.
export function updateSeriesChapter(
  seriesId: string,
  chapterId: string,
  input: SeriesChapterInput,
): Promise<SeriesChapterDetail> {
  return apiFetch<SeriesChapterDetail>(
    `/series/${seriesId}/chapters/${chapterId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

// Admin only, multipart/form-data. Uploads the chapter's real audio file to
// MinIO — audioObjectKey/audioContentType/audioFileSizeBytes on the chapter
// are computed from this upload, never settable directly. mp3/m4a/wav only.
// Re-uploading replaces the previous file in place. 204 No Content —
// playback still goes through fetchSeriesChapter below, not this.
export async function uploadSeriesChapterAudio(
  seriesId: string,
  chapterId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/series/${seriesId}/chapters/${chapterId}/audio`, {
    method: "PUT",
    body: formData,
  });
}

// GET /series/{id}/chapters/{chapterId}'s own shape — same fields as a
// SeriesChapterDetail row plus audioUrl, a freshly signed URL (1 hour
// validity) safe to drop straight into an <audio> tag. null if no audio has
// been uploaded yet (no longer a 404 for that case). Only this single-
// chapter endpoint ever populates audioUrl — the chapters[] list on GET
// /series/{id} does not, to avoid signing one URL per chapter on every
// series-detail load.
export interface SeriesChapterWithAudio extends SeriesChapterDetail {
  audioUrl: string | null;
}

// Any logged-in user (not admin-only), as long as the series is published.
export function fetchSeriesChapter(
  seriesId: string,
  chapterId: string,
): Promise<SeriesChapterWithAudio> {
  return apiFetch<SeriesChapterWithAudio>(
    `/series/${seriesId}/chapters/${chapterId}`,
  );
}

// Marks this chapter DONE for the current viewer — any logged-in user, as
// long as the series is published. No longer 403s on out-of-order
// completion (any chapter, any order); status (DONE/CURRENT/LOCKED) on the
// next GET /series/{id} reflects it. 204 No Content.
export async function completeSeriesChapter(
  seriesId: string,
  chapterId: string,
): Promise<void> {
  await apiFetch(`/series/${seriesId}/chapters/${chapterId}/complete`, {
    method: "POST",
  });
}
