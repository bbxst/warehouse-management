"use client";

import { useState } from "react";
import { Edit, Trash } from "lucide-react";

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
import { generateUniqueId } from "@/lib/utils";

export function ItemsTable() {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const editClick = () => {
    setOpen(true);
  };
  const deleteClick = () => {
    setDeleteOpen(true);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="[&>th]:font-bold text-mute-foreground">
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{generateUniqueId("INV")}</TableCell>
            <TableCell>Bolt</TableCell>
            <TableCell>100</TableCell>
            <TableCell>฿ 30</TableCell>
            <TableCell className="w-[100px] pl-0">
              <div>
                <Button variant="ghost" size="icon" onClick={editClick}>
                  <Edit />
                </Button>
                <Button variant="ghost" size="icon" onClick={deleteClick}>
                  <Trash />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <ItemDialog open={open} onOpenChange={setOpen} />

      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
