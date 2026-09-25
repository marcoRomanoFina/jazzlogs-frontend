"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  trackTagsFormSchema,
  trackTagsFormDefaultValues,
  type TrackTagsFormValues,
} from "@/lib/validations/trackTags";
import {
  STYLE_OPTIONS,
  MOOD_OPTIONS,
  CONTEXT_OPTIONS,
  RHYTHM_OPTIONS,
  INSTRUMENT_OPTIONS,
} from "@/lib/constants/album";
import { buildTrackTagSteps } from "@/components/admin/trackTagSubmission";
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
  fieldError,
  btnPrimary,
  btnGhost,
} from "@/components/admin/formStyles";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface TrackTagsSnapshot {
  styles: { code: string }[];
  moods: { code: string }[];
  contexts: { code: string }[];
  rhythms: { code: string }[];
  instruments: { code: string }[];
}

export default function TrackTagsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<StepReport[] | null>(null);
  const [submittedTrackId, setSubmittedTrackId] = useState<string | null>(null);
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
  } = useForm<TrackTagsFormValues>({
    resolver: zodResolver(trackTagsFormSchema),
    defaultValues: trackTagsFormDefaultValues,
  });

  // PUT is a full replace now, not add-one — loading what's already there
  // first means unchecked boxes don't silently wipe existing tags.
  async function handleLoadCurrent() {
    const valid = await trigger(["trackId"]);
    if (!valid) return;

    setLoadState({ status: "loading" });
    try {
      const track = await apiFetch<TrackTagsSnapshot>(
        `/tracks/${getValues("trackId")}/tags`,
      );
      setValue(
        "styles",
        track.styles.map((t) => t.code),
      );
      setValue(
        "moods",
        track.moods.map((t) => t.code),
      );
      setValue(
        "contexts",
        track.contexts.map((t) => t.code),
      );
      setValue(
        "rhythms",
        track.rhythms.map((t) => t.code),
      );
      setValue(
        "instruments",
        track.instruments.map((t) => t.code),
      );
      setLoadState({ status: "done" });
    } catch (err) {
      setLoadState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo cargar el track.",
      });
    }
  }

  async function handleSave() {
    const valid = await trigger(["trackId"]);
    if (!valid) return;

    setSubmitting(true);
    const values = getValues();
    setSubmittedTrackId(values.trackId);
    const steps = buildTrackTagSteps(values, values.trackId);
    const updated = await submitSteps(steps, setReports);
    setReports(updated);
    setSubmitting(false);
  }

  async function handleRetry() {
    if (!reports) return;
    setSubmitting(true);
    const values = getValues();
    const steps = buildTrackTagSteps(values, values.trackId);
    const updated = await retryFailedSteps(steps, reports, setReports);
    setReports(updated);
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <label className={fieldLabel} htmlFor="trackId">
          Track ID *
        </label>
        <div className="flex gap-2">
          <input id="trackId" className={fieldInput} {...register("trackId")} />
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
        {errors.trackId && (
          <p className={fieldError}>{errors.trackId.message}</p>
        )}
        {loadState.status === "error" && (
          <p className={fieldError}>{loadState.message}</p>
        )}
        {loadState.status === "done" && (
          <p className="mt-1 text-xs text-[#7fbf7f]">Tags actuales cargados.</p>
        )}
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
        <span className={fieldLabel}>Moods</span>
        <Controller
          control={control}
          name="moods"
          render={({ field }) => (
            <CheckboxGroup
              options={MOOD_OPTIONS}
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

      <div>
        <span className={fieldLabel}>Rhythms</span>
        <Controller
          control={control}
          name="rhythms"
          render={({ field }) => (
            <CheckboxGroup
              options={RHYTHM_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div>
        <span className={fieldLabel}>Featured instruments</span>
        <Controller
          control={control}
          name="instruments"
          render={({ field }) => (
            <CheckboxGroup
              options={INSTRUMENT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-[rgba(232,220,192,.12)] pt-5">
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
            albumId={submittedTrackId}
            apiUrl={API_URL}
            successMessage="Tags guardados con éxito."
            showAlbumLink={false}
          />
        )}
      </div>
    </div>
  );
}
