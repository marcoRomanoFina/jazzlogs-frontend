export interface StickyNoteData {
  ts?: string;
  title: string;
  text: string;
  track?: string;
  album?: string;
  name?: string;
  date: string;
  likes: number;
  rotate?: number;
}

export default function StickyNote({ note }: { note: StickyNoteData }) {
  return (
    <div
      className="flex min-h-[220px] min-w-0 flex-col gap-[15px] rounded-[3px] bg-[#f3e4a8] p-[28px_26px_22px] text-[#1c1b18] shadow-[0_14px_28px_rgba(0,0,0,.35)]"
      style={{ transform: `rotate(${note.rotate ?? -1}deg)` }}
    >
      <div className="flex items-center gap-2">
        <span className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[.14em] text-[rgba(28,27,24,.5)]">
          Timestamp
        </span>
        {note.ts && (
          <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-dm-mono)] text-[14px] font-bold text-[#8a5c00]">
            ▶ {note.ts}
          </span>
        )}
      </div>
      <div className="text-[20px] font-extrabold leading-[1.15] tracking-[-.02em] break-words">
        {note.title}
      </div>
      <p className="m-0 line-clamp-5 break-words text-[16px] font-medium leading-[1.5]">{note.text}</p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[rgba(28,27,24,.16)] pt-[13px]">
        <span className="text-[11px] font-semibold uppercase tracking-[.04em] text-[rgba(28,27,24,.6)]">
          {note.track ? `${note.track}${note.album ? ` · ${note.album}` : ""}` : `— ${note.name}, ${note.date}`}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#8a5c00]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#8a5c00" stroke="#8a5c00" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {note.likes}
        </span>
      </div>
    </div>
  );
}
