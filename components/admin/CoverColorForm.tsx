"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { setAlbumCoverColor, clearAlbumCoverColor } from "@/lib/albums";
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

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export default function CoverColorForm() {
  const [albumId, setAlbumId] = useState("");
  const [coverColor, setCoverColor] = useState("#d99b10");
  const [state, setState] = useState<State>({ status: "idle" });

  async function run(action: Action) {
    const id = albumId.trim();
    if (!id) {
      setState({ status: "error", message: "Ingresá un Album ID." });
      return;
    }
    if (action === "set" && !HEX_PATTERN.test(coverColor.trim())) {
      setState({
        status: "error",
        message: "El color tiene que ser hex de 6 dígitos, ej. #a86b32.",
      });
      return;
    }

    setState({ status: "loading", action });
    try {
      if (action === "set") {
        await setAlbumCoverColor(id, coverColor.trim());
      } else {
        await clearAlbumCoverColor(id);
      }
      setState({ status: "done", action });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? `${err.status}: ${err.message}`
            : action === "set"
              ? "No se pudo guardar el cover color."
              : "No se pudo sacar el cover color.",
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
        <label className={fieldLabel} htmlFor="coverColor">
          Cover color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label="Elegir color"
            value={HEX_PATTERN.test(coverColor) ? coverColor : "#d99b10"}
            onChange={(e) => setCoverColor(e.target.value)}
            className="h-11 w-14 flex-none cursor-pointer rounded-lg border-[1.5px] border-[rgba(233,230,223,.25)] bg-transparent p-1"
          />
          <input
            id="coverColor"
            className={fieldInput}
            placeholder="#a86b32"
            value={coverColor}
            onChange={(e) => setCoverColor(e.target.value)}
          />
        </div>
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
              : "Guardar color"}
          </button>
          <button
            type="button"
            className={btnGhost}
            disabled={state.status === "loading"}
            onClick={() => run("clear")}
          >
            {state.status === "loading" && state.action === "clear"
              ? "Sacando…"
              : "Sacar color (volver al automático)"}
          </button>
        </div>
        {state.status === "error" && (
          <p className={fieldError}>{state.message}</p>
        )}
        {state.status === "done" && (
          <p className="text-sm font-medium text-[#7fbf7f]">
            {state.action === "set"
              ? "Cover color guardado — la página del álbum ya lo usa en vez del promedio automático."
              : "Cover color sacado — la página del álbum vuelve a calcularlo de la cover."}
          </p>
        )}
      </div>
    </div>
  );
}
