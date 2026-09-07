"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { removeSimilarArtist } from "@/lib/artists";
import { fieldLabel, fieldInput, fieldError, btnPrimary } from "@/components/admin/formStyles";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function RemoveSimilarArtistForm() {
  const [artistId, setArtistId] = useState("");
  const [similarArtistId, setSimilarArtistId] = useState("");
  const [bidirectional, setBidirectional] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleRemove() {
    const aid = artistId.trim();
    const sid = similarArtistId.trim();
    if (!aid || !sid) {
      setState({
        status: "error",
        message: "Ingresá un Artist ID y un Similar Artist ID.",
      });
      return;
    }

    setState({ status: "loading" });
    try {
      await removeSimilarArtist(aid, sid, bidirectional);
      setState({ status: "done" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
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
          placeholder="UUID del artista de cuya lista sacás el similar"
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
          placeholder="UUID del artista a sacar de esa lista"
          value={similarArtistId}
          onChange={(e) => setSimilarArtistId(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-[#e9e6df]">
        <input
          type="checkbox"
          checked={bidirectional}
          onChange={(e) => setBidirectional(e.target.checked)}
        />
        También sacar la relación inversa (bidirectional)
      </label>
      <p className="-mt-4 text-xs text-[rgba(233,230,223,.5)]">
        Solo importa si la relación se creó como bidireccional al agregarla.
      </p>

      <div className="flex flex-col gap-3 border-t border-[rgba(233,230,223,.12)] pt-5">
        <div>
          <button
            type="button"
            className={btnPrimary}
            disabled={state.status === "loading"}
            onClick={handleRemove}
          >
            {state.status === "loading" ? "Sacando…" : "Sacar similar artist"}
          </button>
        </div>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Similar artist sacado (no-op si no existía esa relación).
          </p>
        )}
      </div>
    </div>
  );
}
