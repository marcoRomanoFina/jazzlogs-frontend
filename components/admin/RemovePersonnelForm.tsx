"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { removeAlbumPersonnel } from "@/lib/albums";
import { PERSONNEL_ROLES, type PersonnelRole } from "@/lib/constants/album";
import {
  fieldLabel,
  fieldInput,
  fieldSelect,
  fieldError,
  btnPrimary,
} from "@/components/admin/formStyles";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function RemovePersonnelForm() {
  const [albumId, setAlbumId] = useState("");
  const [artistId, setArtistId] = useState("");
  const [role, setRole] = useState<PersonnelRole>("LEADER");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleRemove() {
    const aid = albumId.trim();
    const arid = artistId.trim();
    if (!aid || !arid) {
      setState({
        status: "error",
        message: "Ingresá un Album ID y un Artist ID.",
      });
      return;
    }

    setState({ status: "loading" });
    try {
      await removeAlbumPersonnel(aid, arid, role);
      setState({ status: "done" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : "No se pudo sacar el personnel.",
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

      <div>
        <label className={fieldLabel} htmlFor="artistId">
          Artist ID *
        </label>
        <input
          id="artistId"
          className={fieldInput}
          placeholder="UUID del artista a sacar de la ficha técnica"
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="role">
          Rol *
        </label>
        <select
          id="role"
          className={fieldSelect}
          value={role}
          onChange={(e) => setRole(e.target.value as PersonnelRole)}
        >
          {PERSONNEL_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-[rgba(233,230,223,.5)]">
          Un artista puede tener edges de LEADER y SIDEMAN al mismo álbum —
          decí cuál de los dos sacar.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(233,230,223,.12)] pt-5">
        <div>
          <button
            type="button"
            className={btnPrimary}
            disabled={state.status === "loading"}
            onClick={handleRemove}
          >
            {state.status === "loading" ? "Sacando…" : "Sacar personnel"}
          </button>
        </div>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            Personnel sacado (no-op si no existía esa relación).
          </p>
        )}
      </div>
    </div>
  );
}
