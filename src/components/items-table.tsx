"use client";

import { useState } from "react";
import { Edit, Loader2, Trash } from "lucide-react";

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
import { apiRequest } from "@/lib/utils";

export function ItemsTable() {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Item>();

  const { data, isLoading } = useQuery<Item[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      return await apiRequest<Item[]>("/api/inventory", "GET");
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
    <>
      <Table>
        <TableHeader>
          <TableRow className="[&>th]:font-bold text-mute-foreground">
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>฿ {item.price.toLocaleString()}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="w-[100px] pl-0">
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
        url={`https://localhost:5001/api/inventory/${selected?.id}`}
        invalidateKey="inventory"
      />
    </>
  );
}
