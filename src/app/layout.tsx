import "../styles/globals.css";
import type { Metadata } from "next";
import QueryProvider from "@/providers/query-provider";

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
      <body className={`antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
