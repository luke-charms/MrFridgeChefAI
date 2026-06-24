import "./globals.css";

export const metadata = {
  title: "FridgeChef",
  description: "Photo your fridge. Get recipes instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
