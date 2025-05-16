"use client";

import { Edit } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OrderDialog } from "@/components/order-dialog";

export default function OrdersPage() {
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
          <TableRow>
            <TableCell>ORD001</TableCell>
            <TableCell>2025/05/05</TableCell>
            <TableCell>10</TableCell>
            <TableCell>฿ 1000</TableCell>
            <TableCell>Outgoing</TableCell>
            <TableCell>Pending</TableCell>
            <TableCell className="w-[100px]">
              <Button variant="ghost" size="icon">
                <Edit />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <OrderDialog open={false} onOpenChange={() => {}} />
    </div>
  );
}
