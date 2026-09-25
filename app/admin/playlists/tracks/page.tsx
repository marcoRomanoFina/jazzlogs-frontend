import AdminGate from "@/components/admin/AdminGate";
import PlaylistTrackForm from "@/components/admin/PlaylistTrackForm";

export default function PlaylistTracksPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Agregar track a playlist
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Agrega un track existente del catálogo al final de una playlist, a
          partir de su Playlist ID y Track ID. Repetí una vez por cada track
          del tracklist — el orden en que los cargás es el orden final.
        </p>
        <PlaylistTrackForm />
      </div>
    </AdminGate>
  );
}
