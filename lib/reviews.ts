import { apiFetch, type Page } from "@/lib/api";
import type { TrackNote } from "@/lib/notes";

export interface StandoutTrack {
  id: string;
  name: string;
}

export interface AlbumReview {
  id: string;
  albumId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string | null;
  likeCount: number;
  likedByCurrentUser: boolean;
  standoutTracks: StandoutTrack[];
  // Full notes the reviewer left on this album's other tracks — same shape
  // as the per-track note feed (TrackNote), so they can be opened in the
  // same viewingNote modal, not just displayed as a lean summary.
  notes: TrackNote[];
  createdAt: string;
  updatedAt: string;
}

// There's no GET /albums/{id}/reviews/me anymore — the caller's own review
// (if any) is always content[0] of page 0, ahead of everyone else's (who
// are sorted newest-first from there). Comparing content[0].userId against
// the current user is how the page now figures out "do I already have a
// review here" — see AlbumEditorialContent's page0 handling.
export async function fetchAlbumReviews(
  albumId: string,
  page = 0,
  size = 6,
): Promise<Page<AlbumReview>> {
  return apiFetch<Page<AlbumReview>>(
    `/albums/${albumId}/reviews?page=${page}&size=${size}`,
  );
}

// Idempotent — always 204, even if there was nothing to delete.
export async function deleteReview(albumId: string): Promise<void> {
  await apiFetch(`/albums/${albumId}/reviews`, { method: "DELETE" });
}

// First review for this album from this user. 409 if one already exists —
// call updateReview instead.
export async function createReview(
  albumId: string,
  rating: number,
  text?: string | null,
  standoutTrackIds?: string[],
): Promise<AlbumReview> {
  return apiFetch<AlbumReview>(`/albums/${albumId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      rating,
      text: text ?? null,
      standoutTrackIds: standoutTrackIds ?? null,
    }),
  });
}

// Full replacement, not a patch — standoutTrackIds you omit here are gone,
// not left alone. 404 if there's no review yet — call createReview instead.
export async function updateReview(
  albumId: string,
  rating: number,
  text?: string | null,
  standoutTrackIds?: string[],
): Promise<AlbumReview> {
  return apiFetch<AlbumReview>(`/albums/${albumId}/reviews`, {
    method: "PUT",
    body: JSON.stringify({
      rating,
      text: text ?? null,
      standoutTrackIds: standoutTrackIds ?? null,
    }),
  });
}
