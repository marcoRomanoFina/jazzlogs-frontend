import AdminGate from "@/components/admin/AdminGate";
import TrackEditorialForm from "@/components/admin/TrackEditorialForm";

export default function TrackEditorialPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">Editorial de track</h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — cargá la editorial de un track existente a partir de su Track ID.
        </p>
        <TrackEditorialForm />
      </div>
    </AdminGate>
  );
}
