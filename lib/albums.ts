import { apiFetch } from "@/lib/api";
import type { TrackNote } from "@/lib/notes";
import type { EditorialVoice } from "@/lib/editorials";

export type EditorialBlockType = "LEAD" | "PARA" | "QUOTE";

export interface EditorialBlock {
  position: number;
  type: EditorialBlockType;
  subhead: string | null;
  text: string;
  contentCategory: string;
}

export interface TrackEditorial {
  title: string;
  dek: string | null;
  byline: EditorialVoice;
  // Required on create (POST /tracks/{id}/editorial) — the log number
  // JazzLogs identifies this entry by, e.g. "042".
  logNumber: string;
  // Five independent image slots (uploadTrackEditorialCoverImage/
  // PrincipalImage/SecondaryImage/BannerImage/FooterImage below) — each
  // null until an admin uploads one, re-uploading replaces it in place.
  coverImageUrl: string | null;
  principalImageUrl: string | null;
  secondaryImageUrl: string | null;
  bannerImageUrl: string | null;
  footerImageUrl: string | null;
  blocks: EditorialBlock[];
  likeCount: number;
  likedByCurrentUser: boolean;
  // Missing on editorials that predate this field, not just null — treat
  // it as fully optional rather than trusting it's always there.
  createdAt?: string;
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

export interface AlbumTrack {
  id: string;
  trackNumber: number | null;
  spotifyTrackId: string;
  name: string;
  durationMs: number | null;
  spotifyUrl: string | null;
  imageUrl: string | null;
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

// POST /tracks — track-first ingest (the track-only pivot). No albumId
// anymore: the backend resolves or creates the Album and Artist itself from
// the track's own Spotify data (spotifyAlbumId/spotifyArtistId). If either
// already exists, it's reused as-is — never overwritten with whatever
// Spotify returns on this particular load.
export interface CreateTrackRequest {
  spotifyTrackId: string;
  vocalProfile?: string;
  energy?: string;
  accessibility?: string;
  moodIntensity?: string;
  tempoFeel?: string;
  compositionType?: string;
}

export async function createTrack(input: CreateTrackRequest): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/tracks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// GET /albums/{id} — post track-only-pivot, deliberately minimal: metadata
// derived from Spotify, no manual curation left at all (no cover/letter
// color, no reviews, no personnel, no editorial of its own — see
// AlbumTrack.editorial below for the track-level editorial instead).
// totalTracks changed meaning here too — it's no longer "how many tracks
// Spotify says this album has," it's "how many tracks JazzLogs has
// catalogued for it" (load order). loggedTrackCount is new: how many of
// those have a written editorial.
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
  loggedTrackCount: number;
}

export async function fetchAlbumHeader(id: string): Promise<AlbumHeader> {
  return apiFetch<AlbumHeader>(`/albums/${id}`);
}

// The expensive part, fetched separately (and in parallel with the header)
// so it doesn't hold up everything above the fold.
export async function fetchAlbumTracks(id: string): Promise<AlbumTrack[]> {
  return apiFetch<AlbumTrack[]>(`/albums/${id}/tracks`);
}

// GET /tracks/{id} — a single track's own detail endpoint, independent of
// its album's batched list. Artist and album come back flat (same idea as
// AlbumSummaryDto) so a track detail page doesn't need to hit two more
// endpoints to render its byline — `track` itself is the exact same shape
// as an entry in fetchAlbumTracks (tags, performers, the current user's own
// rating/listen/save, full editorial). GET /albums/{id}/tracks is still the
// batched route for an album's whole tracklist; this is only for one track
// on its own.
export interface TrackDetail {
  artistId: string;
  artistName: string;
  artistImageUrl: string | null;
  artistSpotifyUrl: string | null;
  albumId: string;
  albumName: string;
  albumImageUrl: string | null;
  albumSpotifyUrl: string | null;
  albumReleaseYear: number | null;
  track: AlbumTrack;
}

export async function fetchTrackDetail(id: string): Promise<TrackDetail> {
  return apiFetch<TrackDetail>(`/tracks/${id}`);
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

// Admin only, multipart/form-data. Five independent image slots on the
// track editorial — each 404s if the track doesn't have an editorial yet
// (POST /tracks/{id}/editorial first). 204 No Content — re-fetch the track
// (via fetchAlbumTracks) to see the new URL on the matching editorial field.
export async function uploadTrackEditorialCoverImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/tracks/${id}/editorial/cover-image`, {
    method: "PUT",
    body: formData,
  });
}

export async function uploadTrackEditorialPrincipalImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/tracks/${id}/editorial/principal-image`, {
    method: "PUT",
    body: formData,
  });
}

export async function uploadTrackEditorialSecondaryImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/tracks/${id}/editorial/secondary-image`, {
    method: "PUT",
    body: formData,
  });
}

export async function uploadTrackEditorialBannerImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/tracks/${id}/editorial/banner-image`, {
    method: "PUT",
    body: formData,
  });
}

export async function uploadTrackEditorialFooterImage(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiFetch(`/tracks/${id}/editorial/footer-image`, {
    method: "PUT",
    body: formData,
  });
}

// GET /tracks/featured's own shape — the archive's "Featured Tracks" strip,
// admin-curated (up to 6 at a time, see setTrackFeatured/unsetTrackFeatured
// below). `id` is the editorial's own id, NOT the track's — use trackId to
// link to GET /tracks/{trackId} (there's no album page to link to anymore,
// hence no albumId here either).
export interface FeaturedTrack {
  id: string;
  title: string;
  dek: string;
  byline: EditorialVoice;
  trackId: string;
  trackName: string;
  // Editorial cover image, not Spotify's track/album artwork.
  coverImageUrl: string | null;
  albumName: string;
  artistName: string;
  createdAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

type FeaturedTrackResponse = FeaturedTrack & {
  // Kept only while deployed API instances finish moving to coverImageUrl.
  imageUrl?: string | null;
  cover_image_url?: string | null;
};

export async function fetchFeaturedTracks(): Promise<FeaturedTrack[]> {
  const tracks = await apiFetch<FeaturedTrackResponse[]>("/tracks/featured");
  return tracks.map(({ imageUrl, cover_image_url, ...track }) => ({
    ...track,
    coverImageUrl: track.coverImageUrl ?? imageUrl ?? cover_image_url ?? null,
  }));
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
