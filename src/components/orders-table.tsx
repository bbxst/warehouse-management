"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";

import {
  apiRequest,
  getOrderStatusLabel,
  getOrderTypeLabel,
} from "@/lib/utils";
import { Order } from "@/types";
import { OrderStatus } from "@/types/enums";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";

export function OrdersTable() {
  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      return await apiRequest<Order[]>("/api/orders", "GET");
    },
  });

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden md:border md:rounded-md md:p-6">
      <Table>
        <TableHeader>
          <TableRow className="[&>th]:font-bold text-mute-foreground">
            <TableHead>Id</TableHead>
            <TableHead>Issued on</TableHead>
            <TableHead>Last update</TableHead>
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
          ) : !data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex items-center justify-center py-4 text-muted-foreground font-medium">
                  No data available
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(order.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.itemCount}</TableCell>
                <TableCell>฿ {order.total.toLocaleString()}</TableCell>
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
