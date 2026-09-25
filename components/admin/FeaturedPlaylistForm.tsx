"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { setPlaylistFeatured, clearPlaylistFeatured } from "@/lib/playlists";
import {
  fieldLabel,
  fieldInput,
  fieldError,
  btnPrimary,
  btnGhost,
} from "@/components/admin/formStyles";

type Action = "set" | "clear";

type State =
  | { status: "idle" }
  | { status: "loading"; action: Action }
  | { status: "error"; message: string }
  | { status: "done"; action: Action };

export default function FeaturedPlaylistForm() {
  const [playlistId, setPlaylistId] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function run(action: Action) {
    const id = playlistId.trim();
    if (!id) {
      setState({ status: "error", message: "Ingresá un Playlist ID." });
      return;
    }

    setState({ status: "loading", action });
    try {
      await (action === "set" ? setPlaylistFeatured : clearPlaylistFeatured)(
        id,
      );
      setState({ status: "done", action });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : action === "set"
              ? "No se pudo marcar la playlist como featured."
              : "No se pudo sacar la playlist de featured.",
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

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={btnPrimary}
            disabled={state.status === "loading"}
            onClick={() => run("set")}
          >
            {state.status === "loading" && state.action === "set"
              ? "Guardando…"
              : "Marcar como featured"}
          </button>
          <button
            type="button"
            className={btnGhost}
            disabled={state.status === "loading"}
            onClick={() => run("clear")}
          >
            {state.status === "loading" && state.action === "clear"
              ? "Sacando…"
              : "Sacar de featured"}
          </button>
        </div>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            {state.action === "set"
              ? "Playlist marcada como la featured del archive."
              : "Playlist sacada de featured (no-op si no era la featured actual)."}
          </p>
        )}
      </div>
    </div>
  );
}
