import { z } from "zod";
import { editorialBlockFormSchema } from "@/lib/validations/editorialBlock";
import { EDITORIAL_VOICE_OPTIONS } from "@/lib/editorials";

export const trackEditorialFormSchema = z.object({
  trackId: z.string().min(1, "Requerido"),
  title: z.string().min(1, "Requerido"),
  dek: z.string().min(1, "Requerido"),
  logNumber: z.string().min(1, "Requerido"),
  // Optional now (used to be required free text) — "" means unset, the
  // empty first <option>, left as the default so the backend fills in
  // JAZZLOGS itself, same as omitting the field entirely.
  byline: z.union([z.enum(EDITORIAL_VOICE_OPTIONS), z.literal("")]),
  blocks: z.array(editorialBlockFormSchema),
});
export type TrackEditorialFormValues = z.infer<typeof trackEditorialFormSchema>;

export const trackEditorialFormDefaultValues: TrackEditorialFormValues = {
  trackId: "",
  title: "",
  dek: "",
  logNumber: "",
  byline: "",
  blocks: [],
};
