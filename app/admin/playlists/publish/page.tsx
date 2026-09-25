import AdminGate from "@/components/admin/AdminGate";
import PublishPlaylistForm from "@/components/admin/PublishPlaylistForm";

export default function PublishPlaylistPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Publicar playlist
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Toda playlist nace en borrador — publicala acá cuando esté lista
          (cover + tracklist cargados) para que la vea todo el mundo. Volver
          a borrador desmarca automáticamente esa playlist como featured, si
          lo era.
        </p>
        <PublishPlaylistForm />
      </div>
    </AdminGate>
  );
}
