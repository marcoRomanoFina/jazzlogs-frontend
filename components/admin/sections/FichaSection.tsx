import { useFormContext } from "react-hook-form";
import type { AlbumFormValues } from "@/lib/validations/album";
import { VOCAL_PROFILES, LEVELS } from "@/lib/constants/album";
import Link from "next/link";
import {
  fieldLabel,
  fieldInput,
  fieldSelect,
  fieldError,
} from "@/components/admin/formStyles";
import SpotifyAlbumPreview from "@/components/admin/SpotifyAlbumPreview";

export default function FichaSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AlbumFormValues>();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <label className={fieldLabel} htmlFor="artistId">
          Artist ID *
        </label>
        <input id="artistId" className={fieldInput} {...register("artistId")} />
        {errors.artistId && (
          <p className={fieldError}>{errors.artistId.message}</p>
        )}
        <p className="mt-1 text-xs text-[rgba(233,230,223,.5)]">
          ¿No tenés el ID?{" "}
          <Link
            href="/admin/artists/new"
            target="_blank"
            className="text-[#d99b10] underline"
          >
            Creá un artista nuevo →
          </Link>
        </p>
      </div>

      <div>
        <label className={fieldLabel} htmlFor="spotifyAlbumId">
          Spotify Album ID *
        </label>
        <input
          id="spotifyAlbumId"
          className={fieldInput}
          {...register("spotifyAlbumId")}
        />
        {errors.spotifyAlbumId && (
          <p className={fieldError}>{errors.spotifyAlbumId.message}</p>
        )}
        <p className="mt-1 text-xs text-[rgba(233,230,223,.5)]">
          Nombre, imagen, año y total de tracks se traen de Spotify
          automáticamente.
        </p>
        <SpotifyAlbumPreview />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="logNumber">
          Log № *
        </label>
        <input
          id="logNumber"
          className={fieldInput}
          {...register("logNumber")}
        />
        {errors.logNumber && (
          <p className={fieldError}>{errors.logNumber.message}</p>
        )}
      </div>

      <div>
        <label className={fieldLabel} htmlFor="label">
          Label *
        </label>
        <input id="label" className={fieldInput} {...register("label")} />
        {errors.label && <p className={fieldError}>{errors.label.message}</p>}
      </div>

      <div>
        <label className={fieldLabel} htmlFor="vocalProfile">
          Vocal profile *
        </label>
        <select
          id="vocalProfile"
          className={fieldSelect}
          {...register("vocalProfile")}
        >
          <option value="">—</option>
          {VOCAL_PROFILES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        {errors.vocalProfile && (
          <p className={fieldError}>{errors.vocalProfile.message}</p>
        )}
      </div>

      <div>
        <label className={fieldLabel} htmlFor="energy">
          Energy *
        </label>
        <select id="energy" className={fieldSelect} {...register("energy")}>
          <option value="">—</option>
          {LEVELS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        {errors.energy && <p className={fieldError}>{errors.energy.message}</p>}
      </div>

      <div>
        <label className={fieldLabel} htmlFor="moodIntensity">
          Mood intensity *
        </label>
        <select
          id="moodIntensity"
          className={fieldSelect}
          {...register("moodIntensity")}
        >
          <option value="">—</option>
          {LEVELS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        {errors.moodIntensity && (
          <p className={fieldError}>{errors.moodIntensity.message}</p>
        )}
      </div>

      <div>
        <label className={fieldLabel} htmlFor="accessibility">
          Accessibility *
        </label>
        <select
          id="accessibility"
          className={fieldSelect}
          {...register("accessibility")}
        >
          <option value="">—</option>
          {LEVELS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        {errors.accessibility && (
          <p className={fieldError}>{errors.accessibility.message}</p>
        )}
      </div>

      <div>
        <label className={fieldLabel} htmlFor="instagramPermalink">
          Instagram permalink
        </label>
        <input
          id="instagramPermalink"
          className={fieldInput}
          {...register("instagramPermalink")}
        />
      </div>
    </div>
  );
}
