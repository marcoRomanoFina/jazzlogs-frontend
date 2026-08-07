import { apiFetch } from "@/lib/api";
import type { PersonnelFormValues } from "@/lib/validations/personnel";
import { omitEmpty } from "@/components/admin/runAlbumSubmission";

export function buildPersonnelSteps(
  personnel: PersonnelFormValues[],
  albumId: string,
) {
  const realPersonnel = personnel.filter((p) => p.artistId?.trim());
  return realPersonnel.map((p, i) => {
    // Both LEADER_OF and SIDEMAN_ON edges carry instruments now, not just sideman.
    const instruments = p.instruments.length > 0 ? p.instruments : undefined;

    return {
      key: `personnel-${i}`,
      label: `Personnel: ${p.artistId} (${p.role})`,
      run: async () => {
        await apiFetch(`/albums/${albumId}/personnel`, {
          method: "POST",
          body: JSON.stringify(
            omitEmpty({ artistId: p.artistId, role: p.role, instruments }),
          ),
        });
      },
    };
  });
}
