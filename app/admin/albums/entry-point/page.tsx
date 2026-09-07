import AdminGate from "@/components/admin/AdminGate";
import EntryPointForm from "@/components/admin/EntryPointForm";

export default function EntryPointPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">
          Entry point
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — marca (o saca) un álbum o track como buena
          puerta de entrada al catálogo de un artista (ve en Essential
          Listening de la página de ese artista). No hace falta que el
          artista sea el principal del álbum/track — sirve también para
          colaboraciones o créditos de sideman.
        </p>
        <EntryPointForm />
      </div>
    </AdminGate>
  );
}
