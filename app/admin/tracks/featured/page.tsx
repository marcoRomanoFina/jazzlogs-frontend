import AdminGate from "@/components/admin/AdminGate";
import FeaturedTrackForm from "@/components/admin/FeaturedTrackForm";

export default function FeaturedTrackPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">
          Featured tracks
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — agrega o saca un track de la sección Featured
          Tracks del archive, a partir de su Track ID. Máximo 6 a la vez, y el
          track necesita tener su editorial cargada.
        </p>
        <FeaturedTrackForm />
      </div>
    </AdminGate>
  );
}
