import { apiFetch, ApiError, type Page } from "@/lib/api";
import type { VocabularyTag } from "@/lib/albums";
import type { TrackNote } from "@/lib/notes";
import type { SeriesVoice } from "@/lib/series";

// Purely classification for now — doesn't change any backend behavior
// (track order/reordering etc. are the same either way). Ours to decide
// what to do with visually (a badge, a separate section, whatever).
export type PlaylistType = "JOURNEY" | "STANDARD";

// The narrator voice reading the playlist's byline — same enum Series uses
// for its own voice field, just under a different field name here
// ("byline", not "voice"). Required on create/update, no default.
export type PlaylistVoice = SeriesVoice;

// PlaylistSummaryDto's shape — shared by every playlist *listing* endpoint:
// GET /playlists, GET /playlists/journeys, GET /playlists/standard, GET
// /playlists/catalogue (all inside content[] of a Page), and GET
// /playlists/journey below (a lone object, narrowed to type: "JOURNEY").
// GET /playlists/featured used to be a lone object of this same shape too,
// but it's since grown back a tracklist — see FeaturedPlaylist below,
// which now carries the full PlaylistDetail shape instead.
export interface PlaylistSummary {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  coverImageUrl: string | null;
  spotifyUrl: string | null;
  type: PlaylistType;
  byline: PlaylistVoice;
  published: boolean;
  likeCount: number;
  likedByCurrentUser: boolean;
  trackCount: number;
  durationMs: number;
  styleTags: VocabularyTag[];
  moodTags: VocabularyTag[];
  contextTags: VocabularyTag[];
  // A fourth tag type alongside the three above — same InstrumentVocabulary
  // codes tracks already use (PIANO, TENOR_SAXOPHONE, DRUMS, etc.).
  featuredInstruments: VocabularyTag[];
  createdAt: string;
  updatedAt: string;
}

// GET /playlists/journey's own shape — PlaylistSummary with type narrowed
// to always "JOURNEY".
export type JourneyPlaylist = Omit<PlaylistSummary, "type"> & {
  type: "JOURNEY";
};

