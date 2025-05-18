import { OrderStatus, OrderType } from "@/types/enums";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeWords(str: string) {
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

export function generateUniqueId(prefix: string): string {
  const dateTime = new Date().toLocaleDateString().replace(/\//g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 4);
  return `${prefix.toUpperCase()}${dateTime}${randomSuffix.toUpperCase()}`;
}

export async function apiRequest<T>(
  url: string,
  method: string,
  body?: unknown
): Promise<T> {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  };

  const res = await fetch(`https://localhost:5001${url}`, fetchOptions);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return await res.json();
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pending";
    case OrderStatus.COMPLETED:
      return "Completed";
    case OrderStatus.CANCELED:
      return "Canceled";
    default:
      return "Unknown";
  }
}

export function getOrderTypeLabel(type: OrderType): string {
  switch (type) {
    case OrderType.INCOMING:
      return "Incoming";
    case OrderType.OUTGOING:
      return "Outgoing";
    default:
      return "Unknown";
  }
}
