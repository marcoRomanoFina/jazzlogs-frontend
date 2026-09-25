import AdminGate from "@/components/admin/AdminGate";
import SeriesForm from "@/components/admin/SeriesForm";

export default function NewSeriesPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Nueva serie
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Crea la ficha de una serie — solo metadata, todavía sin capítulos.
          Guardá el Series ID que te devuelve para cargarle los capítulos
          después.
        </p>
        <SeriesForm />
      </div>
    </AdminGate>
  );
}
