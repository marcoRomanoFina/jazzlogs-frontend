"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  uploadSeriesChapterCover,
  uploadSeriesChapterLandscapeCover,
} from "@/lib/series";
import {
  fieldLabel,
  fieldInput,
  fieldError,
  btnPrimary,
} from "@/components/admin/formStyles";

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Slot = "cover" | "landscape";

type State =
  | { status: "idle" }
  | { status: "loading"; slot: Slot }
  | { status: "error"; slot: Slot; message: string }
  | { status: "done"; slot: Slot };

// Two independent uploads on the same chapter — re-uploading one never
// touches the other, so each gets its own file input and submit button
// rather than sharing a single "cover" concept.
export default function SeriesChapterCoverForm() {
  const [seriesId, setSeriesId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [landscapeFile, setLandscapeFile] = useState<File | null>(null);
  const [state, setState] = useState<State>({ status: "idle" });

  function validate(file: File | null, slot: Slot): boolean {
    if (!seriesId.trim()) {
      setState({ status: "error", slot, message: "Ingresá un Series ID." });
      return false;
    }
    if (!chapterId.trim()) {
      setState({ status: "error", slot, message: "Ingresá un Chapter ID." });
      return false;
    }
    if (!file) {
      setState({
        status: "error",
        slot,
        message: "Elegí un archivo de imagen.",
      });
      return false;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setState({
        status: "error",
        slot,
        message: "Solo se aceptan JPEG, PNG o WEBP.",
      });
      return false;
    }
    if (file.size > MAX_BYTES) {
      setState({
        status: "error",
        slot,
        message: "El archivo pesa más de 50MB.",
      });
      return false;
    }
    return true;
  }

  async function handleSubmit(slot: Slot) {
    const file = slot === "cover" ? coverFile : landscapeFile;
    if (!validate(file, slot)) return;

    setState({ status: "loading", slot });
    try {
      const upload =
        slot === "cover"
          ? uploadSeriesChapterCover
          : uploadSeriesChapterLandscapeCover;
      await upload(seriesId.trim(), chapterId.trim(), file!);
      setState({ status: "done", slot });
    } catch (err) {
      setState({
        status: "error",
        slot,
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo subir la imagen.",
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

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <label className={fieldLabel} htmlFor="coverFile">
          Imagen del capítulo
        </label>
        <input
          id="coverFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[rgba(232,220,192,.7)] file:mr-3 file:rounded-full file:border-0 file:bg-[#F6D013] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#1C1A14]"
        />
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "loading" && state.slot === "cover"}
          onClick={() => handleSubmit("cover")}
        >
          {state.status === "loading" && state.slot === "cover"
            ? "Subiendo…"
            : "Subir imagen del capítulo"}
        </button>
        {state.status === "error" && state.slot === "cover" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && state.slot === "cover" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Imagen del capítulo actualizada.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <label className={fieldLabel} htmlFor="landscapeFile">
          Imagen landscape/hero
        </label>
        <input
          id="landscapeFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setLandscapeFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[rgba(232,220,192,.7)] file:mr-3 file:rounded-full file:border-0 file:bg-[#F6D013] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#1C1A14]"
        />
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "loading" && state.slot === "landscape"}
          onClick={() => handleSubmit("landscape")}
        >
          {state.status === "loading" && state.slot === "landscape"
            ? "Subiendo…"
            : "Subir imagen landscape"}
        </button>
        {state.status === "error" && state.slot === "landscape" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && state.slot === "landscape" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Imagen landscape actualizada.
          </p>
        )}
      </div>

      <p className="text-xs text-[rgba(232,220,192,.5)]">
        JPEG, PNG o WEBP, 50MB máx. cada una. Re-subir una de las dos pisa solo
        esa imagen, no afecta a la otra.
      </p>
    </div>
  );
}
