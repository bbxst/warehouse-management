"use client";

import { Item } from "@/types";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getOrderTypeLabel } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderType } from "@/types/enums";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import SubmitButton from "@/components/submit-button";

const orderItemSchema = z.object({
  id: z.string().nonempty("ID is required"), // Matches `required string Id`
  quantity: z.number().min(0, "Quantity must be non-negative"), // Matches `decimal Quantity`
});

const addOrderSchema = z.object({
  type: z.coerce.number(),
  items: z.array(orderItemSchema).nonempty("At least one item is required"),
});

type AddOrderFormData = z.infer<typeof addOrderSchema>;

export default function PlaceOrderPage() {
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [search, setSerch] = useState<string>("");

  const queryClient = useQueryClient();

  const { data } = useQuery<Item[]>({
    queryKey: ["inventory", search],
    queryFn: async () => {
      return await apiRequest<Item[]>(`/api/inventory?name=${search}`, "GET");
    },
    enabled: search.length > 0,
  });

  const form = useForm<AddOrderFormData>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: {
      type: OrderType.INCOMING,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleAddItem = (item: Item) => {
    if (itemNames.some((i) => i === item.name)) {
      toast.error("Item already added to the order.");
      setSerch("");
      return;
    }
    setItemNames((prevItems) => [...prevItems, item.name]);
    append({ id: item.id, quantity: 1 });
    setSerch("");
  };

  const handleRemoveItem = (index: number) => {
    setItemNames((prevItems) => {
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      return newItems;
    });

    remove(index);
  };

  const mutation = useMutation({
    mutationFn: async (data: AddOrderFormData) => {
      await apiRequest<AddOrderFormData>("/api/orders", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`Order created successfully`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
    onSettled: () => {
      form.reset();
      setItemNames([]);
    },
  });

  const onSubmit = async (data: AddOrderFormData) => {
    mutation.mutate(data);
    // try {
    //   const response = await fetch("/api/orders", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(data),
    //   });
    //   const result = await response.json();
    //   alert(`Order Submitted: ${JSON.stringify(result)}`);
    //   form.reset();
    // } catch (error) {
    //   console.error("Error submitting order:", error);
    // }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 flex flex-col h-full p-6 gap-3 border rounded-lg overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Place Order</h1>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Order Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={OrderType.INCOMING.toString()}>
                      {getOrderTypeLabel(OrderType.INCOMING)}
                    </SelectItem>
                    <SelectItem value={OrderType.OUTGOING.toString()}>
                      {getOrderTypeLabel(OrderType.OUTGOING)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="relative">
          <Command>
            <CommandInput
              value={search}
              onValueChange={(search) => setSerch(search)}
              placeholder="Search item name..."
            />
            {search.length > 0 && (
              <CommandList className="absolute top-9 w-full z-10 bg-white border border-t-0">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {data?.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleAddItem(item)}
                    >
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </div>
        <div className="overflow-y-auto">
          <div className="flex items-center justify-between p-2 border-b font-medium">
            <span className="w-[35%]">Item Name</span>
            <span>Quantity</span>
            <span>Action</span>
          </div>
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 border-b"
            >
              <span className="w-[35%]">{itemNames[index]}</span>
              <Popover>
                <PopoverTrigger className="h-10 px-2 rounded-lg hover:bg-accent">
                  {form.watch(`items.${index}.quantity`)}
                </PopoverTrigger>
                <PopoverContent className="flex w-fit gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            className="w-20"
                            {...field}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={() => handleRemoveItem(index)}
                className="size-10"
                variant="ghost"
              >
                <Trash />
              </Button>
            </div>
          ))}
        </div>
        <SubmitButton state={mutation.isPending} text="Place Order" />
      </form>
    </Form>
  );
}
