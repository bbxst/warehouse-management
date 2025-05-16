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
