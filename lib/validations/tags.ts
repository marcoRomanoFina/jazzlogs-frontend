import { z } from "zod";

export const albumTagsFormSchema = z.object({
  albumId: z.string().min(1, "Requerido"),
  styles: z.array(z.string()),
  moods: z.array(z.string()),
  contexts: z.array(z.string()),
});
export type AlbumTagsFormValues = z.infer<typeof albumTagsFormSchema>;

export const albumTagsFormDefaultValues: AlbumTagsFormValues = {
  albumId: "",
  styles: [],
  moods: [],
  contexts: [],
};
