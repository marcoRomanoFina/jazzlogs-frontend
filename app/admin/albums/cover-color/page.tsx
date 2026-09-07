import AdminGate from "@/components/admin/AdminGate";
import CoverColorForm from "@/components/admin/CoverColorForm";

export default function CoverColorPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">
          Cover color
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramienta interna — cura a mano el color de ambiente de la página
          de un álbum, a partir de su Album ID. Sin un color guardado, la
          página lo calcula sola promediando la cover.
        </p>
        <CoverColorForm />
      </div>
    </AdminGate>
  );
}
