import { z } from "zod";

export const artistTagsFormSchema = z.object({
  artistId: z.string().min(1, "Requerido"),
  primaryInstrument: z.string().optional(),
  styles: z.array(z.string()),
  contexts: z.array(z.string()),
});
export type ArtistTagsFormValues = z.infer<typeof artistTagsFormSchema>;

export const artistTagsFormDefaultValues: ArtistTagsFormValues = {
  artistId: "",
  primaryInstrument: "",
  styles: [],
  contexts: [],
};
