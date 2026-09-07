import AdminGate from "@/components/admin/AdminGate";
import RemoveSimilarArtistForm from "@/components/admin/RemoveSimilarArtistForm";

export default function RemoveSimilarArtistPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">
          Sacar similar artist
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — saca a un artista de la lista de &quot;similares&quot;
          curada a mano de otro. Tildá bidirectional solo si la relación se
          creó como bidireccional al agregarla. No rompe nada si esa relación
          no existía.
        </p>
        <RemoveSimilarArtistForm />
      </div>
    </AdminGate>
  );
}
