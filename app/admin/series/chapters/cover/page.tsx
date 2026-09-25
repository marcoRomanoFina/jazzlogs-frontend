import AdminGate from "@/components/admin/AdminGate";
import SeriesChapterCoverForm from "@/components/admin/SeriesChapterCoverForm";

export default function SeriesChapterCoverPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Imágenes de capítulo
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Subir la imagen del capítulo y/o la imagen landscape/hero de un
          capítulo existente, a partir de su Series ID y Chapter ID. Son dos
          uploads independientes.
        </p>
        <SeriesChapterCoverForm />
      </div>
    </AdminGate>
  );
}
