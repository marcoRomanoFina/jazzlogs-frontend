"use client";

// Windowed page list — first, last, the current page and one neighbor on
// each side, with "…" filling any gap. Listing every page number (the old
// behavior) got unreadable fast on a catalogue with dozens of pages;
// undefined entries in the returned array mean "render an ellipsis here".
function pageWindow(page: number, pageCount: number): (number | undefined)[] {
  const pages = new Set([0, pageCount - 1, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 0 && p < pageCount).sort((a, b) => a - b);

  const result: (number | undefined)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(undefined);
    result.push(sorted[i]);
  }
  return result;
}

export default function Pager({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const btnBase =
    "min-w-[40px] rounded-full border-[1.5px] border-[#F6D013] px-3.5 py-2 text-[13px] font-semibold";

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onChange(Math.max(0, page - 1))}
        className={
          btnBase + " " + (page === 0 ? "cursor-default text-[rgba(232,220,192,.3)]" : "text-[#E8DCC0]")
        }
      >
        ← Prev
      </button>
      {pageWindow(page, pageCount).map((i, idx) =>
        i === undefined ? (
          <span
            key={`gap-${idx}`}
            className="min-w-[40px] px-3.5 py-2 text-center text-[13px] font-semibold text-[rgba(232,220,192,.4)]"
          >
            …
          </span>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={
              btnBase +
              " " +
              (i === page ? "bg-[#F6D013] text-[#1C1A14]" : "text-[#E8DCC0]")
            }
          >
            {i + 1}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page === pageCount - 1}
        onClick={() => onChange(Math.min(pageCount - 1, page + 1))}
        className={
          btnBase +
          " " +
          (page === pageCount - 1 ? "cursor-default text-[rgba(232,220,192,.3)]" : "text-[#E8DCC0]")
        }
      >
        Next →
      </button>
    </div>
  );
}
