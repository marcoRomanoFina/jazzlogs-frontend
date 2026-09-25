import { dmSans, fraunces, newsreader } from "@/lib/fonts";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${dmSans.variable} ${fraunces.variable} ${newsreader.variable} font-[family-name:var(--font-dm-sans)]`}>
      {children}
    </div>
  );
}
