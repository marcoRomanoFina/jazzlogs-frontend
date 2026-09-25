import { apiFetch, type Page } from "@/lib/api";

// The voice credited on an editorial — used to
// be free text (defaulting to some hand-typed "Jazzlogs"/"JazzLogs"), now a
// fixed enum. Optional on create/update; omitting or sending null has the
// backend fill in JAZZLOGS itself. Every existing editorial was normalized
// to JAZZLOGS in the migration, so responses always carry one of these 9
// values now, never null.
export const EDITORIAL_VOICE_OPTIONS = [
  "MARK",
  "LAURA",
  "ALICE",
  "ADAM",
  "JAMES",
  "ALLIE",
  "BOB",
  "NATALIE",
  "JAZZLOGS",
] as const;
export type EditorialVoice = (typeof EDITORIAL_VOICE_OPTIONS)[number];

// GET /editorials' own dedicated shape — track-only catalogue (the
// track-only pivot deleted album/artist editorials entirely, and with them
// the old `type`/ownerId/context split — every row is a track now).
export interface CatalogueEditorial {
  id: string;
  trackId: string;
  trackName: string;
  // Editorial cover image, not the Spotify track/album artwork.
  editorialCoverUrl: string | null;
  albumName: string;
  albumId: string;
  artistName: string;
  title: string;
  dek: string | null;
  byline: EditorialVoice;
  createdAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface ListEditorialsParams {
  q?: string;
  byline?: EditorialVoice;
  page?: number;
}

export async function fetchEditorials(
  params: ListEditorialsParams = {},
): Promise<Page<CatalogueEditorial>> {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.byline) search.set("byline", params.byline);
  if (params.page !== undefined) search.set("page", String(params.page));

  const qs = search.toString();
  return apiFetch<Page<CatalogueEditorial>>(`/editorials${qs ? `?${qs}` : ""}`);
}

// GET /editorials/count — total row count for the catalogue above, no auth
// required. Used for the "N editorials, and counting" dek copy instead of
// paging with size=1 just to read totalElements.
export async function fetchEditorialsCount(): Promise<number> {
  const { count } = await apiFetch<{ count: number }>("/editorials/count");
  return count;
}

// GET /editorials/by-byline/{byline}'s own shape (EditorialTrackSummaryDto)
// — `id` is the editorial's own id, not the track's; trackId is what links
// to GET /tracks/{trackId}. No albumId (no album page to link to anymore).
export interface EditorialTrackSummary {
  id: string;
  title: string;
  dek: string | null;
  byline: EditorialVoice;
  trackId: string;
  trackName: string;
  imageUrl: string | null;
  albumName: string;
  artistName: string;
  createdAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface LatestEditorial {
  trackId: string;
  trackName: string;
  albumName: string;
  title: string;
  logNumber: string;
  dek: string | null;
  byline: EditorialVoice;
  coverImageUrl: string | null;
  principalImageUrl: string | null;
  createdAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
  hook: string | null;
}

// No paging — always the n most recent (default/max 10, server clamps a
// higher request rather than rejecting it).
export function fetchEditorialsByByline(
  byline: EditorialVoice,
  n = 10,
): Promise<EditorialTrackSummary[]> {
  return apiFetch<EditorialTrackSummary[]>(
    `/editorials/by-byline/${byline}?n=${n}`,
  );
}

// The newest track editorials across every byline, already ordered by the
// backend as createdAt DESC. The server clamps n to its supported 1–15 range.
export function fetchRecentEditorials(
  n = 15,
): Promise<EditorialTrackSummary[]> {
  return apiFetch<EditorialTrackSummary[]>(`/editorials/recent?n=${n}`);
}

// Returns the newest editorial in the catalogue. The API responds with 404
// when no editorial exists yet; callers can render that as an empty state.
export function fetchLatestEditorial(): Promise<LatestEditorial> {
  return apiFetch<LatestEditorial>("/editorials/latest");
}
