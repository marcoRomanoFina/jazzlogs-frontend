import { apiFetch, type Page } from "@/lib/api";
import type { VocabularyTag } from "@/lib/albums";

// GET /artists/{id} — deliberately light now: just enough to render the
// header (name, photo). Post track-only-pivot, artists don't have their own
// editorial anymore (Track is the only object with one) — instruments/
// styles/contexts/similarArtists/albumAppearances/trackAppearances all left
// this endpoint too, they come back through their own endpoint(s) instead.
export interface ArtistHeader {
  id: string;
  name: string;
  spotifyArtistId: string | null;
  spotifyUrl: string | null;
  imageUrl: string | null;
}

export async function fetchArtistHeader(id: string): Promise<ArtistHeader> {
  return apiFetch<ArtistHeader>(`/artists/${id}`);
}

// GET /artists/{id}/sideman-albums's own shape — albums where this artist
// appears as a sideman rather than as the leader. artistId/artistName here
// are the album's LEADER, not this page's artist — the sideman isn't the
// album's owner. Fixed page size server-side.
export interface SidemanAlbum {
  id: string;
  name: string;
  imageUrl: string | null;
  releaseYear: number | null;
  totalTracks: number | null;
  artistId: string;
  artistName: string;
}

export function fetchSidemanAlbums(
  artistId: string,
  page = 0,
): Promise<Page<SidemanAlbum>> {
  return apiFetch<Page<SidemanAlbum>>(
    `/artists/${artistId}/sideman-albums?page=${page}`,
  );
}

// GET /artists/{id}/similar — hand-curated (not algorithmic), alphabetical
// by name, size fixed at 6. Same path as the admin POST that adds one.
export interface SimilarArtist {
  id: string;
  name: string;
  imageUrl: string | null;
  // Curated blurb explaining the connection — null if nobody wrote one yet.
  reason: string | null;
}

export function fetchSimilarArtists(
  artistId: string,
  page = 0,
): Promise<Page<SimilarArtist>> {
  return apiFetch<Page<SimilarArtist>>(
    `/artists/${artistId}/similar?page=${page}`,
  );
}

// Admin only. Hand-curates a "similar artist" relation — reason is the
// blurb GET /artists/{id}/similar comes back with; bidirectional also adds
// the reverse edge (this artist as a similar of similarArtistId).
export async function addSimilarArtist(
  artistId: string,
  similarArtistId: string,
  reason?: string,
  bidirectional = false,
): Promise<void> {
  await apiFetch(`/artists/${artistId}/similar`, {
    method: "POST",
    body: JSON.stringify({
      similarArtistId,
      reason: reason?.trim() || undefined,
      bidirectional,
    }),
  });
}

// Admin only. Idempotent — a no-op if the relation didn't exist.
// bidirectional only matters if the relation was created as bidirectional
// (via the POST that adds one) — pass true to also drop the reverse edge.
export async function removeSimilarArtist(
  artistId: string,
  similarArtistId: string,
  bidirectional = false,
): Promise<void> {
  await apiFetch(
    `/artists/${artistId}/similar/${similarArtistId}?bidirectional=${bidirectional}`,
    { method: "DELETE" },
  );
}

// GET /artists/{id}/tags (ArtistTagsDto server-side) — instruments/styles/
// contexts, the tag-only slice of what used to live on GET /artists/{id}
// directly. similarArtists/albumAppearances/trackAppearances aren't here
// either — those are getting their own endpoint(s) later.
export interface ArtistConnections {
  instruments: VocabularyTag[];
  styles: VocabularyTag[];
  contexts: VocabularyTag[];
}

export function fetchArtistConnections(id: string): Promise<ArtistConnections> {
  return apiFetch<ArtistConnections>(`/artists/${id}/tags`);
}
