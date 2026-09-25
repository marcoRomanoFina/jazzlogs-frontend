import { z } from "zod";

// Numeric/enum-ish optional fields stay as raw strings at the schema/form
// level (matching what <input>/<select> actually produce).
const optionalString = () => z.string().optional();

export const trackFormSchema = z.object({
  spotifyTrackId: z.string().min(1, "Requerido"),
  vocalProfile: optionalString(),
  energy: optionalString(),
  accessibility: optionalString(),
  moodIntensity: optionalString(),
  tempoFeel: optionalString(),
  compositionType: optionalString(),
});
export type TrackFormValues = z.infer<typeof trackFormSchema>;

export const tracksFormSchema = z.object({
  tracks: z
    .array(trackFormSchema)
    .min(1, "Agregá al menos un track antes de guardar."),
});
export type TracksFormValues = z.infer<typeof tracksFormSchema>;

export const emptyTrack: TrackFormValues = {
  spotifyTrackId: "",
  vocalProfile: "",
  energy: "",
  accessibility: "",
  moodIntensity: "",
  tempoFeel: "",
  compositionType: "",
};

export const tracksFormDefaultValues: TracksFormValues = {
  tracks: [],
};
