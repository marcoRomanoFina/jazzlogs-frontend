import { z } from "zod";
import { EDITORIAL_BLOCK_TYPES, BLOCK_CONTENT_CATEGORIES } from "@/lib/constants/album";

// Shared by album/track/artist editorial forms — the backend's BlockRequest
// shape (type, subhead, text, contentCategory) is identical across all three
// owner types.
export const editorialBlockFormSchema = z.object({
  type: z.enum(EDITORIAL_BLOCK_TYPES),
  subhead: z.string().optional(),
  text: z.string().min(1, "El bloque no puede estar vacío"),
  contentCategory: z.enum(BLOCK_CONTENT_CATEGORIES, "Requerido"),
});
export type EditorialBlockFormValues = z.infer<typeof editorialBlockFormSchema>;

export const emptyEditorialBlock: EditorialBlockFormValues = {
  type: "PARA",
  subhead: "",
  text: "",
  contentCategory: "MUSICAL_ANALYSIS",
};
