"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { uploadSeriesChapterAudio } from "@/lib/series";
import {
  fieldLabel,
  fieldInput,
  fieldError,
  btnPrimary,
} from "@/components/admin/formStyles";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function SeriesChapterAudioForm() {
  const [seriesId, setSeriesId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    if (!seriesId.trim()) {
      setState({ status: "error", message: "Ingresá un Series ID." });
      return;
    }
    if (!chapterId.trim()) {
      setState({ status: "error", message: "Ingresá un Chapter ID." });
      return;
    }
    if (!file) {
      setState({ status: "error", message: "Elegí un archivo de audio." });
      return;
    }

    setState({ status: "loading" });
    try {
      await uploadSeriesChapterAudio(seriesId.trim(), chapterId.trim(), file);
      setState({ status: "done" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo subir el audio.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={fieldLabel} htmlFor="seriesId">
          Series ID *
        </label>
        <input
          id="seriesId"
          className={fieldInput}
          placeholder="UUID de la serie"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="chapterId">
          Chapter ID *
        </label>
        <input
          id="chapterId"
          className={fieldInput}
          placeholder="UUID del capítulo"
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="file">
          Audio *
        </label>
        <input
          id="file"
          type="file"
          accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,.mp3,.m4a,.wav"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[rgba(232,220,192,.7)] file:mr-3 file:rounded-full file:border-0 file:bg-[#F6D013] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#1C1A14]"
        />
        <p className="mt-1.5 text-xs text-[rgba(232,220,192,.5)]">
          MP3, M4A o WAV. Reemplaza el audio anterior — no hace falta borrar
          nada antes.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "loading"}
          onClick={handleSubmit}
        >
          {state.status === "loading" ? "Subiendo…" : "Subir audio"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Audio actualizado — audioObjectKey/audioContentType/
            audioFileSizeBytes ahora reflejan este archivo (GET /series/
            {"{id}"}).
          </p>
        )}
      </div>
    </div>
  );
}
