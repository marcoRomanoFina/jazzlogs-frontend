"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { apiFetch, ApiError } from "@/lib/api";
import type { AlbumFormValues } from "@/lib/validations/album";
import { btnGhost } from "@/components/admin/formStyles";

interface SpotifyAlbumData {
  name: string;
  imageUrl: string | null;
  spotifyUrl: string | null;
  totalTracks: number | null;
  releaseYear: number | null;
}

export default function SpotifyAlbumPreview() {
  const { getValues } = useFormContext<AlbumFormValues>();
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "done"; data: SpotifyAlbumData }
  >({ status: "idle" });

  async function handlePreview() {
    const spotifyAlbumId = getValues("spotifyAlbumId")?.trim();
    if (!spotifyAlbumId) {
      setState({ status: "error", message: "Ingresá un Spotify Album ID primero." });
      return;
    }

    setState({ status: "loading" });
    try {
      const data = await apiFetch<SpotifyAlbumData>(
        `/admin/spotify/album/${encodeURIComponent(spotifyAlbumId)}`
      );
      setState({ status: "done", data });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof ApiError ? `${err.status}: ${err.message}` : "No se pudo consultar Spotify.",
      });
    }
  }

  return (
    <div className="mt-2">
      <button type="button" className={btnGhost} onClick={handlePreview} disabled={state.status === "loading"}>
        {state.status === "loading" ? "Buscando…" : "Preview en Spotify"}
      </button>

      {state.status === "error" && (
        <p className="mt-2 text-xs text-[#e9a3a3]">{state.message}</p>
      )}

      {state.status === "done" && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-[rgba(233,230,223,.15)] bg-[rgba(233,230,223,.03)] p-3">
          {state.data.imageUrl && (
            <Image
              src={state.data.imageUrl}
              alt={state.data.name}
              width={56}
              height={56}
              unoptimized
              className="rounded"
            />
          )}
          <div className="text-sm">
            <p className="font-medium text-[#e9e6df]">{state.data.name}</p>
            <p className="text-xs text-[rgba(233,230,223,.6)]">
              {state.data.releaseYear ?? "—"} · {state.data.totalTracks ?? "—"} tracks
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
