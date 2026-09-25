import AdminGate from "@/components/admin/AdminGate";
import SeriesCoverForm from "@/components/admin/SeriesCoverForm";

export default function SeriesCoverPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Cover de serie
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Subir la imagen de portada real de una serie, a partir de su Series
          ID.
        </p>
        <SeriesCoverForm />
      </div>
    </AdminGate>
  );
}
