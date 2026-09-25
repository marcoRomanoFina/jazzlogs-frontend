import { dmSans, fraunces, newsreader } from "@/lib/fonts";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${fraunces.variable} ${newsreader.variable} min-h-screen bg-[#1C1A14] font-[family-name:var(--font-dm-sans)] text-[#E8DCC0]`}
    >
      {children}
    </div>
  );
}
