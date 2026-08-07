import { archivo, dmMono } from "@/lib/fonts";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${archivo.variable} ${dmMono.variable} min-h-screen bg-[#1c1b18] font-[family-name:var(--font-archivo)] text-[#e9e6df]`}
    >
      <div className="mx-auto max-w-[1180px] px-6">{children}</div>
    </div>
  );
}
