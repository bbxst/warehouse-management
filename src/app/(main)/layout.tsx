import { AppSidebar } from "@/components/app-sidebar";
import { LayoutHeader } from "@/components/layout-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <LayoutHeader />
          <main className="flex-1 flex flex-col overflow-hidden p-6">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
