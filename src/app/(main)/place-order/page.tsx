"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Trash } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Item } from "@/types";
import { OrderType } from "@/types/enums";
import { apiRequest, getOrderTypeLabel } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

const orderItemSchema = z.object({
  id: z.string().nonempty("ID is required"),
  quantity: z.number().min(1, "Quantity must be positive"),
});

const addOrderSchema = z.object({
  type: z.coerce.number(),
  items: z.array(orderItemSchema).nonempty("At least one item is required"),
});

type AddOrderFormData = z.infer<typeof addOrderSchema>;

export default function PlaceOrderPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSerch] = useState<string>("");
  const [total, setTotal] = useState<number>(0);

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
    if (items.some((i) => i.id === item.id)) {
      toast.error("Item already added to the order.");
      setSerch("");
      return;
    }
    setItems((prevItems) => [...prevItems, item]);
    append({ id: item.id, quantity: 1 });
    setTotal((prevTotal) => prevTotal + item.price * 1);
    setSerch("");
  };

  const handleRemoveItem = (index: number) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      return newItems;
    });
    setTotal(
      (prevTotal) => prevTotal - items[index].price * fields[index].quantity
    );
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
      setItems([]);
      setTotal(0);
    },
  });

  const onSubmit = async (data: AddOrderFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 flex flex-col h-full p-6 gap-3 border rounded-lg overflow-hidden"
      >
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Place Order</h1>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value.toString()}
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
          <div className="overflow-y-auto border flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {items[index].id}
                    </TableCell>
                    <TableCell>{items[index].name}</TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger className="h-8 px-4 rounded-lg hover:bg-accent">
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
                                    {...field}
                                    className="w-20"
                                    type="number"
                                    min={1}
                                    max={items[index].quantity}
                                    value={field.value}
                                    onChange={(e) => {
                                      const newQnt =
                                        Number(e.target.value) > 0
                                          ? Number(e.target.value)
                                          : 1;
                                      const price = items[index].price;
                                      setTotal((prevTotal) => {
                                        const oldValue = field.value * price;
                                        const newTotal =
                                          prevTotal - oldValue + price * newQnt;
                                        return newTotal;
                                      });
                                      field.onChange(Number(newQnt));
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>{items[index].price}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleRemoveItem(index)}
                        className="size-10"
                        variant="ghost"
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="text-xl font-semibold px-3">
          <span>Total</span>
          <span className="float-right text-xl font-semibold">
            ฿ {total.toLocaleString()}
          </span>
        </div>
        <SubmitButton
          isValid={form.formState.isValid}
          state={mutation.isPending}
          text="Place Order"
        />
      </form>
    </Form>
  );
}
