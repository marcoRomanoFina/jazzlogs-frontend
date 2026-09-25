import { z } from "zod";

export const trackTagsFormSchema = z.object({
  trackId: z.string().min(1, "Requerido"),
  styles: z.array(z.string()),
  moods: z.array(z.string()),
  contexts: z.array(z.string()),
  rhythms: z.array(z.string()),
  instruments: z.array(z.string()),
});
export type TrackTagsFormValues = z.infer<typeof trackTagsFormSchema>;

export const trackTagsFormDefaultValues: TrackTagsFormValues = {
  trackId: "",
  styles: [],
  moods: [],
  contexts: [],
  rhythms: [],
  instruments: [],
};
