import { z } from "zod";
import { editorialBlockFormSchema } from "@/lib/validations/editorialBlock";

export const trackEditorialFormSchema = z.object({
  trackId: z.string().min(1, "Requerido"),
  title: z.string().min(1, "Requerido"),
  dek: z.string().min(1, "Requerido"),
  byline: z.string().min(1, "Requerido"),
  blocks: z.array(editorialBlockFormSchema),
});
export type TrackEditorialFormValues = z.infer<typeof trackEditorialFormSchema>;

export const trackEditorialFormDefaultValues: TrackEditorialFormValues = {
  trackId: "",
  title: "",
  dek: "",
  byline: "",
  blocks: [],
};
