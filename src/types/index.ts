import { ItemStatus, OrderStatus, OrderType } from "./enums";

export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  status: ItemStatus;
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

export interface OrderDetail {
  id: string;
  type: OrderType;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderDetailItem[];
}

export interface OrderDetailItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
