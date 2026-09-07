import AdminGate from "@/components/admin/AdminGate";
import RemovePersonnelForm from "@/components/admin/RemovePersonnelForm";

export default function RemovePersonnelPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">
          Sacar personnel
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — saca a un artista de la ficha técnica de un
          álbum. El rol es obligatorio: un artista puede tener edges de
          LEADER y SIDEMAN al mismo álbum, así que hay que decir cuál sacar.
          No rompe nada si esa relación no existía.
        </p>
        <RemovePersonnelForm />
      </div>
    </AdminGate>
  );
}
