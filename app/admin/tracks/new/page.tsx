import AdminGate from "@/components/admin/AdminGate";
import TracksForm from "@/components/admin/TracksForm";

export default function NewTracksPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">Nuevo track</h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Herramienta interna — cargá tracks a partir de su Spotify Track ID. El álbum y el
          artista se resuelven o se crean solos a partir de los datos de Spotify del track.
        </p>
        <TracksForm />
      </div>
    </AdminGate>
  );
}