// GET /playlists/journey — the most recently published JOURNEY playlist,
// at most one. Not admin-curatable like /playlists/featured — there's no
// POST/DELETE for this one, it's purely derived: publish a newer JOURNEY
// and it automatically takes over here. 404 (mapped to null) until at
// least one JOURNEY has ever been published.
export async function fetchJourneyPlaylist(): Promise<JourneyPlaylist | null> {
  try {
    return await apiFetch<JourneyPlaylist>("/playlists/journey");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// One track inside GET /playlists/{id} — matches PlaylistTrackDetailDto on
// the backend exactly. GET /playlists/featured's tracks are almost this
// same shape too (see FeaturedPlaylistTrack below) — just missing
// albumImageUrl and myNotes. Field names here: this one has albumImageUrl (not imageUrl),
// no albumEditorialId at all (there's no way to tell from this row alone
// whether the album has an editorial — link via albumId regardless and let
// the album page's own "No editorial yet." empty state handle it), and
// adds ratingCount alongside avgRating.
export interface PlaylistDetailTrack {
  trackId: string;
  trackName: string;
  title: string | null;
  curatorNote: string | null;
  albumId: string;
  artistId: string;
  albumName: string;
  artistName: string;
  albumImageUrl: string | null;
  // From Track.getSpotifyUrl() — null when the track itself has none set,
  // same as Album/AlbumTrack's own spotifyUrl elsewhere.
  spotifyUrl: string | null;
  position: number;
  durationMs: number | null;
  avgRating: number | null;
  ratingCount: number;
  // The current viewer's own rating on this track — null if they haven't
  // rated it (or nobody's logged in), same batched-per-viewer treatment as
  // listenedByCurrentUser/myNotes below, sourced server-side from
  // TrackRatingRepository.findByUserIdAndTrackIdIn (mirrors AlbumTrack.myRating).
  myRating: number | null;
  // False for the admin-only add/update-note paths, which don't compute any
  // per-viewer state (same as likedByCurrentUser/savedByCurrentUser
  // elsewhere) — only meaningful coming back from GET /playlists/{id}.
  listenedByCurrentUser: boolean;
  // Only the current user's own notes on this track (empty if none, or if
  // nobody's logged in) — never other users' notes, unlike
  // AlbumTrack.myNotes's community-feed sibling (GET /tracks/{id}/notes).
  // Batched server-side for the whole tracklist in one query.
  myNotes: TrackNote[];
}

// GET /playlists/{id}'s own shape — PlaylistSummary plus the full
// tracklist and savedByCurrentUser (computed the same way likedByCurrentUser
// is — false when nobody's logged in). Drives the "Listen later" toggle's
// initial state. principalImageUrl/bannerImageUrl/footerImageUrl are
// detail-only too (see uploadPlaylistPrincipalImage etc. below) — null
// until uploaded, and absent from every listing endpoint and from
// /playlists/featured (see FeaturedPlaylist below, which omits them).
export interface PlaylistDetail extends PlaylistSummary {
  savedByCurrentUser: boolean;
  tracks: PlaylistDetailTrack[];
  principalImageUrl: string | null;
  bannerImageUrl: string | null;
  footerImageUrl: string | null;
}

export async function fetchPlaylistDetail(id: string): Promise<PlaylistDetail> {
  return apiFetch<PlaylistDetail>(`/playlists/${id}`);
}

// A featured track's shape — PlaylistDetailTrack minus albumImageUrl and
// myNotes, the two fields GET /playlists/featured's tracks don't carry.
// Everything else about the track (and the playlist itself) is identical
// to the normal detail shape.
export type FeaturedPlaylistTrack = Omit<
  PlaylistDetailTrack,
  "albumImageUrl" | "myNotes"
>;

// GET /playlists/featured's own shape — at most one playlist featured at a
// time. Used to be the lean PlaylistSummary shape with no tracklist at
// all; it's since grown back the full PlaylistDetail shape (tracks
// included), just with each track missing albumImageUrl/myNotes (see
// FeaturedPlaylistTrack above). 404 (mapped to null) when nothing's
// featured right now — not exceptional, just means the featured-playlist
// block has nothing to show.
export interface FeaturedPlaylist
  extends Omit<
    PlaylistDetail,
    "tracks" | "principalImageUrl" | "bannerImageUrl" | "footerImageUrl"
  > {
  tracks: FeaturedPlaylistTrack[];
}

export async function fetchFeaturedPlaylist(): Promise<FeaturedPlaylist | null> {
  try {
    return await apiFetch<FeaturedPlaylist>("/playlists/featured");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// GET /playlists/journeys and GET /playlists/standard — the playlist
// version of "The Catalogue": no filters, fixed order (createdAt desc),
// size fixed at 6 server-side by default. Admins also see drafts; everyone
// else only sees published ones.
export function fetchJourneyPlaylists(
  page = 0,
  size = 6,
): Promise<Page<PlaylistSummary>> {
  return apiFetch<Page<PlaylistSummary>>(
    `/playlists/journeys?page=${page}&size=${size}`,
  );
}

export function fetchStandardPlaylists(
  page = 0,
  size = 6,
): Promise<Page<PlaylistSummary>> {
  return apiFetch<Page<PlaylistSummary>>(
    `/playlists/standard?page=${page}&size=${size}`,
  );
}

// GET /playlists — every playlist, both types together, same
// pagination/shape as the two above. Not wired into any page yet.
export function fetchPlaylists(
  page = 0,
  size = 6,
): Promise<Page<PlaylistSummary>> {
  return apiFetch<Page<PlaylistSummary>>(
    `/playlists?page=${page}&size=${size}`,
  );
}

// GET /playlists/catalogue — likewise both types together; presumably the
// single-strip alternative to fetchJourneyPlaylists/fetchStandardPlaylists'
// two separate ones. Not wired into any page yet either.
export function fetchPlaylistCatalogue(
  page = 0,
  size = 6,
): Promise<Page<PlaylistSummary>> {
  return apiFetch<Page<PlaylistSummary>>(
    `/playlists/catalogue?page=${page}&size=${size}`,
  );
}

// Admin only. Marks this playlist as THE featured one, un-featuring
// whichever was featured before — no DELETE needed first. 409 if the
// playlist isn't published yet (publish it first), or if another admin
// featured something else in the same instant (safe to retry).
export async function setPlaylistFeatured(id: string): Promise<void> {
  await apiFetch(`/playlists/${id}/featured`, { method: "POST" });
}

// Admin only. Un-features this playlist — a no-op if it wasn't featured.
export async function clearPlaylistFeatured(id: string): Promise<void> {
  await apiFetch(`/playlists/${id}/featured`, { method: "DELETE" });
}

// Admin only. Publishes the playlist — the only way it goes live, since
// createPlaylist/updatePlaylistMetadata can't set `published` at all
// anymore (every new playlist starts a draft).
export async function publishPlaylist(id: string): Promise<void> {
  await apiFetch(`/playlists/${id}/publish`, { method: "POST" });
}

// Admin only. Back to draft — a no-op if it already was one. If this
// playlist happened to be THE featured one, the backend un-features it too
// (a featured playlist can't be a draft), so setPlaylistFeatured/
// clearPlaylistFeatured's own cached state (if any caller keeps one) should
// be treated as stale after this.
export async function unpublishPlaylist(id: string): Promise<void> {
  await apiFetch(`/playlists/${id}/publish`, { method: "DELETE" });
}

// Body shared by createPlaylist and updatePlaylistMetadata below — a full
// metadata replace either way, no tracklist here. Send null or [] for a
// *Codes field that doesn't apply, not an omitted field.
//
// No `slug` here — playlists route by id only now, same as editorials
// (slug was never wired to a real lookup, so it got dropped for
// consistency). No `published` either — PlaylistUpsertRequest doesn't have
// that field at all (sending one is silently ignored). Every new playlist
// starts a draft; see publishPlaylist/unpublishPlaylist below for the only
// way to flip it.
export interface PlaylistMetadataInput {
  title: string;
  tagline: string | null;
  description: string | null;
  coverImageUrl: string | null;
  spotifyUrl: string | null;
  type: PlaylistType;
  // Required — an invalid or missing value 400s.
  byline: PlaylistVoice;
  styleCodes: string[] | null;
  moodCodes: string[] | null;
  contextCodes: string[] | null;
  // Fourth tag type, same rule as the three above — omitting or sending []
  // does NOT clear instruments the playlist already had, only replacing
  // works today.
  instrumentCodes: string[] | null;
}

// Admin only. Metadata only — the playlist has no tracks yet after this;
// see addPlaylistTrack below. 201 Created, body is just { id: uuid } — NOT
// a Location header (browsers don't expose that one to fetch by default,
// it isn't on the CORS-safelisted list, so reading it would silently come
// back null even though the server sends it).
export async function createPlaylist(
  input: PlaylistMetadataInput,
): Promise<string> {
  const { id } = await apiFetch<{ id: string }>("/playlists", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return id;
}

// Admin only. Same body as createPlaylist — a full replace of the existing
// metadata, not a partial patch. Returns the full PlaylistDetailDto; not
// typed here since nothing in the frontend reads it today.
export async function updatePlaylistMetadata(
  id: string,
  input: PlaylistMetadataInput,
): Promise<unknown> {
  return apiFetch(`/playlists/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// Admin only. Hard delete — metadata, tracks, likes, listens, saved items,
// and the Neo4j node with all its relationships, gone for good. No
// soft-delete, no recovery. 204 on success, 404 if the id doesn't exist.
export async function deletePlaylist(id: string): Promise<void> {
  await apiFetch(`/playlists/${id}`, { method: "DELETE" });
}

export interface AddPlaylistTrackInput {
  trackId: string;
  // Both required now — an editorial re-naming of the track just for this
  // playlist entry (doesn't touch the track's real name) and the curator's
  // comment for the entry. The backend rejects the request without them.
  title: string;
  curatorNote: string;
}

// The freshly created row's own shape — only the fields the create response
// is guaranteed to carry (position included, now calculated server-side).
export interface PlaylistTrackDetail {
  trackId: string;
  title: string;
  curatorNote: string;
  position: number;
}

// Admin only. Appends ONE existing catalogue track to the end of the
// playlist (position = current trackCount) — call once per track in the
// tracklist. 409 if the track's already in this playlist.
export async function addPlaylistTrack(
  playlistId: string,
  input: AddPlaylistTrackInput,
): Promise<PlaylistTrackDetail> {
  return apiFetch<PlaylistTrackDetail>(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Admin only, multipart/form-data. Replaces the cover image in place (same
// object key, playlists/{id}/cover.<ext>) — no need to delete anything
// first. jpeg/png/webp only, 5MB max (the backend 413s over that, 400s on
// any other content-type). 204 No Content — re-fetch the playlist (GET
// /playlists/{id}, coverImageUrl) to see the new URL; it isn't returned here.
export async function uploadPlaylistCover(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/playlists/${id}/cover`, {
    method: "PUT",
    body: formData,
  });
}

// Admin only, multipart/form-data. Three independent detail-page-only
// images — same mechanism/format rules as uploadPlaylistCover, and
// re-uploading one never touches the other two. 204 No Content — re-fetch
// the playlist (GET /playlists/{id}) to see the new URL; not present on
// PlaylistSummary/FeaturedPlaylist.
export async function uploadPlaylistPrincipalImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/playlists/${id}/principal-image`, {
    method: "PUT",
    body: formData,
  });
}

export async function uploadPlaylistBannerImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/playlists/${id}/banner-image`, {
    method: "PUT",
    body: formData,
  });
}

export async function uploadPlaylistFooterImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/playlists/${id}/footer-image`, {
    method: "PUT",
    body: formData,
  });
}
