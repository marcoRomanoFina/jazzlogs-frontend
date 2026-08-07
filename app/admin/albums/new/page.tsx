import AdminGate from "@/components/admin/AdminGate";
import AlbumForm from "@/components/admin/AlbumForm";

export default function NewAlbumPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">Nuevo álbum</h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — cargá la ficha, editorial, tracks, tags y personnel de un álbum.
        </p>
        <AlbumForm />
      </div>
    </AdminGate>
  );
}
