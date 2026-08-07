"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  artistTagsFormSchema,
  artistTagsFormDefaultValues,
  type ArtistTagsFormValues,
} from "@/lib/validations/artistTags";
import {
  STYLE_OPTIONS,
  CONTEXT_OPTIONS,
  INSTRUMENT_OPTIONS,
} from "@/lib/constants/album";
import { buildArtistTagSteps } from "@/components/admin/artistTagSubmission";
import {
  submitSteps,
  retryFailedSteps,
  type StepReport,
} from "@/components/admin/runAlbumSubmission";
import SubmitReport from "@/components/admin/SubmitReport";
import CheckboxGroup from "@/components/admin/CheckboxGroup";
import { apiFetch, ApiError } from "@/lib/api";
import {
  fieldLabel,
  fieldInput,
  fieldSelect,
  fieldError,
  btnPrimary,
  btnGhost,
} from "@/components/admin/formStyles";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ArtistTagsSnapshot {
  instruments: { code: string }[];
  styles: { code: string }[];
  contexts: { code: string }[];
}

export default function ArtistTagsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<StepReport[] | null>(null);
  const [submittedArtistId, setSubmittedArtistId] = useState<string | null>(
    null,
  );
  const [loadState, setLoadState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "done" }
  >({ status: "idle" });

  const {
    register,
    control,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ArtistTagsFormValues>({
    resolver: zodResolver(artistTagsFormSchema),
    defaultValues: artistTagsFormDefaultValues,
  });

  // styles/contexts are a full replace (PUT) now, not add-one — loading
  // what's already there first means unchecked boxes don't silently wipe
  // existing tags.
  async function handleLoadCurrent() {
    const valid = await trigger(["artistId"]);
    if (!valid) return;

    setLoadState({ status: "loading" });
    try {
      const artist = await apiFetch<ArtistTagsSnapshot>(
        `/artists/${getValues("artistId")}`,
      );
      setValue("primaryInstrument", artist.instruments[0]?.code ?? "");
      setValue(
        "styles",
        artist.styles.map((t) => t.code),
      );
      setValue(
        "contexts",
        artist.contexts.map((t) => t.code),
      );
      setLoadState({ status: "done" });
    } catch (err) {
      setLoadState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo cargar el artista.",
      });
    }
  }

  async function handleSave() {
    const valid = await trigger(["artistId"]);
    if (!valid) return;

    setSubmitting(true);
    const values = getValues();
    setSubmittedArtistId(values.artistId);
    const steps = buildArtistTagSteps(values, values.artistId);
    const updated = await submitSteps(steps, setReports);
    setReports(updated);
    setSubmitting(false);
  }

  async function handleRetry() {
    if (!reports) return;
    setSubmitting(true);
    const values = getValues();
    const steps = buildArtistTagSteps(values, values.artistId);
    const updated = await retryFailedSteps(steps, reports, setReports);
    setReports(updated);
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <label className={fieldLabel} htmlFor="artistId">
          Artist ID *
        </label>
        <div className="flex gap-2">
          <input
            id="artistId"
            className={fieldInput}
            {...register("artistId")}
          />
          <button
            type="button"
            className={btnGhost}
            disabled={loadState.status === "loading"}
            onClick={handleLoadCurrent}
          >
            {loadState.status === "loading"
              ? "Cargando…"
              : "Cargar tags actuales"}
          </button>
        </div>
        {errors.artistId && (
          <p className={fieldError}>{errors.artistId.message}</p>
        )}
        {loadState.status === "error" && (
          <p className={fieldError}>{loadState.message}</p>
        )}
        {loadState.status === "done" && (
          <p className="mt-1 text-xs text-[#7fbf7f]">Tags actuales cargados.</p>
        )}
      </div>

      <div>
        <label className={fieldLabel} htmlFor="primaryInstrument">
          Primary instrument
        </label>
        <select
          id="primaryInstrument"
          className={fieldSelect}
          {...register("primaryInstrument")}
        >
          <option value="">—</option>
          {INSTRUMENT_OPTIONS.map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={fieldLabel}>Styles</span>
        <Controller
          control={control}
          name="styles"
          render={({ field }) => (
            <CheckboxGroup
              options={STYLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div>
        <span className={fieldLabel}>Contexts</span>
        <Controller
          control={control}
          name="contexts"
          render={({ field }) => (
            <CheckboxGroup
              options={CONTEXT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-[rgba(233,230,223,.12)] pt-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={btnPrimary}
            disabled={submitting}
            onClick={handleSave}
          >
            {submitting ? "Guardando…" : "Guardar tags"}
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
            albumId={submittedArtistId}
            apiUrl={API_URL}
            successMessage="Tags guardados con éxito."
            showAlbumLink={false}
          />
        )}
      </div>
    </div>
  );
}
