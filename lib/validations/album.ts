import { z } from "zod";
import { VOCAL_PROFILES, LEVELS } from "@/lib/constants/album";

// Editorial, tracks, tags and personnel all live in their own standalone
// forms/pages — each hits its own endpoint keyed by an existing albumId, not
// just one created in the same session. This schema is the ficha alone.
export const albumFormSchema = z.object({
  // name/imageUrl/spotifyUrl/releaseYear/totalTracks all come from Spotify
  // now (backend fetches them via spotifyAlbumId), so they're not form
  // fields anymore.
  artistId: z.string().min(1, "Requerido"),
  spotifyAlbumId: z.string().min(1, "Requerido"),
  logNumber: z.string().min(1, "Requerido"),
  label: z.string().min(1, "Requerido"),
  vocalProfile: z.enum(VOCAL_PROFILES, "Requerido"),
  energy: z.enum(LEVELS, "Requerido"),
  moodIntensity: z.enum(LEVELS, "Requerido"),
  accessibility: z.enum(LEVELS, "Requerido"),
  instagramPermalink: z.string().optional(),
});

export type AlbumFormValues = z.infer<typeof albumFormSchema>;

export const albumFormDefaultValues: AlbumFormValues = {
  artistId: "",
  spotifyAlbumId: "",
  logNumber: "",
  label: "",
  vocalProfile: undefined as unknown as AlbumFormValues["vocalProfile"],
  energy: undefined as unknown as AlbumFormValues["energy"],
  moodIntensity: undefined as unknown as AlbumFormValues["moodIntensity"],
  accessibility: undefined as unknown as AlbumFormValues["accessibility"],
  instagramPermalink: "",
};
