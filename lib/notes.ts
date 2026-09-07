import { apiFetch, type Page } from "@/lib/api";

export interface TrackNote {
  id: string;
  trackId: string;
  userId: string;
  userName: string | null;
  title: string;
  text: string;
  timestampSeconds: number | null;
  likeCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
}

// The community feed for a track — every user's notes, not just the current
// user's (see lib/albums.ts's AlbumTrack.myNotes for that one) — paged
// server-side, with the requesting user's own notes ordered first. A track
// can accumulate far more notes than fit in one response, so this is never
// "fetch everything and paginate in the browser".
export async function fetchTrackNotes(
  trackId: string,
  page = 0,
  size = 6,
): Promise<Page<TrackNote>> {
  return apiFetch<Page<TrackNote>>(
    `/tracks/${trackId}/notes?page=${page}&size=${size}`,
  );
}

export async function createNote(
  trackId: string,
  title: string,
  text: string,
  timestampSeconds?: number | null,
): Promise<TrackNote> {
  return apiFetch<TrackNote>(`/tracks/${trackId}/notes`, {
    method: "POST",
    body: JSON.stringify({
      title,
      text,
      timestampSeconds: timestampSeconds ?? null,
    }),
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  await apiFetch(`/notes/${noteId}`, { method: "DELETE" });
}
