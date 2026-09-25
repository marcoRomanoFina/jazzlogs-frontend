import AdminGate from "@/components/admin/AdminGate";
import PublishSeriesForm from "@/components/admin/PublishSeriesForm";

export default function PublishSeriesPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Publicar serie
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Toda serie nace en borrador — publicala acá cuando esté lista para
          que la vea todo el mundo.
        </p>
        <PublishSeriesForm />
      </div>
    </AdminGate>
  );
}
