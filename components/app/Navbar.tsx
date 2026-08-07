import Link from "next/link";

const LINKS = [
  { href: "/home", label: "Home" },
  { href: "/series", label: "Series" },
  { href: "/playlists", label: "Playlists" },
  { href: "/agent", label: "Agent" },
  { href: "/archive", label: "Editorials" },
] as const;

export default function Navbar({ active }: { active?: string }) {
  return (
    <div className="flex items-center justify-between py-[26px]">
      <div className="flex items-baseline gap-[34px]">
        <Link
          href="/home"
          className="text-2xl font-extrabold tracking-[-.03em] text-[#d99b10] no-underline"
        >
          jazzlogs.
        </Link>
        <div className="hidden gap-[26px] text-[13px] font-semibold sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                "no-underline hover:opacity-60 " +
                (active === link.label
                  ? "border-b-2 border-[#d99b10] pb-[3px] text-[#e9e6df]"
                  : "text-[rgba(233,230,223,.6)]")
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <Link href="/profile" className="flex items-center gap-2.5 no-underline">
        <span className="hidden text-[13px] font-semibold text-[#e9e6df] sm:inline">
          Miles D.
        </span>
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#2a2621] text-[12px] font-extrabold tracking-[-.02em] text-[#d99b10]">
          MD
        </span>
      </Link>
    </div>
  );
}
