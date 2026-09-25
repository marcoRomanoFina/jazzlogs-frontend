import AdminGate from "@/components/admin/AdminGate";
import EditSeriesChapterForm from "@/components/admin/EditSeriesChapterForm";

export default function EditSeriesChapterPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Editar capítulo
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Reemplaza type, trackId, título, note y audioDurationMs de un
          capítulo existente a partir de su Series ID y Chapter ID. No toca
          posición, audio ni imágenes.
        </p>
        <EditSeriesChapterForm />
      </div>
    </AdminGate>
  );
}
