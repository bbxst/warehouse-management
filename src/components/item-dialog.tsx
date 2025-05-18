"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Item } from "@/types";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { SubmitButton } from "./submit-button";
import { apiRequest, getItemStatusLabel } from "@/lib/utils";
import { useSidebar } from "./ui/sidebar";
import { ItemStatus } from "@/types/enums";

const itemSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  price: z.coerce
    .number()
    .positive({ message: "Price must be greater than 0" }),
  status: z.coerce.number().nonnegative({ message: "Invalid status" }),
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
  const { openMobile, setOpenMobile } = useSidebar();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    form.reset({
      name: item?.name || "",
      price: item?.price || 1,
      status: item?.status || ItemStatus.INCOMING,
    });
  }, [item, form]);

  const mutation = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      if (isEditing) {
        await apiRequest(`/api/inventory/${item?.id}`, "PATCH", values);
      } else {
        await apiRequest(`/api/inventory`, "POST", values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`Item ${isEditing ? "updated" : "created"} successfully`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
    onSettled: () => {
      if (!isEditing) {
        form.reset({
          name: "",
          price: 1,
          status: ItemStatus.INCOMING,
        });
      }
      onOpenChange(false);
      if (openMobile) setOpenMobile(false);
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
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ItemStatus.ACTIVE.toString()}>
                        {getItemStatusLabel(ItemStatus.ACTIVE)}
                      </SelectItem>
                      <SelectItem value={ItemStatus.ARRIVED.toString()}>
                        {getItemStatusLabel(ItemStatus.ARRIVED)}
                      </SelectItem>
                      <SelectItem value={ItemStatus.INCOMING.toString()}>
                        {getItemStatusLabel(ItemStatus.INCOMING)}
                      </SelectItem>
                    </SelectContent>
                  </Select>

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
