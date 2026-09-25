import AdminGate from "@/components/admin/AdminGate";
import PlaylistForm from "@/components/admin/PlaylistForm";

export default function NewPlaylistPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Nueva playlist
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Crea la ficha de una playlist — solo metadata, todavía sin
          tracklist. Guardá el Playlist ID que te devuelve para cargarle los
          tracks después.
        </p>
        <PlaylistForm />
      </div>
    </AdminGate>
  );
}
