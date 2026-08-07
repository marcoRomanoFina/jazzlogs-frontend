"use client";

import { useState } from "react";
import Image from "next/image";
import { apiFetch, ApiError } from "@/lib/api";
import {
  fieldLabel,
  fieldInput,
  btnPrimary,
} from "@/components/admin/formStyles";

interface ArtistDetail {
  id: string;
  name: string;
  spotifyArtistId: string | null;
  spotifyUrl: string | null;
  imageUrl: string | null;
}

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "done"; artist: ArtistDetail };

export default function CreateArtistForm() {
  const [spotifyArtistId, setSpotifyArtistId] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const trimmedId = spotifyArtistId.trim();
  const trimmedName = name.trim();
  const canSubmit = Boolean(trimmedId || trimmedName);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setState({ status: "submitting" });
    try {
      const artist = await apiFetch<ArtistDetail>("/artists", {
        method: "POST",
        body: JSON.stringify({
          spotifyArtistId: trimmedId || undefined,
          name: trimmedName || undefined,
        }),
      });
      setState({ status: "done", artist });
      setSpotifyArtistId("");
      setName("");
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo crear el artista.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <label className={fieldLabel} htmlFor="spotifyArtistId">
          Spotify Artist ID
        </label>
        <input
          id="spotifyArtistId"
          className={fieldInput}
          value={spotifyArtistId}
          onChange={(e) => setSpotifyArtistId(e.target.value)}
          placeholder="0kbYTNQb4Pb1rPbbaF0pT4"
        />
        <p className="mt-1 text-xs text-[rgba(233,230,223,.5)]">
          Nombre, imagen y URL se traen de Spotify automáticamente — el ID está
          en la URL del artista en Spotify (open.spotify.com/artist/&lt;id&gt;).
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs text-[rgba(233,230,223,.4)]">
        <div className="h-px flex-1 bg-[rgba(233,230,223,.15)]" />
        o, si no está en Spotify
        <div className="h-px flex-1 bg-[rgba(233,230,223,.15)]" />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
          className={fieldInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: un sideman sin presencia en Spotify"
        />
        <p className="mt-1 text-xs text-[rgba(233,230,223,.5)]">
          Fallback manual — sin Spotify ID el artista se crea sin imagen ni URL
          de Spotify.
        </p>
      </div>

      <button
        type="submit"
        className={btnPrimary + " self-start"}
        disabled={state.status === "submitting" || !canSubmit}
      >
        {state.status === "submitting" ? "Creando…" : "Crear artista"}
      </button>

      {state.status === "error" && (
        <p className="text-sm text-[#e9a3a3]">{state.message}</p>
      )}

      {state.status === "done" && (
        <div className="flex items-center gap-4 rounded-xl border border-[rgba(233,230,223,.15)] bg-[rgba(233,230,223,.03)] p-4">
          {state.artist.imageUrl && (
            <Image
              src={state.artist.imageUrl}
              alt={state.artist.name}
              width={64}
              height={64}
              unoptimized
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-[#e9e6df]">{state.artist.name}</p>
            <p className="mt-1 font-mono text-xs text-[rgba(233,230,223,.6)]">
              Artist ID:{" "}
              <span className="select-all text-[#d99b10]">
                {state.artist.id}
              </span>
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
