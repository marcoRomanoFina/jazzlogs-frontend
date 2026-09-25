"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  addSeriesChapter,
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
  | { status: "done"; chapterId: string; position: number };

// Adds one chapter at a time, at the end of the series (position calculated
// server-side) — the series ID stays put across submits so loading a whole
// series is just: fill the fields, hit Agregar, repeat. Audio and both
// images are separate uploads, done afterward via their own tools once this
// chapter has an ID.
export default function SeriesChapterForm() {
  const [seriesId, setSeriesId] = useState("");
  const [type, setType] = useState<ChapterType>("TRACK");
  const [trackId, setTrackId] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [audioDurationSeconds, setAudioDurationSeconds] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    if (!seriesId.trim()) {
      setState({ status: "error", message: "Ingresá un Series ID." });
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
      const chapter = await addSeriesChapter(seriesId.trim(), input);
      setState({
        status: "done",
        chapterId: chapter.id,
        position: chapter.position,
      });
      // Cleared so the next chapter can be typed straight away — seriesId
      // stays, since a whole series is loaded chapter by chapter.
      setTrackId("");
      setTitle("");
      setNote("");
      setAudioDurationSeconds("");
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo agregar el capítulo.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {state.status === "done" && (
        <p className="text-xs text-[rgba(232,220,192,.5)]">
          Chapter ID:{" "}
          <span className="select-all font-mono text-[#F6D013]">
            {state.chapterId}
          </span>{" "}
          — posición {state.position}. Usá{" "}
          <a href="/admin/series/chapters/audio" className="underline">
            Audio de capítulo
          </a>{" "}
          y{" "}
          <a href="/admin/series/chapters/cover" className="underline">
            Imágenes de capítulo
          </a>{" "}
          para cargarle el audio y las imágenes.
        </p>
      )}

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
          placeholder="Dejalo vacío si no lo sabés — no se puede sacar del archivo automáticamente"
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
          {state.status === "loading" ? "Agregando…" : "Agregar capítulo"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
      </div>
    </div>
  );
}
