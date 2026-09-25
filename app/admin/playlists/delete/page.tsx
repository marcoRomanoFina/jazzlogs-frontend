import AdminGate from "@/components/admin/AdminGate";
import DeletePlaylistForm from "@/components/admin/DeletePlaylistForm";

export default function DeletePlaylistPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Borrar playlist
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Borra una playlist por completo a partir de su Playlist ID. Hard
          delete — no hay vuelta atrás.
        </p>
        <DeletePlaylistForm />
      </div>
    </AdminGate>
  );
}
