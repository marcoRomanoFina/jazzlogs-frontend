import { archivo, dmMono } from "@/lib/fonts";
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
      className={`${archivo.variable} ${dmMono.variable} min-h-screen bg-[#1c1b18] font-[family-name:var(--font-archivo)] text-[#e9e6df]`}
    >
      <SidebarProvider>
        <Sidebar />
        <AppContent>{children}</AppContent>
      </SidebarProvider>
    </div>
  );
}
