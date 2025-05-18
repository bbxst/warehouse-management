import { OrderStatus, OrderType } from "./enums";

export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  itemCount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
}
