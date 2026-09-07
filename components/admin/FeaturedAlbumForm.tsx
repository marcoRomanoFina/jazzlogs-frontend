"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
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
  | { status: "done"; title: string };

// Just enough of AlbumDetailDto to find the editorial we actually need to
// flag — the rest of the album payload doesn't matter here.
interface AlbumEditorialSnapshot {
  editorial: { id: string; title: string } | null;
}

export default function FeaturedAlbumForm() {
  const [albumId, setAlbumId] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    const id = albumId.trim();
    if (!id) {
      setState({ status: "error", message: "Ingresá un Album ID." });
      return;
    }

    setState({ status: "loading" });
    try {
      // "Featured" lives on the editorial, not the album itself — POST
      // /editorials/{id}/featurated — so this looks the album up first just
      // to find which editorial that is, rather than needing the admin to
      // hunt down the editorial id by hand.
      const album = await apiFetch<AlbumEditorialSnapshot>(`/albums/${id}`);
      if (!album.editorial) {
        setState({
          status: "error",
          message: "Este álbum todavía no tiene una editorial cargada.",
        });
        return;
      }
      await apiFetch(`/editorials/${album.editorial.id}/featurated`, {
        method: "POST",
      });
      setState({ status: "done", title: album.editorial.title });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo marcar el álbum como featured.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={fieldLabel} htmlFor="albumId">
          Album ID *
        </label>
        <input
          id="albumId"
          className={fieldInput}
          placeholder="UUID del álbum"
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(233,230,223,.12)] pt-5">
        <button
          type="button"
          className={btnPrimary + " self-start"}
          disabled={state.status === "loading"}
          onClick={handleSubmit}
        >
          {state.status === "loading" ? "Guardando…" : "Marcar como featured"}
        </button>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            &ldquo;{state.title}&rdquo; ahora es el editorial featured del
            archive.
          </p>
        )}
      </div>
    </div>
  );
}
