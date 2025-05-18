"use client";

import { useState } from "react";
import { Edit, Loader2, Trash } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { ItemDialog } from "./item-dialog";
import { DeleteDialog } from "./delete-dialog";
import { useQuery } from "@tanstack/react-query";
import { Item } from "@/types";
import { apiRequest, getItemStatusLabel } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { ItemStatus } from "@/types/enums";
import { PageHeader } from "./page-header";

export function ItemsTable() {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Item>();
  const [status, setStatus] = useState<string>("-1");

  const { data, isLoading } = useQuery<Item[]>({
    queryKey: ["inventory", status],
    queryFn: async () => {
      const url =
        status !== "-1" ? `/api/inventory?status=${status}` : `/api/inventory`;
      return await apiRequest<Item[]>(url, "GET");
    },
  });

  const editClick = (item: Item) => {
    setSelected(item);
    setOpen(true);
  };
  const deleteClick = (item: Item) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden md:border md:rounded-md md:p-6">
      <PageHeader title="Inventory">
        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">All</SelectItem>
            <SelectItem value={ItemStatus.ACTIVE.toString()}>
              {getItemStatusLabel(ItemStatus.ACTIVE)}
            </SelectItem>
            <SelectItem value={ItemStatus.ARRIVED.toString()}>
              {getItemStatusLabel(ItemStatus.ARRIVED)}
            </SelectItem>
            <SelectItem value={ItemStatus.INCOMING.toString()}>
              {getItemStatusLabel(ItemStatus.INCOMING)}
            </SelectItem>
            <SelectItem value={ItemStatus.DELETED.toString()}>
              {getItemStatusLabel(ItemStatus.DELETED)}
            </SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Added on</TableHead>
            <TableHead>Last update</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8}>
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
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>฿ {item.price.toLocaleString()}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === ItemStatus.ACTIVE
                        ? "default"
                        : item.status === ItemStatus.ARRIVED
                        ? "secondary"
                        : item.status === ItemStatus.INCOMING
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {getItemStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editClick(item)}
                    >
                      <Edit />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteClick(item)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ItemDialog open={open} onOpenChange={setOpen} item={selected} />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        url={`/api/inventory/${selected?.id}`}
        invalidateKey="inventory"
      />
    </div>
  );
}
