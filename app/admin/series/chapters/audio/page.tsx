import AdminGate from "@/components/admin/AdminGate";
import SeriesChapterAudioForm from "@/components/admin/SeriesChapterAudioForm";

export default function SeriesChapterAudioPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Audio de capítulo
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Subir el audio real de un capítulo, a partir de su Series ID y
          Chapter ID.
        </p>
        <SeriesChapterAudioForm />
      </div>
    </AdminGate>
  );
}
