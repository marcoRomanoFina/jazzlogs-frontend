import { apiFetch } from "@/lib/api";

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
