import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FridgeChef",
  description: "Photo your fridge. Get recipes instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
