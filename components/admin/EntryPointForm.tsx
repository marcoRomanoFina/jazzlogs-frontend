"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  setAlbumEntryPoint,
  clearAlbumEntryPoint,
  setTrackEntryPoint,
  clearTrackEntryPoint,
} from "@/lib/albums";
import {
  fieldLabel,
  fieldInput,
  fieldSelect,
  fieldError,
  btnPrimary,
  btnGhost,
} from "@/components/admin/formStyles";

type EntityType = "ALBUM" | "TRACK";
type Action = "set" | "clear";

type State =
  | { status: "idle" }
  | { status: "loading"; action: Action }
  | { status: "error"; message: string }
  | { status: "done"; action: Action };

export default function EntryPointForm() {
  const [entityType, setEntityType] = useState<EntityType>("ALBUM");
  const [entityId, setEntityId] = useState("");
  const [artistId, setArtistId] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function run(action: Action) {
    const eid = entityId.trim();
    const aid = artistId.trim();
    if (!eid || !aid) {
      setState({
        status: "error",
        message: `Ingresá ${entityType === "ALBUM" ? "un Album ID" : "un Track ID"} y un Artist ID.`,
      });
      return;
    }

    setState({ status: "loading", action });
    try {
      const set = entityType === "ALBUM" ? setAlbumEntryPoint : setTrackEntryPoint;
      const clear =
        entityType === "ALBUM" ? clearAlbumEntryPoint : clearTrackEntryPoint;
      await (action === "set" ? set : clear)(eid, aid);
      setState({ status: "done", action });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : action === "set"
              ? "No se pudo marcar el entry point."
              : "No se pudo sacar el entry point.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={fieldLabel} htmlFor="entityType">
          Tipo
        </label>
        <select
          id="entityType"
          className={fieldSelect}
          value={entityType}
          onChange={(e) => setEntityType(e.target.value as EntityType)}
        >
          <option value="ALBUM">Álbum</option>
          <option value="TRACK">Track</option>
        </select>
      </div>

      <div>
        <label className={fieldLabel} htmlFor="entityId">
          {entityType === "ALBUM" ? "Album ID" : "Track ID"} *
        </label>
        <input
          id="entityId"
          className={fieldInput}
          placeholder={entityType === "ALBUM" ? "UUID del álbum" : "UUID del track"}
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="artistId">
          Artist ID *
        </label>
        <input
          id="artistId"
          className={fieldInput}
          placeholder="UUID del artista al que este contenido es puerta de entrada"
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(233,230,223,.12)] pt-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={btnPrimary}
            disabled={state.status === "loading"}
            onClick={() => run("set")}
          >
            {state.status === "loading" && state.action === "set"
              ? "Guardando…"
              : "Marcar como entry point"}
          </button>
          <button
            type="button"
            className={btnGhost}
            disabled={state.status === "loading"}
            onClick={() => run("clear")}
          >
            {state.status === "loading" && state.action === "clear"
              ? "Sacando…"
              : "Sacar entry point"}
          </button>
        </div>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            {state.action === "set"
              ? `${entityType === "ALBUM" ? "Álbum" : "Track"} marcado como entry point de ese artista.`
              : `Entry point sacado (no-op si no estaba marcado).`}
          </p>
        )}
      </div>
    </div>
  );
}
