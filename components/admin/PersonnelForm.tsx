"use client";

import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  albumPersonnelFormSchema,
  albumPersonnelFormDefaultValues,
  emptyPersonnelRow,
  type AlbumPersonnelFormValues,
} from "@/lib/validations/personnel";
import { PERSONNEL_ROLES, INSTRUMENT_OPTIONS } from "@/lib/constants/album";
import { buildPersonnelSteps } from "@/components/admin/personnelSubmission";
import {
  submitSteps,
  retryFailedSteps,
  type StepReport,
} from "@/components/admin/runAlbumSubmission";
import SubmitReport from "@/components/admin/SubmitReport";
import CheckboxGroup from "@/components/admin/CheckboxGroup";
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

// No FormProvider here (this is the only form on the page), so register/
// errors come down as props instead of via useFormContext.
function PersonnelRow({
  control,
  register,
  errors,
  index,
  onRemove,
}: {
  control: Control<AlbumPersonnelFormValues>;
  register: UseFormRegister<AlbumPersonnelFormValues>;
  errors: FieldErrors<AlbumPersonnelFormValues>;
  index: number;
  onRemove: () => void;
}) {
  return (
    <div className={rowCard}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
        <div>
          <label className={fieldLabel}>Artist ID</label>
          <input
            className={fieldInput}
            {...register(`personnel.${index}.artistId` as const)}
          />
          {errors.personnel?.[index]?.artistId && (
            <p className={fieldError}>
              {errors.personnel[index]?.artistId?.message}
            </p>
          )}
        </div>

        <div>
          <label className={fieldLabel}>Role</label>
          <select
            className={fieldSelect}
            {...register(`personnel.${index}.role` as const)}
          >
            {PERSONNEL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="pb-2.5">
          <button
            type="button"
            className={btnIcon}
            onClick={onRemove}
            aria-label="Eliminar personnel"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mt-3">
        <label className={fieldLabel}>Instruments</label>
        <Controller
          control={control}
          name={`personnel.${index}.instruments` as const}
          render={({ field }) => (
            <CheckboxGroup
              options={INSTRUMENT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
}

export default function PersonnelForm() {
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<StepReport[] | null>(null);
  const [submittedAlbumId, setSubmittedAlbumId] = useState<string | null>(null);

  const {
    register,
    control,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<AlbumPersonnelFormValues>({
    resolver: zodResolver(albumPersonnelFormSchema),
    defaultValues: albumPersonnelFormDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "personnel",
  });

  async function handleSave() {
    const valid = await trigger(["albumId", "personnel"]);
    if (!valid) return;

    setSubmitting(true);
    const values = getValues();
    setSubmittedAlbumId(values.albumId);
    const steps = buildPersonnelSteps(values.personnel, values.albumId);
    const updated = await submitSteps(steps, setReports);
    setReports(updated);
    setSubmitting(false);
  }

  async function handleRetry() {
    if (!reports) return;
    setSubmitting(true);
    const values = getValues();
    const steps = buildPersonnelSteps(values.personnel, values.albumId);
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
          <span className={fieldLabel + " mb-0"}>Personnel</span>
          <button
            type="button"
            className={btnGhost}
            onClick={() => append(emptyPersonnelRow)}
          >
            + Agregar personnel
          </button>
        </div>

        {fields.map((field, index) => (
          <PersonnelRow
            key={field.id}
            control={control}
            register={register}
            errors={errors}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}

        {fields.length === 0 && (
          <p className="text-sm text-[rgba(233,230,223,.5)]">
            Todavía no agregaste ningún personnel.
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
            {submitting ? "Guardando…" : "Guardar personnel"}
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
            successMessage="Personnel guardado con éxito."
          />
        )}
      </div>
    </div>
  );
}
