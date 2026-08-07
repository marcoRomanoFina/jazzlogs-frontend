import { z } from "zod";
import { editorialBlockFormSchema } from "@/lib/validations/editorialBlock";

const optionalString = () => z.string().optional();

export const albumEditorialFormSchema = z.object({
  albumId: z.string().min(1, "Requerido"),
  title: z.string().min(1, "Requerido"),
  dek: optionalString(),
  byline: optionalString(),
  blocks: z.array(editorialBlockFormSchema),
});
export type AlbumEditorialFormValues = z.infer<typeof albumEditorialFormSchema>;

export const albumEditorialFormDefaultValues: AlbumEditorialFormValues = {
  albumId: "",
  title: "",
  dek: "",
  byline: "",
  blocks: [],
};
