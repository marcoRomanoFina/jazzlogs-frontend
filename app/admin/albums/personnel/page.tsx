import AdminGate from "@/components/admin/AdminGate";
import PersonnelForm from "@/components/admin/PersonnelForm";

export default function AlbumPersonnelPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">Personnel de álbum</h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — cargá el personnel de un álbum existente a partir de su Album ID.
        </p>
        <PersonnelForm />
      </div>
    </AdminGate>
  );
}
