"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  uploadPlaylistPrincipalImage,
  uploadPlaylistBannerImage,
  uploadPlaylistFooterImage,
} from "@/lib/playlists";
import {
  fieldLabel,
  fieldInput,
  fieldError,
  btnPrimary,
} from "@/components/admin/formStyles";

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Slot = "principal" | "banner" | "footer";

const SLOTS: { slot: Slot; label: string; upload: typeof uploadPlaylistPrincipalImage }[] = [
  { slot: "principal", label: "Imagen principal", upload: uploadPlaylistPrincipalImage },
  { slot: "banner", label: "Imagen banner", upload: uploadPlaylistBannerImage },
  { slot: "footer", label: "Imagen de footer", upload: uploadPlaylistFooterImage },
];

type State =
  | { status: "idle" }
  | { status: "loading"; slot: Slot }
  | { status: "error"; slot: Slot; message: string }
  | { status: "done"; slot: Slot };

// Three independent detail-page-only uploads on the same playlist — same
// idea as SeriesDetailImagesForm, just pointed at the playlist endpoints.
// Re-uploading one never touches the other two.
export default function PlaylistDetailImagesForm() {
  const [playlistId, setPlaylistId] = useState("");
  const [files, setFiles] = useState<Record<Slot, File | null>>({
    principal: null,
    banner: null,
    footer: null,
  });
  const [state, setState] = useState<State>({ status: "idle" });

  function validate(file: File | null, slot: Slot): boolean {
    if (!playlistId.trim()) {
      setState({ status: "error", slot, message: "Ingresá un Playlist ID." });
      return false;
    }
    if (!file) {
      setState({
        status: "error",
        slot,
        message: "Elegí un archivo de imagen.",
      });
      return false;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setState({
        status: "error",
        slot,
        message: "Solo se aceptan JPEG, PNG o WEBP.",
      });
      return false;
    }
    if (file.size > MAX_BYTES) {
      setState({
        status: "error",
        slot,
        message: "El archivo pesa más de 50MB.",
      });
      return false;
    }
    return true;
  }

  async function handleSubmit(slot: Slot, upload: typeof uploadPlaylistPrincipalImage) {
    const file = files[slot];
    if (!validate(file, slot)) return;

    setState({ status: "loading", slot });
    try {
      await upload(playlistId.trim(), file!);
      setState({ status: "done", slot });
    } catch (err) {
      setState({
        status: "error",
        slot,
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo subir la imagen.",
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

      {SLOTS.map(({ slot, label, upload }) => (
        <div
          key={slot}
          className="flex flex-col gap-3 border-t border-[rgba(232,220,192,.12)] pt-5"
        >
          <label className={fieldLabel} htmlFor={`${slot}File`}>
            {label}
          </label>
          <input
            id={`${slot}File`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) =>
              setFiles((f) => ({ ...f, [slot]: e.target.files?.[0] ?? null }))
            }
            className="block w-full text-sm text-[rgba(232,220,192,.7)] file:mr-3 file:rounded-full file:border-0 file:bg-[#F6D013] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#1C1A14]"
          />
          <button
            type="button"
            className={btnPrimary + " self-start"}
            disabled={state.status === "loading" && state.slot === slot}
            onClick={() => handleSubmit(slot, upload)}
          >
            {state.status === "loading" && state.slot === slot
              ? "Subiendo…"
              : `Subir ${label.toLowerCase()}`}
          </button>
          {state.status === "error" && state.slot === slot && (
            <p className={fieldError}>{state.message}</p>
          )}
          {state.status === "done" && state.slot === slot && (
            <p className="text-sm font-medium text-[#7fbf7f]">
              {label} actualizada.
            </p>
          )}
        </div>
      ))}

      <p className="text-xs text-[rgba(232,220,192,.5)]">
        JPEG, PNG o WEBP, 50MB máx. cada una. Re-subir una de las tres pisa
        solo esa imagen, no afecta a las otras dos. Solo se usan en el
        detalle de la playlist (GET /playlists/{"{id}"}) — no aparecen en
        catalogue, journeys, standard ni featured.
      </p>
    </div>
  );
}
