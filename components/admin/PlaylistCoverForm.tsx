"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { uploadPlaylistCover } from "@/lib/playlists";
import {
  fieldLabel,
  fieldInput,
  fieldError,
  btnPrimary,
} from "@/components/admin/formStyles";

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function PlaylistCoverForm() {
  const [playlistId, setPlaylistId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    if (!playlistId.trim()) {
      setState({ status: "error", message: "Ingresá un Playlist ID." });
      return;
    }
    if (!file) {
      setState({ status: "error", message: "Elegí un archivo de imagen." });
      return;
    }
    // Same limits the backend enforces — catching it here saves a round
    // trip, but the backend still 413s/400s if this ever gets out of sync.
    if (!ALLOWED_TYPES.includes(file.type)) {
      setState({
        status: "error",
        message: "Solo se aceptan JPEG, PNG o WEBP.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      setState({ status: "error", message: "El archivo pesa más de 50MB." });
      return;
    }

    setState({ status: "loading" });
    try {
      await uploadPlaylistCover(playlistId.trim(), file);
      setState({ status: "done" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo subir la portada.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={fieldLabel} htmlFor="playlistId">
          Playlist ID *
        </label>
        <input
          id="playlistId"
          className={fieldInput}
          placeholder="UUID de la playlist"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="file">
          Imagen *
        </label>
        <input
          id="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[rgba(232,220,192,.7)] file:mr-3 file:rounded-full file:border-0 file:bg-[#F6D013] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#1C1A14]"
        />
        <p className="mt-1.5 text-xs text-[rgba(232,220,192,.5)]">
          JPEG, PNG o WEBP, 50MB máx. Reemplaza la portada anterior — no hace
          falta borrar nada antes.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "loading"}
          onClick={handleSubmit}
        >
          {state.status === "loading" ? "Subiendo…" : "Subir portada"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Portada actualizada — el coverImageUrl nuevo aparece la próxima
            vez que se pida la playlist (GET /playlists/{"{id}"}).
          </p>
        )}
      </div>
    </div>
  );
}
