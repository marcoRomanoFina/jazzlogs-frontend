"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { addSimilarArtist, removeSimilarArtist } from "@/lib/artists";
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

export default function SimilarArtistForm() {
  const [artistId, setArtistId] = useState("");
  const [similarArtistId, setSimilarArtistId] = useState("");
  const [reason, setReason] = useState("");
  const [bidirectional, setBidirectional] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  async function run(action: Action) {
    const aid = artistId.trim();
    const sid = similarArtistId.trim();
    if (!aid || !sid) {
      setState({
        status: "error",
        message: "Ingresá un Artist ID y un Similar Artist ID.",
      });
      return;
    }

    setState({ status: "loading", action });
    try {
      if (action === "add") {
        await addSimilarArtist(aid, sid, reason, bidirectional);
      } else {
        await removeSimilarArtist(aid, sid, bidirectional);
      }
      setState({ status: "done", action });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : action === "add"
              ? "No se pudo agregar el similar artist."
              : "No se pudo sacar el similar artist.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={fieldLabel} htmlFor="artistId">
          Artist ID *
        </label>
        <input
          id="artistId"
          className={fieldInput}
          placeholder="UUID del artista cuya lista de similares editás"
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="similarArtistId">
          Similar Artist ID *
        </label>
        <input
          id="similarArtistId"
          className={fieldInput}
          placeholder="UUID del artista a agregar/sacar de esa lista"
          value={similarArtistId}
          onChange={(e) => setSimilarArtistId(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="reason">
          Reason (opcional, solo para agregar)
        </label>
        <input
          id="reason"
          className={fieldInput}
          placeholder="Por qué aparece como similar — se muestra en la página del artista"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-[#E8DCC0]">
        <input
          type="checkbox"
          checked={bidirectional}
          onChange={(e) => setBidirectional(e.target.checked)}
        />
        Bidirectional
      </label>
      <p className="-mt-4 text-xs text-[rgba(232,220,192,.5)]">
        Al agregar: también crea la relación inversa. Al sacar: solo importa
        si se había creado como bidireccional — tildá para sacar también esa
        relación inversa.
      </p>

      <div className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={btnPrimary}
            disabled={state.status === "loading"}
            onClick={() => run("add")}
          >
            {state.status === "loading" && state.action === "add"
              ? "Agregando…"
              : "Agregar similar artist"}
          </button>
          <button
            type="button"
            className={btnGhost}
            disabled={state.status === "loading"}
            onClick={() => run("remove")}
          >
            {state.status === "loading" && state.action === "remove"
              ? "Sacando…"
              : "Sacar similar artist"}
          </button>
        </div>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            {state.action === "add"
              ? "Similar artist agregado."
              : "Similar artist sacado (no-op si no existía esa relación)."}
          </p>
        )}
      </div>
    </div>
  );
}
