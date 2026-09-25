import AdminGate from "@/components/admin/AdminGate";
import PlaylistDetailImagesForm from "@/components/admin/PlaylistDetailImagesForm";

export default function PlaylistDetailImagesPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Imágenes de detalle de playlist
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Subir la imagen principal, banner y/o footer del detalle de una
          playlist, a partir de su Playlist ID.
        </p>
        <PlaylistDetailImagesForm />
      </div>
    </AdminGate>
  );
}
