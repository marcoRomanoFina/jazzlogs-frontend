import { apiFetch } from "@/lib/api";
import type { TrackFormValues } from "@/lib/validations/track";
import { omitEmpty } from "@/components/admin/runAlbumSubmission";

export function buildTrackSteps(tracks: TrackFormValues[], albumId: string) {
  const realTracks = tracks.filter((t) => t.spotifyTrackId?.trim());
  return realTracks.map((track, i) => ({
    key: `track-${i}`,
    label: `Track: ${track.spotifyTrackId}`,
    run: async () => {
      await apiFetch(`/albums/${albumId}/tracks`, {
        method: "POST",
        body: JSON.stringify(
          omitEmpty({
            spotifyTrackId: track.spotifyTrackId,
            standout: track.standout,
            vocalProfile: track.vocalProfile,
            energy: track.energy,
            accessibility: track.accessibility,
            moodIntensity: track.moodIntensity,
            tempoFeel: track.tempoFeel,
            compositionType: track.compositionType,
          })
        ),
      });
    },
  }));
}
