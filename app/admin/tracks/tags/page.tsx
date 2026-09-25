import AdminGate from "@/components/admin/AdminGate";
import TrackTagsForm from "@/components/admin/TrackTagsForm";

export default function TrackTagsPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Tags de track
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Herramienta interna — cargá moods, contexts, rhythms e instrumentos
          destacados de un track existente a partir de su Track ID.
        </p>
        <TrackTagsForm />
      </div>
    </AdminGate>
  );
}
