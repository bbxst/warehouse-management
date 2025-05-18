"use client";

import { SidebarTrigger, useSidebar } from "./ui/sidebar";

export function LayoutHeader() {
  const { state, isMobile } = useSidebar();

  const isHidden = !isMobile && state === "expanded";

  return (
    <header className="relative flex justify-center items-center w-full h-14 px-3 gap-3 border-b">
      <SidebarTrigger
        data-state={isHidden}
        className="absolute left-3 data-[state=true]:hidden"
      />
      <span className="font-medium">Warehouse Management System</span>
    </header>
  );
}
