"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { capitalize } from "@/lib/utils";

export function LayoutHeader() {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  const isHidden = !isMobile && state === "expanded";

  const page = pathname.split("/")[1];
  const title = capitalize(page);

  return (
    <header className="flex items-center w-full h-14 p-3 gap-3">
      <SidebarTrigger
        data-state={isHidden}
        className="data-[state=true]:hidden"
      />
      <span className="text-xl font-bold pl-1">{title}</span>
    </header>
  );
}
