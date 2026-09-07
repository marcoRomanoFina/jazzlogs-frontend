import AdminGate from "@/components/admin/AdminGate";
import FeaturedAlbumForm from "@/components/admin/FeaturedAlbumForm";

export default function FeaturedAlbumPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">
          Álbum featured
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — marca la editorial de un álbum existente como la
          destacada del archive, a partir de su Album ID.
        </p>
        <FeaturedAlbumForm />
      </div>
    </AdminGate>
  );
}
