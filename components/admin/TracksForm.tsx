"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tracksFormSchema,
  emptyTrack,
  type TracksFormValues,
} from "@/lib/validations/track";
import {
  VOCAL_PROFILES,
  LEVELS,
  TEMPO_FEELS,
  COMPOSITION_TYPES,
} from "@/lib/constants/album";
import { buildTrackSteps } from "@/components/admin/trackSubmission";
import {
  submitSteps,
  retryFailedSteps,
  type StepReport,
} from "@/components/admin/runAlbumSubmission";
import SubmitReport from "@/components/admin/SubmitReport";
import {
  fieldLabel,
  fieldInput,
  fieldSelect,
  fieldError,
  btnPrimary,
  btnGhost,
  btnIcon,
  rowCard,
} from "@/components/admin/formStyles";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function TracksForm() {
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<StepReport[] | null>(null);
  const [submittedAlbumId, setSubmittedAlbumId] = useState<string | null>(null);

  const {
    register,
    control,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<TracksFormValues>({
    resolver: zodResolver(tracksFormSchema),
    defaultValues: { albumId: "", tracks: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tracks" });

  async function handleSave() {
    const valid = await trigger(["albumId", "tracks"]);
    if (!valid) return;

    setSubmitting(true);
    const values = getValues();
    setSubmittedAlbumId(values.albumId);
    const steps = buildTrackSteps(values.tracks, values.albumId);
    const updated = await submitSteps(steps, setReports);
    setReports(updated);
    setSubmitting(false);
  }

  async function handleRetry() {
    if (!reports) return;
    setSubmitting(true);
    const values = getValues();
    const steps = buildTrackSteps(values.tracks, values.albumId);
    const updated = await retryFailedSteps(steps, reports, setReports);
    setReports(updated);
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={fieldLabel} htmlFor="albumId">
          Album ID *
        </label>
        <input
          id="albumId"
          className={fieldInput}
          placeholder="UUID del álbum (lo devuelve /admin/albums/new al guardar la ficha)"
          {...register("albumId")}
        />
        {errors.albumId && (
          <p className={fieldError}>{errors.albumId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="mb-1 flex items-center justify-between">
          <span className={fieldLabel + " mb-0"}>Tracks</span>
          <button
            type="button"
            className={btnGhost}
            onClick={() => append(emptyTrack)}
          >
            + Agregar track
          </button>
        </div>

        <p className="text-xs text-[rgba(233,230,223,.5)]">
          Nombre, duración y número de track se traen de Spotify a partir del
          Spotify Track ID.
        </p>
        {errors.tracks?.message && (
          <p className={fieldError}>{errors.tracks.message}</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className={rowCard}>
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[220px]">
                <label className={fieldLabel}>Spotify Track ID *</label>
                <input
                  className={fieldInput}
                  {...register(`tracks.${index}.spotifyTrackId` as const)}
                />
                {errors.tracks?.[index]?.spotifyTrackId && (
                  <p className={fieldError}>
                    {errors.tracks[index]?.spotifyTrackId?.message}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 pb-2.5 text-[13px] text-[rgba(233,230,223,.85)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[rgba(233,230,223,.4)] bg-transparent accent-[#d99b10]"
                  {...register(`tracks.${index}.standout` as const)}
                />
                Standout
              </label>

              <button
                type="button"
                className={btnIcon}
                onClick={() => remove(index)}
                aria-label="Eliminar track"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div>
                <label className={fieldLabel}>Vocal profile</label>
                <select
                  className={fieldSelect}
                  {...register(`tracks.${index}.vocalProfile` as const)}
                >
                  <option value="">—</option>
                  {VOCAL_PROFILES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Energy</label>
                <select
                  className={fieldSelect}
                  {...register(`tracks.${index}.energy` as const)}
                >
                  <option value="">—</option>
                  {LEVELS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Accessibility</label>
                <select
                  className={fieldSelect}
                  {...register(`tracks.${index}.accessibility` as const)}
                >
                  <option value="">—</option>
                  {LEVELS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Mood intensity</label>
                <select
                  className={fieldSelect}
                  {...register(`tracks.${index}.moodIntensity` as const)}
                >
                  <option value="">—</option>
                  {LEVELS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Tempo feel</label>
                <select
                  className={fieldSelect}
                  {...register(`tracks.${index}.tempoFeel` as const)}
                >
                  <option value="">—</option>
                  {TEMPO_FEELS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Composition type</label>
                <select
                  className={fieldSelect}
                  {...register(`tracks.${index}.compositionType` as const)}
                >
                  <option value="">—</option>
                  {COMPOSITION_TYPES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <p className="text-sm text-[rgba(233,230,223,.5)]">
            Todavía no agregaste ningún track.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-[rgba(233,230,223,.12)] pt-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={btnPrimary}
            disabled={submitting}
            onClick={handleSave}
          >
            {submitting ? "Guardando…" : "Guardar tracks"}
          </button>
          {reports?.some((r) => r.status === "error") && (
            <button
              type="button"
              className={btnGhost}
              disabled={submitting}
              onClick={handleRetry}
            >
              Reintentar pasos fallidos
            </button>
          )}
        </div>

        {reports && reports.length > 0 && (
          <SubmitReport
            reports={reports}
            albumId={submittedAlbumId}
            apiUrl={API_URL}
            successMessage="Tracks guardados con éxito."
          />
        )}
      </div>
    </div>
  );
}
