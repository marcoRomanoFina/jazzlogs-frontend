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
