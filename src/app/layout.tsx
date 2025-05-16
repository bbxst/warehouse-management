import "../styles/globals.css";
import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";

import QueryProvider from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const noto = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Warehouse Management System",
  description: "A simple warehouse management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${noto.className} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
