import { z } from "zod";
import { editorialBlockFormSchema } from "@/lib/validations/editorialBlock";

const optionalString = () => z.string().optional();

export const artistEditorialFormSchema = z.object({
  artistId: z.string().min(1, "Requerido"),
  title: z.string().min(1, "Requerido"),
  dek: optionalString(),
  byline: optionalString(),
  blocks: z.array(editorialBlockFormSchema),
});
export type ArtistEditorialFormValues = z.infer<
  typeof artistEditorialFormSchema
>;

export const artistEditorialFormDefaultValues: ArtistEditorialFormValues = {
  artistId: "",
  title: "",
  dek: "",
  byline: "",
  blocks: [],
};
