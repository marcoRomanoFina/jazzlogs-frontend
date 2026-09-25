export default function EmptyState({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div
      className={
        "border-t-[1.5px] border-[#F6D013] px-5 py-18 text-center " + className
      }
    >
      <div className="text-[34px] font-extrabold tracking-[-.035em] text-[#F6D013]">
        {title}
      </div>
      <div className="mt-3 text-[15px] leading-[1.55] text-[rgba(232,220,192,.6)]">
        {subtitle}
      </div>
    </div>
  );
}
