import AdminGate from "@/components/admin/AdminGate";
import FeaturedSeriesForm from "@/components/admin/FeaturedSeriesForm";

export default function FeaturedSeriesPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Serie featured
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Marcar o sacar la serie destacada del archive, a partir de su
          Series ID. Solo puede haber una a la vez, y tiene que estar
          publicada.
        </p>
        <FeaturedSeriesForm />
      </div>
    </AdminGate>
  );
}
