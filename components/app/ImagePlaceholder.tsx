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
        "flex h-full w-full items-center justify-center bg-[#2a2621] text-center font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[.1em] text-[rgba(233,230,223,.35)] " +
        className
      }
    >
      {label}
    </div>
  );
}
