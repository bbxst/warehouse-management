"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  apiRequest,
  getOrderStatusLabel,
  getOrderTypeLabel,
} from "@/lib/utils";
import { Order } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Badge } from "./ui/badge";
import { OrderStatus } from "@/types/enums";

export function OrdersTable() {
  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      return await apiRequest<Order[]>("/api/orders", "GET");
    },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="[&>th]:font-bold text-mute-foreground">
            <TableHead>Id</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data?.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.items?.length}</TableCell>
                <TableCell>฿ 0</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getOrderTypeLabel(order.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === OrderStatus.PENDING
                        ? "secondary"
                        : order.status === OrderStatus.COMPLETED
                        ? "default"
                        : "destructive"
                    }
                  >
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="w-[100px]">
                  <Link
                    href={`/orders/${order.id}`}
                    className={buttonVariants({
                      size: "icon",
                      variant: "ghost",
                    })}
                  >
                    <ExternalLink />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
