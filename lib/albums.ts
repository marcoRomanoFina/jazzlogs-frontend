import { apiFetch } from "@/lib/api";
import type { TrackNote } from "@/lib/notes";
import type { PersonnelRole } from "@/lib/constants/album";

export interface SpotlightTrack {
  id: string;
  trackNumber: number | null;
  name: string;
  editorialTitle: string;
  editorialDek: string | null;
  editorialLikeCount: number;
  editorialLikedByCurrentUser: boolean;
}

export interface AlbumSpotlight {
  id: string;
  artistName: string;
  name: string;
  imageUrl: string | null;
  releaseYear: number | null;
  postedAt: string | null;
  editorialTitle: string | null;
  editorialDek: string | null;
  editorialByline: string | null;
  editorialLikeCount: number;
  editorialLikedByCurrentUser: boolean;
  tracks: SpotlightTrack[];
}

// Lean teaser, not the full album detail — see AlbumService.getAlbumSpotlight
// on the backend for why this is a separate endpoint.
export async function fetchAlbumSpotlight(id: string): Promise<AlbumSpotlight> {
  return apiFetch<AlbumSpotlight>(`/albums/${id}/spotlight`);
}

export type EditorialBlockType = "LEAD" | "PARA" | "QUOTE";

export interface EditorialBlock {
  position: number;
  type: EditorialBlockType;
  subhead: string | null;
  text: string;
  contentCategory: string;
}

