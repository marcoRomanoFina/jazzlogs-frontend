"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { addPlaylistTrack } from "@/lib/playlists";
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
  | { status: "done"; position: number };

// Adds one track at a time, at the end of the tracklist (position =
// current trackCount) — the playlist ID stays put across submits so
// loading a whole tracklist is just: fill Track ID + title + note, hit
// Agregar, repeat. Title and curator note are both required by the
// backend now, not optional re-namings.
export default function PlaylistTrackForm() {
  const [playlistId, setPlaylistId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [title, setTitle] = useState("");
  const [curatorNote, setCuratorNote] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    if (
      !playlistId.trim() ||
      !trackId.trim() ||
      !title.trim() ||
      !curatorNote.trim()
    ) {
      setState({
        status: "error",
        message:
          "Ingresá un Playlist ID, un Track ID, un título y una curator note.",
      });
      return;
    }

    setState({ status: "loading" });
    try {
      const row = await addPlaylistTrack(playlistId.trim(), {
        trackId: trackId.trim(),
        title: title.trim(),
        curatorNote: curatorNote.trim(),
      });
      setState({ status: "done", position: row.position });
      // Cleared so the next track can be typed straight away — playlistId
      // stays, since a whole tracklist is loaded into the same playlist.
      setTrackId("");
      setTitle("");
      setCuratorNote("");
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? err.status === 409
              ? "Ese track ya está en la playlist."
              : `${err.status}: ${err.message}`
            : "No se pudo agregar el track.",
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
          placeholder="UUID de la playlist (lo devuelve Nueva playlist al crearla)"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
        />
      </div>

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

      <div>
        <label className={fieldLabel} htmlFor="title">
          Título en esta playlist *
        </label>
        <input
          id="title"
          className={fieldInput}
          placeholder="Re-nombra el track solo dentro de esta playlist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="curatorNote">
          Curator note *
        </label>
        <textarea
          id="curatorNote"
          rows={2}
          className={fieldInput}
          placeholder="El comentario del curador para esta entrada"
          value={curatorNote}
          onChange={(e) => setCuratorNote(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "loading"}
          onClick={handleSubmit}
        >
          {state.status === "loading" ? "Agregando…" : "Agregar track"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Track agregado en la posición {state.position}.
          </p>
        )}
      </div>
    </div>
  );
}
