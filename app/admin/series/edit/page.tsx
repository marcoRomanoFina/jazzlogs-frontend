import AdminGate from "@/components/admin/AdminGate";
import EditSeriesForm from "@/components/admin/EditSeriesForm";

export default function EditSeriesPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Editar serie
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Reemplaza título, dek, description y cover de una serie existente a
          partir de su Series ID. No toca el estado de publicación ni los
          capítulos.
        </p>
        <EditSeriesForm />
      </div>
    </AdminGate>
  );
}