export interface AlbumEditorial {
  id: string;
  title: string;
  dek: string | null;
  byline: string | null;
  blocks: EditorialBlock[];
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface TrackEditorial {
  title: string;
  dek: string | null;
  byline: string | null;
  blocks: EditorialBlock[];
}

export interface VocabularyTag {
  code: string;
  label: string;
}

export interface TrackPerformer {
  artistId: string;
  artistName: string;
  role: string;
  instrument: string | null;
  primaryCredit: boolean;
}

export interface AlbumPersonnelEntry {
  artistId: string;
  artistName: string;
  role: string;
  instruments: string[];
}

export interface AlbumTrack {
  id: string;
  trackNumber: number | null;
  spotifyTrackId: string;
  name: string;
  durationMs: number | null;
  spotifyUrl: string | null;
  imageUrl: string | null;
  standout: boolean;
  vocalProfile: string | null;
  energy: string | null;
  accessibility: string | null;
  moodIntensity: string | null;
  tempoFeel: string | null;
  compositionType: string | null;
  editorial: TrackEditorial | null;
  performers: TrackPerformer[];
  moods: VocabularyTag[];
  contexts: VocabularyTag[];
  rhythms: VocabularyTag[];
  featuredInstruments: VocabularyTag[];
  myNotes: TrackNote[];
  avgRating: number | null;
  ratingCount: number;
  myRating: number | null;
  hasListened: boolean;
  isSaved: boolean;
}

// GET /albums/{id} — deliberately light: everything about the album EXCEPT
// its tracks (see AlbumTrack/fetchAlbumTracks below, a separate call). The
// tracks list is the expensive part (several Neo4j round-trips per track,
// plus notes/ratings) — splitting it out lets the page render this header
// immediately, above the fold, without waiting on that.
export interface AlbumHeader {
  id: string;
  artistId: string;
  artistName: string;
  name: string;
  spotifyAlbumId: string;
  spotifyUrl: string | null;
  imageUrl: string | null;
  releaseYear: number | null;
  totalTracks: number | null;
  logNumber: string;
  label: string;
  vocalProfile: string | null;
  energy: string | null;
  moodIntensity: string | null;
  accessibility: string | null;
  postedAt: string | null;
  instagramPermalink: string | null;
  editorial: AlbumEditorial | null;
  // Admin-curated, hex ("#a86b32") — null until an admin sets one for this
  // album (setAlbumCoverColor/clearAlbumCoverColor below), in which case the
  // frontend falls back to sampling the cover art itself.
  coverColor: string | null;
  // Just the label now, not {code, label} — unlike the per-track tag
  // fields below (moods/contexts/rhythms/featuredInstruments on
  // AlbumTrack), which are unchanged.
  styles: string[];
  moods: string[];
  contexts: string[];
  personnel: AlbumPersonnelEntry[];
  avgRating: number | null;
  reviewCount: number;
  // Derived, live, from listenedTrackCount === totalTracks — not something
  // the user sets directly. There is no POST/DELETE /albums/{id}/listen.
  hasListened: boolean;
  listenedTrackCount: number;
  listenCount: number;
  isSaved: boolean;
}

export async function fetchAlbumHeader(id: string): Promise<AlbumHeader> {
  return apiFetch<AlbumHeader>(`/albums/${id}`);
}

// The expensive part, fetched separately (and in parallel with the header)
// so it doesn't hold up everything above the fold.
export async function fetchAlbumTracks(id: string): Promise<AlbumTrack[]> {
  return apiFetch<AlbumTrack[]>(`/albums/${id}/tracks`);
}

// Admin only. 400 if coverColor isn't exactly #rrggbb.
export async function setAlbumCoverColor(
  id: string,
  coverColor: string,
): Promise<void> {
  await apiFetch(`/albums/${id}/cover-color`, {
    method: "PUT",
    body: JSON.stringify({ coverColor }),
  });
}

// Admin only. Back to null — the frontend falls back to sampling the cover
// art itself once this album no longer has a curated color.
export async function clearAlbumCoverColor(id: string): Promise<void> {
  await apiFetch(`/albums/${id}/cover-color`, { method: "DELETE" });
}

// Admin only. Marks this album as a good entry point into artistId's
// catalogue (see GET /artists/{id}/essential-listening) — a collaboration
// or a sideman credit can be curated as an entry point too, so this isn't
// necessarily the album's own primary artist.
export async function setAlbumEntryPoint(
  albumId: string,
  artistId: string,
): Promise<void> {
  await apiFetch(`/albums/${albumId}/entry-point/${artistId}`, {
    method: "POST",
  });
}

// Admin only. Idempotent — a no-op if it wasn't marked.
export async function clearAlbumEntryPoint(
  albumId: string,
  artistId: string,
): Promise<void> {
  await apiFetch(`/albums/${albumId}/entry-point/${artistId}`, {
    method: "DELETE",
  });
}

// Admin only. Idempotent — a no-op if that relation didn't exist. role is
// required: an artist can have both a LEADER and a SIDEMAN edge to the same
// album, so this says which one to drop.
export async function removeAlbumPersonnel(
  albumId: string,
  artistId: string,
  role: PersonnelRole,
): Promise<void> {
  await apiFetch(
    `/albums/${albumId}/personnel/${artistId}?role=${role}`,
    { method: "DELETE" },
  );
}

export async function markTrackListened(id: string): Promise<void> {
  await apiFetch(`/tracks/${id}/listen`, { method: "POST" });
}

export async function unmarkTrackListened(id: string): Promise<void> {
  await apiFetch(`/tracks/${id}/listen`, { method: "DELETE" });
}

export async function rateTrack(id: string, rating: number): Promise<void> {
  await apiFetch(`/tracks/${id}/ratings`, {
    method: "POST",
    body: JSON.stringify({ rating }),
  });
}

// Admin only. Same idea as setAlbumEntryPoint/clearAlbumEntryPoint above,
// for a track rather than a whole album.
export async function setTrackEntryPoint(
  trackId: string,
  artistId: string,
): Promise<void> {
  await apiFetch(`/tracks/${trackId}/entry-point/${artistId}`, {
    method: "POST",
  });
}

// Admin only. Idempotent — a no-op if it wasn't marked.
export async function clearTrackEntryPoint(
  trackId: string,
  artistId: string,
): Promise<void> {
  await apiFetch(`/tracks/${trackId}/entry-point/${artistId}`, {
    method: "DELETE",
  });
}

// GET /tracks/featured's own shape — the archive's "Featured Tracks" strip,
// admin-curated (up to 6 at a time, see setTrackFeatured/unsetTrackFeatured
// below). logNumber always comes from the track's album, so unlike
// CatalogueEditorial/RecentAlbumEditorial it's never null here.
export interface FeaturedTrack {
  id: string;
  title: string;
  dek: string;
  byline: string;
  logNumber: string | null;
  trackName: string;
  imageUrl: string | null;
  albumName: string;
  albumId: string;
  createdAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export function fetchFeaturedTracks(): Promise<FeaturedTrack[]> {
  return apiFetch<FeaturedTrack[]>("/tracks/featured");
}

// Admin only. 409 if there are already 6 featured tracks, or if this track
// doesn't have an editorial yet; idempotent if it's already featured.
export async function setTrackFeatured(id: string): Promise<void> {
  await apiFetch(`/tracks/${id}/featured`, { method: "POST" });
}

// Admin only. No-op (still 204) if the track wasn't featured.
export async function unsetTrackFeatured(id: string): Promise<void> {
  await apiFetch(`/tracks/${id}/featured`, { method: "DELETE" });
}
