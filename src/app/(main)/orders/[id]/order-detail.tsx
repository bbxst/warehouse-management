"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { CheckCircle, Edit, Trash } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { OrderDetail, OrderDetailItem } from "@/types";
import {
  apiRequest,
  getOrderStatusLabel,
  getOrderTypeLabel,
} from "@/lib/utils";

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
import { OrderStatus, OrderType } from "@/types/enums";
import { Badge } from "@/components/ui/badge";

const orderItemSchema = z.object({
  id: z.string().nonempty("Id is required"),
  quantity: z.number().min(1, "Quantity must be positive"),
});

const addOrderSchema = z.object({
  items: z.array(orderItemSchema).nonempty("At least one item is required"),
});

type AddOrderFormData = z.infer<typeof addOrderSchema>;

export default function OrderDetailClient({ id }: { id: string }) {
  const [items, setItems] = useState<OrderDetailItem[]>([]);
  const [search, setSerch] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const { data: orderDetail, isLoading } = useQuery<OrderDetail>({
    queryKey: ["orders", id],
    queryFn: async () => {
      return await apiRequest<OrderDetail>(`/api/orders/${id}`, "GET");
    },
    enabled: !!id,
  });

  const form = useForm<AddOrderFormData>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (!!orderDetail) {
      setItems(orderDetail.items);
      setTotal(orderDetail.total);
      const mappedItems = orderDetail.items.map((item) => {
        return {
          id: item.id,
          quantity: item.quantity,
        };
      });
      if (mappedItems.length > 0) {
        form.setValue(
          "items",
          mappedItems as [(typeof mappedItems)[0], ...typeof mappedItems]
        );
      }
    }
  }, [form, orderDetail]);

  const { data: searchItem } = useQuery<OrderDetailItem[]>({
    queryKey: ["inventory", search],
    queryFn: async () => {
      return await apiRequest<OrderDetailItem[]>(
        `/api/inventory?status=1&name=${search}`,
        "GET"
      );
    },
    enabled: search.length > 0 && isEdit,
  });

  const handleAddItem = (item: OrderDetailItem) => {
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
      await apiRequest<AddOrderFormData>(
        `/api/orders/${id}/items`,
        "PUT",
        data.items
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`Order created successfully`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
    onSettled: () => {
      setIsEdit(false);
      form.reset();
    },
  });

  const onSubmit = async (data: AddOrderFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 flex flex-col h-full p-6 gap-6 border rounded-lg overflow-hidden"
      >
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{id}</h1>
            <div className="space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEdit(!isEdit)}
              >
                <Edit /> Edit
              </Button>
              <Button type="button" variant="success" onClick={() => {}}>
                <CheckCircle /> Approve
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-x-6">
              <span className="text-sm">Type</span>
              <Badge>{getOrderTypeLabel(orderDetail?.type as OrderType)}</Badge>
            </div>
            <div className="space-x-6">
              <span className="text-sm">Status</span>
              <Badge>
                {getOrderStatusLabel(orderDetail?.status as OrderStatus)}
              </Badge>
            </div>
            <div className="space-x-6">
              <span className="text-sm">Issued Date</span>
              <span className="font-medium">
                {new Date(
                  orderDetail?.createdAt as string
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="space-x-6">
              <span className="text-sm">Last Update</span>
              <span className="font-medium">
                {new Date(
                  orderDetail?.updatedAt as string
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
          {isEdit && (
            <div className="relative">
              <Command>
                <CommandInput
                  value={search}
                  onValueChange={(search) => setSerch(search)}
                  placeholder="Search item name..."
                />
                {search.length > 0 && (
                  <CommandList className="absolute top-10 w-full z-10 bg-white border rounded-lg">
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {searchItem?.map((item) => (
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
          )}
          <div className="flex-1 flex flex-col overflow-hidden border rounded-lg p-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  {isEdit && fields.length > 1 && <TableHead>Action</TableHead>}
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
                        <PopoverTrigger
                          disabled={!isEdit}
                          className={`h-8 px-4 rounded-lg ${
                            isEdit && "hover:bg-accent"
                          }`}
                        >
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
                    {isEdit && fields.length > 1 && (
                      <TableCell>
                        <Button
                          onClick={() => handleRemoveItem(index)}
                          className="size-10"
                          variant="ghost"
                        >
                          <Trash />
                        </Button>
                      </TableCell>
                    )}
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
        {isEdit && (
          <SubmitButton
            isValid={form.formState.isDirty}
            state={mutation.isPending}
          />
        )}
      </form>
    </Form>
  );
}
