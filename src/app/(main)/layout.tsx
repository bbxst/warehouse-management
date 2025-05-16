import { AppSidebar } from "@/components/app-sidebar";
import { LayoutHeader } from "@/components/layout-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <LayoutHeader />
        <main className="flex-1 overflow-y-auto px-3">{children}</main>
      </div>
    </SidebarProvider>
  );
}
