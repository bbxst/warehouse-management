"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Item } from "@/types";
import { generateUniqueId } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import SubmitButton from "./submit-button";

const itemSchema = z.object({
  id: z.string().nonempty({ message: "Id is required" }),
  name: z.string().nonempty({ message: "Name is required" }),
  price: z.coerce
    .number()
    .positive({ message: "Price must be greater than 0" }),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item;
}

export function ItemDialog({ open, onOpenChange, item }: ItemDialogProps) {
  const isEditing = !!item;
  const queryClient = useQueryClient();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    form.reset({
      id: "defalut",
      name: item?.name || "",
      price: item?.price || 0,
    });
  }, [item, form]);

  const mutation = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      if (isEditing) {
        const response = await fetch(
          `https://localhost:5001/api/inventory/${item?.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update item");
        }
      } else {
        const response = await fetch("https://localhost:5001/api/inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          throw new Error("Failed to create item");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`Item ${isEditing ? "updated" : "created"} successfully`);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
    onSettled: () => {
      if (!isEditing) {
        form.reset({
          id: generateUniqueId("INV"),
          name: "",
          price: 0,
        });
      }
    },
  });

  const onSubmit = (values: z.infer<typeof itemSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>All fields are required.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bolt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SubmitButton state={mutation.isPending} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
