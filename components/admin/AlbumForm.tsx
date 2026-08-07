"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  albumFormSchema,
  albumFormDefaultValues,
  type AlbumFormValues,
} from "@/lib/validations/album";
import FichaSection from "@/components/admin/sections/FichaSection";
import SubmitReport from "@/components/admin/SubmitReport";
import {
  submitFicha,
  type StepReport,
} from "@/components/admin/runAlbumSubmission";
import { btnPrimary } from "@/components/admin/formStyles";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function AlbumForm() {
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<StepReport[] | null>(null);

  const methods = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: albumFormDefaultValues,
  });

  async function handleSave() {
    const valid = await methods.trigger();
    if (!valid) return;

    setSubmitting(true);
    const values = methods.getValues();
    const { albumId: newAlbumId, reports: finalReports } = await submitFicha(
      values,
      setReports,
    );
    if (newAlbumId) setAlbumId(newAlbumId);
    setReports(finalReports);
    setSubmitting(false);
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-6">
        {albumId && (
          <p className="text-xs text-[rgba(233,230,223,.5)]">
            Album ID:{" "}
            <span className="select-all font-mono text-[#d99b10]">
              {albumId}
            </span>{" "}
            — usalo en{" "}
            <a href="/admin/tracks/new" className="underline">
              Nuevo track
            </a>
            ,{" "}
            <a href="/admin/albums/editorial" className="underline">
              Editorial de álbum
            </a>
            ,{" "}
            <a href="/admin/albums/tags" className="underline">
              Tags de álbum
            </a>{" "}
            o{" "}
            <a href="/admin/albums/personnel" className="underline">
              Personnel de álbum
            </a>
            .
          </p>
        )}

        <FichaSection />

        <div className="flex flex-col gap-4 border-t border-[rgba(233,230,223,.12)] pt-5">
          <button
            type="button"
            className={btnPrimary}
            disabled={submitting}
            onClick={handleSave}
          >
            {submitting ? "Guardando…" : "Guardar ficha"}
          </button>

          {reports && reports.length > 0 && (
            <SubmitReport
              reports={reports}
              albumId={albumId}
              apiUrl={API_URL}
              successMessage="Ficha guardada con éxito."
            />
          )}
        </div>
      </div>
    </FormProvider>
  );
}
