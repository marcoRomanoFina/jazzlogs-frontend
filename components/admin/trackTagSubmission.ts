import { apiFetch } from "@/lib/api";

// Full replace, not add-one — same reasoning as tagSubmission.ts's album
// version, see StyleTagRequest's comment on the backend.
export function buildTrackTagSteps(
  tags: {
    styles: string[];
    moods: string[];
    contexts: string[];
    rhythms: string[];
    instruments: string[];
  },
  trackId: string,
) {
  return [
    {
      key: "styles",
      label: `Styles (${tags.styles.length})`,
      run: async () => {
        await apiFetch(`/tracks/${trackId}/tags/style`, {
          method: "PUT",
          body: JSON.stringify({ styleCodes: tags.styles }),
        });
      },
    },
    {
      key: "moods",
      label: `Moods (${tags.moods.length})`,
      run: async () => {
        await apiFetch(`/tracks/${trackId}/tags/mood`, {
          method: "PUT",
          body: JSON.stringify({ moodCodes: tags.moods }),
        });
      },
    },
    {
      key: "contexts",
      label: `Contexts (${tags.contexts.length})`,
      run: async () => {
        await apiFetch(`/tracks/${trackId}/tags/context`, {
          method: "PUT",
          body: JSON.stringify({ contextCodes: tags.contexts }),
        });
      },
    },
    {
      key: "rhythms",
      label: `Rhythms (${tags.rhythms.length})`,
      run: async () => {
        await apiFetch(`/tracks/${trackId}/tags/rhythm`, {
          method: "PUT",
          body: JSON.stringify({ rhythmCodes: tags.rhythms }),
        });
      },
    },
    {
      key: "instruments",
      label: `Featured instruments (${tags.instruments.length})`,
      run: async () => {
        await apiFetch(`/tracks/${trackId}/tags/instrument`, {
          method: "PUT",
          body: JSON.stringify({ instrumentCodes: tags.instruments }),
        });
      },
    },
  ];
}
