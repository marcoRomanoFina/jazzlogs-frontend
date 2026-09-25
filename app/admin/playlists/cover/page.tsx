import AdminGate from "@/components/admin/AdminGate";
import PlaylistCoverForm from "@/components/admin/PlaylistCoverForm";

export default function PlaylistCoverPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Cover de playlist
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Sube la imagen de portada real de una playlist, a partir de su
          Playlist ID.
        </p>
        <PlaylistCoverForm />
      </div>
    </AdminGate>
  );
}
