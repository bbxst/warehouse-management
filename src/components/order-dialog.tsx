"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Button } from "./ui/button";

const itemSchema = z.object({
  id: z.string().nonempty({ message: "Id is required" }),
  status: z.enum(["pending", "completed", "cancelled"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
});

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDialog({ open, onOpenChange }: OrderDialogProps) {
  const form = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      id: "",
    },
  });

  function onSubmit(values: z.infer<typeof itemSchema>) {
    toast(`${values.id}`);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>All fields are required.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Id</FormLabel>
                  <FormControl>
                    <Input placeholder="INV000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
