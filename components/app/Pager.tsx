"use client";

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
    "min-w-[40px] rounded-full border-[1.5px] border-[#d99b10] px-3.5 py-2 text-[13px] font-semibold";

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onChange(Math.max(0, page - 1))}
        className={
          btnBase + " " + (page === 0 ? "cursor-default text-[rgba(233,230,223,.3)]" : "text-[#e9e6df]")
        }
      >
        ← Prev
      </button>
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={
            btnBase +
            " " +
            (i === page ? "bg-[#d99b10] text-[#1c1b18]" : "text-[#e9e6df]")
          }
        >
          {i + 1}
        </button>
      ))}
      <button
        type="button"
        disabled={page === pageCount - 1}
        onClick={() => onChange(Math.min(pageCount - 1, page + 1))}
        className={
          btnBase +
          " " +
          (page === pageCount - 1 ? "cursor-default text-[rgba(233,230,223,.3)]" : "text-[#e9e6df]")
        }
      >
        Next →
      </button>
    </div>
  );
}
