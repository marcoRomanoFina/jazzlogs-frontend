import { z } from "zod";
import { PERSONNEL_ROLES } from "@/lib/constants/album";

export const personnelFormSchema = z.object({
  artistId: z.string().min(1, "Requerido"),
  role: z.enum(PERSONNEL_ROLES),
  // Codes from InstrumentVocabulary — the backend validates these, not free text.
  instruments: z.array(z.string()),
});
export type PersonnelFormValues = z.infer<typeof personnelFormSchema>;

export const albumPersonnelFormSchema = z.object({
  albumId: z.string().min(1, "Requerido"),
  personnel: z.array(personnelFormSchema),
});
export type AlbumPersonnelFormValues = z.infer<typeof albumPersonnelFormSchema>;

export const emptyPersonnelRow: PersonnelFormValues = {
  artistId: "",
  role: "SIDEMAN",
  instruments: [],
};

export const albumPersonnelFormDefaultValues: AlbumPersonnelFormValues = {
  albumId: "",
  personnel: [],
};
