"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  updateSeriesChapter,
  type ChapterType,
  type SeriesChapterInput,
} from "@/lib/series";
import {
  fieldLabel,
  fieldInput,
  fieldSelect,
  fieldError,
  btnPrimary,
} from "@/components/admin/formStyles";

const TYPE_OPTIONS: ChapterType[] = ["INTRO", "TRACK", "OUTRO"];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

// A full replace of the chapter's editorial fields, not a partial patch —
// same as the backend's own PATCH /series/{id}/chapters/{chapterId}. Never
// touches position, audio file fields or either image; those go through
// Audio de capítulo and Imágenes de capítulo.
export default function EditSeriesChapterForm() {
  const [seriesId, setSeriesId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [type, setType] = useState<ChapterType>("TRACK");
  const [trackId, setTrackId] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [audioDurationSeconds, setAudioDurationSeconds] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    const sId = seriesId.trim();
    const cId = chapterId.trim();
    if (!sId) {
      setState({ status: "error", message: "Ingresá un Series ID." });
      return;
    }
    if (!cId) {
      setState({ status: "error", message: "Ingresá un Chapter ID." });
      return;
    }
    if (type !== "OUTRO" && !trackId.trim()) {
      setState({
        status: "error",
        message: "Todo capítulo necesita un Track ID, salvo el OUTRO.",
      });
      return;
    }

    setState({ status: "loading" });
    const input: SeriesChapterInput = {
      type,
      trackId: type !== "OUTRO" ? trackId.trim() : null,
      title: title.trim() || null,
      note: note.trim() || null,
      audioDurationSeconds: audioDurationSeconds.trim()
        ? Number(audioDurationSeconds.trim())
        : null,
    };
    try {
      await updateSeriesChapter(sId, cId, input);
      setState({ status: "done" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo actualizar el capítulo.",
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
        <label className={fieldLabel} htmlFor="type">
          Type *
        </label>
        <select
          id="type"
          className={fieldSelect}
          value={type}
          onChange={(e) => setType(e.target.value as ChapterType)}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {type !== "OUTRO" && (
        <div>
          <label className={fieldLabel} htmlFor="trackId">
            Track ID *
          </label>
          <input
            id="trackId"
            className={fieldInput}
            placeholder="UUID del track existente en el catálogo"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className={fieldLabel} htmlFor="title">
          Título
        </label>
        <input
          id="title"
          className={fieldInput}
          placeholder="Título del capítulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="note">
          Note
        </label>
        <textarea
          id="note"
          rows={3}
          className={fieldInput}
          placeholder="Texto del capítulo…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="audioDurationSeconds">
          Audio duration (s)
        </label>
        <input
          id="audioDurationSeconds"
          type="number"
          min={0}
          className={fieldInput}
          placeholder="Dejalo vacío si no lo sabés"
          value={audioDurationSeconds}
          onChange={(e) => setAudioDurationSeconds(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "loading"}
          onClick={handleSubmit}
        >
          {state.status === "loading" ? "Guardando…" : "Guardar cambios"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Capítulo actualizado.
          </p>
        )}
      </div>
    </div>
  );
}
