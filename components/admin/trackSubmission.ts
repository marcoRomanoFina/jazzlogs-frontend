import { createTrack } from "@/lib/albums";
import type { TrackFormValues } from "@/lib/validations/track";
import { omitEmpty } from "@/components/admin/runAlbumSubmission";

// Track-first ingest (the track-only pivot) — POST /tracks per track, no
// albumId: the backend resolves or creates the Album and Artist itself from
// each track's own Spotify data.
export function buildTrackSteps(tracks: TrackFormValues[]) {
  const realTracks = tracks.filter((t) => t.spotifyTrackId?.trim());
  return realTracks.map((track, i) => ({
    key: `track-${i}`,
    label: `Track: ${track.spotifyTrackId}`,
    run: async () => {
      await createTrack({
        spotifyTrackId: track.spotifyTrackId,
        ...omitEmpty({
          vocalProfile: track.vocalProfile,
          energy: track.energy,
          accessibility: track.accessibility,
          moodIntensity: track.moodIntensity,
          tempoFeel: track.tempoFeel,
          compositionType: track.compositionType,
        }),
      });
    },
  }));
}
