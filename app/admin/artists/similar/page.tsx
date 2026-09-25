import AdminGate from "@/components/admin/AdminGate";
import SimilarArtistForm from "@/components/admin/SimilarArtistForm";

export default function SimilarArtistPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Similar artists
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Herramienta interna — cura a mano la lista de &quot;similares&quot; de un
          artista (ve en la página de ese artista). Agregar y sacar no
          rompen nada si la relación ya existía o no existía,
          respectivamente.
        </p>
        <SimilarArtistForm />
      </div>
    </AdminGate>
  );
}
