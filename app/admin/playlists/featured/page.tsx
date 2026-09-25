import AdminGate from "@/components/admin/AdminGate";
import FeaturedPlaylistForm from "@/components/admin/FeaturedPlaylistForm";

export default function FeaturedPlaylistPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Playlist featured
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Herramienta interna — marca o saca la playlist destacada del
          archive, a partir de su Playlist ID. Marcar una nueva desmarca
          automáticamente la que estaba antes. La playlist tiene que estar
          publicada, si no la petición falla.
        </p>
        <FeaturedPlaylistForm />
      </div>
    </AdminGate>
  );
}
