import { dmSans, fraunces, newsreader } from "@/lib/fonts";
import Sidebar from "@/components/app/Sidebar";
import AppContent from "@/components/app/AppContent";
import { SidebarProvider } from "@/components/app/SidebarContext";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${fraunces.variable} ${newsreader.variable} min-h-screen bg-[#1C1A14] font-[family-name:var(--font-dm-sans)] text-[#E8DCC0]`}
    >
      <SidebarProvider>
        <Sidebar />
        <AppContent>{children}</AppContent>
      </SidebarProvider>
    </div>
  );
}
