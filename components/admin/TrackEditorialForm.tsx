"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  trackEditorialFormSchema,
  trackEditorialFormDefaultValues,
  type TrackEditorialFormValues,
} from "@/lib/validations/trackEditorial";
import { emptyEditorialBlock } from "@/lib/validations/editorialBlock";
import { EDITORIAL_VOICE_OPTIONS } from "@/lib/editorials";
import {
  EDITORIAL_BLOCK_TYPES,
  BLOCK_CONTENT_CATEGORY_OPTIONS,
} from "@/lib/constants/album";
import { apiFetch, ApiError } from "@/lib/api";
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

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function TrackEditorialForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  const {
    register,
    control,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<TrackEditorialFormValues>({
    resolver: zodResolver(trackEditorialFormSchema),
    defaultValues: trackEditorialFormDefaultValues,
  });

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "blocks",
  });

  async function onSubmit() {
    const valid = await trigger();
    if (!valid) return;

    setState({ status: "submitting" });
    const values = getValues();
    try {
      await apiFetch(`/tracks/${values.trackId}/editorial`, {
        method: "POST",
        body: JSON.stringify({
          title: values.title,
          dek: values.dek,
          logNumber: values.logNumber,
          byline: values.byline || undefined,
          blocks: values.blocks.map((b) => ({
            type: b.type,
            subhead: b.subhead?.trim() || undefined,
            text: b.text,
            contentCategory: b.contentCategory,
          })),
        }),
      });
      setState({ status: "done" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo guardar.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={fieldLabel} htmlFor="trackId">
          Track ID *
        </label>
        <input id="trackId" className={fieldInput} {...register("trackId")} />
        {errors.trackId && (
          <p className={fieldError}>{errors.trackId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={fieldLabel} htmlFor="title">
            Title *
          </label>
          <input id="title" className={fieldInput} {...register("title")} />
          {errors.title && <p className={fieldError}>{errors.title.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={fieldLabel} htmlFor="dek">
            Dek *
          </label>
          <textarea
            id="dek"
            rows={2}
            className={fieldInput}
            {...register("dek")}
          />
          {errors.dek && <p className={fieldError}>{errors.dek.message}</p>}
        </div>

        <div>
          <label className={fieldLabel} htmlFor="logNumber">
            Log number *
          </label>
          <input
            id="logNumber"
            className={fieldInput}
            placeholder="042"
            {...register("logNumber")}
          />
          {errors.logNumber && (
            <p className={fieldError}>{errors.logNumber.message}</p>
          )}
        </div>

        <div>
          <label className={fieldLabel} htmlFor="byline">
            Byline
          </label>
          <select id="byline" className={fieldSelect} {...register("byline")}>
            <option value="">— (defaults to Jazzlogs)</option>
            {EDITORIAL_VOICE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-3">
          <span className={fieldLabel + " mb-0"}>Bloques</span>
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div key={field.id} className={rowCard}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <select
                  className={fieldSelect + " w-36"}
                  {...register(`blocks.${index}.type` as const)}
                >
                  {EDITORIAL_BLOCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <select
                  className={fieldSelect + " w-56"}
                  {...register(`blocks.${index}.contentCategory` as const)}
                >
                  {BLOCK_CONTENT_CATEGORY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div className="ml-auto flex gap-1.5">
                  <button
                    type="button"
                    className={btnIcon}
                    disabled={index === 0}
                    onClick={() => swap(index, index - 1)}
                    aria-label="Mover arriba"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={btnIcon}
                    disabled={index === fields.length - 1}
                    onClick={() => swap(index, index + 1)}
                    aria-label="Mover abajo"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={btnIcon}
                    onClick={() => remove(index)}
                    aria-label="Eliminar bloque"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <input
                className={fieldInput + " mb-2"}
                placeholder="Subhead (opcional)"
                {...register(`blocks.${index}.subhead` as const)}
              />

              <textarea
                rows={3}
                className={fieldInput}
                placeholder="Texto del bloque…"
                {...register(`blocks.${index}.text` as const)}
              />
              {errors.blocks?.[index]?.text && (
                <p className={fieldError}>
                  {errors.blocks[index]?.text?.message}
                </p>
              )}
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-[rgba(232,220,192,.5)]">
              Todavía no agregaste ningún bloque.
            </p>
          )}

          <button
            type="button"
            className={btnGhost + " self-start"}
            onClick={() => append(emptyEditorialBlock)}
          >
            + Agregar bloque
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "submitting"}
          onClick={onSubmit}
        >
          {state.status === "submitting" ? "Guardando…" : "Guardar editorial"}
        </button>
        {state.status === "error" && (
          <p className="text-sm text-[#e9a3a3]">{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Editorial guardada con éxito.
          </p>
        )}
      </div>
    </div>
  );
}
