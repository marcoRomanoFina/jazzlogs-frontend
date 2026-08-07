import { apiFetch } from "@/lib/api";

// Primary instrument stays a single add (POST), not a replace — it's a
// singular concept by definition, unlike styles/contexts below. Those are
// full replace (PUT): submitting overwrites the artist's complete set with
// exactly what's checked here, see StyleTagRequest's comment on the backend.
export function buildArtistTagSteps(
  tags: { primaryInstrument?: string; styles: string[]; contexts: string[] },
  artistId: string,
) {
  const steps: { key: string; label: string; run: () => Promise<void> }[] = [];

  if (tags.primaryInstrument?.trim()) {
    const instrumentCode = tags.primaryInstrument;
    steps.push({
      key: "primary-instrument",
      label: `Primary instrument: ${instrumentCode}`,
      run: async () => {
        await apiFetch(`/artists/${artistId}/instrument`, {
          method: "POST",
          body: JSON.stringify({ instrumentCode }),
        });
      },
    });
  }

  steps.push({
    key: "styles",
    label: `Styles (${tags.styles.length})`,
    run: async () => {
      await apiFetch(`/artists/${artistId}/styles`, {
        method: "PUT",
        body: JSON.stringify({ styleCodes: tags.styles }),
      });
    },
  });

  steps.push({
    key: "contexts",
    label: `Contexts (${tags.contexts.length})`,
    run: async () => {
      await apiFetch(`/artists/${artistId}/contexts`, {
        method: "PUT",
        body: JSON.stringify({ contextCodes: tags.contexts }),
      });
    },
  });

  return steps;
}
