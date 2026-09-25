export default function ImagePlaceholder({
  label = "Cover",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={
        "flex h-full w-full items-center justify-center bg-[#2A261C] text-center font-[family-name:var(--font-dm-sans)] text-[10px] uppercase tracking-[.1em] text-[rgba(232,220,192,.35)] " +
        className
      }
    >
      {label}
    </div>
  );
}
