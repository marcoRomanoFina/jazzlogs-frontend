import AdminGate from "@/components/admin/AdminGate";
import CreateArtistForm from "@/components/admin/CreateArtistForm";

export default function NewArtistPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Nuevo artista
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Herramienta interna — creá un artista a partir de su Spotify Artist
          ID, o solo con el nombre si no tiene presencia en Spotify (por
          ejemplo, sidemen viejos).
        </p>
        <CreateArtistForm />
      </div>
    </AdminGate>
  );
}
