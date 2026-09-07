import { apiFetch, type Page } from "@/lib/api";
import type { EditorialBlock, VocabularyTag } from "@/lib/albums";

// Same shape as AlbumEditorial (lib/albums.ts) — id/likeCount/
// likedByCurrentUser are new here, letting the like button go straight
// through the generic /likes endpoint (entityType: "EDITORIAL") same as an
// album's.
export interface ArtistEditorial {
  id: string;
  title: string;
  dek: string | null;
  byline: string | null;
  blocks: EditorialBlock[];
  likeCount: number;
  likedByCurrentUser: boolean;
}

// GET /artists/{id} — deliberately light now: just enough to render the
// header (name, photo, editorial). instruments/styles/contexts/
// similarArtists/albumAppearances/trackAppearances all left this endpoint —
// they'll come back through their own endpoint(s) later.
export interface ArtistHeader {
  id: string;
  name: string;
  spotifyArtistId: string | null;
  spotifyUrl: string | null;
  imageUrl: string | null;
  // null until an editorial has actually been written for this artist.
  editorial: ArtistEditorial | null;
}

export async function fetchArtistHeader(id: string): Promise<ArtistHeader> {
  return apiFetch<ArtistHeader>(`/artists/${id}`);
}

// GET /artists/{id}/essential-listening's own shape — curated entry-point
// albums, oldest release first. artistId/artistName here are the ALBUM's
// (not necessarily this page's artist — a collaboration or a sideman
// credit can be curated as an entry point too), so never assume they match
// the artist whose page this is. Same shape reused for
// GET /artists/{id}/sideman-albums.
export interface EssentialListeningAlbum {
  id: string;
  name: string;
  imageUrl: string | null;
  releaseYear: number | null;
  label: string | null;
  totalTracks: number;
  logNumber: string | null;
  // JazzLogs's own rating, not Spotify's — null if the album has no
  // reviews yet.
  avgRating: number | null;
  // From the album's own editorial — null if it doesn't have one.
  dek: string | null;
  artistId: string;
  artistName: string;
}

// Fixed at 5 per page server-side — there's no client-controlled size here.
// An artist with nothing curated as an entry point yet comes back as an
// empty page (content: [], totalElements: 0), not an error.
export function fetchEssentialListening(
  artistId: string,
  page = 0,
): Promise<Page<EssentialListeningAlbum>> {
  return apiFetch<Page<EssentialListeningAlbum>>(
    `/artists/${artistId}/essential-listening?page=${page}`,
  );
}

// GET /artists/{id}/sideman-albums — albums where this artist appears as a
// sideman rather than as the leader. Same shape/pagination as essential
// listening (size fixed at 6), but artistId/artistName here are the
// album's LEADER, not this page's artist — the sideman isn't the album's
// owner.
export function fetchSidemanAlbums(
  artistId: string,
  page = 0,
): Promise<Page<EssentialListeningAlbum>> {
  return apiFetch<Page<EssentialListeningAlbum>>(
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
