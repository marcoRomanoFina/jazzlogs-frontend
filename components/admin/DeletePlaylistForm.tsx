"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { deletePlaylist } from "@/lib/playlists";
import {
  fieldLabel,
  fieldInput,
  fieldError,
} from "@/components/admin/formStyles";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

// Hard delete, no undo — requires re-typing the id as a confirmation step
// (not just a click) before the button even enables, since there's no
// modal/confirm-dialog machinery in these lightweight admin forms to lean
// on instead.
export default function DeletePlaylistForm() {
  const [playlistId, setPlaylistId] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const trimmedId = playlistId.trim();
  const canDelete = trimmedId.length > 0 && confirmId.trim() === trimmedId;

  async function handleDelete() {
    if (!canDelete) return;

    setState({ status: "loading" });
    try {
      await deletePlaylist(trimmedId);
      setState({ status: "done" });
      setPlaylistId("");
      setConfirmId("");
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo borrar la playlist.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border-[1.5px] border-[rgba(217,60,60,.5)] bg-[rgba(217,60,60,.08)] px-4 py-3 text-sm text-[#e9a3a3]">
        Esto borra la playlist por completo — metadata, tracks, likes,
        listens, saved items y su nodo en Neo4j. No hay soft-delete ni
        recuperación después de esto.
      </div>

      <div>
        <label className={fieldLabel} htmlFor="playlistId">
          Playlist ID *
        </label>
        <input
          id="playlistId"
          className={fieldInput}
          placeholder="UUID de la playlist a borrar"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="confirmId">
          Escribí el mismo ID de nuevo para confirmar *
        </label>
        <input
          id="confirmId"
          className={fieldInput}
          placeholder="Repetí el Playlist ID de arriba"
          value={confirmId}
          onChange={(e) => setConfirmId(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <button
          type="button"
          className="self-start rounded-full bg-[#d94b3c] px-5 py-2.5 text-sm font-bold text-[#1C1A14] transition-colors hover:bg-[#e05c4d] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canDelete || state.status === "loading"}
          onClick={handleDelete}
        >
          {state.status === "loading" ? "Borrando…" : "Borrar playlist"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Playlist borrada.
          </p>
        )}
      </div>
    </div>
  );
}
