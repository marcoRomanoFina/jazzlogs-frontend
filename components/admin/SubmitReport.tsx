import type { StepReport } from "@/components/admin/runAlbumSubmission";

const STATUS_ICON: Record<StepReport["status"], string> = {
  pending: "○",
  running: "◐",
  done: "✓",
  error: "✕",
};

const STATUS_COLOR: Record<StepReport["status"], string> = {
  pending: "text-[rgba(233,230,223,.4)]",
  running: "text-[#d99b10]",
  done: "text-[#7fbf7f]",
  error: "text-[#e9a3a3]",
};

export default function SubmitReport({
  reports,
  albumId,
  apiUrl,
  successMessage = "Guardado con éxito.",
  errorSummary = "Algunos pasos fallaron. Podés reintentar solo los pasos con error.",
  showAlbumLink = true,
}: {
  reports: StepReport[];
  albumId: string | null;
  apiUrl: string;
  successMessage?: string;
  errorSummary?: string;
  showAlbumLink?: boolean;
}) {
  const hasErrors = reports.some((r) => r.status === "error");
  const allDone = reports.length > 0 && reports.every((r) => r.status === "done");

  return (
    <div className="rounded-xl border border-[rgba(233,230,223,.15)] bg-[rgba(233,230,223,.03)] p-5">
      <ul className="flex flex-col gap-2">
        {reports.map((r) => (
          <li key={r.key} className="flex items-start gap-2 text-sm">
            <span className={STATUS_COLOR[r.status] + " w-4 shrink-0 text-center"}>
              {STATUS_ICON[r.status]}
            </span>
            <div>
              <span className="text-[#e9e6df]">{r.label}</span>
              {r.error && <p className="mt-0.5 text-xs text-[#e9a3a3]">{r.error}</p>}
            </div>
          </li>
        ))}
      </ul>

      {allDone && (
        <div className="mt-4 border-t border-[rgba(233,230,223,.12)] pt-4 text-sm">
          <p className="font-medium text-[#7fbf7f]">{successMessage}</p>
          {showAlbumLink && albumId && (
            <a
              href={`${apiUrl}/albums/${albumId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block border-b border-[rgba(233,230,223,.5)] text-[#e9e6df]"
            >
              Ver GET /albums/{albumId} →
            </a>
          )}
        </div>
      )}

      {hasErrors && (
        <p className="mt-4 border-t border-[rgba(233,230,223,.12)] pt-4 text-sm text-[#e9a3a3]">
          {errorSummary}
        </p>
      )}
    </div>
  );
}
