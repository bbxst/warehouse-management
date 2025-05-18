"use client";

import {
  ClipboardPlus,
  FileText,
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "./ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button, buttonVariants } from "./ui/button";
import { ItemDialog } from "./item-dialog";
import { useState } from "react";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-between items-center h-14 px-3">
          <SidebarTrigger />
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="size-10"
                    onClick={() => setOpen(true)}
                  >
                    <PackagePlus className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Item</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/place-order"
                    className={buttonVariants({
                      variant: "ghost",
                      className: "size-10",
                    })}
                  >
                    <ClipboardPlus className="size-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Place Order</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={pathname === item.url}
                    className="data-[size=lg]:gap-4 data-[size=lg]:px-4 font-medium"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <ItemDialog open={open} onOpenChange={setOpen} />
      </SidebarContent>
    </Sidebar>
  );
}
