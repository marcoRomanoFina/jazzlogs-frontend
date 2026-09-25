"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  createPlaylist,
  type PlaylistMetadataInput,
  type PlaylistType,
  type PlaylistVoice,
} from "@/lib/playlists";
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

const BYLINE_OPTIONS: PlaylistVoice[] = [
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

export default function PlaylistForm() {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [type, setType] = useState<PlaylistType>("STANDARD");
  const [byline, setByline] = useState<PlaylistVoice | "">("");
  const [styleCodes, setStyleCodes] = useState<string[]>([]);
  const [moodCodes, setMoodCodes] = useState<string[]>([]);
  const [contextCodes, setContextCodes] = useState<string[]>([]);
  const [instrumentCodes, setInstrumentCodes] = useState<string[]>([]);
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    if (!title.trim()) {
      setState({
        status: "error",
        message: "Ingresá al menos un título.",
      });
      return;
    }
    if (!byline) {
      setState({ status: "error", message: "Elegí una voz para el byline." });
      return;
    }

    setState({ status: "loading" });
    const input: PlaylistMetadataInput = {
      title: title.trim(),
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      coverImageUrl: coverImageUrl.trim() || null,
      spotifyUrl: spotifyUrl.trim() || null,
      type,
      byline,
      styleCodes,
      moodCodes,
      contextCodes,
      instrumentCodes,
    };
    try {
      const id = await createPlaylist(input);
      setState({ status: "done", id });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo crear la playlist.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {state.status === "done" && (
        <p className="text-xs text-[rgba(232,220,192,.5)]">
          Playlist ID:{" "}
          <span className="select-all font-mono text-[#F6D013]">
            {state.id}
          </span>{" "}
          — nace en borrador. Usalo en{" "}
          <a href="/admin/playlists/tracks" className="underline">
            Agregar track a playlist
          </a>{" "}
          y{" "}
          <a href="/admin/playlists/cover" className="underline">
            Cover de playlist
          </a>{" "}
          para cargarla, y cuando esté lista, en{" "}
          <a href="/admin/playlists/publish" className="underline">
            Publicar playlist
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
          placeholder="Rainy-day ballads"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          className={fieldInput}
          placeholder="For the hours when the light goes grey…"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
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
          placeholder="Texto largo de la playlist…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="coverImageUrl">
          Cover image URL
        </label>
        <input
          id="coverImageUrl"
          className={fieldInput}
          placeholder="Opcional acá — para subir el archivo real usá Cover de playlist después"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="spotifyUrl">
          Spotify URL
        </label>
        <input
          id="spotifyUrl"
          className={fieldInput}
          placeholder="https://open.spotify.com/playlist/…"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
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
          onChange={(e) => setType(e.target.value as PlaylistType)}
        >
          <option value="STANDARD">Standard</option>
          <option value="JOURNEY">Journey</option>
        </select>
        <p className="mt-1.5 text-xs text-[rgba(232,220,192,.5)]">
          Solo clasificación por ahora — no cambia nada del comportamiento
          (orden de tracks, etc.).
        </p>
      </div>

      <div>
        <label className={fieldLabel} htmlFor="byline">
          Byline (voz) *
        </label>
        <select
          id="byline"
          className={fieldSelect}
          value={byline}
          onChange={(e) => setByline(e.target.value as PlaylistVoice)}
        >
          <option value="" disabled>
            Elegí una voz
          </option>
          {BYLINE_OPTIONS.map((v) => (
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
          {state.status === "loading" ? "Creando…" : "Crear playlist"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
      </div>
    </div>
  );
}
