"use client";

import {
  DiamondPlus,
  FileText,
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingCart,
} from "lucide-react";

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
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-between items-center h-14 p-3">
          <SidebarTrigger />
          <Image
            className="w-[80px] h-[20px] mr-2"
            src="/light-logo.png"
            width={160}
            height={50}
            alt="logo"
          />
        </div>
        <div className="flex flex-col px-3 gap-2">
          <Button>
            <PackagePlus /> Add Item
          </Button>
          <Button>
            <DiamondPlus /> Place Order
          </Button>
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
      </SidebarContent>
    </Sidebar>
  );
}
