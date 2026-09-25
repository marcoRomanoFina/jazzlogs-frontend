"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { setSeriesFeatured, clearSeriesFeatured } from "@/lib/series";
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

export default function FeaturedSeriesForm() {
  const [seriesId, setSeriesId] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function run(action: Action) {
    const id = seriesId.trim();
    if (!id) {
      setState({ status: "error", message: "Ingresá un Series ID." });
      return;
    }

    setState({ status: "loading", action });
    try {
      await (action === "set" ? setSeriesFeatured : clearSeriesFeatured)(id);
      setState({ status: "done", action });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : action === "set"
              ? "No se pudo marcar la serie como featured."
              : "No se pudo sacar la serie de featured.",
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
              ? "Serie marcada como la featured del archive."
              : "Serie sacada de featured (no-op si no era la featured actual)."}
          </p>
        )}
      </div>
    </div>
  );
}
