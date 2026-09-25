"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { setTrackFeatured, unsetTrackFeatured } from "@/lib/albums";
import {
  fieldLabel,
  fieldInput,
  fieldError,
  btnPrimary,
  btnGhost,
} from "@/components/admin/formStyles";

type Action = "add" | "remove";

type State =
  | { status: "idle" }
  | { status: "loading"; action: Action }
  | { status: "error"; message: string }
  | { status: "done"; action: Action };

export default function FeaturedTrackForm() {
  const [trackId, setTrackId] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function run(action: Action) {
    const id = trackId.trim();
    if (!id) {
      setState({ status: "error", message: "Ingresá un Track ID." });
      return;
    }

    setState({ status: "loading", action });
    try {
      if (action === "add") {
        await setTrackFeatured(id);
      } else {
        await unsetTrackFeatured(id);
      }
      setState({ status: "done", action });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : action === "add"
              ? "No se pudo agregar el track a Featured Tracks."
              : "No se pudo sacar el track de Featured Tracks.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={fieldLabel} htmlFor="trackId">
          Track ID *
        </label>
        <input
          id="trackId"
          className={fieldInput}
          placeholder="UUID del track"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={btnPrimary}
            disabled={state.status === "loading"}
            onClick={() => run("add")}
          >
            {state.status === "loading" && state.action === "add"
              ? "Guardando…"
              : "Agregar a Featured Tracks"}
          </button>
          <button
            type="button"
            className={btnGhost}
            disabled={state.status === "loading"}
            onClick={() => run("remove")}
          >
            {state.status === "loading" && state.action === "remove"
              ? "Sacando…"
              : "Sacar de Featured Tracks"}
          </button>
        </div>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            {state.action === "add"
              ? "Track agregado a Featured Tracks — idempotente si ya estaba; falla con 409 si ya hay 6 o si el track no tiene editorial todavía."
              : "Track sacado de Featured Tracks (no-op si no estaba)."}
          </p>
        )}
      </div>
    </div>
  );
}
