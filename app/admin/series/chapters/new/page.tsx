import AdminGate from "@/components/admin/AdminGate";
import SeriesChapterForm from "@/components/admin/SeriesChapterForm";

export default function NewSeriesChapterPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Nuevo capítulo
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Agregar un capítulo al final de una serie, a partir de su Series
          ID. El audio y las imágenes se cargan después, con sus propias
          herramientas.
        </p>
        <SeriesChapterForm />
      </div>
    </AdminGate>
  );
}
