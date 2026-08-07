import AdminGate from "@/components/admin/AdminGate";
import TracksForm from "@/components/admin/TracksForm";

export default function NewTracksPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">Nuevo track</h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — cargá tracks en cualquier álbum existente a partir de su Album ID
          y el Spotify Track ID de cada track.
        </p>
        <TracksForm />
      </div>
    </AdminGate>
  );
}
