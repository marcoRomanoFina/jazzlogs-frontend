"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  createSeries,
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
  | { status: "done"; id: string };

export default function SeriesForm() {
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
      const series = await createSeries(input);
      setState({ status: "done", id: series.id });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo crear la serie.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {state.status === "done" && (
        <p className="text-xs text-[rgba(232,220,192,.5)]">
          Series ID:{" "}
          <span className="select-all font-mono text-[#F6D013]">
            {state.id}
          </span>{" "}
          — nace en borrador, sin portada ni capítulos. Usá{" "}
          <a href="/admin/series/cover" className="underline">
            Cover de serie
          </a>{" "}
          para cargarle la portada, y cuando esté lista,{" "}
          <a href="/admin/series/publish" className="underline">
            Publicar serie
          </a>{" "}
          para que la vea todo el mundo.
        </p>
      )}

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
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "loading"}
          onClick={handleSubmit}
        >
          {state.status === "loading" ? "Creando…" : "Crear serie"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
      </div>
    </div>
  );
}
