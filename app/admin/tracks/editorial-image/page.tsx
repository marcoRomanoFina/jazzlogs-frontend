import AdminGate from "@/components/admin/AdminGate";
import TrackEditorialImageForm from "@/components/admin/TrackEditorialImageForm";

export default function TrackEditorialImagePage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Imágenes de editorial de track
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Subir las 5 imágenes de la editorial de un track, a partir de su Track ID.
        </p>
        <TrackEditorialImageForm />
      </div>
    </AdminGate>
  );
}
