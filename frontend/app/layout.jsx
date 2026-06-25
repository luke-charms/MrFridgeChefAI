import "./globals.css";

// Metadata for the application, used for SEO and social sharing
export const metadata = {
  title: "FridgeChef",
  description: "Photo your fridge. Get recipes instantly.",
};

// The root layout component that wraps the entire application
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
