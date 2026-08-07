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
): Promise<Page<EditorialSummary>> {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.size !== undefined) search.set("size", String(params.size));
  if (params.sort) search.set("sort", params.sort);

  const qs = search.toString();
  return apiFetch<Page<EditorialSummary>>(`/editorials${qs ? `?${qs}` : ""}`);
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
