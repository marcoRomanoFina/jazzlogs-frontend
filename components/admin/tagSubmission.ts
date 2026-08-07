import { apiFetch } from "@/lib/api";

// Full replace, not add-one — submitting overwrites the album's complete set
// of styles/moods/contexts with exactly what's checked here (an empty group
// clears that category), see StyleTagRequest's comment on the backend.
export function buildTagSteps(
  tags: { styles: string[]; moods: string[]; contexts: string[] },
  albumId: string,
) {
  return [
    {
      key: "styles",
      label: `Styles (${tags.styles.length})`,
      run: async () => {
        await apiFetch(`/albums/${albumId}/tags/style`, {
          method: "PUT",
          body: JSON.stringify({ styleCodes: tags.styles }),
        });
      },
    },
    {
      key: "moods",
      label: `Moods (${tags.moods.length})`,
      run: async () => {
        await apiFetch(`/albums/${albumId}/tags/mood`, {
          method: "PUT",
          body: JSON.stringify({ moodCodes: tags.moods }),
        });
      },
    },
    {
      key: "contexts",
      label: `Contexts (${tags.contexts.length})`,
      run: async () => {
        await apiFetch(`/albums/${albumId}/tags/context`, {
          method: "PUT",
          body: JSON.stringify({ contextCodes: tags.contexts }),
        });
      },
    },
  ];
}
