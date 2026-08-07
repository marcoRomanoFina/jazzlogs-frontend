import { archivo, dmMono } from "@/lib/fonts";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${archivo.variable} ${dmMono.variable} font-[family-name:var(--font-archivo)]`}>
      {children}
    </div>
  );
}
