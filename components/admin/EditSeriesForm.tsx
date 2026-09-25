"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  updateSeriesMetadata,
  type SeriesMetadataInput,
  type SeriesVoice,
} from "@/lib/series";
import {
  STYLE_OPTIONS,
  MOOD_OPTIONS,
  CONTEXT_OPTIONS,
  INSTRUMENT_OPTIONS,
} from "@/lib/constants/album";
import CheckboxGroup from "@/components/admin/CheckboxGroup";
import {
  fieldLabel,
  fieldInput,
  fieldSelect,
  fieldError,
  btnPrimary,
} from "@/components/admin/formStyles";

const VOICE_OPTIONS: SeriesVoice[] = [
  "MARK",
  "LAURA",
  "ALICE",
  "ADAM",
  "JAMES",
  "ALLIE",
  "BOB",
  "NATALIE",
];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

// A full metadata replace, not a partial patch — same as the backend's own
// PUT /series/{id}. Never touches cover, status or chapters; those go
// through Cover de serie, Publicar serie and the (future) chapter tools.
export default function EditSeriesForm() {
  const [seriesId, setSeriesId] = useState("");
  const [title, setTitle] = useState("");
  const [dek, setDek] = useState("");
  const [description, setDescription] = useState("");
  const [voice, setVoice] = useState<SeriesVoice | "">("");
  const [styleCodes, setStyleCodes] = useState<string[]>([]);
  const [moodCodes, setMoodCodes] = useState<string[]>([]);
  const [contextCodes, setContextCodes] = useState<string[]>([]);
  const [instrumentCodes, setInstrumentCodes] = useState<string[]>([]);
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    const id = seriesId.trim();
    if (!id) {
      setState({ status: "error", message: "Ingresá un Series ID." });
      return;
    }
    if (!title.trim()) {
      setState({ status: "error", message: "Ingresá al menos un título." });
      return;
    }
    if (!voice) {
      setState({ status: "error", message: "Elegí una voz." });
      return;
    }

    setState({ status: "loading" });
    const input: SeriesMetadataInput = {
      title: title.trim(),
      dek: dek.trim() || null,
      description: description.trim() || null,
      voice,
      styleCodes,
      moodCodes,
      contextCodes,
      instrumentCodes,
    };
    try {
      await updateSeriesMetadata(id, input);
      setState({ status: "done" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo actualizar la serie.",
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
        <label className={fieldLabel} htmlFor="title">
          Título *
        </label>
        <input
          id="title"
          className={fieldInput}
          placeholder="The Bebop Chronicles"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="dek">
          Dek
        </label>
        <input
          id="dek"
          className={fieldInput}
          placeholder="Bajada corta de la serie…"
          value={dek}
          onChange={(e) => setDek(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className={fieldInput}
          placeholder="Texto largo de la serie…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="voice">
          Voice *
        </label>
        <select
          id="voice"
          className={fieldSelect}
          value={voice}
          onChange={(e) => setVoice(e.target.value as SeriesVoice)}
        >
          <option value="" disabled>
            Elegí un narrador…
          </option>
          {VOICE_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-[rgba(232,220,192,.5)]">
          Es un reemplazo completo — reingresá la voz actual de la serie si no
          la querés cambiar.
        </p>
      </div>

      <div>
        <label className={fieldLabel}>Styles</label>
        <CheckboxGroup
          options={STYLE_OPTIONS}
          value={styleCodes}
          onChange={setStyleCodes}
        />
      </div>

      <div>
        <label className={fieldLabel}>Moods</label>
        <CheckboxGroup
          options={MOOD_OPTIONS}
          value={moodCodes}
          onChange={setMoodCodes}
        />
      </div>

      <div>
        <label className={fieldLabel}>Contexts</label>
        <CheckboxGroup
          options={CONTEXT_OPTIONS}
          value={contextCodes}
          onChange={setContextCodes}
        />
      </div>

      <div>
        <label className={fieldLabel}>Featured instruments</label>
        <CheckboxGroup
          options={INSTRUMENT_OPTIONS}
          value={instrumentCodes}
          onChange={setInstrumentCodes}
        />
        <p className="mt-1.5 text-xs text-[rgba(232,220,192,.5)]">
          Dejar todo sin marcar en cualquiera de los cuatro grupos NO borra
          los tags que ya tenía la serie — hoy no hay forma de vaciarlos,
          solo de reemplazarlos por otros acá.
        </p>
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
            Metadata actualizada.
          </p>
        )}
      </div>
    </div>
  );
}
