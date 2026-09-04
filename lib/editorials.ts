import { apiFetch, ApiError, type Page } from "@/lib/api";

export type EditorialOwnerType = "ALBUM" | "TRACK" | "ARTIST";

export interface EditorialSummary {
  id: string;
  type: EditorialOwnerType;
  ownerId: string;
  ownerName: string;
  ownerImageUrl: string | null;
  title: string;
  dek: string | null;
  byline: string | null;
  createdAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
  featurated: boolean;
  // Artist name for an album, album name for a track — null for an artist.
  contextName: string | null;
  releaseYear: number | null;
  // Raw text of the editorial's first block — no formatting, just a snippet.
  previewText: string | null;
  // Artist id for an album, album id for a track — null for an artist. Lets
  // a track editorial link straight into its album's editorial page.
  contextId: string | null;
}

// GET /editorials' own dedicated shape — leaner than EditorialSummary
// (no featurated/releaseYear/previewText, those are /editorials/featured-only
// concerns) and adds logNumber, which EditorialSummary doesn't have at all.
// null for an ARTIST editorial — an artist doesn't belong to one album's
// catalog number the way an album or track does.
export interface CatalogueEditorial {
  id: string;
  type: EditorialOwnerType;
  ownerId: string;
  ownerName: string;
  ownerImageUrl: string | null;
  contextName: string | null;
  contextId: string | null;
  title: string;
  dek: string | null;
  byline: string | null;
  createdAt: string;
  logNumber: string | null;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface ListEditorialsParams {
  type?: EditorialOwnerType;
  q?: string;
  page?: number;
  size?: number;
  // Spring's standard Pageable sort syntax, e.g. "title,asc".
  sort?: string;
}

export async function fetchEditorials(
  params: ListEditorialsParams = {},
): Promise<Page<CatalogueEditorial>> {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.size !== undefined) search.set("size", String(params.size));
  if (params.sort) search.set("sort", params.sort);

  const qs = search.toString();
  return apiFetch<Page<CatalogueEditorial>>(`/editorials${qs ? `?${qs}` : ""}`);
}

// No editorial has been marked featured yet -> backend 404s; that's a valid,
// unexceptional state here (just means the hero has nothing to show).
export async function fetchFeaturedEditorial(): Promise<EditorialSummary | null> {
  try {
    return await apiFetch<EditorialSummary>("/editorials/featured");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// GET /editorials/recent's own shape — always an album (an artist/track
// can't be "recently filed" in this strip), so it's flattened around that
// instead of the owner/context split CatalogueEditorial needs to stay
// generic across all three editorial types.
export interface RecentAlbumEditorial {
  id: string;
  albumId: string;
  artistId: string;
  imageUrl: string | null;
  title: string;
  albumName: string;
  artistName: string;
  dek: string | null;
  byline: string | null;
  logNumber: string | null;
  likeCount: number;
  likedByCurrentUser: boolean;
}

// No query params, no paging — always the 10 most recent album editorials
// (or fewer, early on), newest first.
export function fetchRecentAlbumEditorials(): Promise<RecentAlbumEditorial[]> {
  return apiFetch<RecentAlbumEditorial[]>("/editorials/recent");
}

// GET /editorials/last-log's own shape — the single most recent album
// editorial, spotlighted with its track editorials alongside it. Distinct
// from RecentAlbumEditorial: no separate albumId/artistId (just one `id`,
// the album's), and each track carries its own editorial id rather than the
// track's id.
export interface LastLogTrack {
  // The track editorial's own id — only meant for the like display, not for
  // linking to the track's section (no track id is exposed here).
  id: string;
  trackNumber: number | null;
  title: string;
  dek: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface LastLogAlbumEditorial {
  id: string;
  title: string;
  artistName: string;
  dek: string;
  byline: string;
  releaseYear: number | null;
  postedAt: string;
  imageUrl: string | null;
  likeCount: number;
  likedByCurrentUser: boolean;
  tracks: LastLogTrack[];
}

// No query params. 404 (mapped to null) when there isn't an album editorial
// yet at all — same "not exceptional" treatment as fetchFeaturedEditorial.
export async function fetchLastLog(): Promise<LastLogAlbumEditorial | null> {
  try {
    return await apiFetch<LastLogAlbumEditorial>("/editorials/last-log");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
